import { createGame, legalActions, assertState } from './engine.js';
import { DECK, isFlower, kindOf } from './tiles.js';
import type { GameState, Intent, MeldKind, Seat } from './model.js';
import { teachingStep } from './learning-model.js';

// Fixed teaching examples for lessons 4–6 (IDs follow docs/archive/S23-LESSON-PREPARATION.md). Every move goes through the
// shared engine; this file only places tiles. Never reads or writes a normal Session or feeds normal AI.
export const kinds = (text: string): string[] => (text.match(/[1-9]+[mpsz]|f[1-8]/g) ?? [])
  .flatMap(t => t[0] === 'f' ? [t] : [...t.slice(0, -1)].map(n => n + t.at(-1)));
const effective = (s: GameState, seat: number) => s.players[seat].concealed.length + s.players[seat].melds.length * 3;
type Options = {
  turn?: Seat; phase?: 'awaitDiscard' | 'awaitDraw'; dealer?: Seat; streak?: number; available?: number;
  hands?: Partial<Record<Seat, string>>; melds?: Partial<Record<Seat, { kind?: MeldKind; tiles: string }[]>>;
  flowers?: Partial<Record<Seat, string>>; head?: string; tail?: string;
  restrictions?: Partial<Record<Seat, { passedWin?: boolean; passedPon?: string[]; lastDiscard?: string }>>;
};
/** Mirrors test/fixtures.mjs placement so runtime examples stay comparable to the prepared engine cases. */
export function lessonFixture(o: Options = {}): GameState {
  const turn = o.turn ?? 0, phase = o.phase ?? 'awaitDiscard', dealer = o.dealer ?? 0;
  const state = createGame({ dealer, matchId: 'lesson-example', seed: 1 }), free = new Set(DECK);
  const take = (kind: string) => {
    const id = [...free].find(t => kindOf(t) === kind);
    if (!id) throw new Error('LESSON_TILE_CAPACITY');
    free.delete(id); return id;
  };
  for (const seat of [0, 1, 2, 3] as Seat[]) {
    const p = state.players[seat];
    p.concealed = kinds(o.hands?.[seat] ?? '').map(take); p.flowers = kinds(o.flowers?.[seat] ?? '').map(take);
    p.melds = (o.melds?.[seat] ?? []).map((m, i) => ({ meldId: `meld-${seat}-${i}`, kind: m.kind ?? 'pon', tiles: kinds(m.tiles).map(take),
      fromSeat: m.kind === 'concealedKong' ? null : ((seat + 3) % 4) as Seat, sourceEvent: i + 1 }));
  }
  const lastDiscards = Object.entries(o.restrictions ?? {}).filter(([, r]) => r?.lastDiscard).map(([seat, r]) => [Number(seat), take(r!.lastDiscard!)] as const);
  const first = kinds(o.head ?? '').map(take), last = kinds(o.tail ?? '').map(take);
  const fillerOrder = [...free].filter(t => !isFlower(t)).sort((a, b) => {
    const ka = kindOf(a), kb = kindOf(b);
    return Number(a.at(-1)) - Number(b.at(-1)) || Number(ka[0]) % 3 - Number(kb[0]) % 3 || ka.localeCompare(kb);
  });
  for (const seat of [0, 1, 2, 3]) {
    const target = 16 + (phase === 'awaitDiscard' && turn === seat ? 1 : 0);
    while (effective(state, seat) < target) {
      const id = fillerOrder.find(t => free.has(t));
      if (!id) throw new Error('LESSON_TILE_CAPACITY');
      free.delete(id); state.players[seat].concealed.push(id);
    }
  }
  let middle = [...free];
  if (o.available !== undefined) {
    const count = 16 + o.available - first.length - last.length, removed = middle.slice(count); middle = middle.slice(0, count);
    for (const id of removed) {
      if (isFlower(id)) [...state.players].sort((a, b) => a.flowers.length - b.flowers.length)[0].flowers.push(id);
      else state.players[3].discardHistory.push({ tileId: id, eventSeq: 0, claimedBy: null });
    }
  }
  const remaining = [...first, ...middle, ...last], remSet = new Set(remaining);
  state.wall = { order: [...DECK.filter(t => !remSet.has(t)), ...remaining], head: 144 - remaining.length, tail: 143, reserveCount: 16 };
  Object.assign(state, { phase, turn, dealer, streak: o.streak ?? 0, dealerAdvances: 0, roundWind: '1z', initialDealer: dealer });
  let seq = 0;
  for (const p of state.players) for (const m of p.melds) {
    m.sourceEvent = ++seq;
    if (m.fromSeat !== null) state.players[m.fromSeat].discardHistory.unshift({ tileId: m.tiles[0], eventSeq: m.sourceEvent, claimedBy: state.players.indexOf(p) as Seat });
  }
  for (const [seat, tileId] of lastDiscards) state.players[seat].discardHistory.push({ tileId, eventSeq: 0, claimedBy: null });
  for (const p of state.players) {
    p.discardHistory.sort((a, b) => (a.eventSeq || 10000) - (b.eventSeq || 10000));
    for (const d of p.discardHistory) if (!d.eventSeq) d.eventSeq = ++seq;
    p.restrictions.lastDiscard = p.discardHistory.length ? kindOf(p.discardHistory.at(-1)!.tileId) : null;
  }
  state.eventSeq = seq + 10; state.version = state.eventSeq;
  state.drawContext = { source: 'normal', lastTile: phase === 'awaitDraw' ? null : state.players[turn].concealed.at(-1) ?? null, replacement: false, selfDrawForbidden: false };
  state.openingContext = { draws: [2, 2, 2, 2], discards: state.players.map(p => p.discardHistory.length), interrupted: true };
  state.pending = null;
  for (const [seat, r] of Object.entries(o.restrictions ?? {})) {
    if (r?.passedWin !== undefined) state.players[Number(seat)].restrictions.passedWin = r.passedWin;
    if (r?.passedPon) state.players[Number(seat)].restrictions.passedPon = r.passedPon;
  }
  assertState(state); return state;
}

