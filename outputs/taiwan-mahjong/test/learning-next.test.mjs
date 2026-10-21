import test from 'node:test';
import assert from 'node:assert/strict';
import { legalActions, getObservation, serialize, restore } from '../dist/engine.js';
import { winningTiles, isWinningHand } from '../dist/hand.js';
import { kindOf } from '../dist/tiles.js';
import { scoreLines } from '../dist/view.js';
import { fixture, run, discard, resolve, effective, kinds, W02 } from './fixtures.mjs';
import { chiFixture } from './chi-fixtures.mjs';
import * as L from '../dist/learning-fixtures.js';
import { teachingStep, resolveTeachingDiscard } from '../dist/learning-model.js';

// Fixed teaching examples, not normal-play AI or an assessment bank. IDs match S23-LESSON-PREPARATION.md.
// Runtime lessons use dist/learning-fixtures.js; the tests at the end prove those states equal these prepared cases.
const has = (s, seat, type) => legalActions(s, seat).some(a => a.type === type);
const ownKinds = a => a.ownTiles.map(kindOf).sort().join(',');
const waits = (s, seat) => winningTiles(s.players[seat].concealed, s.players[seat].melds);
const kongHand = '5555m 123p 456p 789p 123s 1z';
const stackedHand = '123m 456m 789p 555z 666z 77s';
const linePairs = s => scoreLines(s.settlement.score).map(i => [i.reason, i.tai]);

for (const [label, suit] of [['G', 'm'], ['T', 'p']]) for (const [suffix, own, banned] of [
  ['13', `1${suit},3${suit}`, [`2${suit}`]], ['34', `3${suit},4${suit}`, [`2${suit}`, `5${suit}`]],
]) test(`L4-${label}${suffix}：134遇上家2，選定吃法後先打牌、只禁該吃法的牌`, () => {
  const start = chiFixture(suit);
  assert.deepEqual(legalActions(start, 0).filter(a => a.type === 'CHI').map(ownKinds).sort(), [`1${suit},3${suit}`, `3${suit},4${suit}`]);
  let s = resolve(start, { 0: a => a.type === 'CHI' && ownKinds(a) === own });
  assert.equal(s.phase, 'awaitDiscard'); assert.equal(s.turn, 0);
  assert.equal(s.players[0].concealed.length, 14); assert.equal(effective(s.players[0]), 17);
  assert.deepEqual(s.players[0].restrictions.forbiddenDiscards, banned);
  assert.ok(legalActions(s, 0).every(a => a.type === 'DISCARD'));
  const next = legalActions(s, 0).find(a => a.type === 'DISCARD');
  s = discard(s, 0, kindOf(next.tileId)); assert.equal(effective(s.players[0]), 16);
  const wrongSource = discard(fixture({ turn: 2, hands: { 0: start.players[0].concealed.map(kindOf), 2: `2${suit}` } }), 2, `2${suit}`);
  assert.equal(has(wrongSource, 0, 'CHI'), false);
});

test('L4-P：碰可取任一家，碰後手中第四張同牌不能立刻打出或加槓', () => {
  for (const source of [1, 2, 3]) {
    let s = discard(fixture({ turn: source, hands: { 0: '555m 123p 456p 789p 12s 77z', [source]: '5m' } }), source, '5m');
    assert.ok(has(s, 0, 'PON')); s = resolve(s, { 0: 'PON' });
    assert.equal(s.phase, 'awaitDiscard'); assert.equal(s.turn, 0);
    assert.equal(effective(s.players[0]), 17); assert.equal(s.players[0].melds[0].fromSeat, source);
    assert.ok(s.players[0].concealed.some(t => kindOf(t) === '5m'));
    assert.deepEqual(s.players[0].restrictions.forbiddenDiscards, ['5m']);
    assert.ok(legalActions(s, 0).every(a => a.type === 'DISCARD' && kindOf(a.tileId) !== '5m'));
    s = discard(s, 0, '7z'); assert.equal(effective(s.players[0]), 16);
  }
});

