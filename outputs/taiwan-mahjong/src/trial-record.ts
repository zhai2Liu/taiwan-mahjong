export const TRIAL_MAX_BYTES = 128 * 1024;
export const EXPOSURES = ['unknown', 'seen', 'unseen-self-report'] as const;
export type Exposure = typeof EXPOSURES[number];
export type TrialQuestionRecord = { id: string; prompt: string; status: 'unanswered' | 'draft' | 'submitted-and-revealed'; selected: { id: string; text: string }[]; reason: string; feedback: string; exposure?: Exposure };
export type TrialRecord = { schemaVersion: 1 | 2 | 3; contentRevision?: string; rulesVersion: 'TW16-CLASSIC-v1'; mode: 'L3-B0-content-trial'; reasonAssessment: 'not-reviewed'; guidanceMode?: 'topic-guided'; questions: TrialQuestionRecord[] };
const fail = (message: string): never => { throw new Error(message); };
function shape(value: unknown, keys: string[], where: string): void {
  if (!value || typeof value !== 'object' || Array.isArray(value)
    || Object.keys(value).sort().join(',') !== [...keys].sort().join(',')) fail(`${where}：欄位不符`);
}
function string(value: unknown, max: number, where: string): void {
  if (typeof value !== 'string' || value.length > max) fail(`${where}：文字格式或長度不符`);
}
/** Pure shared format validation; no files, network, grading, or authentication. Node24 can read this erasable TS directly. */
export function decodeTrialRecord(text: string, questionIds: readonly string[]): TrialRecord {
  if (typeof text !== 'string' || new TextEncoder().encode(text).length > TRIAL_MAX_BYTES) fail('檔案超過 128 KiB 或不是文字');
  let data: TrialRecord;
  try { data = JSON.parse(text.replace(/^\uFEFF/, '')); } catch { return fail('不是有效的 JSON'); }
  const versioned = data?.schemaVersion === 2 || data?.schemaVersion === 3, exposure = data?.schemaVersion === 3;
  shape(data, ['schemaVersion', 'rulesVersion', 'mode', 'reasonAssessment', 'questions', ...(versioned ? ['contentRevision'] : []), ...(exposure ? ['guidanceMode'] : [])], '根節點');
  if (![1, 2, 3].includes(data.schemaVersion) || data.rulesVersion !== 'TW16-CLASSIC-v1' || data.mode !== 'L3-B0-content-trial'
    || data.reasonAssessment !== 'not-reviewed' || exposure && data.guidanceMode !== 'topic-guided') fail('不支援的紀錄版本或模式');
  if (versioned && (typeof data.contentRevision !== 'string' || !/^[a-f0-9]{64}$/.test(data.contentRevision))) fail('題庫版本標記格式不符');
  if (!Array.isArray(data.questions) || data.questions.length !== questionIds.length) fail(`必須包含全部 ${questionIds.length} 題完整紀錄`);
  const seen = new Set<string>();
  for (const [index, record] of data.questions.entries()) {
    const where = `第 ${index + 1} 筆`;
    shape(record, ['id', 'prompt', 'status', 'selected', 'reason', 'feedback', ...(exposure ? ['exposure'] : [])], where);
    string(record.id, 40, where + ' 題號');
    if (!questionIds.includes(record.id) || seen.has(record.id)) fail(`${where}：未知或重複題號`); seen.add(record.id);
    string(record.prompt, 10000, where + ' 題幹'); string(record.reason, 2000, where + ' 理由'); string(record.feedback, 1000, where + ' 回饋');
    if (!['unanswered', 'draft', 'submitted-and-revealed'].includes(record.status)) fail(`${where}：未知作答狀態`);
    if (exposure && !EXPOSURES.includes(record.exposure!)) fail(`${where}：未知題目曝光狀態`);
    if (!Array.isArray(record.selected) || record.selected.length > 16) fail(`${where}：選項格式不符`);
    const selected = new Set<string>();
    for (const choice of record.selected) {
      shape(choice, ['id', 'text'], where + ' 選項'); string(choice.id, 100, where + ' 選項代號'); string(choice.text, 2000, where + ' 選項文字');
      if (!choice.id || selected.has(choice.id)) fail(`${where}：空白或重複選項代號`); selected.add(choice.id);
    }
    const hasDraft = selected.size > 0 || record.reason.trim().length > 0;
    if ((record.status === 'unanswered' && hasDraft) || (record.status === 'draft' && !hasDraft)
      || (record.status === 'submitted-and-revealed' && !selected.size)) fail(`${where}：作答狀態與內容矛盾`);
  }
  return data;
}
