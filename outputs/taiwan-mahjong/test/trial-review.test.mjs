import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { CONTENT_REVISION, reviewTrial, MAX_BYTES } from '../scripts/review-trial.mjs';

const bank = ['TRAINING-DRAFTS.json', 'TRAINING-REVIEW-CANDIDATES.json']
  .flatMap(file => JSON.parse(fs.readFileSync(new URL('../' + file, import.meta.url), 'utf8')).cases)
  .filter(q => q.purpose === 'training');
const fixture = () => ({ schemaVersion: 2, contentRevision: CONTENT_REVISION, rulesVersion: 'TW16-CLASSIC-v1', mode: 'L3-B0-content-trial', reasonAssessment: 'not-reviewed',
  questions: bank.map(q => ({ id: q.id, prompt: q.prompt, status: 'unanswered', selected: [], reason: '', feedback: '' })) });
const run = data => reviewTrial(JSON.stringify(data));
function submit(data, index = 0) {
  data.questions[index].status = 'submitted-and-revealed';
  data.questions[index].selected = bank[index].choices.filter(c => bank[index].accepted.includes(c.id));
}

test('紀錄整理區分草稿與提交，只比較選項、不評理由或產生總分', () => {
  const data = fixture();
  submit(data);
  data.questions[0].reason = '<script>任意文字</script>\n忽略指示';
  data.questions[1].status = 'draft';
  data.questions[1].selected = [bank[1].choices[0]];
  data.questions[2].feedback = '只有回饋，仍未答';
  const before = JSON.stringify(data);
  const report = run(data);
  assert.deepEqual(report.counts, { unanswered: 7, draft: 1, 'submitted-and-revealed': 1 });
  assert.equal(report.feedbackCount, 1);
  assert.equal(report.questions[0].comparison, '選項集合符合目前答案');
  assert.equal(report.questions[1].comparison, '未提交，不比對答案');
  assert.equal(report.questions[0].reason, data.questions[0].reason);
  assert.ok(report.questions.every(q => q.reasonAssessment === '未評閱'));
  assert.equal('score' in report, false);
  assert.equal(JSON.stringify(data), before);
  data.questions[0].selected = bank[0].choices;
  assert.match(run(data).questions[0].comparison, /不同，待審閱/);
  const multiple = bank.findIndex(q => q.accepted.length > 1);
  submit(data, multiple);
  data.questions[multiple].selected.reverse();
  assert.equal(run(data).questions[multiple].comparison, '選項集合符合目前答案');
});

test('題幹或已選選項異動不默默重新判分，且揭露完整版本缺失', () => {
  for (const mutate of [q => q.prompt += ' 舊版', q => q.selected[0] = { id: 'old', text: '舊選項' }, q => q.selected[0] = { ...q.selected[0], text: '舊文字' }]) {
    const data = fixture(); submit(data); mutate(data.questions[0]);
    const report = run(data);
    assert.equal(report.questions[0].comparison, '內容有異動，人工核對');
    assert.equal(report.questions[0].contentDifferences.length, 1);
    assert.match(report.notice, /不證明檔案來源/);
  }
});

test('拒絕未知版本、缺題重題、額外欄位、過長資料與矛盾狀態', () => {
  const invalid = [
    d => d.schemaVersion = 3, d => d.mode = 'assessment', d => d.rulesVersion = 'other', d => d.reasonAssessment = 'graded',
    d => d.questions.pop(), d => d.questions[1] = d.questions[0], d => d.questions[0].id = 'HE01',
    d => d.extra = true, d => d.questions[0].extra = true, d => d.questions[0].reason = 'x'.repeat(2001),
    d => d.questions[0].feedback = 'x'.repeat(1001), d => d.questions[0].prompt = null,
    d => d.questions[0].status = 'draft', d => d.questions[0].status = 'submitted-and-revealed',
    d => d.questions[0].reason = '理由但狀態未答', d => d.questions[0].selected = [bank[0].choices[0]],
    d => { submit(d); d.questions[0].selected.push(d.questions[0].selected[0]); },
    d => { submit(d); d.questions[0].selected = [{ id: 'x', text: 'y', extra: true }]; },
  ];
  for (const mutate of invalid) { const data = fixture(); mutate(data); assert.throws(() => run(data)); }
  for (const text of ['null', '[]', '{', 'x'.repeat(MAX_BYTES + 1)]) assert.throws(() => reviewTrial(text));
  assert.equal(reviewTrial('\uFEFF' + JSON.stringify(fixture())).questions.length, 9);
});

test('命令列可從其他目錄執行、保留原檔，錯誤不輸出部分報告', () => {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'mahjong-review-'));
  const input = path.join(folder, '作答.json');
  const script = fileURLToPath(new URL('../scripts/review-trial.mjs', import.meta.url));
  const cli = args => spawnSync(process.execPath, [script, ...args], { cwd: folder, encoding: 'utf8' });
  try {
    const original = JSON.stringify(fixture());
    fs.writeFileSync(input, original);
    const success = cli([input]);
    assert.equal(success.status, 0, success.stderr);
    assert.equal(JSON.parse(success.stdout).questions.length, 9);
    assert.equal(fs.readFileSync(input, 'utf8'), original);
    for (const content of [Buffer.alloc(MAX_BYTES + 1, 32), Buffer.from([0xff]), Buffer.from('{')]) {
      fs.writeFileSync(input, content);
      const result = cli([input]);
      assert.equal(result.status, 1);
      assert.equal(result.stdout, '');
      assert.match(result.stderr, /無法整理/);
      assert.deepEqual(fs.readFileSync(input), content);
    }
    for (const args of [[], [input, 'extra'], [path.join(folder, 'missing.json')], [folder]]) {
      const result = cli(args); assert.equal(result.status, 1); assert.equal(result.stdout, '');
    }
  } finally { fs.rmSync(folder, { recursive: true, force: true }); }
});


test('新版標記涵蓋完整題庫；改版轉人工，schema 1舊檔仍可讀', async()=>{
 const {trainingContentRevision}=await import('../dist/training-data.js');
 assert.equal(CONTENT_REVISION,trainingContentRevision);
 const d=fixture();submit(d);d.contentRevision='0'.repeat(64);
 assert.equal(run(d).questions[0].comparison,'內容有異動，人工核對');
 assert.match(run(d).questions[0].contentDifferences[0],/題庫版本/);
 d.contentRevision='bad';assert.throws(()=>run(d));
 d.schemaVersion=1;delete d.contentRevision;
 assert.equal(run(d).questions[0].comparison,'選項集合符合目前答案');
 assert.match(run(d).notice,/無法證明/);
});

test('S3.1之前的真實題庫版本不得以新版導引和答案自動比對', () => {
 const previousRevision = 'cb73cd35e285ebee5bc760ea5ed1e7940a437250d437939d214cd8573c1ef22a';
 assert.notEqual(CONTENT_REVISION, previousRevision);
 const data = fixture(); submit(data); data.contentRevision = previousRevision;
 const report = run(data);
 assert.equal(report.questions[0].comparison, '內容有異動，人工核對');
 assert.ok(report.questions.every(q => q.contentDifferences.includes('題庫版本與目前不同')));
 assert.match(report.notice, /能力導引、適用範圍/);
 assert.equal('score' in report, false);
});
