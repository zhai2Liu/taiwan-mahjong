import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyProgress, markLesson, decodeLearningProgress, encodeLearningProgress, saveLearningProgress, LEARN_KEY,
  LEGACY_LEARN_KEY, COURSE_VERSION, LEGACY_COURSE_VERSION, decodeLegacyLearningProgress, importLegacyProgress, importLearningProgress } from '../dist/learning-progress.js';
import { createTeachingRound, runTeachingOthers, teachingStep, resolveTeachingDiscard, compositionTiles, collectGroup, collectPair, completedComposition, invalidHandChoices, recognitionQuestions, lessons } from '../dist/learning-model.js';
import { legalActions, assertState } from '../dist/engine.js';
import { isWinningHand } from '../dist/hand.js';
import { kindOf } from '../dist/tiles.js';

const blank = { read: false, guided: false, independent: false };
const legacyRaw = flags => JSON.stringify({ schemaVersion: 1, courseVersion: LEGACY_COURSE_VERSION, rulesVersion: 'TW16-CLASSIC-v1', lessons: flags });
// C01: the five legal per-lesson flag combinations of the old three-lesson record.
const legacyCombos = [blank, { read: true, guided: false, independent: false }, { read: true, guided: true, independent: false },
  { read: true, guided: false, independent: true }, { read: true, guided: true, independent: true }];

