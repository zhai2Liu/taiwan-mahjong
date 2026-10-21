import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, legalActions, serialize, restore } from '../dist/engine.js';
import { kindOf } from '../dist/tiles.js';
import { scoreLines } from '../dist/view.js';
import { ROUND_POINTS, roundCheckpoint, encodeCheckpoint, decodeCheckpoint, replayRound } from '../dist/learning-round.js';
import { fixture, run, discard, resolve, effective } from './fixtures.mjs';

// Independent reference: test/fixtures.mjs allocation + raw engine steps (same script as learning-round.test.mjs).
function reference(lesson) {
  const transfer = lesson === 8, dealer = transfer ? 0 : 1, suit = transfer ? 'p' : 'm';
  const allocation = fixture({ dealer, turn: dealer, hands: {
    0: transfer ? '134p 789p 456m 789m 56s 22z 9s' : '134m 789m 456p 789p 56s 22z',
    1: transfer ? '123m 456p 789p 56s 123s 22z' : '9m',
  }, head: transfer ? '5z 6z 2p 7z 4z 5z 7s' : '5z 6z f4 7z 4z 2m 5z 6z 7z 7s', tail: '9s' });
  const deck = [];
  for (let round = 0; round < 4; round++) for (let offset = 0; offset < 4; offset++)
    deck.push(...allocation.players[(dealer + offset) % 4].concealed.slice(round * 4, round * 4 + 4));
  deck.push(allocation.players[dealer].concealed[16], ...allocation.wall.order.slice(allocation.wall.head, allocation.wall.tail + 1));
  const at = {}, turn = (s, seat, tile) => resolve(discard(run(s, 'engine', 'DRAW'), seat, tile));
  let s = at.start = createGame({ dealer, deck, seed: 20261017, matchId: transfer ? 'lesson-8-fixed' : 'lesson-7-fixed' });
  s = at.dealt = run(s, 'engine', 'DEAL'); s = at.opening = run(s, 'engine', 'RESOLVE');
  if (!transfer) {
    s = resolve(discard(s, 1, '9m')); s = turn(turn(s, 2, '5z'), 3, '6z');
    s = at.flower = run(s, 'engine', 'DRAW'); s = run(s, 'engine', 'REPLACE');
  }
  s = at.discard = s;
  s = resolve(discard(s, 0, '9s'));
  s = transfer ? turn(turn(s, 1, '5z'), 2, '6z') : turn(turn(s, 1, '7z'), 2, '4z');
  s = at.claim = discard(run(s, 'engine', 'DRAW'), 3, `2${suit}`);
  at.passed = resolve(s);
  for (const pair of ['13', '34']) {
    let c = at[`afterClaim${pair}`] = resolve(s, { 0: a => a.type === 'CHI' && a.ownTiles.map(t => kindOf(t)[0]).sort().join('') === pair });
    c = at[`afterDiscard${pair}`] = resolve(discard(c, 0, `${pair === '13' ? 4 : 1}${suit}`));
    for (const [seat, tile] of transfer ? [[1, '7z'], [2, '4z'], [3, '5z']] : [[1, '5z'], [2, '6z'], [3, '7z']]) c = turn(c, seat, tile);
    c = at[`win${pair}`] = run(c, 'engine', 'DRAW');
    at[`result${pair}selfDraw`] = run(c, 0, 'WIN');
    at[`nextHand${pair}selfDraw`] = run(at[`result${pair}selfDraw`], 'engine', 'NEXT_HAND');
    if (transfer) {
      at[`result${pair}ron`] = resolve(discard(c, 0, '7s'), { 1: 'WIN' });
      at[`nextHand${pair}ron`] = run(at[`result${pair}ron`], 'engine', 'NEXT_HAND');
    }
  }
  return at;
}
const refKey = cp => `${cp.point}${cp.chi ?? ''}${cp.outcome ?? ''}`;
// opIds come from different helpers; everything else must match exactly.
const comparable = s => ({ ...s, acceptedOpIds: s.acceptedOpIds.length });

