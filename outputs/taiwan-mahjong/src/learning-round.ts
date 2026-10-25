import { createGame, legalActions } from './engine.js';
import { kindOf } from './tiles.js';
import type { GameState, Intent, Seat } from './model.js';
import { act, discardKind, lessonFixture, settleClaims } from './learning-fixtures.js';

// S2.4a: pure core for the fixed lesson 7–8 rounds (docs/archive/S24-LESSON-PREPARATION.md). No storage, DOM, timers, network or
// normal AI; every move goes through the shared engine.
// ponytail: only the two fixed chi pairs (13/34), lesson 8 giving up the 7s self-draw so the lower seat wins, and a
// legal PASS on the chi (a teaching stop, not a completion). Any other legal move is outside this package: the UI must
// say so and let the player retry explicitly, never judge it wrong. No completion flag lives here.
// The fixed wall and hidden hands live only here; the UI still renders getObservation(state, 0), and these states must
// never reach the normal AI, Session or saved match.
/** Binds both the fixed deck and the engine semantics; bump it (no migration of old data) if either changes. */
export const ROUND_SCRIPT_VERSION = 'beginner-round-v1';
export const ROUND_POINTS = ['start', 'dealt', 'opening', 'flower', 'discard', 'claim', 'afterClaim', 'afterDiscard',
  'win', 'result', 'nextHand', 'passed'] as const;
export type RoundPoint = typeof ROUND_POINTS[number];
/** `assisted` is kept verbatim for the future UI; it never changes the replayed state and is not a skill rating. */
export type RoundCheckpoint = {
  schemaVersion: 1; scriptVersion: typeof ROUND_SCRIPT_VERSION; rulesVersion: 'TW16-CLASSIC-v1'; lesson: 7 | 8;
  point: RoundPoint; chi: null | '13' | '34'; outcome: null | 'selfDraw' | 'ron'; assisted: boolean;
};
export type DecodedCheckpoint = { ok: true; checkpoint: RoundCheckpoint } | { ok: false; error: string };
const KEYS = ['schemaVersion', 'scriptVersion', 'rulesVersion', 'lesson', 'point', 'chi', 'outcome', 'assisted'] as const;
const MAX_LENGTH = 512;
const CHOSEN: readonly unknown[] = ['afterClaim', 'afterDiscard', 'win', 'result', 'nextHand'];

function checkpointError(value: unknown): string | null {
  if (!value || typeof value !== 'object' || Object.getPrototypeOf(value) !== Object.prototype) return 'NOT_OBJECT';
  const o = value as Record<string, unknown>;
  if (Object.keys(o).length !== KEYS.length || !KEYS.every(k => Object.hasOwn(o, k))) return 'KEYS';
  if (o.schemaVersion !== 1 || o.scriptVersion !== ROUND_SCRIPT_VERSION || o.rulesVersion !== 'TW16-CLASSIC-v1') return 'VERSION';
  if (o.lesson !== 7 && o.lesson !== 8) return 'LESSON';
  if (!(ROUND_POINTS as readonly unknown[]).includes(o.point) || (o.point === 'flower' && o.lesson !== 7)) return 'POINT';
  if (CHOSEN.includes(o.point) ? o.chi !== '13' && o.chi !== '34' : o.chi !== null) return 'CHI';
  const outcomes = o.point !== 'result' && o.point !== 'nextHand' ? [null] : o.lesson === 7 ? ['selfDraw'] : ['selfDraw', 'ron'];
  if (!outcomes.includes(o.outcome as never)) return 'OUTCOME';
  if (typeof o.assisted !== 'boolean') return 'ASSISTED';
  return null;
}
function checked(value: unknown): RoundCheckpoint {
  const error = checkpointError(value);
  if (error) throw new Error(`LESSON_CHECKPOINT_INVALID:${error}`);
  return value as RoundCheckpoint;
}
export function roundCheckpoint(o: { lesson: 7 | 8; point: RoundPoint; chi?: RoundCheckpoint['chi']; outcome?: RoundCheckpoint['outcome']; assisted: boolean }): RoundCheckpoint {
  return checked({ schemaVersion: 1, scriptVersion: ROUND_SCRIPT_VERSION, rulesVersion: 'TW16-CLASSIC-v1', lesson: o.lesson,
    point: o.point, chi: o.chi ?? null, outcome: o.outcome ?? null, assisted: o.assisted });
}
/** Canonical key order; holds no GameState, hand, wall, intent or score. Throws on an invalid checkpoint. */
export function encodeCheckpoint(cp: RoundCheckpoint): string {
  const valid = checked(cp);
  return JSON.stringify(Object.fromEntries(KEYS.map(k => [k, valid[k]])));
}
/** Never throws and never resets: only the exact encodeCheckpoint text is accepted; storage must not reformat it. */
export function decodeCheckpoint(text: unknown): DecodedCheckpoint {
  if (typeof text !== 'string') return { ok: false, error: 'NOT_STRING' };
  if (text.length > MAX_LENGTH) return { ok: false, error: 'TOO_LONG' };
  let value: unknown;
  try { value = JSON.parse(text); } catch { return { ok: false, error: 'MALFORMED' }; }
  const error = checkpointError(value);
  if (error) return { ok: false, error };
  if (encodeCheckpoint(value as RoundCheckpoint) !== text) return { ok: false, error: 'NOT_CANONICAL' };
  return { ok: true, checkpoint: value as RoundCheckpoint };
}