for (const [id, choices, winner] of [
  ['WIN', { 1: 'CHI', 2: 'PON', 3: 'WIN' }, 3],
  ['PON', { 1: 'CHI', 2: 'PON', 3: 'PASS' }, 2],
  ['CHI', { 1: 'CHI', 2: 'PASS', 3: 'PASS' }, 1],
]) test(`L4-A${id}：同一張二萬依胡、碰、吃順序仲裁，未取得牌者不拆手牌`, () => {
  const start = discard(fixture({ hands: { 0: '2m', 1: '34m', 2: '22m', 3: W02 } }), 0, '2m');
  const s = resolve(start, choices);
  assert.equal(s.settlement?.winner ?? s.turn, winner);
  for (const seat of [1, 2, 3].filter(n => n !== winner)) assert.deepEqual(s.players[seat].concealed, start.players[seat].concealed);
  assert.equal(s.players[0].discardHistory.at(-1).claimedBy, winner);
  if (winner === 3) assert.equal(s.players[1].restrictions.passedWin, false);
});

test('L4-KC：暗槓後先補牌，五組加眼睛可有18張實體牌，其他人不見暗槓牌種', () => {
  let s = fixture({ hands: { 0: kongHand }, tail: '1z' });
  const tail = s.wall.tail;
  s = run(s, 0, 'KAN_CLOSED'); assert.equal(s.phase, 'awaitReplacement');
  assert.equal(effective(s.players[0]), 16); assert.equal(s.wall.tail, tail);
  assert.deepEqual(getObservation(s, 1).players[0].melds[0], { meldId: s.players[0].melds[0].meldId, kind: 'concealedKong', count: 4 });
  s = run(s, 'engine', 'REPLACE'); assert.equal(s.wall.tail, tail - 1);
  assert.equal(effective(s.players[0]), 17); assert.equal(s.players[0].concealed.length + s.players[0].melds[0].tiles.length, 18);
  assert.ok(has(s, 0, 'WIN'));
});

test('L4-KO：明槓不能取上家；取對家後補成牌型仍須先打、不能一般自摸', () => {
  for (const source of [2, 3]) {
    let s = discard(fixture({ turn: source, hands: { 0: '555m 123p 456p 789p 123s 1z', [source]: '5m' }, tail: '1z' }), source, '5m');
    assert.equal(has(s, 0, 'KAN_OPEN'), source === 2); assert.ok(has(s, 0, 'PON'));
    if (source === 3) continue;
    s = resolve(s, { 0: 'KAN_OPEN' }); assert.equal(s.phase, 'awaitReplacement');
    s = run(s, 'engine', 'REPLACE');
    assert.equal(isWinningHand(s.players[0].concealed, s.players[0].melds), true);
    assert.equal(has(s, 0, 'WIN'), false); assert.equal(s.players[0].restrictions.passedWin, false);
    assert.equal(s.drawContext.selfDrawForbidden, true);
  }
});

for (const rob of [false, true]) test(`L4-${rob ? 'KR' : 'KA'}：加槓${rob ? '被搶不成槓、不補牌' : '無人搶才成立、解除過水並補牌'}`, () => {
  let s = fixture({ hands: { 0: '5m 123p 456p 789p 123s 1z', 1: W02 }, melds: { 0: [{ tiles: '555m' }] },
    restrictions: { 0: { passedWin: true } }, tail: '1z' });
  const tail = s.wall.tail, fourth = s.players[0].concealed.find(t => kindOf(t) === '5m');
  s = run(s, 0, 'KAN_ADDED'); assert.equal(s.phase, 'awaitRobKong');
  assert.equal(s.players[0].melds[0].kind, 'pon'); assert.ok(s.players[0].concealed.includes(fourth));
  assert.equal(s.players[0].restrictions.passedWin, true);
  s = resolve(s, { 1: rob ? 'WIN' : 'PASS' }); assert.equal(s.wall.tail, tail);
  if (rob) {
    assert.equal(s.settlement.source, 'robKong'); assert.equal(s.settlement.winner, 1);
    assert.equal(s.settlement.externalTile, fourth); assert.equal(s.players[0].melds[0].tiles.length, 3);
  } else {
    assert.equal(s.phase, 'awaitReplacement'); assert.equal(s.players[0].melds[0].kind, 'addedKong');
    assert.equal(s.players[0].restrictions.passedWin, false);
    s = run(s, 'engine', 'REPLACE'); assert.equal(s.wall.tail, tail - 1); assert.ok(has(s, 0, 'WIN'));
  }
});

