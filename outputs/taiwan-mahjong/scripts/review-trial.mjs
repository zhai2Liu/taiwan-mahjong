import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

const questions = ['TRAINING-DRAFTS.json', 'TRAINING-REVIEW-CANDIDATES.json']
  .flatMap(file => JSON.parse(fs.readFileSync(new URL('../' + file, import.meta.url), 'utf8')).cases)
  .filter(q => q.purpose === 'training');
export const CONTENT_REVISION = createHash('sha256').update(JSON.stringify(questions.map(({ id, prompt, choices, accepted, derivation, board = [] }) => ({ id, prompt, choices, accepted, derivation, board })))).digest('hex');
export const MAX_BYTES = 128 * 1024;
const fail = message => { throw new Error(message); };
function shape(value, keys, where) {
  if (!value || typeof value !== 'object' || Array.isArray(value)
    || Object.keys(value).sort().join(',') !== [...keys].sort().join(',')) fail(`${where}：欄位不符`);
}
function string(value, max, where) {
  if (typeof value !== 'string' || value.length > max) fail(`${where}：文字格式或長度不符`);
}

// ponytail: schema 1 has no complete question revision; compare current content only.
// Historical answer-key/board changes require manual review, not automatic regrading.
export function reviewTrial(text) {
  if (typeof text !== 'string' || Buffer.byteLength(text, 'utf8') > MAX_BYTES) fail('檔案超過 128 KiB 或不是文字');
  let data;
  try { data = JSON.parse(text.replace(/^\uFEFF/, '')); } catch { fail('不是有效的 JSON'); }
  const versioned = data?.schemaVersion === 2;
  shape(data, ['schemaVersion', 'rulesVersion', 'mode', 'reasonAssessment', 'questions', ...(versioned ? ['contentRevision'] : [])], '根節點');
  if (![1, 2].includes(data.schemaVersion) || data.rulesVersion !== 'TW16-CLASSIC-v1'
    || data.mode !== 'L3-B0-content-trial' || data.reasonAssessment !== 'not-reviewed') fail('不支援的紀錄版本或模式');
  if (versioned && (typeof data.contentRevision !== 'string' || !/^[a-f0-9]{64}$/.test(data.contentRevision))) fail('題庫版本標記格式不符');
  if (!Array.isArray(data.questions) || data.questions.length !== questions.length) fail('必須包含九題完整紀錄');
  const seen = new Set();
  const rows = data.questions.map((record, index) => {
    const where = `第 ${index + 1} 筆`;
    shape(record, ['id', 'prompt', 'status', 'selected', 'reason', 'feedback'], where);
    string(record.id, 40, where + ' 題號');
    const current = questions.find(q => q.id === record.id);
    if (!current || seen.has(record.id)) fail(`${where}：未知或重複題號`);
    seen.add(record.id);
    string(record.prompt, 10000, where + ' 題幹');
    string(record.reason, 2000, where + ' 理由');
    string(record.feedback, 1000, where + ' 回饋');
    if (!['unanswered', 'draft', 'submitted-and-revealed'].includes(record.status)) fail(`${where}：未知作答狀態`);
    if (!Array.isArray(record.selected) || record.selected.length > 16) fail(`${where}：選項格式不符`);
    const selected = new Set();
    for (const choice of record.selected) {
      shape(choice, ['id', 'text'], where + ' 選項');
      string(choice.id, 100, where + ' 選項代號');
      string(choice.text, 2000, where + ' 選項文字');
      if (!choice.id || selected.has(choice.id)) fail(`${where}：空白或重複選項代號`);
      selected.add(choice.id);
    }
    const hasDraft = selected.size > 0 || record.reason.trim().length > 0;
    if ((record.status === 'unanswered' && hasDraft)
      || (record.status === 'draft' && !hasDraft)
      || (record.status === 'submitted-and-revealed' && !selected.size)) fail(`${where}：作答狀態與內容矛盾`);
    const changes = [];
    if (versioned && data.contentRevision !== CONTENT_REVISION) changes.push('題庫版本與目前不同');
    if (record.prompt !== current.prompt) changes.push('題幹與目前版本不同');
    if (record.selected.some(c => !current.choices.some(now => now.id === c.id && now.text === c.text))) changes.push('已選選項與目前版本不同');
    const comparison = record.status !== 'submitted-and-revealed' ? '未提交，不比對答案'
      : changes.length ? '內容有異動，人工核對'
      : selected.size === current.accepted.length && current.accepted.every(id => selected.has(id))
        ? '選項集合符合目前答案' : '選項集合與目前答案不同，待審閱';
    return { ...record, comparison, contentDifferences: changes, reasonAssessment: '未評閱' };
  });
  return {
    reportVersion: 1,
    notice: versioned ? '題庫版本包含題幹、全部選項、牌面、答案與推導；不同版本轉人工核對。版本標記不證明檔案來源或真人理解，不是能力評分。' : '僅比對目前題庫；原檔沒有完整題目版本，無法證明作答時的牌面、未選選項及答案相同。不是歷史判分、能力評分或真人理解驗證。',
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