function allCheckpoints() {
  const out = [];
  for (const lesson of [7, 8]) for (const point of ROUND_POINTS) for (const chi of [null, '13', '34'])
    for (const outcome of [null, 'selfDraw', 'ron']) for (const assisted of [false, true]) {
      try { out.push(roundCheckpoint({ lesson, point, chi, outcome, assisted })); } catch { /* impossible combination */ }
    }
  return out;
}

test('只有可達組合能建立：L7 17個、L8 20個檢查點（各含受助true/false）', () => {
  const all = allCheckpoints();
  assert.equal(all.filter(c => c.lesson === 7).length, 34); assert.equal(all.filter(c => c.lesson === 8).length, 40);
  assert.ok(!all.some(c => c.lesson === 8 && c.point === 'flower'));
  assert.ok(!all.some(c => c.lesson === 7 && c.outcome === 'ron'));
});

test('所有可達檢查點：codec往返、與獨立引擎路徑等值、serialize/restore等值、受助不改局面', () => {
  const refs = { 7: reference(7), 8: reference(8) };
  for (const cp of allCheckpoints()) {
    const text = encodeCheckpoint(cp), decoded = decodeCheckpoint(text);
    assert.deepEqual(decoded, { ok: true, checkpoint: cp });
    assert.deepEqual(Object.keys(JSON.parse(text)), ['schemaVersion', 'scriptVersion', 'rulesVersion', 'lesson', 'point', 'chi', 'outcome', 'assisted']);
    const s = replayRound(decoded.checkpoint), ref = refs[cp.lesson][refKey(cp)];
    assert.ok(ref, refKey(cp));
    assert.deepEqual(comparable(s), comparable(ref), `L${cp.lesson} ${refKey(cp)}`);
    assert.deepEqual(restore(serialize(s)), s);
    assert.deepEqual(replayRound({ ...cp, assisted: !cp.assisted }), s);
    assert.equal(decoded.checkpoint.assisted, cp.assisted);
  }
});

test('真實144張發牌：開局莊家先打不再摸；L7補花待補', () => {
  for (const lesson of [7, 8]) {
    const start = replayRound(roundCheckpoint({ lesson, point: 'start', assisted: false }));
    assert.equal(start.wall.order.length, 144); assert.equal(new Set(start.wall.order).size, 144); assert.equal(start.phase, 'setup');
    const opening = replayRound(roundCheckpoint({ lesson, point: 'opening', assisted: false }));
    assert.equal(opening.turn, lesson === 8 ? 0 : 1); assert.ok(!legalActions(opening, 'engine').some(a => a.type === 'DRAW'));
  }
  const flower = replayRound(roundCheckpoint({ lesson: 7, point: 'flower', assisted: false }));
  assert.equal(flower.phase, 'awaitReplacement'); assert.equal(effective(flower.players[0]), 16);
  assert.deepEqual(replayRound(roundCheckpoint({ lesson: 8, point: 'discard', assisted: false })),
    replayRound(roundCheckpoint({ lesson: 8, point: 'opening', assisted: false })));
});

const expected = [
  [7, 'selfDraw', 2, [['自摸', 1], ['1 花（正花）', 1]], [160, -60, -50, -50], 0, 2, 0],
  [8, 'selfDraw', 1, [['自摸', 1]], [150, -50, -50, -50], 0, 0, 1],
  [8, 'ron', 1, null, [-50, 50, 0, 0], 1, 1, 0],
];
for (const [lesson, outcome, tai, lines, delta, winner, dealer, streak] of expected) for (const chi of ['13', '34'])
  test(`L${lesson}-${outcome === 'ron' ? 'R' : ''}${chi}：台數、付款、莊位；重播結算與NEXT_HAND不重付`, () => {
    const cp = roundCheckpoint({ lesson, point: 'result', chi, outcome, assisted: false });
    const s = replayRound(cp), again = replayRound(cp);
    assert.equal(s.settlement.winner, winner); assert.equal(s.settlement.source, outcome); assert.equal(s.settlement.score.tai, tai);
    if (lines) assert.deepEqual(scoreLines(s.settlement.score).map(i => [i.reason, i.tai]), lines);
    assert.deepEqual(s.settlement.delta, delta); assert.deepEqual(s.scores, delta); assert.deepEqual(again.scores, delta);
    if (outcome === 'ron') assert.equal(s.players[0].restrictions.passedWin, true);
    const next = replayRound({ ...cp, point: 'nextHand' });
    assert.deepEqual(next.scores, delta); assert.equal(next.dealer, dealer); assert.equal(next.streak, streak);
    assert.equal(next.handId, 2); assert.equal(next.settlement, null);
  });