test('L4-E：牌尾可用4張仍有兩吃法，3張則禁吃，不能只憑134開選項', () => {
  assert.equal(legalActions(chiFixture('m', 0, { available: 4 }), 0).filter(a => a.type === 'CHI').length, 2);
  assert.equal(has(chiFixture('m', 0, { available: 3 }), 0, 'CHI'), false);
});

test('L5-G：四組加34萬及東東，聽二萬／五萬，自己摸與別家打出來源不同', () => {
  assert.deepEqual(winningTiles(W02), ['2m', '5m']);
  const ron = discard(fixture({ turn: 3, hands: { 0: W02, 3: '2m' } }), 3, '2m');
  assert.ok(legalActions(ron, 0).some(a => a.type === 'WIN' && a.source === 'ron'));
  const drawn = run(fixture({ phase: 'awaitDraw', hands: { 0: W02 }, head: '5m' }), 'engine', 'DRAW');
  assert.ok(legalActions(drawn, 0).some(a => a.type === 'WIN' && a.source === 'selfDraw'));
});

test('L5-T：換例四組加二筒二筒、發發，兩種等待是二筒及發財', () => {
  const hand = kinds('123m 567m 345p 678s 22p 66z');
  assert.deepEqual(winningTiles(hand), ['2p', '6z']);
  for (const tile of ['2p', '6z']) assert.equal(isWinningHand([...hand, tile]), true);
  assert.equal(isWinningHand([...hand, '5z']), false);
});

test('L5-P：真正放過二萬後，自摸五萬仍被過水限制，打回五萬不解除', () => {
  let s = discard(fixture({ turn: 3, hands: { 0: W02, 3: '2m' }, head: '5m' }), 3, '2m');
  assert.ok(has(s, 0, 'WIN')); s = resolve(s);
  assert.equal(s.players[0].restrictions.passedWin, true);
  s = run(s, 'engine', 'DRAW'); assert.equal(isWinningHand(s.players[0].concealed), true); assert.equal(has(s, 0, 'WIN'), false);
  s = discard(s, 0, '5m'); assert.deepEqual(waits(s, 0), ['2m', '5m']);
  assert.equal(s.players[0].restrictions.passedWin, true);
});

test('L5-R：放過後摸九萬、打九萬解除，下一家打二萬可重新胡', () => {
  let s = resolve(discard(fixture({ turn: 3, hands: { 0: W02, 3: '2m' }, head: '9m 2m' }), 3, '2m'));
  assert.equal(s.players[0].restrictions.passedWin, true);
  s = run(s, 'engine', 'DRAW'); s = discard(s, 0, '9m');
  assert.deepEqual(waits(s, 0), ['2m', '5m']); assert.equal(s.players[0].restrictions.passedWin, false);
  s = resolve(s); s = run(s, 'engine', 'DRAW'); s = discard(s, 1, '2m'); assert.ok(has(s, 0, 'WIN'));
});

test('L5-C：改聽一筒／四筒／七筒，打出的四筒仍在新聽口，不能解除過水', () => {
  let s = run(fixture({ phase: 'awaitDraw', hands: { 0: W02 }, head: '5m', restrictions: { 0: { passedWin: true } } }), 'engine', 'DRAW');
  // Remaining 23456p completes as 123+456, 234+456, or 234+567; do not freeze just one decomposition.
  s = discard(s, 0, '4p'); assert.deepEqual(waits(s, 0), ['1p', '4p', '7p']);
  assert.equal(s.players[0].restrictions.passedWin, true);
});

