import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, legalActions, serialize, restore } from '../dist/engine.js';
import { kindOf } from '../dist/tiles.js';
import { scoreLines } from '../dist/view.js';
import { fixture, run, discard, resolve, effective } from './fixtures.mjs';

// S24-LESSON-PREPARATION.md: fixed teaching scripts, never a normal-play AI policy.
function lessonRound(transfer) {
  const dealer = transfer ? 0 : 1;
  const allocation = fixture({ dealer, turn: dealer, hands: {
    0: transfer ? '134p 789p 456m 789m 56s 22z 9s' : '134m 789m 456p 789p 56s 22z',
    1: transfer ? '123m 456p 789p 56s 123s 22z' : '9m',
  }, head: transfer ? '5z 6z 2p 7z 4z 5z 7s' : '5z 6z f4 7z 4z 2m 5z 6z 7z 7s', tail: '9s' });
  // Reuse physical allocation, then rebuild the full deck and actually DEAL. No mid-hand state injection.
  const deck = [];
  for (let round = 0; round < 4; round++) for (let offset = 0; offset < 4; offset++)
    deck.push(...allocation.players[(dealer + offset) % 4].concealed.slice(round * 4, round * 4 + 4));
  deck.push(allocation.players[dealer].concealed[16], ...allocation.wall.order.slice(allocation.wall.head, allocation.wall.tail + 1));
  assert.equal(deck.length, 144); assert.equal(new Set(deck).size, 144);
  return createGame({ dealer, deck, seed: 20261017, matchId: transfer ? 'lesson-8-fixed' : 'lesson-7-fixed' });
}
function replay(s) {
  const copy = restore(serialize(s)); assert.deepEqual(copy, s); return copy;
}
function scriptedDrawAndDiscard(s, seat, tile) {
  assert.equal(s.turn, seat); assert.equal(s.phase, 'awaitDraw');
  s = run(s, 'engine', 'DRAW'); assert.equal(kindOf(s.drawContext.lastTile), tile);
  return resolve(discard(s, seat, tile));
}
function reachClaim(transfer) {
  let s = run(lessonRound(transfer), 'engine', 'DEAL');
  assert.equal(s.phase, 'initialFlowers');
  s = run(s, 'engine', 'RESOLVE'); assert.equal(s.phase, 'awaitDiscard');
  assert.equal(s.turn, transfer ? 0 : 1);
  assert.equal(legalActions(s, 'engine').some(a => a.type === 'DRAW'), false, 'dealer must not draw again');
  s = resolve(discard(s, s.turn, transfer ? '9s' : '9m'));
  if (transfer) s = scriptedDrawAndDiscard(s, 1, '5z');
  s = scriptedDrawAndDiscard(s, 2, transfer ? '6z' : '5z');
  if (!transfer) {
    s = scriptedDrawAndDiscard(s, 3, '6z');
    s = run(s, 'engine', 'DRAW'); assert.equal(s.phase, 'awaitReplacement');
    assert.equal(effective(s.players[0]), 16); assert.deepEqual(s.players[0].flowers.map(kindOf), ['f4']);
    s = replay(s); s = run(s, 'engine', 'REPLACE');
    assert.equal(kindOf(s.drawContext.lastTile), '9s'); assert.equal(effective(s.players[0]), 17);
    s = resolve(discard(s, 0, '9s')); s = scriptedDrawAndDiscard(s, 1, '7z');
    s = scriptedDrawAndDiscard(s, 2, '4z');
  }
  assert.equal(s.turn, 3); s = run(s, 'engine', 'DRAW');
  s = discard(s, 3, transfer ? '2p' : '2m');
  assert.equal(s.phase, 'awaitClaims'); return replay(s);
}
function reachOwnWin(transfer, own) {
  let s = reachClaim(transfer); const suit = transfer ? 'p' : 'm';
  const choices = legalActions(s, 0).filter(a => a.type === 'CHI');
  assert.deepEqual(choices.map(a => a.ownTiles.map(kindOf).sort().join(',')).sort(), [`1${suit},3${suit}`, `3${suit},4${suit}`]);
  s = resolve(s, { 0: a => a.type === 'CHI' && a.ownTiles.map(kindOf).sort().join(',') === own });
  assert.equal(s.turn, 0); assert.equal(s.phase, 'awaitDiscard');
  const leftover = own.startsWith('1') ? `4${suit}` : `1${suit}`;
  s = resolve(discard(s, 0, leftover));
  for (const [seat, tile] of transfer ? [[1,'7z'],[2,'4z'],[3,'5z']] : [[1,'5z'],[2,'6z'],[3,'7z']]) s = scriptedDrawAndDiscard(s, seat, tile);
  s = run(s, 'engine', 'DRAW'); assert.equal(kindOf(s.drawContext.lastTile), '7s');
  assert.ok(legalActions(s, 0).some(a => a.type === 'WIN')); return replay(s);
}

for (const transfer of [false, true]) for (const pair of ['13', '34']) {
  const suit = transfer ? 'p' : 'm', own = [...pair].map(n => n + suit).join(',');
  test(`L${transfer ? 8 : 7}-${pair}：真正發牌→${transfer ? '莊家先打' : '補花'}→${pair}吃法→自摸→結算／下一局`, () => {
    let s = reachOwnWin(transfer, own); s = run(s, 0, 'WIN');
    assert.equal(s.phase, 'handResult'); assert.equal(s.settlement.source, 'selfDraw'); assert.equal(s.settlement.winner, 0);
    assert.equal(s.settlement.score.tai, transfer ? 1 : 2);
    assert.deepEqual(scoreLines(s.settlement.score).map(i => [i.reason,i.tai]), transfer ? [['自摸',1]] : [['自摸',1],['1 花（正花）',1]]);
    assert.deepEqual(s.settlement.delta, transfer ? [150,-50,-50,-50] : [160,-60,-50,-50]);
    const settled = replay(s), next = run(settled, 'engine', 'NEXT_HAND');
    assert.deepEqual(next.scores, settled.scores); assert.equal(next.dealer, transfer ? 0 : 2); assert.equal(next.streak, transfer ? 1 : 0);
  });
}
for (const pair of ['13', '34']) test(`L8-R${pair}：合法另一分支放棄自摸後打七條，別家胡仍能讀結算，非必須獲勝`, () => {
  let s = reachOwnWin(true, [...pair].map(n => n + 'p').join(','));
  s = discard(s, 0, '7s'); assert.equal(s.players[0].restrictions.passedWin, true);
  s = resolve(s, { 1: 'WIN' }); assert.equal(s.settlement.winner, 1); assert.equal(s.settlement.source, 'ron');
  assert.equal(s.settlement.score.tai, 1); assert.deepEqual(s.settlement.delta, [-50,50,0,0]);
  const next = run(replay(s), 'engine', 'NEXT_HAND'); assert.equal(next.dealer, 1); assert.equal(next.streak, 0);
});
for (const transfer of [false, true]) test(`L${transfer ? 8 : 7}-PASS：吃是選項，可選過並保留手牌，接著正常摸牌`, () => {
  let s = reachClaim(transfer); const own = [...s.players[0].concealed];
  s = resolve(s); assert.deepEqual(s.players[0].concealed, own);
  assert.equal(s.phase, 'awaitDraw'); assert.equal(s.turn, 0); assert.equal(effective(s.players[0]), 16);
});
