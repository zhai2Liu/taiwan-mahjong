import { createGame, applyAction, legalActions, assertState } from './engine.js';
import { prepareHand, isWinningHand } from './hand.js';
import { DECK, isFlower, kindOf } from './tiles.js';
import type { GameState, Intent, Meld, Seat } from './model.js';

export const lessons = [
  { title: '認牌與桌面', text: '萬、筒（餅）、條（索）各有一到九。東南西北中發白是字牌，不能組連號順子；春夏秋冬梅蘭菊竹是花牌，一般亮出後補牌，不放進一般胡牌形。海底是各家打出的牌。', hint: '先看花色，再看數字或字；上家在你左側，下家在你右側，對家在對面。字牌只能湊同牌，不能按字的順序湊連號。' },
  { title: '摸牌、補花與打牌', text: '一般沒有槓時，閒家起手十六張，摸牌後十七張，再打一張回十六張。莊家起手補花後已有十七張，先打、不再摸。一般摸花先亮出，再從牌尾補牌；花胡特例由遊戲判定，後續課再說明，本例不會觸發。', hint: '先找莊家；沒有人吃碰槓胡時輪到下家。你摸到花，先補花，再選一張打出。單擊選牌，雙擊同張或Enter打出。' },
  { title: '五組牌加一對眼睛', text: '一般胡牌形要五組完整牌加一對相同的眼睛。同花色連號三張是順子，三張同牌是一組，四張同牌是槓、也只算一組。每張牌只能用一次；有一槓時實體可十八張。牌型成立仍不等於當下合法能胡。', hint: '先找同花色三張連號或三／四張同牌，最後留兩張相同牌當眼睛。字牌不能組順子；不能把一張牌放進兩組。' },
  { title: '別人打牌後，我能做什麼？', text: '吃：只拿上家剛打的牌，和手中兩張湊成同花色連號三張。碰：任何一家剛打的牌，和手中兩張同牌湊成一組。不要就按「過」。同一張牌有人要胡、碰／明槓、吃時，依胡＞碰／明槓＞吃取得，不是比誰按得快。吃碰成功後先打一張合法的牌，不再摸牌，也不能立刻槓或自摸；吃後不能立刻打出能和剛用的兩張湊成順子的牌，碰後不能立刻打同種牌。本桌不能明槓上家。', hint: '先看是誰打的：吃只看上家。把那張牌放在連號的前、中、後試試，可能不只一種吃法。吃碰後手中少兩張、桌上多一組，接著打一張，不摸牌。' },
  { title: '聽什麼，不一定現在就能胡', text: '再進一張就能湊成五組加一對眼睛，叫聽牌，可能同時聽好幾種。自己摸到叫自摸；別人打出被你胡，打的人叫放槍。本桌不必宣告聽牌，也沒有至少一台才能胡的門檻。若當下能合法胡卻選過，就是過水：全部聽口的胡、自摸、搶槓都暫停；要等你打出一張「不在打後新聽口內」的牌才解除。', hint: '先只看牌型：把每種候選牌放進來，看能不能拆成五組加眼睛。再看資格：剛才是否放過合法胡牌、打出的那張是否還在新聽口裡。' },
  { title: '看懂結算', text: '本桌一底30分、每台10分。胡別人由放槍的一家付；一般自摸由其他三家各付。先逐條看台項，再看每一筆付款：涉及莊家的那筆才加莊家1台及連莊2N台，所以三家付款不一定同額。正花依本局門風：東春梅、南夏蘭、西秋菊、北冬竹。莊家胡或流局連莊；閒家胡則由原莊家的下家接莊，不是胡的人坐莊。', hint: '依序看：哪幾項台數成立 → 誰付款 → 這筆有沒有涉及莊家 → 下一局莊位。數字都來自本局已完成的結算，畫面不會重新算或重複付款。' },
  { title: '帶你打一局', text: '這是固定牌序的教學示例。我們分段走完一局：先看輪到誰，再做一個動作——摸、補花、打或回應別人的牌，最後讀結算與下一局莊家。其他三家按示例劇本摸打，不是正常對戰的公平電腦。可以查提示、再試、暫停或保存續學點；先學會合法完成一局，不必每一步都找最佳打法。', hint: '先看目前輪到誰、剛才那張牌是誰打的，再決定摸、補、打或回應。' },
  { title: '換一局，自己試', text: '換一副教學示例：這次你是莊家，花色與莊位都不同，由你先判斷。可以先不看提示，需要時再查。請說出每次輪到誰，以及結算後誰付款、誰接莊。不以自己胡牌或積分增加當完成條件；能自摸時也可以合法選擇不胡，一樣讀完結算就完成。這仍是同一副固定示例，重練不等於陌生題；本機紀錄不是牌技分數或證書。', hint: '每一步先看輪到誰；結算時逐條看台項、誰付款，再看莊家有沒有胡。' },
] as const;
export function recognitionQuestions(transfer: boolean) {
  return [
    { prompt: transfer ? '請找出四筒。' : '請找出六條。', tiles: transfer ? ['4m', '4p', '4s', '5z', 'f5'] : ['6m', '6p', '6s', '6z', 'f1'], answers: [transfer ? 1 : 2], explanation: '看牌面花色與數字，不只看數字；萬、筒、條是不同花色。' },
    { prompt: `桌面標示${transfer ? '下家' : '上家'}剛打出${transfer ? '九條' : '二筒'}。這張在誰的海底？`, tiles: [] as string[], choices: ['上家（左側）', '對家（對面）', '下家（右側）'], answers: [transfer ? 2 : 0], explanation: '海底分家排列，來源看各家的位置。上家在左、下家在右；不是靠牌種猜是誰打的。' },
    { prompt: transfer ? '中、發、白三張，能當一組順子嗎？' : '東、南、西三張，能當一組順子嗎？', tiles: transfer ? ['5z', '6z', '7z'] : ['1z', '2z', '3z'], choices: ['可以，三個字連著排', '不可以，字牌沒有連號順子'], answers: [1], explanation: '字牌沒有連號順子。順子要同花色的一到九連號三張；三張同樣字牌才可湊成一組。' },
  ];
}
export function teachingStep(game: GameState, actor: Seat | 'engine', intent: Intent): GameState {
  const result = applyAction(game, { actor, intent, opId: `lesson-${game.version}-${actor}`, matchId: game.matchId, handId: game.handId, version: game.version });
  if (!result.ok) throw new Error(`INVALID_LESSON_ACTION:${result.error}`);
  return result.state;
}
/** Deliberately fixed lesson wall. Never reads or writes a normal Session. */
export function createTeachingRound(transfer: boolean): GameState {
  const ordinary = DECK.filter(t => !isFlower(t)), flowers = DECK.filter(isFlower);
  const deck = [...ordinary.slice(0, 80), ...flowers, ...ordinary.slice(80)];
  const position = transfer ? 65 : 67, flower = transfer ? 'f5#0' : 'f1#0', at = deck.indexOf(flower);
  [deck[position], deck[at]] = [deck[at], deck[position]];
  return teachingStep(createGame({ deck, dealer: transfer ? 3 : 1, seed: 20261014, matchId: transfer ? 'lesson-transfer' : 'lesson-guided' }), 'engine', { type: 'DEAL' });
}
/** Other seats visibly follow the lesson script: legal discard, then every responder passes. */
export function runTeachingOthers(game: GameState): GameState {
  for (let count = 0; count < 100; count++) {
    if (game.turn === 0 && ['awaitDraw', 'awaitDiscard', 'awaitReplacement'].includes(game.phase)) return game;
    const flow = legalActions(game, 'engine')[0];
    if (flow) { game = teachingStep(game, 'engine', flow); continue; }
    const responder = ([0, 1, 2, 3] as Seat[]).find(s => legalActions(game, s).some(a => a.type === 'PASS'));
    if (responder !== undefined) { game = teachingStep(game, responder, legalActions(game, responder).find(a => a.type === 'PASS')!); continue; }
    const discard = legalActions(game, game.turn).find(a => a.type === 'DISCARD');
    if (!discard) throw new Error('LESSON_SCRIPT_STOPPED');
    game = teachingStep(game, game.turn, discard);
  }
  throw new Error('LESSON_SCRIPT_LIMIT');
}
export function resolveTeachingDiscard(game: GameState): GameState {
  for (let count = 0; game.phase === 'awaitClaims' && count < 8; count++) {
    const flow = legalActions(game, 'engine')[0];
    if (flow) { game = teachingStep(game, 'engine', flow); continue; }
    const seat = ([1, 2, 3] as Seat[]).find(s => legalActions(game, s).some(a => a.type === 'PASS'));
    if (seat === undefined) throw new Error('LESSON_CLAIM_STOPPED');
    game = teachingStep(game, seat, legalActions(game, seat).find(a => a.type === 'PASS')!);
  }
  assertState(game); return game;
}
function physical(kinds: string[]): string[] {
  const used = new Set<string>();
  return kinds.map(k => { const id = DECK.find(t => kindOf(t) === k && !used.has(t)); if (!id) throw new Error('LESSON_TILE_CAPACITY'); used.add(id); return id; });
}
export function compositionTiles(transfer: boolean): string[] {
  return physical(transfer ? ['1s','1s','1s','1s','2m','3m','4m','6p','7p','8p','4z','4z','4z','6z','6z','6z','9m','9m'] : ['1m','2m','3m','4m','5m','6m','1p','2p','3p','7p','8p','9p','5s','5s','5s','7z','7z']);
}
/** Uses the shared frozen hand validator; consumed physical IDs cannot be used twice. */
export function collectGroup(remaining: string[], groups: Meld[], selected: string[]): { remaining: string[]; groups: Meld[] } | null {
  if (groups.length >= 5 || ![3, 4].includes(selected.length) || new Set(selected).size !== selected.length || !selected.every(t => remaining.includes(t))) return null;
  const kind: Meld['kind'] = selected.length === 4 ? 'concealedKong' : selected.every(t => kindOf(t) === kindOf(selected[0])) ? 'pon' : 'chi';
  const meld: Meld = { kind, tiles: [...selected], meldId: `lesson-group-${groups.length}`, fromSeat: kind === 'concealedKong' ? null : 3, sourceEvent: groups.length + 1 };
  const next = [...groups, meld];
  if (!prepareHand([], next, next.length * 3)) return null;
  return { remaining: remaining.filter(t => !selected.includes(t)), groups: next };
}
export function collectPair(remaining: string[], selected: string[]): { remaining: string[]; pair: string[] } | null {
  if (selected.length !== 2 || new Set(selected).size !== 2 || !selected.every(t => remaining.includes(t)) || kindOf(selected[0]) !== kindOf(selected[1])) return null;
  return { remaining: remaining.filter(t => !selected.includes(t)), pair: [...selected] };
}
export const completedComposition = (remaining: string[], pair: string[], groups: Meld[]) => remaining.length === 0 && pair.length === 2 && groups.length === 5 && isWinningHand(pair, groups);
export function invalidHandChoices(transfer: boolean): string[][] {
  const rest = ['4m','5m','6m','1p','2p','3p','7p','8p','9p','5s','5s','5s','7z','7z'];
  return [physical(['1m','2m','3m', ...rest]), physical([...(transfer ? ['1m','2p','3m'] : ['1z','2z','3z']), ...rest])];
}