test('L5-H：曾打過二萬不等同不能胡二萬，不套用其他麻將規則', () => {
  const s = discard(fixture({ turn: 3, hands: { 0: W02, 3: '2m' }, restrictions: { 0: { lastDiscard: '2m' } } }), 3, '2m');
  assert.equal(s.players[0].restrictions.passedWin, false); assert.ok(has(s, 0, 'WIN'));
});

test('L6-G：門清一摸三、紅中、發財、2正花、獨聽共8台，連2莊每家付160', () => {
  const s = run(fixture({ hands: { 0: stackedHand }, flowers: { 0: 'f1 f5 f2' }, streak: 2 }), 0, 'WIN');
  const before = serialize(s);
  assert.deepEqual(linePairs(s), [['門清一摸三', 3], ['紅中', 1], ['發財', 1], ['2 花（正花）', 2], ['獨聽', 1]]);
  assert.equal(s.settlement.score.tai, 8); assert.deepEqual(s.settlement.delta, [480, -160, -160, -160]);
  assert.equal(serialize(s), before, 'display must not recompute or mutate settlement');
  const copy = restore(before); assert.deepEqual(copy.scores, s.scores);
  const next = run(copy, 'engine', 'NEXT_HAND'); assert.deepEqual(next.scores, s.scores);
  assert.equal(next.dealer, 0); assert.equal(next.streak, 3);
});

test('L6-T：開門胡紅中及1正花共2台，非莊放槍付50，不加無關莊連台', () => {
  let s = discard(fixture({ turn: 2, dealer: 0, streak: 2, hands: { 1: '456m 234p 345s 55z 22z', 2: '5z' },
    melds: { 1: [{ kind: 'chi', tiles: '123m' }] }, flowers: { 1: 'f2 f1' } }), 2, '5z');
  s = resolve(s, { 1: 'WIN' });
  assert.deepEqual(linePairs(s), [['紅中', 1], ['1 花（正花）', 1]]);
  assert.equal(s.settlement.score.tai, 2); assert.deepEqual(s.settlement.delta, [0, 50, -50, 0]);
  const next = run(s, 'engine', 'NEXT_HAND'); assert.equal(next.dealer, 1); assert.equal(next.streak, 0); assert.equal(next.dealerAdvances, 1);
});

test('L6-P：閒家8台自摸，只有莊家付款加莊連台，三家不一定同額', () => {
  const s = run(fixture({ turn: 1, hands: { 1: stackedHand }, flowers: { 1: 'f2 f6 f1' }, streak: 2 }), 1, 'WIN');
  assert.equal(s.settlement.score.tai, 8); assert.deepEqual(s.settlement.delta, [-160, 380, -110, -110]);
});

test('L6-N：閒家胡牌後莊位交原莊家下家，不直接交給胡牌者', () => {
  let s = discard(fixture({ turn: 3, hands: { 2: '456m 234p 345s 55z 22z', 3: '5z' }, streak: 2,
    melds: { 2: [{ kind: 'chi', tiles: '123m' }] }, flowers: { 2: 'f3 f1' } }), 3, '5z');
  s = resolve(s, { 2: 'WIN' }); assert.equal(s.settlement.winner, 2);
  assert.deepEqual(s.settlement.delta, [0, 0, 50, -50]);
  const next = run(s, 'engine', 'NEXT_HAND'); assert.equal(next.dealer, 1); assert.equal(next.streak, 0);
});

test('L6-Z：零台也可胡，非莊放槍支付一底30分', () => {
  let s = discard(fixture({ turn: 2, dealer: 3, hands: { 1: '45m 234p 345s 789s 11z', 2: '6m' },
    melds: { 1: [{ kind: 'chi', tiles: '123m' }] } }), 2, '6m');
  assert.ok(has(s, 1, 'WIN')); s = resolve(s, { 1: 'WIN' });
  assert.equal(s.settlement.score.tai, 0); assert.deepEqual(linePairs(s), []); assert.deepEqual(s.settlement.delta, [0, 30, -30, 0]);
});

