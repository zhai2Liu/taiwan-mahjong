import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyProgress, markLesson, decodeLearningProgress, encodeLearningProgress, saveLearningProgress, LEARN_KEY } from '../dist/learning-progress.js';
import { createTeachingRound, runTeachingOthers, teachingStep, resolveTeachingDiscard, compositionTiles, collectGroup, collectPair, completedComposition, invalidHandChoices, recognitionQuestions } from '../dist/learning-model.js';
import { legalActions, assertState } from '../dist/engine.js';
import { isWinningHand } from '../dist/hand.js';
import { kindOf } from '../dist/tiles.js';

test('新手進度只有三筆布林、版本與容量限制，完成須已閱讀', () => {
  const p = emptyProgress(); assert.deepEqual(decodeLearningProgress(null), p);
  assert.deepEqual(decodeLearningProgress(encodeLearningProgress(p)), p);
  for (const mutate of [v => v.schemaVersion = 2, v => v.courseVersion = 'future', v => v.rulesVersion = 'other', v => v.extra = 1,
    v => v.lessons.push(v.lessons[0]), v => v.lessons[0].read = 'yes', v => v.lessons[0].extra = false, v => v.lessons[0].independent = true]) {
    const copy = structuredClone(p); mutate(copy); assert.throws(() => decodeLearningProgress(JSON.stringify(copy)));
  }
  for (const raw of ['{broken', '', 'null', '[]', ' '.repeat(4097)]) assert.throws(() => decodeLearningProgress(raw));
});
test('閱讀、提示下及自行完成分列，不修改舊紀錄', () => {
  const p = emptyProgress(), guided = markLesson(p, 0, 'guided'), independent = markLesson(guided, 1, 'independent');
  assert.deepEqual(p.lessons[0], { read: false, guided: false, independent: false });
  assert.deepEqual(independent.lessons[0], { read: true, guided: true, independent: false });
  assert.deepEqual(independent.lessons[1], { read: true, guided: false, independent: true });
  for (const i of [-1, 3, 1.5]) assert.throws(() => markLesson(p, i, 'read'));
});
const locks = { request: async (_key, _options, callback) => callback({}) };
test('保存／重建只改學習鍵，過期、配額及無鎖保留原檔', async () => {
  const data = new Map([['game', 'preserved'], [LEARN_KEY, '{broken']]);
  const storage = { getItem: k => data.get(k) ?? null, setItem: (k, v) => data.set(k, v) };
  const raw = await saveLearningProgress(storage, '{broken', emptyProgress(), locks);
  assert.equal(data.get('game'), 'preserved'); assert.equal(data.get(LEARN_KEY), raw);
  await assert.rejects(saveLearningProgress(storage, null, markLesson(emptyProgress(), 0, 'read'), locks), /CONFLICT/);
  await assert.rejects(saveLearningProgress(storage, raw, emptyProgress(), null), /LOCK_UNAVAILABLE/);
  await assert.rejects(saveLearningProgress(storage, raw, emptyProgress(), { request: async (_k, _o, f) => f(null) }), /BUSY/);
  await assert.rejects(saveLearningProgress({ ...storage, setItem() { throw new Error('quota'); } }, raw, markLesson(emptyProgress(), 0, 'guided'), locks), /quota/);
  assert.equal(data.get(LEARN_KEY), raw);
  data.set(LEARN_KEY, 'changed-during-wait');
  await assert.rejects(saveLearningProgress(storage, raw, emptyProgress(), locks), /CONFLICT/);
  assert.equal(data.get(LEARN_KEY), 'changed-during-wait');
});
test('保存排隊前捕捉資料，不因呼叫端後續修改寫入不同內容', async () => {
  let release, stored = null; const p = emptyProgress();
  const pending = saveLearningProgress({ getItem: () => stored, setItem: (_k, v) => stored = v }, null, p,
    { request: (_k, _o, f) => new Promise(resolve => release = () => resolve(f({}))) });
  p.lessons[0].read = true; release(); await pending;
  assert.equal(decodeLearningProgress(stored).lessons[0].read, false);
});
for (const transfer of [false, true]) test(`摸打示例${transfer ? '換例' : '示範'}：莊家先打、16→花→補17→打16→下家`, () => {
  let g = createTeachingRound(transfer); assertState(g);
  assert.equal(g.dealer, transfer ? 3 : 1); assert.equal(g.players[g.dealer].concealed.length, 17); assert.equal(g.players[0].concealed.length, 16);
  g = runTeachingOthers(g); assert.equal(g.phase, 'awaitDraw'); assert.equal(g.turn, 0);
  g = teachingStep(g, 'engine', { type: 'DRAW' }); assert.equal(g.phase, 'awaitReplacement');
  assert.deepEqual(g.players[0].flowers, [transfer ? 'f5#0' : 'f1#0']); assert.equal(g.players[0].concealed.length, 16);
  g = teachingStep(g, 'engine', { type: 'REPLACE' }); assert.equal(g.phase, 'awaitDiscard'); assert.equal(g.players[0].concealed.length, 17);
  g = teachingStep(g, 0, legalActions(g, 0).find(a => a.type === 'DISCARD'));
  g = resolveTeachingDiscard(g); assert.equal(g.phase, 'awaitDraw'); assert.equal(g.turn, 1); assert.equal(g.players[0].concealed.length, 16); assertState(g);
});
const pick = (remaining, kinds) => { const pool = [...remaining]; return kinds.map(k => pool.splice(pool.findIndex(t => kindOf(t) === k), 1)[0]); };
for (const transfer of [false, true]) test(`組牌${transfer ? '18張含一槓' : '17張'}：五組加眼睛且每張只能用一次`, () => {
  let remaining = compositionTiles(transfer), groups = []; assert.equal(new Set(remaining).size, remaining.length);
  const expected = transfer ? [['1s','1s','1s','1s'], ['2m','3m','4m'], ['6p','7p','8p'], ['4z','4z','4z'], ['6z','6z','6z']] : [['1m','2m','3m'], ['4m','5m','6m'], ['1p','2p','3p'], ['7p','8p','9p'], ['5s','5s','5s']];
  for (const kinds of expected) {
    const chosen = pick(remaining, kinds), result = collectGroup(remaining, groups, chosen); assert.ok(result);
    assert.equal(collectGroup(result.remaining, result.groups, chosen), null); remaining = result.remaining; groups = result.groups;
  }
  const eyes = collectPair(remaining, [...remaining]); assert.ok(eyes); assert.ok(completedComposition(eyes.remaining, eyes.pair, groups));
  assert.equal(collectGroup([], groups, []), null);
});
test('字牌連號、混花色連號、重用實體牌與不同眼睛拒絕；反例獨立可核對', () => {
  for (const ids of [['1z#0','2z#0','3z#0'], ['1m#0','2p#0','3m#0'], ['1m#0','1m#0','1m#1']]) assert.equal(collectGroup(ids, [], ids), null);
  assert.equal(collectPair(['1m#0','2m#0'], ['1m#0','2m#0']), null);
  assert.equal(collectPair(['1m#0'], ['1m#0','1m#0']), null);
  for (const transfer of [false,true]) { const [valid, invalid] = invalidHandChoices(transfer); assert.equal(isWinningHand(valid), true); assert.equal(isWinningHand(invalid), false); }
  assert.deepEqual(recognitionQuestions(false).map(q => q.answers), [[2],[0],[1]]);
  assert.deepEqual(recognitionQuestions(true).map(q => q.answers), [[1],[2],[1]]);
});
