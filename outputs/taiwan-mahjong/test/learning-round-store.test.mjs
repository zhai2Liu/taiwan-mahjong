import test from 'node:test';
import assert from 'node:assert/strict';
import { ROUND_KEY, ROUND_MAX_BYTES, scriptLesson, roundSave, encodeRoundSave, decodeRoundSave, readRoundSave, saveRoundProgress, removeRoundProgress } from '../dist/learning-round-store.js';
import { roundCheckpoint, encodeCheckpoint, replayRound } from '../dist/learning-round.js';
import { LEARN_KEY, LEGACY_LEARN_KEY } from '../dist/learning-progress.js';
import { getObservation, legalActions } from '../dist/engine.js';
import { winningTiles } from '../dist/hand.js';
import { kindOf } from '../dist/tiles.js';

const cp = (lesson, point, assisted, chi = null, outcome = null) => roundCheckpoint({ lesson, point, chi, outcome, assisted });
const sample = () => roundSave(8, 'transfer', cp(8, 'claim', false));
const others = { 'tw16:TW16-CLASSIC-v1:save': 'game', [LEARN_KEY]: 'v2-raw', [LEGACY_LEARN_KEY]: 'v1-raw', 'tw16:practice:v1': 'practice', 'tw16:review:v2': 'review', 'tw16:trial:v1': 'trial', 'tw16:coach:v1': 'on' };
function memory(initial = {}) {
  const data = new Map(Object.entries({ ...others, ...initial })), writes = [];
  return { data, writes, storage: { getItem: k => data.has(k) ? data.get(k) : null, setItem: (k, v) => { writes.push(['set', k]); data.set(k, v); }, removeItem: k => { writes.push(['remove', k]); data.delete(k); } } };
}
const lockLog = (grant = true) => { const order = []; return { order, locks: { request: async (name, options, callback) => { order.push([name, options.mode, options.ifAvailable]); return callback(grant ? {} : null); } } }; };
const othersKept = data => assert.deepEqual(Object.fromEntries(Object.keys(others).map(k => [k, data.get(k)])), others);

test('續學鍵獨立：tw16:learn:round:v1；第7課示範用L7，其餘配對都用L8', () => {
  assert.equal(ROUND_KEY, 'tw16:learn:round:v1'); assert.notEqual(ROUND_KEY, LEARN_KEY); assert.equal(ROUND_MAX_BYTES, 2048);
  assert.deepEqual([[7, 'guided'], [7, 'transfer'], [8, 'guided'], [8, 'transfer']].map(([c, m]) => scriptLesson(c, m)), [7, 8, 8, 8]);
});

test('封套固定四欄、鍵序與原文；checkpoint逐字保留core原文，往返不變', () => {
  for (const [course, mode, lesson] of [[7, 'guided', 7], [7, 'transfer', 8], [8, 'guided', 8], [8, 'transfer', 8]]) {
    for (const assisted of mode === 'guided' ? [true] : [false, true]) {
      const c = cp(lesson, 'win', assisted, '34'), save = roundSave(course, mode, c), raw = encodeRoundSave(save);
      assert.deepEqual(Object.keys(JSON.parse(raw)), ['schemaVersion', 'courseLesson', 'mode', 'checkpoint']);
      assert.equal(JSON.parse(raw).checkpoint, encodeCheckpoint(c));
      const decoded = decodeRoundSave(raw);
      assert.equal(decoded.ok, true); assert.deepEqual(decoded.save, save); assert.deepEqual(decoded.checkpoint, c);
      assert.equal(encodeRoundSave(decoded.save), raw);
      assert.ok(new TextEncoder().encode(raw).length <= ROUND_MAX_BYTES);
    }
  }
});