test('L6-F：四季成花槓取代春正花，梅仍正花，不把每一張花都算1台', () => {
  const s = run(fixture({ hands: { 0: stackedHand }, flowers: { 0: 'f1 f2 f3 f4 f5' } }), 0, 'WIN');
  assert.equal(s.settlement.score.tai, 9);
  assert.ok(linePairs(s).some(([name, tai]) => name === '花槓 1 組' && tai === 2));
  assert.ok(linePairs(s).some(([name, tai]) => name === '1 花（正花）' && tai === 1));
});

test('L6-D：流局零付款且仍連莊，不能把安全不放槍解釋成一定阻莊', () => {
  const s = run(fixture({ phase: 'awaitDraw', available: 0, streak: 2 }), 'engine', 'RESOLVE');
  assert.equal(s.settlement.source, 'draw'); assert.equal(s.settlement.score, null); assert.deepEqual(s.settlement.delta, [0, 0, 0, 0]);
  const next = run(s, 'engine', 'NEXT_HAND'); assert.equal(next.dealer, 0); assert.equal(next.streak, 3);
});

// ---- Runtime lesson examples (src/learning-fixtures.ts) must be the same engine states as the prepared cases above. ----
// Only the match label and operation IDs differ; everything the engine reasons about is compared.
const core = s => { const { matchId, acceptedOpIds, settlement, ...rest } = s; return JSON.stringify({ ...rest, settlement: settlement && { ...settlement, id: null } }); };
const pon = source => discard(fixture({ turn: source, hands: { 0: '555m 123p 456p 789p 12s 77z', [source]: '5m' } }), source, '5m');
const priority = () => discard(fixture({ hands: { 0: '2m', 1: '34m', 2: '22m', 3: W02 } }), 0, '2m');
const added = () => fixture({ hands: { 0: '5m 123p 456p 789p 123s 1z', 1: W02 }, melds: { 0: [{ tiles: '555m' }] }, restrictions: { 0: { passedWin: true } }, tail: '1z' });
const ron = (head = []) => discard(fixture({ turn: 3, hands: { 0: W02, 3: '2m' }, head }), 3, '2m');

test('執行期第4課示例與L4-G／T／P／A／K／E牌例逐狀態一致', () => {
  for (const suit of ['m', 'p']) assert.equal(core(L.chiExample(suit)), core(chiFixture(suit)));
  for (const available of [4, 3]) assert.equal(core(L.chiExample('m', 3, available)), core(chiFixture('m', 0, { available })));
  assert.equal(core(L.chiExample('m', 2)), core(discard(fixture({ turn: 2, hands: { 0: chiFixture('m').players[0].concealed.map(kindOf), 2: '2m' } }), 2, '2m')));
  for (const source of [1, 2, 3]) assert.equal(core(L.ponExample(source)), core(pon(source)));
  assert.equal(core(L.priorityExample()), core(priority()));
  L.PRIORITY_CHOICES.forEach(choice => assert.equal(core(L.settleClaims(L.priorityExample(), choice)), core(resolve(priority(), choice))));
  assert.equal(core(L.closedKongExample()), core(fixture({ hands: { 0: kongHand }, tail: '1z' })));
  for (const source of [2, 3]) assert.equal(core(L.openKongExample(source)), core(discard(fixture({ turn: source, hands: { 0: '555m 123p 456p 789p 123s 1z', [source]: '5m' }, tail: '1z' }), source, '5m')));
  assert.equal(core(L.addedKongExample()), core(added()));
});

