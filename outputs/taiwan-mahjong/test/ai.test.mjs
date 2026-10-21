import test from 'node:test';
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { chooseAction } from '../dist/ai.js';
import { createGame, getObservation, legalActions, assertState } from '../dist/engine.js';
import { winningTiles } from '../dist/hand.js';
import { kindOf, isFlower } from '../dist/tiles.js';
import { analyzeObservation, compareAnalysis, publicPool } from '../dist/analysis.js';
import { ordinaryRonSafety } from '../dist/safety.js';
import { fixture, discard, step, W02, WIN } from './fixtures.mjs';

const decide = (state, seat = 0, seed = 1) => {
  const observation = getObservation(state, seat);
  return chooseAction(observation, observation.legalActions, seed);
};
const freeze = value => {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};

test('AI 同觀察同種子可重播、只選合法動作、不修改輸入、不讀全域亂數', () => {
  const observation = freeze(getObservation(fixture({ hands: { 0: [...W02, '7z'] } }), 0));
  const originalRandom = Math.random;
  Math.random = () => { throw new Error('AI must not use global randomness'); };
  try {
    const a = chooseAction(observation, observation.legalActions, 123);
    const b = chooseAction(observation, observation.legalActions, 123);
    assert.deepEqual(a, b);
    assert.ok(observation.legalActions.includes(a.intent));
    assert.ok(a.randomState > 0 && a.randomState <= 0xffffffff);
    assert.notEqual(a.randomState, 123);
  } finally { Math.random = originalRandom; }
});

test('AI 邊界拒絕無動作或壞種子，忽略不在觀察合法清單的偽造胡牌', () => {
  const o = getObservation(fixture(), 0);
  for (const seed of [0, -1, 1.5, NaN, Infinity, 0x100000000]) assert.throws(() => chooseAction(o, o.legalActions, seed), /INVALID_AI_RANDOM_STATE/);
  assert.throws(() => chooseAction(o, [], 1), /NO_LEGAL_AI_ACTION/);
  const forged = { type: 'WIN', source: 'selfDraw' };
  const result = chooseAction(o, [...o.legalActions, forged], 1);
  assert.notEqual(result.intent, forged);
  assert.ok(o.legalActions.includes(result.intent));
});

test('AI 合法胡牌必選，包含自摸、放槍及搶槓', () => {
  assert.equal(decide(fixture({ hands: { 0: WIN } })).intent.type, 'WIN');
  const ron = discard(fixture({ hands: { 0: '2m', 1: W02 } }), 0, '2m');
  assert.equal(decide(ron, 1).intent.source, 'ron');
  let kong = fixture({ hands: { 0: '2m', 1: W02 }, melds: { 0: [{ tiles: '222m' }] } });
  kong = step(kong, 0, legalActions(kong, 0).find(a => a.type === 'KAN_ADDED'));
  assert.equal(decide(kong, 1).intent.source, 'robKong');
});

test('AI 以五面子一對將判斷，保留第五組兩面並打出孤張', () => {
  const result = decide(fixture({ hands: { 0: [...W02, '7z'] } }));
  assert.equal(kindOf(result.intent.tileId), '7z');
  assert.equal(result.reason, '聽牌；依公開資訊估計有效進張 8 張');
});

test('AI 副露算一組，五副露後保留尚有三張的單騎', () => {
  const state = fixture({ hands: { 0: '12z' }, melds: { 0: ['123m', '456m', '123p', '456p', '789s'].map(tiles => ({ kind: 'chi', tiles })) } });
  const o = getObservation(state, 0);
  o.players[1].discardHistory.push(...[1, 2, 3].map(n => ({ tileId: `1z#${n}`, eventSeq: 100 + n, claimedBy: null })));
  const result = chooseAction(o, o.legalActions, 1);
  assert.equal(kindOf(result.intent.tileId), '1z');
  assert.equal(result.reason, '聽牌；依公開資訊估計有效進張 3 張');
});

