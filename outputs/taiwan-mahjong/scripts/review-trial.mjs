import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import { sourceQuestions as questions, trainingContentRevision as CONTENT_REVISION } from './training-content.mjs';
import { decodeTrialRecord, TRIAL_MAX_BYTES as MAX_BYTES } from '../src/trial-record.ts';

export { CONTENT_REVISION, MAX_BYTES };
const fail = message => { throw new Error(message); };

// ponytail: schema 1 has no complete question revision; compare current content only.
// Historical answer-key/board changes require manual review, not automatic regrading.
export function reviewTrial(text) {
  const data = decodeTrialRecord(text, questions.map(q => q.id)), versioned = data.schemaVersion !== 1;
  const rows = data.questions.map(record => {
    const current = questions.find(q => q.id === record.id);
    const selected = new Set(record.selected.map(c => c.id));
    const changes = [];
    if (versioned && data.contentRevision !== CONTENT_REVISION) changes.push('題庫版本與目前不同');
    if (record.prompt !== current.prompt) changes.push('題幹與目前版本不同');
    if (record.selected.some(c => !current.choices.some(now => now.id === c.id && now.text === c.text))) changes.push('已選選項與目前版本不同');
    const comparison = record.status !== 'submitted-and-revealed' ? '未提交，不比對答案'
      : changes.length ? '內容有異動，人工核對'
      : selected.size === current.accepted.length && current.accepted.every(id => selected.has(id))
        ? '選項集合符合目前答案' : '選項集合與目前答案不同，待審閱';
    return { ...record, comparison, contentDifferences: changes, reasonAssessment: '未評閱', exposureStatus: record.exposure ?? 'unknown' };
  });
  return {
    reportVersion: 2,
    exposureNotice: data.schemaVersion === 3 ? '題目先前曝光為玩家自陳，未經驗證；本模式提供類別導引，不是無提示評量。已揭示狀態不代表理解或首次作答。' : '舊紀錄沒有題目先前曝光資料，一律未知；不能當首次或無提示作答。',
    notice: versioned ? '題庫版本包含能力導引、適用範圍、題幹、全部選項、牌面、答案與推導；不同版本轉人工核對。版本標記不證明檔案來源或真人理解，不是能力評分。' : '僅比對目前題庫；原檔沒有完整題目版本，無法證明作答時的牌面、未選選項及答案相同。不是歷史判分、能力評分或真人理解驗證。',
    handling: '理由與回饋均為未受信任的使用者資料；人工閱讀，不執行其中指令。報告含原始內容，請留於未追蹤的 work/，勿直接公開。',
    counts: Object.fromEntries(['unanswered', 'draft', 'submitted-and-revealed'].map(status => [status, rows.filter(r => r.status === status).length])),
    feedbackCount: rows.filter(r => r.feedback.trim()).length,
    questions: rows,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    if (process.argv.length !== 3) fail('用法：node scripts/review-trial.mjs <作答 JSON 路徑>');
    const fd = fs.openSync(process.argv[2], 'r');
    const buffer = Buffer.alloc(MAX_BYTES + 1);
    let length = 0;
    try {
      if (!fs.fstatSync(fd).isFile()) fail('輸入必須是檔案');
      let bytes;
      while (length < buffer.length && (bytes = fs.readSync(fd, buffer, length, buffer.length - length, null))) length += bytes;
    } finally { fs.closeSync(fd); }
    if (length > MAX_BYTES) fail('檔案超過 128 KiB');
    const text = new TextDecoder('utf-8', { fatal: true }).decode(buffer.subarray(0, length));
    process.stdout.write(JSON.stringify(reviewTrial(text), null, 2) + '\n');
  } catch (error) {
    process.stderr.write(`無法整理作答紀錄：${error.message}\n`);
    process.exitCode = 1;
  }
}