export const has = (s: GameState, seat: Seat, type: Intent['type']) => legalActions(s, seat).some(a => a.type === type);
export function act(s: GameState, actor: Seat | 'engine', type: Intent['type'], predicate: (a: Intent) => boolean = () => true): GameState {
  const intent = legalActions(s, actor).find(a => a.type === type && predicate(a));
  if (!intent) throw new Error(`LESSON_ACTION_MISSING:${type}`);
  return teachingStep(s, actor, intent);
}
export const discardKind = (s: GameState, seat: Seat, kind: string) => act(s, seat, 'DISCARD', a => a.type === 'DISCARD' && kindOf(a.tileId) === kind);
/** Every seat with a pending response answers (default PASS) before the engine resolves; nothing is skipped. */
export function settleClaims(s: GameState, choices: Partial<Record<Seat, Intent['type'] | ((a: Intent) => boolean)>> = {}): GameState {
  for (const seat of [0, 1, 2, 3] as Seat[]) {
    const acts = legalActions(s, seat); if (!acts.length) continue;
    const choice = choices[seat] ?? 'PASS';
    const intent = typeof choice === 'function' ? acts.find(choice) : acts.find(a => a.type === choice);
    if (!intent) throw new Error('LESSON_RESPONSE_MISSING');
    s = teachingStep(s, seat, intent);
  }
  return act(s, 'engine', 'RESOLVE');
}

// Lesson 4 — 134 + 147 + 147 + seven honors; the upper seat (3) discards 2.
export const chiHand = (suit: 'm' | 'p') => `134${suit} ${['m', 'p', 's'].filter(x => x !== suit).map(x => `147${x}`).join(' ')} 1234567z`;
export function chiExample(suit: 'm' | 'p', source: Seat = 3, available?: number): GameState {
  return discardKind(lessonFixture({ turn: source, hands: { 0: chiHand(suit), [source]: `2${suit}` }, available }), source, `2${suit}`);
}
export const ponExample = (source: Seat = 3) =>
  discardKind(lessonFixture({ turn: source, hands: { 0: '555m 123p 456p 789p 12s 77z', [source]: '5m' } }), source, '5m');
/** You (seat 0) discard 2m; lower can chi, across can pon, upper (W02) can win. */
export const priorityExample = () => discardKind(lessonFixture({ hands: { 0: '2m', 1: '34m', 2: '22m', 3: '34m 456p 234p 345s 789s 11z' } }), 0, '2m');
export const PRIORITY_CHOICES = [
  { 1: 'CHI', 2: 'PON', 3: 'WIN' }, { 1: 'CHI', 2: 'PON', 3: 'PASS' }, { 1: 'CHI', 2: 'PASS', 3: 'PASS' },
] as const satisfies readonly Partial<Record<Seat, Intent['type']>>[];
export const kongHand = '5555m 123p 456p 789p 123s 1z';
export const closedKongExample = () => lessonFixture({ hands: { 0: kongHand }, tail: '1z' });
export const openKongExample = (source: Seat) =>
  discardKind(lessonFixture({ turn: source, hands: { 0: '555m 123p 456p 789p 123s 1z', [source]: '5m' }, tail: '1z' }), source, '5m');
