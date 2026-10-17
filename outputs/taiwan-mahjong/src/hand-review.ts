import { reviewDecision, type DecisionSnapshot } from './decision-snapshot.js';
import { evidenceIntent } from './decision-evidence.js';
import type { ReviewRecord } from './review-store.js';
import { kindOf } from './tiles.js';
import type { Intent, Seat } from './model.js';
import type { getObservation } from './engine.js';

type Observation = ReturnType<typeof getObservation>;
export type ClaimResolution = { status: 'pending' } | { status: 'unavailable' }
  | { status: 'resolved'; seat: Seat | null; action: 'chi' | 'pon' | 'exposedKong' | 'win' | null; finished: boolean };

/** Validated snapshot and engine public observation only; result metadata never changes pre-decision evidence. */
export function claimResolution(snapshot: DecisionSnapshot, after?: Observation): ClaimResolution | null {
  const o = snapshot.observation;
  if (!['CHI', 'PON', 'PASS'].includes(snapshot.chosen.type) || !o.legalActions.some(a => a.type === 'CHI' || a.type === 'PON')) return null;
  const unknown: ClaimResolution = { status: 'unavailable' }, offered = o.lastDiscard;
  if (!offered || !after || after.matchId !== o.matchId || after.handId !== o.handId || after.seat !== o.seat || after.version <= o.version) return unknown;
  const source = o.players[offered.seat].discardHistory.at(-1);
  if (!source || source.tileId !== offered.tileId) return unknown;
  const result = after.players[offered.seat].discardHistory.find(d => d.eventSeq === source.eventSeq && d.tileId === source.tileId);
  if (!result) return unknown;
  if (after.phase === 'awaitClaims' && after.lastDiscard?.seat === offered.seat && after.lastDiscard.tileId === offered.tileId) return { status: 'pending' };
  const finished = after.phase === 'handResult' || after.phase === 'matchResult';
  if (result.claimedBy === null) return snapshot.chosen.type === 'PASS' ? { status: 'resolved', seat: null, action: null, finished } : unknown;
  const seat = result.claimedBy;
  const meld = after.players[seat].melds.find(m => 'tiles' in m && m.fromSeat === offered.seat && m.sourceEvent === source.eventSeq && m.tiles.includes(source.tileId));
  if (meld && (meld.kind === 'chi' || meld.kind === 'pon' || meld.kind === 'addedKong' || meld.kind === 'exposedKong')) {
    const action = meld.kind === 'addedKong' ? 'pon' : meld.kind;
    if (seat === o.seat && (snapshot.chosen.type !== (action === 'chi' ? 'CHI' : action === 'pon' ? 'PON' : 'KAN_OPEN')
      || !('ownTiles' in snapshot.chosen) || !snapshot.chosen.ownTiles.every(t => meld.tiles.includes(t)))) return unknown;
    return { status: 'resolved', seat, action, finished };
  }
  if (seat !== o.seat && finished && after.settlement?.source === 'ron' && after.settlement.winner === seat
    && after.settlement.externalTile === source.tileId) return { status: 'resolved', seat, action: 'win', finished };
  return unknown;
}

const exact = (a: Intent) => JSON.stringify(evidenceIntent(a));
/** Physical copies of the same kind have identical visible efficiency/safety evidence. */
function groupKey(a: Intent) {
  if (a.type === 'DISCARD') return `${a.type}:${kindOf(a.tileId)}`;
  if (a.type === 'CHI' || a.type === 'PON') return `${a.type}:${a.ownTiles.map(kindOf).sort().join(',')}`;
  return exact(a);
}
function comparable(s: DecisionSnapshot) {
  const actions = s.observation.legalActions;
  return actions.some(a => a.type === 'CHI' || a.type === 'PON')
    || new Set(actions.filter(a => a.type === 'DISCARD').map(groupKey)).size > 1;
}

/** Read-only review of validated snapshots; never advances the game. */
export function buildHandReview(records: readonly ReviewRecord[], matchId: string, handId: number, seat: Seat, after?: Observation) {
  const hand = records.filter((s): s is DecisionSnapshot => s.schemaVersion === 2
    && s.observation.matchId === matchId && s.observation.handId === handId && s.observation.seat === seat);
  const selected = hand.filter(comparable).slice(-3);
  const cards = selected.map(s => buildDecisionCard(s, after));
  return { cards, retainedForHand: hand.length, shown: cards.length,
    limitation: '僅含本瀏覽器仍保留的記錄，不是完整牌譜；只比较當時可見證據，不使用後續結果評判。' };
}
function buildDecisionCard(snapshot: DecisionSnapshot, after?: Observation) {
    const evidence = reviewDecision(snapshot);
    const chosen = exact(snapshot.chosen);
    const rows = new Map<string, { candidate: typeof evidence.candidates[number]; chosen: boolean; efficiencyPreferred: boolean }>();
    for (const candidate of evidence.candidates) {
      const key = groupKey(candidate.intent), picked = candidate.id === chosen;
      const existing = rows.get(key);
      if (!existing || picked) rows.set(key, { candidate, chosen: picked,
        efficiencyPreferred: candidate.intent.type === 'DISCARD' && evidence.discardPreference.kinds.includes(kindOf(candidate.intent.tileId)) });
    }
    return { snapshot: structuredClone(snapshot), evidence, rows: [...rows.values()], claimResolution: claimResolution(snapshot, after),
      selectionNote: '最近三筆可比較決策；不是錯誤排名。',
      claimNote: '吃碰是當時提出的選擇；取得牌與後捨仍受仲裁及合法性限制。',
    };
}

export function buildDecisionReview(snapshot: DecisionSnapshot, after?: Observation) {
  const card = buildDecisionCard(snapshot, after);
  card.selectionNote = '這是剛才已送出的選擇，不能在此改牌或重做。';
  return { cards: [card], retainedForHand: 1, shown: 1, limitation: '候選比較只用決策前可見資訊；仲裁結果另外核對公開牌組與打牌紀錄，不用後來輸贏評判選擇。' };
}