test('未知、錯型、不可能配對、示範未受助、超長、非正規原文一律拒絕，不修復', () => {
  const good = encodeRoundSave(sample()), obj = JSON.parse(good);
  const variants = [
    { ...obj, extra: 1 }, (({ mode, ...rest }) => rest)(obj), { ...obj, schemaVersion: 2 }, { ...obj, schemaVersion: '1' },
    { ...obj, courseLesson: 6 }, { ...obj, courseLesson: '8' }, { ...obj, mode: 'independent' }, { ...obj, checkpoint: JSON.parse(obj.checkpoint) },
    { ...obj, checkpoint: obj.checkpoint.replace('"lesson":8', '"lesson":7') },
    { ...obj, courseLesson: 7, mode: 'guided' },
    { ...obj, mode: 'guided' },
    { ...obj, checkpoint: encodeCheckpoint(cp(7, 'claim', true)) },
    { ...obj, courseLesson: 7, checkpoint: encodeCheckpoint(cp(7, 'claim', false)) },
    { ...obj, checkpoint: ` ${obj.checkpoint}` }, { ...obj, checkpoint: obj.checkpoint.replace('"assisted":false', '"assisted":"false"') },
    { ...obj, state: { wall: [] } }, { ...obj, seed: 1 },
  ];
  for (const v of variants) {
    assert.equal(decodeRoundSave(JSON.stringify(v)).ok, false, JSON.stringify(v));
    assert.throws(() => encodeRoundSave(v));
  }
  for (const raw of [null, undefined, 1, obj, '', 'null', '[]', '{}', '{', ` ${good}`, `${good}\n`, JSON.stringify(obj, null, 1),
    JSON.stringify({ checkpoint: obj.checkpoint, schemaVersion: 1, courseLesson: 8, mode: 'transfer' }), good + ' '.repeat(ROUND_MAX_BYTES), 'x'.repeat(5000)]) {
    const r = decodeRoundSave(raw); assert.equal(r.ok, false, String(raw).slice(0, 50)); assert.equal(typeof r.error, 'string'); assert.equal('save' in r, false);
  }
  assert.equal(decodeRoundSave(good + ' '.repeat(ROUND_MAX_BYTES)).error, 'TOO_LONG');
  assert.equal(decodeRoundSave(JSON.stringify({ ...obj, courseLesson: 7, mode: 'guided' })).error, 'PAIRING');
  assert.equal(decodeRoundSave(JSON.stringify({ ...obj, mode: 'guided' })).error, 'GUIDED_ASSISTED');
  assert.throws(() => roundSave(7, 'guided', cp(7, 'opening', false)), /GUIDED_ASSISTED/);
  assert.throws(() => roundSave(8, 'transfer', cp(7, 'opening', false)), /PAIRING/);
});

test('讀取：成功嚴格驗證才給valid；壞原文逐字回傳；讀取失敗回unreadable，不寫任何鍵', () => {
  const good = encodeRoundSave(sample());
  let m = memory(); assert.deepEqual(readRoundSave(m.storage), { kind: 'none' });
  m = memory({ [ROUND_KEY]: good }); const r = readRoundSave(m.storage);
  assert.equal(r.kind, 'valid'); assert.equal(r.raw, good); assert.equal(r.checkpoint.point, 'claim');
  m = memory({ [ROUND_KEY]: '{broken' }); assert.deepEqual({ ...readRoundSave(m.storage) }, { kind: 'bad', raw: '{broken', error: 'MALFORMED' });
  assert.deepEqual(readRoundSave({ getItem() { throw new Error('read fail'); } }), { kind: 'unreadable' });
  assert.deepEqual(m.writes, []); othersKept(m.data);
});

test('保存成功：一把exclusive ifAvailable鎖、鎖內核對原文、只寫round鍵一次，其他資料原文不變', async () => {
  const m = memory(), { order, locks } = lockLog(), save = sample();
  const raw = await saveRoundProgress(m.storage, null, save, locks);
  assert.deepEqual(order, [[ROUND_KEY, 'exclusive', true]]); assert.deepEqual(m.writes, [['set', ROUND_KEY]]);
  assert.equal(m.data.get(ROUND_KEY), raw); assert.equal(raw, encodeRoundSave(save)); othersKept(m.data);
  const next = roundSave(8, 'transfer', cp(8, 'afterClaim', true, '13'));
  const raw2 = await saveRoundProgress(m.storage, raw, next, locks);
  assert.deepEqual(m.writes, [['set', ROUND_KEY], ['set', ROUND_KEY]]); assert.equal(m.data.get(ROUND_KEY), raw2); othersKept(m.data);
});

