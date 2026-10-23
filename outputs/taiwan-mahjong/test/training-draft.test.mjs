import test from 'node:test';
import assert from 'node:assert/strict';
import { trainingQuestions, trainingContentRevision } from '../dist/training-data.js';
import { decodeTrialRecord, TRIAL_MAX_BYTES } from '../dist/trial-record.js';
import { TRIAL_KEY, decodeTrialDraft, encodeTrialDraft, saveTrialDraft, clearTrialDraft } from '../dist/training-draft.js';

const fixture = () => ({ schemaVersion: 1, questionId: 'E01', skill: 'all', report: { schemaVersion: 3, contentRevision: trainingContentRevision, rulesVersion: 'TW16-CLASSIC-v1', mode: 'L3-B0-content-trial', reasonAssessment: 'not-reviewed', guidanceMode: 'topic-guided',
  questions: trainingQuestions.map(q => ({ id: q.id, prompt: q.prompt, status: 'unanswered', selected: [], reason: '', feedback: '', exposure: 'unknown' })) } });
const available = { request: async (key, options, action) => { assert.equal(key, TRIAL_KEY); assert.deepEqual(options, { mode: 'exclusive', ifAvailable: true }); return action({}); } };
function memory() {
  const values = new Map([['game', 'original-game'], ['practice', 'original-practice'], ['learning', 'original-learning']]);
  return { values, getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
}
test('完整schema3作答續存、題目位置及曝光未知，保存／清除只動新鍵', async () => {
  const draft = fixture(), store = memory();
  draft.report.questions[0].selected = [trainingQuestions[0].choices[0]]; draft.report.questions[0].status = 'draft'; draft.report.questions[0].reason = '<script>當資料</script>'; draft.report.questions[0].exposure = 'unseen-self-report';
  const raw = await saveTrialDraft(store, null, draft, available);
  assert.deepEqual(decodeTrialDraft(raw), draft); assert.equal(decodeTrialRecord(JSON.stringify(draft.report), trainingQuestions.map(q => q.id)).schemaVersion, 3);
  await clearTrialDraft(store, raw, available);
  assert.deepEqual([...store.values], [['game', 'original-game'], ['practice', 'original-practice'], ['learning', 'original-learning']]);
});
test('壞欄位、不同內容、未知版本與曝光、矛盾狀態及容量均拒絕', () => {
  const invalid = [d => d.extra = true, d => d.schemaVersion = 2, d => d.skill = 'foreign', d => d.questionId = 'HE01', d => d.skill = 'claim-cost', d => d.report.contentRevision = '0'.repeat(64),
    d => d.report.schemaVersion = 2, d => d.report.guidanceMode = 'unassisted', d => d.report.questions[0].exposure = 'first-ever', d => delete d.report.questions[0].exposure,
    d => d.report.questions[0].status = 'submitted-and-revealed', d => d.report.questions[0].reason = 'x'.repeat(2001), d => d.report.questions[0].prompt += 'old',
    d => { d.report.questions[0].status = 'draft'; d.report.questions[0].selected = [{ id: 'old', text: 'unknown' }]; }, d => d.report.questions.pop()];
  for (const change of invalid) { const d = fixture(); change(d); assert.throws(() => decodeTrialDraft(JSON.stringify(d))); }
  for (const raw of ['null', '[]', '{', 'x'.repeat(TRIAL_MAX_BYTES + 1)]) assert.throws(() => decodeTrialDraft(raw));
  assert.throws(() => decodeTrialRecord('中'.repeat(TRIAL_MAX_BYTES / 2), trainingQuestions.map(q => q.id)));
});
test('寫入／讀取／缺鎖／忙碌／衝突都保留原檔，清除也必須核對', async () => {
  const draft = fixture(), raw = encodeTrialDraft(draft), store = memory(); store.values.set(TRIAL_KEY, raw);
  const busy = { request: async (_key, _options, action) => action(null) };
  for (const locks of [null, busy]) await assert.rejects(saveTrialDraft(store, raw, draft, locks));
  await assert.rejects(saveTrialDraft(store, null, draft, available), /CONFLICT/);
  await assert.rejects(clearTrialDraft(store, null, available), /CONFLICT/);
  await assert.rejects(saveTrialDraft({ ...store, setItem() { throw Error('quota'); } }, raw, draft, available), /quota/);
  await assert.rejects(saveTrialDraft({ ...store, getItem() { throw Error('read'); } }, raw, draft, available), /TRIAL_UNREADABLE/);
  await assert.rejects(clearTrialDraft({ ...store, getItem() { throw Error('read'); } }, raw, available), /TRIAL_UNREADABLE/);
  await assert.rejects(clearTrialDraft({ ...store, removeItem() { throw Error('remove'); } }, raw, available), /remove/);
  assert.equal(store.getItem(TRIAL_KEY), raw);
});
test('等待鎖時捕捉快照，後續修改不被誤稱已存，外部更動仍不能覆寫', async () => {
  for (const foreign of [false, true]) {
    const draft = fixture(), store = memory(); let release;
    const waiting = { request: async (_key, _options, action) => { await new Promise(resolve => release = resolve); return action({}); } };
    const promise = saveTrialDraft(store, null, draft, waiting); draft.report.questions[0].feedback = '之後才填';
    if (foreign) store.values.set(TRIAL_KEY, 'foreign'); release();
    if (foreign) { await assert.rejects(promise, /CONFLICT/); assert.equal(store.getItem(TRIAL_KEY), 'foreign'); }
    else assert.equal(decodeTrialDraft(await promise).report.questions[0].feedback, '');
  }
});
