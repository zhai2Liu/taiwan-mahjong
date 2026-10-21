import type { getObservation } from './engine.js';
import type { Intent, Meld } from './model.js';
import { kindOf, seatWind } from './tiles.js';
import { createAnalyzer, publicPool, analyzeObservation, compareAnalysis } from './analysis.js';
import type { Analysis } from './analysis.js';
import { ordinaryRonSafety } from './safety.js';

const intentKey = (a: Intent): string => JSON.stringify(a, ['type', 'source', 'windowId', 'tileId', 'ownTiles', 'meldId']);

/** 吃碰門檻：只在叫牌後離聽牌少一步時叫。
 * 門清時另外要求叫牌後已到一向聽以內；碰三元牌或自己的門風／圈風（碰後即有台）不受此限。
 * ponytail: 固定門檻、不看他家攻勢；人格或攻守權重須另依 S6 規格與驗證處理。 */
function worthCalling(o: ReturnType<typeof getObservation>, intent: Intent, current: Analysis, after: Analysis): boolean {
  if (after.shanten >= current.shanten) return false;
  if (o.self.melds.some(m => m.kind !== 'concealedKong')) return true;
  if (after.shanten <= 1) return true;
  const k = o.lastDiscard ? kindOf(o.lastDiscard.tileId) : '';
  return intent.type === 'PON' && (/^[5-7]z$/.test(k) || k === o.roundWind || k === seatWind(o.seat, o.dealer));
}

/** Fair local policy: its entire knowledge is the supplied player observation. */
export function chooseAction(
  observation: ReturnType<typeof getObservation>, actions: Intent[], randomState: number,
): { intent: Intent; randomState: number; reason: string } {
  if (!Number.isInteger(randomState) || randomState < 1 || randomState > 0xffffffff) throw new Error('INVALID_AI_RANDOM_STATE');
  const allowed = new Set(observation.legalActions.map(intentKey));
  const legal = actions.filter(a => allowed.has(intentKey(a)));
  if (!legal.length) throw new Error('NO_LEGAL_AI_ACTION');
  let nextRandom = randomState;
  nextRandom ^= nextRandom << 13; nextRandom ^= nextRandom >>> 17; nextRandom ^= nextRandom << 5;
  nextRandom >>>= 0;
  const win = legal.find(a => a.type === 'WIN');
  if (win) return { intent: win, randomState: nextRandom, reason: '優先選擇合法胡牌' };

  const summary = analyzeObservation(observation, false);
  const pool = publicPool(observation), analyzer = createAnalyzer(pool);
  // ponytail: one-draw tile efficiency; add deeper search only after measured strength needs.
  const candidates = legal.map(intent => {
    let q = summary.current, bonus = 0, blocked = false;
    if (intent.type === 'DISCARD') {
      q = summary.discards.find(d => d.kind === kindOf(intent.tileId))!.analysis;
    } else if (intent.type === 'CHI' || intent.type === 'PON') {
      const claim = summary.claims.find(c => intentKey(c.intent) === intentKey(intent))!;
      if (!claim.best.length) throw new Error('NO_LEGAL_POST_CLAIM_DISCARD');
      q = claim.best[0].analysis;
      blocked = !worthCalling(observation, intent, summary.current, q);
      bonus = -0.1; // 通過門檻後，牌效仍與不叫同等時保留不叫。
    } else if (intent.type === 'KAN_CLOSED' || intent.type === 'KAN_OPEN' || intent.type === 'KAN_ADDED') {
      const removed = intent.type === 'KAN_ADDED' ? [intent.tileId] : intent.ownTiles;
      const hand = observation.self.concealed.filter(t => !removed.includes(t)).map(kindOf);
      let melds: Meld[];
      if (intent.type === 'KAN_ADDED') {
        melds = observation.self.melds.map(m => m.meldId === intent.meldId ? { ...m, kind: 'addedKong', tiles: [...m.tiles, intent.tileId] } : m);
      } else {
        if (intent.type === 'KAN_OPEN' && !observation.lastDiscard) throw new Error('MISSING_DISCARD');
        const open = intent.type === 'KAN_OPEN';
        melds = [...observation.self.melds, {
          meldId: 'analysis-kong', kind: open ? 'exposedKong' : 'concealedKong',
          tiles: [...intent.ownTiles, ...(open ? [observation.lastDiscard!.tileId] : [])],
          fromSeat: open ? observation.lastDiscard!.seat : null, sourceEvent: 0,
        }];
      }
      q = analyzer.analyze(hand, melds, false);
      // ponytail: no rob-kong risk estimate; add public-discard defence with a stronger policy.
      bonus = 0.1;
    }
    return { intent, q, bonus, blocked };
  });
  // 呼叫端只交吃碰選項（沒有「過」）時仍須回傳合法動作，此時不套門檻。
  const usable = candidates.some(c => !c.blocked) ? candidates.filter(c => !c.blocked) : candidates;
  const sorted = usable.sort((a, b) => compareAnalysis(b.q, a.q) || b.bonus - a.bonus);
  const first = sorted[0], tied = sorted.filter(c => compareAnalysis(c.q, first.q) === 0 && c.bonus === first.bonus);
  // ponytail: exact tie-only ordinary-ron proof——牌效完全並列且全為捨牌時，才優先公開牌證明不可能被普通放槍的牌；
  // 不涵蓋自摸、花牌或連莊，未知不當安全。相對危險度與攻守屬於日後另行驗證的策略。
  const safe = tied.every(c => c.intent.type === 'DISCARD')
    ? tied.filter(c => c.intent.type === 'DISCARD' && ordinaryRonSafety(pool, kindOf(c.intent.tileId)).provenSafe) : [];
  const pick = safe.length ? safe : tied;
  const selected = pick[Math.floor(nextRandom / 4294967296 * pick.length)];
  const shape = selected.q.shanten === 0 ? '聽牌' : `${selected.q.shanten} 向聽`;
  return { intent: selected.intent, randomState: nextRandom, reason: `${shape}；依公開資訊估計有效進張 ${selected.q.improving} 張` };
}