test('保存失敗0寫入：無鎖、鎖忙、配額、鎖內讀取失敗、原文衝突（含被清空）、無效封套', async () => {
  const good = encodeRoundSave(sample());
  const cases = [
    ['no lock', memory({ [ROUND_KEY]: good }), good, null, /LOCK_UNAVAILABLE/],
    ['busy', memory({ [ROUND_KEY]: good }), good, lockLog(false).locks, /BUSY/],
    ['conflict', memory({ [ROUND_KEY]: 'other-page' }), good, lockLog().locks, /CONFLICT/],
    ['cleared', memory(), good, lockLog().locks, /CONFLICT/],
    ['appeared', memory({ [ROUND_KEY]: good }), null, lockLog().locks, /CONFLICT/],
  ];
  for (const [name, m, expected, locks, error] of cases) {
    const before = m.data.get(ROUND_KEY);
    await assert.rejects(saveRoundProgress(m.storage, expected, roundSave(8, 'transfer', cp(8, 'discard', false)), locks), error, name);
    assert.deepEqual(m.writes, [], name); assert.equal(m.data.get(ROUND_KEY), before, name); othersKept(m.data);
  }
  const quota = memory({ [ROUND_KEY]: good });
  await assert.rejects(saveRoundProgress({ ...quota.storage, setItem() { throw new DOMException('quota', 'QuotaExceededError'); } }, good, sample(), lockLog().locks), /quota/);
  assert.equal(quota.data.get(ROUND_KEY), good);
  const unreadable = memory({ [ROUND_KEY]: good });
  await assert.rejects(saveRoundProgress({ ...unreadable.storage, getItem() { throw new Error('read fail'); } }, good, sample(), lockLog().locks), /read fail/);
  assert.deepEqual(unreadable.writes, []);
  const invalid = memory(), { order, locks } = lockLog();
  await assert.rejects(saveRoundProgress(invalid.storage, null, { ...sample(), mode: 'guided' }, locks), /ROUND_SAVE_INVALID/);
  assert.deepEqual(order, [], 'invalid saves never wait for a lock'); assert.deepEqual(invalid.writes, []);
});

test('保存前捕捉原文：等鎖期間改動呼叫端物件不影響寫入；等鎖期間他頁改寫則鎖內拒絕', async () => {
  let release; const m = memory(), save = sample();
  const pending = saveRoundProgress(m.storage, null, save, { request: (_k, _o, f) => new Promise(resolve => release = () => resolve(f({}))) });
  save.mode = 'guided'; save.checkpoint = 'tampered'; release();
  assert.equal(decodeRoundSave(await pending).save.mode, 'transfer');
  const other = memory();
  const waiting = saveRoundProgress(other.storage, null, sample(), { request: (_k, _o, f) => new Promise(resolve => release = () => resolve(Promise.resolve().then(() => f({})))) });
  other.data.set(ROUND_KEY, 'written-elsewhere'); release();
  await assert.rejects(waiting, /CONFLICT/); assert.equal(other.data.get(ROUND_KEY), 'written-elsewhere'); assert.deepEqual(other.writes, []);
});