test('執行期第4課流程：兩種吃法、禁打原因、錯來源、碰、仲裁、三種槓與補充界線都由引擎判定', () => {
  for (const suit of ['m', 'p']) {
    const start = L.chiExample(suit);
    assert.equal(has(L.chiExample(suit, 2), 0, 'CHI'), false, 'across seat cannot be chied');
    for (const chi of legalActions(start, 0).filter(a => a.type === 'CHI')) {
      const s = L.settleClaims(start, { 0: a => a.type === 'CHI' && a.ownTiles.join() === chi.ownTiles.join() });
      const own = chi.ownTiles.map(kindOf).sort().join(',');
      assert.deepEqual(s.players[0].restrictions.forbiddenDiscards, own === `1${suit},3${suit}` ? [`2${suit}`] : [`2${suit}`, `5${suit}`]);
      assert.equal(s.wall.head, start.wall.head, 'no extra draw after chi');
      const banned = s.players[0].concealed.filter(t => s.players[0].restrictions.forbiddenDiscards.includes(kindOf(t)));
      assert.ok(banned.every(t => !legalActions(s, 0).some(a => a.type === 'DISCARD' && a.tileId === t)));
      const legal = legalActions(s, 0).find(a => a.type === 'DISCARD');
      const done = resolveTeachingDiscard(teachingStep(s, 0, legal));
      assert.equal(done.players[0].concealed.length, 13); assert.equal(done.players[0].melds.length, 1);
    }
  }
  const p = L.settleClaims(L.ponExample(3), { 0: 'PON' });
  assert.equal(has(L.ponExample(3), 0, 'KAN_OPEN'), false); assert.deepEqual(p.players[0].restrictions.forbiddenDiscards, ['5m']);
  assert.ok(legalActions(p, 0).every(a => a.type === 'DISCARD'));
  assert.deepEqual(L.PRIORITY_CHOICES.map(c => { const s = L.settleClaims(L.priorityExample(), c); return s.settlement?.winner ?? s.turn; }), [3, 2, 1]);
  let k = L.act(L.act(L.closedKongExample(), 0, 'KAN_CLOSED'), 'engine', 'REPLACE');
  assert.equal(k.players[0].concealed.length + k.players[0].melds[0].tiles.length, 18);
  assert.equal(getObservation(k, 1).players[0].melds[0].count, 4);
  assert.equal(has(L.openKongExample(3), 0, 'KAN_OPEN'), false);
  k = L.act(L.settleClaims(L.openKongExample(2), { 0: 'KAN_OPEN' }), 'engine', 'REPLACE');
  assert.equal(isWinningHand(k.players[0].concealed.map(kindOf), k.players[0].melds), true); assert.equal(has(k, 0, 'WIN'), false);
  const waiting = L.act(L.addedKongExample(), 0, 'KAN_ADDED');
  const robbed = L.settleClaims(waiting, { 1: 'WIN' });
  assert.equal(robbed.settlement.source, 'robKong'); assert.equal(robbed.players[0].melds[0].tiles.length, 3); assert.equal(robbed.wall.tail, waiting.wall.tail);
  const kong = L.act(L.settleClaims(waiting, { 1: 'PASS' }), 'engine', 'REPLACE');
  assert.equal(kong.players[0].melds[0].kind, 'addedKong'); assert.equal(kong.players[0].restrictions.passedWin, false); assert.equal(kong.wall.tail, waiting.wall.tail - 1);
  assert.deepEqual(L.lesson4Limits(), { chiAt4: 2, chiAt3: 0, ponAfterPass: false, claimOwnLast: false });
});