function expect(ok: boolean, step: string): void {
  if (!ok) throw new Error(`LESSON_ROUND_SCRIPT:${step}`);
}
/** Reuses the lesson tile allocation, then rebuilds the 144-tile deck in DEAL order (four rounds of four, dealer +1). */
function fixedRound(lesson: 7 | 8): GameState {
  const transfer = lesson === 8, dealer: Seat = transfer ? 0 : 1;
  const allocation = lessonFixture({ dealer, turn: dealer, hands: {
    0: transfer ? '134p 789p 456m 789m 56s 22z 9s' : '134m 789m 456p 789p 56s 22z',
    1: transfer ? '123m 456p 789p 56s 123s 22z' : '9m',
  }, head: transfer ? '5z 6z 2p 7z 4z 5z 7s' : '5z 6z f4 7z 4z 2m 5z 6z 7z 7s', tail: '9s' });
  const deck: string[] = [];
  for (let round = 0; round < 4; round++) for (let offset = 0; offset < 4; offset++)
    deck.push(...allocation.players[(dealer + offset) % 4].concealed.slice(round * 4, round * 4 + 4));
  deck.push(allocation.players[dealer].concealed[16], ...allocation.wall.order.slice(allocation.wall.head, allocation.wall.tail + 1));
  expect(deck.length === 144 && new Set(deck).size === 144, 'DECK');
  return createGame({ dealer, deck, seed: 20261017, matchId: transfer ? 'lesson-8-fixed' : 'lesson-7-fixed' });
}
function draw(s: GameState, seat: Seat, kind: string): GameState {
  expect(s.turn === seat && s.phase === 'awaitDraw', `TURN_${seat}`);
  s = act(s, 'engine', 'DRAW');
  expect(kindOf(s.drawContext.lastTile ?? '') === kind, `DRAW_${kind}`);
  return s;
}
const drawAndDiscard = (s: GameState, seat: Seat, kind: string) => settleClaims(discardKind(draw(s, seat, kind), seat, kind));
const chiPair = (a: Intent) => a.type === 'CHI' ? a.ownTiles.map(t => kindOf(t)[0]).sort().join('') : '';

/** Fresh replay from the fixed DEAL to `cp.point` on every call; nothing is cached or shared between calls. */
export function replayRound(cp: RoundCheckpoint): GameState {
  const { lesson, point, chi, outcome } = checked(cp), l7 = lesson === 7, suit = l7 ? 'm' : 'p';
  let s = fixedRound(lesson);
  if (point === 'start') return s;
  s = act(s, 'engine', 'DEAL');
  if (point === 'dealt') return s;
  s = act(s, 'engine', 'RESOLVE');
  expect(s.phase === 'awaitDiscard' && s.turn === s.dealer, 'OPENING');
  if (point === 'opening') return s;
  if (l7) {
    s = settleClaims(discardKind(s, 1, '9m'));
    s = drawAndDiscard(drawAndDiscard(s, 2, '5z'), 3, '6z');
    s = act(s, 'engine', 'DRAW');
    expect(s.phase === 'awaitReplacement' && s.players[0].flowers.map(kindOf).join() === 'f4', 'FLOWER');
    if (point === 'flower') return s;
    s = act(s, 'engine', 'REPLACE');
    expect(s.phase === 'awaitDiscard' && kindOf(s.drawContext.lastTile ?? '') === '9s', 'REPLACE');
  }
  if (point === 'discard') return s;
  s = settleClaims(discardKind(s, 0, '9s'));
  s = l7 ? drawAndDiscard(drawAndDiscard(s, 1, '7z'), 2, '4z') : drawAndDiscard(drawAndDiscard(s, 1, '5z'), 2, '6z');
  s = discardKind(draw(s, 3, `2${suit}`), 3, `2${suit}`);
  expect(s.phase === 'awaitClaims' && legalActions(s, 0).map(chiPair).filter(Boolean).sort().join() === '13,34', 'CLAIM');
  if (point === 'claim') return s;
  if (point === 'passed') {
    s = settleClaims(s);
    expect(s.phase === 'awaitDraw' && s.turn === 0, 'PASSED');
    return s;
  }
  s = settleClaims(s, { 0: a => chiPair(a) === chi });
  expect(s.phase === 'awaitDiscard' && s.turn === 0 && s.players[0].melds.length === 1, 'AFTER_CLAIM');
  if (point === 'afterClaim') return s;
  s = settleClaims(discardKind(s, 0, `${chi === '13' ? 4 : 1}${suit}`));
  if (point === 'afterDiscard') return s;
  for (const [seat, kind] of (l7 ? [[1, '5z'], [2, '6z'], [3, '7z']] : [[1, '7z'], [2, '4z'], [3, '5z']]) as [Seat, string][])
    s = drawAndDiscard(s, seat, kind);
  s = draw(s, 0, '7s');
  expect(legalActions(s, 0).some(a => a.type === 'WIN'), 'WIN');
  if (point === 'win') return s;
  s = outcome === 'ron' ? settleClaims(discardKind(s, 0, '7s'), { 1: 'WIN' }) : act(s, 0, 'WIN');
  expect(s.phase === 'handResult' && s.settlement?.source === outcome, 'RESULT');
  if (point === 'result') return s;
  return act(s, 'engine', 'NEXT_HAND');
}