test('AI 公開牌重複引用只扣一次，暗槓遮罩不需牌種', () => {
  const state = fixture({ hands: { 0: [...W02, '7z'] } });
  const o = getObservation(state, 0);
  o.players[1].melds.push({ meldId: 'hidden', kind: 'concealedKong', count: 4 });
  o.players[2].melds.push({ meldId: 'public', kind: 'pon', tiles: ['2m#0', '2m#1', '2m#2'], fromSeat: 3, sourceEvent: 100 });
  o.players[3].discardHistory.push({ tileId: '2m#0', eventSeq: 100, claimedBy: 2 });
  const result = chooseAction(o, o.legalActions, 1);
  assert.equal(kindOf(result.intent.tileId), '7z');
  assert.equal(result.reason, '聽牌；依公開資訊估計有效進張 5 張');
});

test('AI 吃碰先比較合法捨牌後效率，改善才叫牌', () => {
  for (const [offered, hand, expected] of [
    ['2m', '34m 67m 123p 456p 789s 11z 7z', 'CHI'],
    ['5m', '55m 67m 123p 456p 789s 11z 7z', 'PON'],
    ['1z', '13m 789m 234p 345s 789s 11z', 'PASS'],
  ]) {
    const state = discard(fixture({ hands: { 0: offered, 1: hand } }), 0, offered);
    assert.equal(decide(state, 1).intent.type, expected);
  }
});

test('AI 門清且叫牌後仍離聽牌兩步以上時不吃碰；有台字牌碰與已副露手不受此限', () => {
  const far = '7m 9m 1p 4p 7p 2s 5s 8s 1z 2z 3z 6z 9p';
  for (const [offered, hand, melds, expected] of [
    ['2m', `34m ${far}`, [], 'PASS'],
    ['5z', `55z 3m ${far}`, [], 'PON'],
    ['2m', '34m 7m 9m 1p 4p 7p 2s 5s 1z 2z 3z 6z', [{ tiles: '999s', fromSeat: 2 }], 'CHI'],
  ]) {
    const state = discard(fixture({ hands: { 0: offered, 1: hand }, melds: { 1: melds } }), 0, offered);
    const o = getObservation(state, 1);
    assert.ok(o.legalActions.some(a => a.type === (expected === 'PASS' ? 'CHI' : expected)), `${offered} 應有可叫選項`);
    assert.equal(decide(state, 1).intent.type, expected, `${offered} ${hand}`);
  }
});

test('AI 遠手碰自風或圈風可破門清，非台字仍保留門清', () => {
  const far = '7m 9m 1p 4p 7p 2s 5s 8s 1z 2z 3z 6z 9p';
  for (const [kind, expected] of [['1z', 'PON'], ['2z', 'PON'], ['3z', 'PASS']]) {
    const hand = `${kind[0]}${kind[0]}z 3m ${far.replace(kind, '8p')}`;
    const o = getObservation(discard(fixture({ hands: { 0: kind, 1: hand } }), 0, kind), 1);
    const summary = analyzeObservation(o, false), claim = summary.claims.find(c => c.intent.type === 'PON');
    assert.ok(claim);
    assert.equal(claim.best[0].analysis.shanten, summary.current.shanten - 1);
    assert.ok(claim.best[0].analysis.shanten > 1, '必須隔離遠手的有台字牌豁免');
    assert.equal(chooseAction(o, o.legalActions, 1).intent.type, expected);
  }
});

test('AI 門清叫牌後恰好一步聽時可吃，只有暗槓的遠手仍保留門清', () => {
  const near = discard(fixture({ hands: { 0: '2m', 1: '34m 67m 124p 456p 789s 11z 7z' } }), 0, '2m');
  const o = getObservation(near, 1), summary = analyzeObservation(o, false);
  assert.equal(summary.current.shanten, 2);
  assert.equal(summary.claims.find(c => c.intent.type === 'CHI').best[0].analysis.shanten, 1);
  assert.equal(decide(near, 1).intent.type, 'CHI');
  const closed = discard(fixture({
    hands: { 0: '2m', 1: '34m 7m 9m 1p 4p 7p 2s 5s 1z 2z 3z 6z' },
    melds: { 1: [{ kind: 'concealedKong', tiles: '9999s' }] },
  }), 0, '2m');
  const closedSummary = analyzeObservation(getObservation(closed, 1), false);
  assert.equal(closedSummary.claims[0].best[0].analysis.shanten, closedSummary.current.shanten - 1);
  assert.ok(closedSummary.claims[0].best[0].analysis.shanten > 1);
  assert.equal(decide(closed, 1).intent.type, 'PASS');
});