for (const lesson of [7, 8]) test(`L${lesson}-PASS：過是合法、不拆手、輪到自己摸，且不是結算`, () => {
  const claim = replayRound(roundCheckpoint({ lesson, point: 'claim', assisted: false }));
  const passed = replayRound(roundCheckpoint({ lesson, point: 'passed', assisted: true }));
  assert.deepEqual(passed.players[0].concealed, claim.players[0].concealed); assert.equal(passed.players[0].melds.length, 0);
  assert.equal(passed.phase, 'awaitDraw'); assert.equal(passed.turn, 0); assert.equal(passed.settlement, null);
  assert.equal(effective(passed.players[0]), 16);
});

test('每次重播都是新物件，修改一份不污染下一份', () => {
  const cp = roundCheckpoint({ lesson: 7, point: 'win', chi: '13', assisted: false });
  const a = replayRound(cp), b = replayRound(cp), pristine = structuredClone(b);
  a.players[0].concealed.length = 0; a.wall.order.reverse(); a.scores[0] = 999;
  assert.deepEqual(b, pristine); assert.deepEqual(replayRound(cp), pristine);
});

test('錯誤輸入與不可能組合一律拒絕（解碼回失敗、建立／編碼丟錯），不偷偷重設', () => {
  const good = roundCheckpoint({ lesson: 8, point: 'result', chi: '34', outcome: 'ron', assisted: true });
  const text = encodeCheckpoint(good), obj = JSON.parse(text);
  const variants = [
    { ...obj, extra: 1 }, { ...obj, schemaVersion: 2 }, { ...obj, scriptVersion: 'beginner-round-v2' }, { ...obj, rulesVersion: 'TW16-CLASSIC-v2' },
    { ...obj, lesson: 9 }, { ...obj, lesson: '8' }, { ...obj, point: 'unknown' }, { ...obj, assisted: 'true' }, { ...obj, assisted: 1 },
    { ...obj, assisted: null }, { ...obj, chi: '12' }, { ...obj, chi: null }, { ...obj, outcome: null }, { ...obj, lesson: 7 },
    { ...obj, point: 'win' }, { ...obj, point: 'claim' }, { ...obj, point: 'passed' }, { ...obj, point: 'flower', chi: null, outcome: null },
    { ...obj, point: 'passed', outcome: null }, { ...obj, point: 'claim', chi: null, outcome: 'ron' },
    { ...obj, state: { players: [] } }, (({ assisted, ...rest }) => rest)(obj),
  ];
  for (const v of variants) {
    assert.equal(decodeCheckpoint(JSON.stringify(v)).ok, false, JSON.stringify(v));
    assert.throws(() => encodeCheckpoint(v)); assert.throws(() => replayRound(v));
  }
  for (const raw of [null, undefined, 42, obj, [], '', 'null', '[]', '{}', '"x"', '{', text.slice(0, -1), ` ${text}`,
    text.replace('"lesson":8', '"lesson":8,"lesson":8'), text + ' '.repeat(4096), 'x'.repeat(4096), JSON.stringify(JSON.stringify(obj))]) {
    const r = decodeCheckpoint(raw);
    assert.equal(r.ok, false, String(raw).slice(0, 60)); assert.equal(typeof r.error, 'string'); assert.equal('checkpoint' in r, false);
  }
  assert.equal(decodeCheckpoint(text + ' '.repeat(4096)).error, 'TOO_LONG');
  assert.throws(() => roundCheckpoint({ lesson: 8, point: 'flower', assisted: false }));
  assert.throws(() => roundCheckpoint({ lesson: 7, point: 'result', chi: '13', outcome: 'ron', assisted: false }));
  assert.throws(() => roundCheckpoint({ lesson: 7, point: 'afterClaim', assisted: false }));
});