test('執行期第5課示例與L5-G／T／P／R／C／H一致，且過水分支只由引擎判定', () => {
  assert.deepEqual(L.kinds(L.WAIT_HAND), W02); assert.deepEqual(L.kinds(L.WAIT_TRANSFER_HAND), kinds('123m 567m 345p 678s 22p 66z'));
  assert.deepEqual(winningTiles(L.kinds(L.WAIT_HAND)), ['2m', '5m']); assert.deepEqual(winningTiles(L.kinds(L.WAIT_TRANSFER_HAND)), ['2p', '6z']);
  for (const head of ['', '5m', '9m 2m']) assert.equal(core(L.ronExample(L.WAIT_HAND, '2m', head)), core(ron(head)));
  assert.equal(core(L.selfDrawExample(L.WAIT_HAND, '5m')), core(run(fixture({ phase: 'awaitDraw', hands: { 0: W02 }, head: '5m' }), 'engine', 'DRAW')));
  assert.equal(core(L.changeWaitExample()), core(discard(run(fixture({ phase: 'awaitDraw', hands: { 0: W02 }, head: '5m', restrictions: { 0: { passedWin: true } } }), 'engine', 'DRAW'), 0, '4p')));
  assert.equal(core(L.ownDiscardExample()), core(discard(fixture({ turn: 3, hands: { 0: W02, 3: '2m' }, restrictions: { 0: { lastDiscard: '2m' } } }), 3, '2m')));
  assert.ok(legalActions(L.ronExample(L.WAIT_HAND, '2m'), 0).some(a => a.type === 'WIN' && a.source === 'ron'));
  assert.ok(legalActions(L.selfDrawExample(L.WAIT_HAND, '5m'), 0).some(a => a.type === 'WIN' && a.source === 'selfDraw'));
  // Lesson path: PASS on a legal ron, draw 5m, no self-draw, discarding 5m keeps passed-water.
  let s = L.act(L.settleClaims(L.ronExample(L.WAIT_HAND, '2m', '5m')), 'engine', 'DRAW');
  assert.equal(s.players[0].restrictions.passedWin, true); assert.equal(has(s, 0, 'WIN'), false);
  assert.equal(L.discardKind(s, 0, '5m').players[0].restrictions.passedWin, true);
  // Second branch: only discarding 9m both clears passed-water and keeps the 2m/5m waits; then a later 2m is a legal win.
  s = L.act(L.settleClaims(L.ronExample(L.WAIT_HAND, '2m', '9m 2m')), 'engine', 'DRAW');
  const clears = [...new Set(legalActions(s, 0).filter(a => a.type === 'DISCARD').map(a => teachingStep(s, 0, a))
    .filter(after => !after.players[0].restrictions.passedWin && winningTiles(after.players[0].concealed.map(kindOf)).join() === '2m,5m')
    .map(after => kindOf(after.players[0].discardHistory.at(-1).tileId)))];
  assert.deepEqual(clears, ['9m']);
  s = L.discardKind(L.act(resolveTeachingDiscard(L.discardKind(s, 0, '9m')), 'engine', 'DRAW'), 1, '2m');
  assert.ok(has(s, 0, 'WIN')); assert.equal(L.settleClaims(s, { 0: 'WIN' }).settlement.winner, 0);
  const changed = L.changeWaitExample();
  assert.deepEqual(winningTiles(changed.players[0].concealed.map(kindOf)), ['1p', '4p', '7p']); assert.equal(changed.players[0].restrictions.passedWin, true);
  const transfer = L.act(L.settleClaims(L.ronExample(L.WAIT_TRANSFER_HAND, '2p', '6z')), 'engine', 'DRAW');
  assert.equal(isWinningHand(transfer.players[0].concealed.map(kindOf)), true); assert.equal(has(transfer, 0, 'WIN'), false);
  assert.ok(has(L.ownDiscardExample(), 0, 'WIN'));
});