test('新版進度：v2鍵、八筆布林、開放八課，嚴格版本與容量，完成須已閱讀', () => {
  assert.equal(LEARN_KEY, 'tw16:learn:v2'); assert.equal(COURSE_VERSION, 'beginner-1-8-v1'); assert.equal(lessons.length, 8);
  const p = emptyProgress(); assert.deepEqual(decodeLearningProgress(null), p);
  assert.equal(p.schemaVersion, 2); assert.equal(p.lessons.length, 8);
  assert.deepEqual(decodeLearningProgress(encodeLearningProgress(p)), p);
  for (const mutate of [v => v.schemaVersion = 1, v => v.schemaVersion = 3, v => v.courseVersion = LEGACY_COURSE_VERSION, v => v.rulesVersion = 'other', v => v.extra = 1,
    v => v.lessons.push(v.lessons[0]), v => v.lessons.pop(), v => v.lessons.length = 3, v => v.lessons[0].read = 'yes', v => v.lessons[0].extra = false,
    v => v.lessons[0].independent = true, v => v.lessons[6].guided = true, v => Object.assign(v.lessons[7], { read: false, independent: true })]) {
    const copy = structuredClone(p); mutate(copy); assert.throws(() => decodeLearningProgress(JSON.stringify(copy)));
  }
  // Lessons 7–8 are open now: their legal flags round-trip in the same key and schema.
  const opened = structuredClone(p); opened.lessons[6] = { read: true, guided: true, independent: false }; opened.lessons[7] = { read: true, guided: false, independent: true };
  assert.deepEqual(decodeLearningProgress(JSON.stringify(opened)), opened);
  for (const raw of ['{broken', '', 'null', '[]', ' '.repeat(4097)]) assert.throws(() => decodeLearningProgress(raw));
  assert.ok(new TextEncoder().encode(encodeLearningProgress({ ...p, lessons: p.lessons.map(() => ({ read: true, guided: true, independent: true })) })).length <= 4096);
});
test('閱讀、提示下及自行完成分列，不修改舊紀錄；第7–8課可標記，範圍外不能', () => {
  const p = emptyProgress(), guided = markLesson(p, 0, 'guided'), independent = markLesson(guided, 5, 'independent');
  assert.deepEqual(p.lessons[0], blank);
  assert.deepEqual(independent.lessons[0], { read: true, guided: true, independent: false });
  assert.deepEqual(independent.lessons[5], { read: true, guided: false, independent: true });
  const later = markLesson(markLesson(independent, 6, 'guided'), 7, 'independent');
  assert.deepEqual(later.lessons.slice(0, 6), independent.lessons.slice(0, 6), 'lessons 1–6 kept bit for bit');
  assert.deepEqual(later.lessons.slice(6), [{ read: true, guided: true, independent: false }, { read: true, guided: false, independent: true }]);
  for (const i of [-1, 8, 9, 1.5]) assert.throws(() => markLesson(p, i, 'read'));
});
test('舊版v1嚴格解碼；帶入前三課逐位複製、第4–8課全false，不把合法舊值改寫', () => {
  for (const combo of legacyCombos) {
    const flags = [combo, legacyCombos[(legacyCombos.indexOf(combo) + 2) % 5], blank];
    const next = importLegacyProgress(decodeLegacyLearningProgress(legacyRaw(flags)));
    assert.deepEqual(next.lessons.slice(0, 3), flags); assert.ok(next.lessons.slice(3).every(p => JSON.stringify(p) === JSON.stringify(blank)));
    assert.equal(next.schemaVersion, 2); assert.equal(next.courseVersion, COURSE_VERSION);
  }
  for (const raw of ['{broken', JSON.stringify(emptyProgress()), legacyRaw([blank, blank]), legacyRaw([blank, blank, { read: false, guided: true, independent: false }]),
    JSON.stringify({ schemaVersion: 1, courseVersion: 'future', rulesVersion: 'TW16-CLASSIC-v1', lessons: [blank, blank, blank] }), ' '.repeat(4097)]) assert.throws(() => decodeLegacyLearningProgress(raw));
  assert.throws(() => decodeLearningProgress(legacyRaw([blank, blank, blank])), 'v1 must not pass as v2');
});
function lockLog(holdNull) {
  const order = [];
  return { order, locks: { request: async (name, options, callback) => { order.push([name, options.mode, options.ifAvailable]); return callback(holdNull === name ? null : {}); } } };
}
test('帶入只寫v2一次：先鎖v1再鎖v2，鎖內核對舊原文與v2不存在；舊檔與其他資料不動', async () => {
  const old = legacyRaw([legacyCombos[3], legacyCombos[1], blank]);
  const data = new Map([['game', 'preserved'], [LEGACY_LEARN_KEY, old]]), writes = [];
  const storage = { getItem: k => data.get(k) ?? null, setItem: (k, v) => { writes.push(k); data.set(k, v); } };
  const { order, locks } = lockLog();
  const saved = await importLearningProgress(storage, old, locks);
  assert.deepEqual(order, [[LEGACY_LEARN_KEY, 'exclusive', true], [LEARN_KEY, 'exclusive', true]]);
  assert.deepEqual(writes, [LEARN_KEY]); assert.equal(data.get(LEGACY_LEARN_KEY), old); assert.equal(data.get('game'), 'preserved');
  assert.deepEqual(decodeLearningProgress(saved).lessons.slice(0, 3), [legacyCombos[3], legacyCombos[1], blank]);
  // Valid v2 already exists (other tab or double click): never replaced by the old record.
  await assert.rejects(importLearningProgress(storage, old, locks), /LEARNING_CONFLICT/); assert.equal(data.get(LEARN_KEY), saved);
  assert.deepEqual(writes, [LEARN_KEY]);
});
test('帶入失敗不寫：舊原文已變、鎖忙、無鎖、壞舊檔、配額；等待中改v1也在鎖內拒絕', async () => {
  const old = legacyRaw([legacyCombos[2], blank, blank]);
  const fresh = () => { const data = new Map([[LEGACY_LEARN_KEY, old]]); return { data, storage: { getItem: k => data.get(k) ?? null, setItem: (k, v) => data.set(k, v) } }; };
  let { data, storage } = fresh();
  data.set(LEGACY_LEARN_KEY, legacyRaw([legacyCombos[4], blank, blank]));
  await assert.rejects(importLearningProgress(storage, old, lockLog().locks), /LEGACY_CHANGED/); assert.equal(data.has(LEARN_KEY), false);
  for (const busy of [LEGACY_LEARN_KEY, LEARN_KEY]) { ({ data, storage } = fresh()); await assert.rejects(importLearningProgress(storage, old, lockLog(busy).locks), /BUSY/); assert.equal(data.has(LEARN_KEY), false); }
  ({ data, storage } = fresh());
  await assert.rejects(importLearningProgress(storage, old, null), /LOCK_UNAVAILABLE/);
  for (const bad of ['{broken', legacyRaw([blank, blank])]) await assert.rejects(importLearningProgress(storage, bad, lockLog().locks));
  await assert.rejects(importLearningProgress({ ...storage, setItem() { throw new Error('quota'); } }, old, lockLog().locks), /quota/);
  assert.equal(data.has(LEARN_KEY), false); assert.equal(data.get(LEGACY_LEARN_KEY), old);
  let release, waiting = true; ({ data, storage } = fresh());
  const pending = importLearningProgress(storage, old, { request: (_k, _o, f) => {
    if (!waiting) return f({});
    waiting = false; return new Promise(resolve => release = () => resolve(Promise.resolve().then(() => f({}))));
  } });
  data.set(LEGACY_LEARN_KEY, legacyRaw([blank, blank, blank])); release();
  await assert.rejects(pending, /LEGACY_CHANGED/); assert.equal(data.has(LEARN_KEY), false);
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