test('清掉續學點：只在原文完全相同時移除round鍵；衝突、無鎖、鎖忙不動', async () => {
  const good = encodeRoundSave(sample());
  for (const [name, stored, expected, locks, error] of [
    ['conflict', 'changed', good, lockLog().locks, /CONFLICT/], ['missing', undefined, good, lockLog().locks, /CONFLICT/],
    ['no lock', good, good, null, /LOCK_UNAVAILABLE/], ['busy', good, good, lockLog(false).locks, /BUSY/], ['no expected', good, null, lockLog().locks, /CONFLICT/],
  ]) {
    const m = memory(stored === undefined ? {} : { [ROUND_KEY]: stored });
    await assert.rejects(removeRoundProgress(m.storage, expected, locks), error, name);
    assert.deepEqual(m.writes, [], name); othersKept(m.data);
  }
  for (const stored of [good, '{bad-but-shown-verbatim']) {
    const m = memory({ [ROUND_KEY]: stored }), { order, locks } = lockLog();
    await removeRoundProgress(m.storage, stored, locks);
    assert.deepEqual(order, [[ROUND_KEY, 'exclusive', true]]); assert.deepEqual(m.writes, [['remove', ROUND_KEY]]);
    assert.equal(m.data.has(ROUND_KEY), false); othersKept(m.data);
  }
});

// Facts the lesson 7–8 screens rely on, read only through the core replay and getObservation(state, 0).
test('畫面依據：第7／8課各段合法動作、聽口、結算與下一局莊位', () => {
  for (const lesson of [7, 8]) {
    const suit = lesson === 7 ? 'm' : 'p', claim = replayRound(cp(lesson, 'claim', false)), o = getObservation(claim, 0);
    assert.equal(o.lastDiscard.seat, 3); assert.equal(kindOf(o.lastDiscard.tileId), `2${suit}`);
    assert.deepEqual(legalActions(claim, 0).map(a => a.type).sort(), ['CHI', 'CHI', 'PASS']);
    assert.ok(!('concealed' in o.players[1]) && !('wall' in o) && !('seed' in o), 'observation hides other hands, wall and seed');
    for (const chi of ['13', '34']) {
      const after = getObservation(replayRound(cp(lesson, 'afterClaim', false, chi)), 0), left = `${chi === '13' ? 4 : 1}${suit}`;
      assert.ok(after.self.concealed.some(t => kindOf(t) === left));
      assert.ok(after.self.restrictions.forbiddenDiscards.includes(`2${suit}`)); assert.ok(!after.self.restrictions.forbiddenDiscards.includes(left));
      const waiting = getObservation(replayRound(cp(lesson, 'afterDiscard', false, chi)), 0);
      assert.deepEqual(winningTiles(waiting.self.concealed.map(kindOf), waiting.self.melds), ['4s', '7s']);
      const win = replayRound(cp(lesson, 'win', false, chi));
      assert.ok(legalActions(win, 0).some(a => a.type === 'WIN')); assert.ok(legalActions(win, 0).some(a => a.type === 'DISCARD' && kindOf(a.tileId) === '7s'));
    }
  }
  const opening7 = getObservation(replayRound(cp(7, 'opening', true)), 0);
  assert.equal(opening7.dealer, 1); assert.equal(opening7.players[1].concealedCount, 17); assert.equal(opening7.self.concealed.length, 16);
  const flower = replayRound(cp(7, 'flower', true));
  assert.ok(legalActions(flower, 'engine').some(a => a.type === 'REPLACE'));
  assert.deepEqual(getObservation(flower, 0).players.map(p => p.discardHistory.map(d => kindOf(d.tileId))), [[], ['9m'], ['5z'], ['6z']]);
  const discard7 = getObservation(replayRound(cp(7, 'discard', true)), 0);
  assert.ok(discard7.self.concealed.some(t => kindOf(t) === '9s')); assert.equal(discard7.self.concealed.length, 17);
  for (const [lesson, outcome, dealer, streak] of [[7, 'selfDraw', 2, 0], [8, 'selfDraw', 0, 1], [8, 'ron', 1, 0]]) {
    const next = getObservation(replayRound(cp(lesson, 'nextHand', false, '13', outcome)), 0);
    assert.equal(next.dealer, dealer); assert.equal(next.streak, streak);
  }
});