test('AI 只拿到吃碰選項（沒有過）時仍回傳合法動作', () => {
  const state = discard(fixture({ hands: { 0: '2m', 1: '34m 7m 9m 1p 4p 7p 2s 5s 8s 1z 2z 3z 6z 9p' } }), 0, '2m');
  const o = getObservation(state, 1), only = o.legalActions.filter(a => a.type === 'CHI');
  assert.equal(chooseAction(o, only, 1).intent.type, 'CHI');
});

test('AI 選保留效率的暗槓／加槓，拒絕拆掉第五面子的暗槓', () => {
  assert.equal(decide(fixture({ hands: { 0: '5555m 123p 456p 789p 123s 1z' } })).intent.type, 'KAN_CLOSED');
  assert.equal(decide(fixture({ hands: { 0: '5m 123p 456p 789p 123s 1z' }, melds: { 0: [{ tiles: '555m' }] } })).intent.type, 'KAN_ADDED');
  const result = decide(fixture({ hands: { 0: '1111m 23m 123p 456p 789s 12z' } }));
  assert.equal(result.intent.type, 'DISCARD');
  assert.ok(['1z', '2z'].includes(kindOf(result.intent.tileId)));
});

test('AI 四張同牌不能拆成需第五張的假聽牌', () => {
  const state = fixture({ hands: { 0: '1111z 222z 333z 444z 55z 6z' } });
  const o = getObservation(state, 0), only = o.legalActions.filter(a => a.type === 'DISCARD' && kindOf(a.tileId) === '6z');
  const result = chooseAction(o, only, 1);
  assert.match(result.reason, /^1 向聽/);
});

const xorshift = n => { n ^= n << 13; n ^= n >>> 17; n ^= n << 5; return n >>> 0; };
const SEEDS = Array.from({ length: 40 }, (_, i) => i * 104729 + 7);
// 北風三張公開於他家捨牌，自家持最後一張；與孤張 9s 牌效完全並列。
const tieFixture = (restrictions = { 1: { lastDiscard: '4z' }, 2: { lastDiscard: '4z' }, 3: { lastDiscard: '4z' } }) =>
  fixture({ hands: { 0: '123m 456m 123p 23s 67p 55z 4z 9s' }, restrictions });
const bestDiscards = o => {
  const { discards } = analyzeObservation(o, false);
  const best = [...discards].sort((a, b) => compareAnalysis(b.analysis, a.analysis))[0].analysis;
  return { discards, best, tied: discards.filter(d => compareAnalysis(d.analysis, best) === 0).map(d => d.kind) };
};

test('AI 牌效完全並列的捨牌中，所有種子都選公開證明不會被普通放槍的牌', () => {
  const o = freeze(getObservation(tieFixture(), 0));
  const { tied } = bestDiscards(o), pool = publicPool(o);
  assert.ok(tied.includes('4z') && tied.includes('9s'), `須先隔離並列：${tied}`);
  assert.deepEqual(tied.filter(k => ordinaryRonSafety(pool, k).provenSafe), ['4z']);
  const order = o.legalActions.filter(a => a.type === 'DISCARD' && tied.includes(kindOf(a.tileId)));
  assert.ok(SEEDS.some(s => kindOf(order[Math.floor(xorshift(s) / 4294967296 * order.length)].tileId) !== '4z'), '原隨機並列須有種子選到非安全牌');
  const originalRandom = Math.random;
  Math.random = () => { throw new Error('AI must not use global randomness'); };
  try {
    const reasons = new Set();
    for (const seed of SEEDS) {
      const result = chooseAction(o, o.legalActions, seed);
      assert.ok(o.legalActions.includes(result.intent));
      assert.equal(kindOf(result.intent.tileId), '4z', `seed ${seed}`);
      assert.equal(result.randomState, xorshift(seed));
      reasons.add(result.reason);
    }
    assert.equal(reasons.size, 1);
  } finally { Math.random = originalRandom; }
});