test('執行期第6課示例與L6-G／T／P／N／Z／F／D一致；只讀已完成結算，重看不重付', () => {
  assert.equal(core(L.settlementGuided()), core(fixture({ hands: { 0: stackedHand }, flowers: { 0: 'f1 f5 f2' }, streak: 2 })));
  const transfer = discard(fixture({ turn: 2, dealer: 0, streak: 2, hands: { 1: '456m 234p 345s 55z 22z', 2: '5z' }, melds: { 1: [{ kind: 'chi', tiles: '123m' }] }, flowers: { 1: 'f2 f1' } }), 2, '5z');
  assert.equal(core(L.settlementTransfer()), core(resolve(transfer, { 1: 'WIN' })));
  const x = L.settlementSupplements();
  assert.equal(core(x.nonDealerSelfDraw), core(run(fixture({ turn: 1, hands: { 1: stackedHand }, flowers: { 1: 'f2 f6 f1' }, streak: 2 }), 1, 'WIN')));
  assert.equal(core(x.dealerMoves), core(resolve(discard(fixture({ turn: 3, hands: { 2: '456m 234p 345s 55z 22z', 3: '5z' }, streak: 2, melds: { 2: [{ kind: 'chi', tiles: '123m' }] }, flowers: { 2: 'f3 f1' } }), 3, '5z'), { 2: 'WIN' })));
  assert.equal(core(x.zeroTai), core(resolve(discard(fixture({ turn: 2, dealer: 3, hands: { 1: '45m 234p 345s 789s 11z', 2: '6m' }, melds: { 1: [{ kind: 'chi', tiles: '123m' }] } }), 2, '6m'), { 1: 'WIN' })));
  assert.equal(core(x.flowerKong), core(run(fixture({ hands: { 0: stackedHand }, flowers: { 0: 'f1 f2 f3 f4 f5' } }), 0, 'WIN')));
  assert.equal(core(x.exhaustiveDraw), core(run(fixture({ phase: 'awaitDraw', available: 0, streak: 2 }), 'engine', 'RESOLVE')));
  const guided = L.act(L.settlementGuided(), 0, 'WIN'), snapshot = serialize(guided);
  assert.deepEqual(linePairs(guided), [['門清一摸三', 3], ['紅中', 1], ['發財', 1], ['2 花（正花）', 2], ['獨聽', 1]]);
  assert.deepEqual(guided.settlement.delta, [480, -160, -160, -160]); assert.deepEqual(guided.scores, [480, -160, -160, -160]);
  // The lesson's 正花 answer (seat wind → 春梅/夏蘭/秋菊/北冬竹) must agree with the engine's S06 line.
  const proper = (s, seat) => { const w = (seat - s.dealer + 4) % 4 + 1; return s.players[seat].flowers.filter(f => [w, w + 4].includes(Number(kindOf(f)[1]))); };
  assert.deepEqual(proper(guided, 0).map(kindOf), ['f1', 'f5']); assert.equal(guided.settlement.score.items.find(i => i.id === 'S06').tai, 2);
  const next = L.nextHand(guided); assert.equal(next.dealer, 0); assert.equal(next.streak, 3); assert.deepEqual(next.scores, guided.scores);
  linePairs(guided); L.nextHand(guided); assert.equal(serialize(guided), snapshot, 'reading or previewing next hand must not pay again');
  const t = L.settlementTransfer();
  assert.deepEqual(linePairs(t), [['紅中', 1], ['1 花（正花）', 1]]); assert.deepEqual(t.settlement.delta, [0, 50, -50, 0]);
  assert.deepEqual(proper(t, 1).map(kindOf), ['f2']); assert.equal(t.settlement.score.items.find(i => i.id === 'S06').tai, 1);
  const tn = L.nextHand(t); assert.equal(tn.dealer, 1); assert.equal(tn.streak, 0);
  assert.deepEqual(x.nonDealerSelfDraw.settlement.delta, [-160, 380, -110, -110]);
  assert.equal(x.dealerMoves.settlement.winner, 2); assert.equal(L.nextHand(x.dealerMoves).dealer, 1);
  assert.equal(x.zeroTai.settlement.score.tai, 0); assert.deepEqual(x.zeroTai.settlement.delta, [0, 30, -30, 0]);
  assert.equal(x.flowerKong.settlement.score.tai, 9); assert.deepEqual(x.exhaustiveDraw.settlement.delta, [0, 0, 0, 0]); assert.equal(L.nextHand(x.exhaustiveDraw).streak, 3);
});