/** Seat 0 already passed a win earlier (passed-water) to show that only a completed added kong lifts it. */
export const addedKongExample = () => lessonFixture({ hands: { 0: '5m 123p 456p 789p 123s 1z', 1: '34m 456p 234p 345s 789s 11z' },
  melds: { 0: [{ tiles: '555m' }] }, restrictions: { 0: { passedWin: true } }, tail: '1z' });
/** Supplements after the main task: tail limit (L4-E/E14), passed pon (E35), own last discard (E36). */
export function lesson4Limits() {
  const chiCount = (available: number) => legalActions(chiExample('m', 3, available), 0).filter(a => a.type === 'CHI').length;
  const passedPon = discardKind(lessonFixture({ hands: { 0: '5m', 1: '55m' }, restrictions: { 1: { passedPon: ['5m'] } } }), 0, '5m');
  const ownLast = discardKind(lessonFixture({ hands: { 0: '5m', 1: '3455m' }, restrictions: { 1: { lastDiscard: '5m' } } }), 0, '5m');
  return { chiAt4: chiCount(4), chiAt3: chiCount(3), ponAfterPass: has(passedPon, 1, 'PON'),
    claimOwnLast: has(ownLast, 1, 'PON') || has(ownLast, 1, 'CHI') };
}

// Lesson 5 — W02 waits on 2m/5m; transfer hand waits on 2p/發.
export const WAIT_HAND = '34m 456p 234p 345s 789s 11z';
export const WAIT_TRANSFER_HAND = '123m 567m 345p 678s 22p 66z';
/** The upper seat discards the first tile; `head` decides what seat 0 draws after passing. */
export const ronExample = (hand: string, tile: string, head = '') =>
  discardKind(lessonFixture({ turn: 3, hands: { 0: hand, 3: tile }, head }), 3, tile);
export const selfDrawExample = (hand: string, tile: string) => act(lessonFixture({ phase: 'awaitDraw', hands: { 0: hand }, head: tile }), 'engine', 'DRAW');
/** L5-C: already passed, draw 5m and discard 4p — the new waits still include 4p. */
export const changeWaitExample = () =>
  discardKind(act(lessonFixture({ phase: 'awaitDraw', hands: { 0: WAIT_HAND }, head: '5m', restrictions: { 0: { passedWin: true } } }), 'engine', 'DRAW'), 0, '4p');
/** L5-H: an earlier own 2m discard does not by itself forbid winning on 2m. */
export const ownDiscardExample = () =>
  discardKind(lessonFixture({ turn: 3, hands: { 0: WAIT_HAND, 3: '2m' }, restrictions: { 0: { lastDiscard: '2m' } } }), 3, '2m');

// Lesson 6 — completed engine settlements only; screens read settlement/score/delta and NEXT_HAND.
export const STACKED_HAND = '123m 456m 789p 555z 666z 77s';
export const settlementGuided = () => lessonFixture({ hands: { 0: STACKED_HAND }, flowers: { 0: 'f1 f5 f2' }, streak: 2 });
export const settlementTransfer = () => settleClaims(discardKind(lessonFixture({ turn: 2, dealer: 0, streak: 2,
  hands: { 1: '456m 234p 345s 55z 22z', 2: '5z' }, melds: { 1: [{ kind: 'chi', tiles: '123m' }] }, flowers: { 1: 'f2 f1' } }), 2, '5z'), { 1: 'WIN' });
export const nextHand = (s: GameState) => act(s, 'engine', 'NEXT_HAND');
export function settlementSupplements() {
  return {
    nonDealerSelfDraw: act(lessonFixture({ turn: 1, hands: { 1: STACKED_HAND }, flowers: { 1: 'f2 f6 f1' }, streak: 2 }), 1, 'WIN'),
    dealerMoves: settleClaims(discardKind(lessonFixture({ turn: 3, streak: 2, hands: { 2: '456m 234p 345s 55z 22z', 3: '5z' },
      melds: { 2: [{ kind: 'chi', tiles: '123m' }] }, flowers: { 2: 'f3 f1' } }), 3, '5z'), { 2: 'WIN' }),
    zeroTai: settleClaims(discardKind(lessonFixture({ turn: 2, dealer: 3, hands: { 1: '45m 234p 345s 789s 11z', 2: '6m' },
      melds: { 1: [{ kind: 'chi', tiles: '123m' }] } }), 2, '6m'), { 1: 'WIN' }),
    flowerKong: act(lessonFixture({ hands: { 0: STACKED_HAND }, flowers: { 0: 'f1 f2 f3 f4 f5' } }), 0, 'WIN'),
    exhaustiveDraw: act(lessonFixture({ phase: 'awaitDraw', available: 0, streak: 2 }), 'engine', 'RESOLVE'),
  };
}