test('AI 安全證明不讓牌效較差的捨牌取代原本最佳捨牌', () => {
  const o = getObservation(fixture({ hands: { 0: '123m 456m 123p 23s 677p 44z 9s' }, restrictions: { 1: { lastDiscard: '4z' }, 2: { lastDiscard: '4z' } } }), 0);
  const { discards, best, tied } = bestDiscards(o);
  assert.ok(ordinaryRonSafety(publicPool(o), '4z').provenSafe);
  assert.ok(compareAnalysis(discards.find(d => d.kind === '4z').analysis, best) < 0, '4z 須確實牌效較差');
  for (const seed of SEEDS) {
    const kind = kindOf(chooseAction(o, o.legalActions, seed).intent.tileId);
    assert.ok(tied.includes(kind) && kind !== '4z', `seed ${seed} 選 ${kind}`);
  }
});

test('AI 並列捨牌皆無安全證明時，維持原並列順序、亂數選擇、理由與下一亂數', () => {
  const o = getObservation(tieFixture({}), 0), pool = publicPool(o);
  const { tied } = bestDiscards(o);
  assert.ok(tied.length >= 2 && tied.every(k => !ordinaryRonSafety(pool, k).provenSafe), `須為全未知並列：${tied}`);
  const order = o.legalActions.filter(a => a.type === 'DISCARD' && tied.includes(kindOf(a.tileId)));
  const seen = new Set(), reasons = new Set();
  for (const seed of SEEDS) {
    const next = xorshift(seed), result = chooseAction(o, o.legalActions, seed);
    assert.equal(result.intent, order[Math.floor(next / 4294967296 * order.length)], `seed ${seed}`);
    assert.equal(result.randomState, next);
    seen.add(kindOf(result.intent.tileId)); reasons.add(result.reason);
  }
  assert.deepEqual([...seen].sort(), [...tied].sort(), '未知不可被轉成安全排序');
  assert.equal(reasons.size, 1);
});

test('AI 平手安全偏好只讀自家觀察：交換他家暗手與牌牆後決策相同', () => {
  const state = tieFixture(), swapped = structuredClone(state);
  const hidden = swapped.players[1].concealed, wall = swapped.wall.order;
  const at = wall.findIndex((t, i) => i >= swapped.wall.head && !isFlower(t) && kindOf(t) !== kindOf(hidden[0]));
  const dealt = wall.indexOf(hidden[0]); // 牌牆順序含已發出的牌，兩處一起交換才是合法局面。
  [hidden[0], wall[at], wall[dealt]] = [wall[at], hidden[0], wall[at]];
  [swapped.players[2].concealed[0], swapped.players[3].concealed[0]] = [swapped.players[3].concealed[0], swapped.players[2].concealed[0]];
  assertState(swapped);
  assert.notDeepEqual(swapped.players[1].concealed, state.players[1].concealed);
  const a = getObservation(state, 0), b = getObservation(swapped, 0);
  assert.deepEqual(a, b);
  for (const seed of SEEDS.slice(0, 8)) assert.deepEqual(chooseAction(a, a.legalActions, seed), chooseAction(b, b.legalActions, seed));
});

test('AI 100 次實際開局決策耗時合理，且每次交回引擎合法動作', t => {
  const observations = [];
  for (let seed = 1; seed <= 20; seed++) {
    let state = createGame({ seed, dealer: 0, matchId: `ai-speed-${seed}` });
    while (state.phase === 'setup' || state.phase === 'initialFlowers') state = step(state, 'engine', legalActions(state, 'engine')[0]);
    if (state.phase === 'awaitDiscard') observations.push(getObservation(state, 0));
  }
  let measured = 0;
  for (let n = 0; n < 100; n++) {
    const o = observations[n % observations.length], start = performance.now();
    const result = chooseAction(o, o.legalActions, n + 1);
    measured += performance.now() - start;
    assert.ok(o.legalActions.includes(result.intent));
    if (result.intent.type === 'DISCARD' && result.reason.startsWith('聽牌')) {
      const hand = o.self.concealed.filter(id => id !== result.intent.tileId).map(kindOf);
      assert.ok(winningTiles(hand, o.self.melds).length > 0, '不可將四面子或缺將誤當聽牌');
    }
  }
  t.diagnostic(`100 次策略決策 ${measured.toFixed(1)}ms；平均 ${(measured / 100).toFixed(2)}ms`);
  assert.ok(measured < 5000, `策略阻塞過長：${measured.toFixed(0)}ms / 100 次`);
});
