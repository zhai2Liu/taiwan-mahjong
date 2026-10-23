import { trainingQuestions, trainingSkills, trainingContentRevision } from './training-data.js';
import { decodeTrialRecord, TRIAL_MAX_BYTES } from './trial-record.js';
import type { TrialRecord } from './trial-record.js';

export const TRIAL_KEY = 'tw16:trial:v1';
export type StoredTrial = { schemaVersion: 1; questionId: string; skill: string; report: TrialRecord };
type StoragePort = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
const ids = trainingQuestions.map(q => q.id);
const check = (ok: unknown) => { if (!ok) throw new Error('INVALID_TRIAL_DRAFT'); };
export function decodeTrialDraft(raw: string): StoredTrial {
  check(typeof raw === 'string' && new TextEncoder().encode(raw).length <= TRIAL_MAX_BYTES);
  const draft = JSON.parse(raw) as StoredTrial;
  check(draft && typeof draft === 'object' && !Array.isArray(draft)
    && Object.keys(draft).sort().join(',') === 'questionId,report,schemaVersion,skill');
  check(draft.schemaVersion === 1 && ids.includes(draft.questionId));
  check(draft.skill === 'all' || trainingSkills.some(s => s.id === draft.skill));
  check(draft.skill === 'all' || trainingQuestions.find(q => q.id === draft.questionId)?.skill === draft.skill);
  const report = decodeTrialRecord(JSON.stringify(draft.report), ids);
  if (report.schemaVersion !== 3 || report.contentRevision !== trainingContentRevision) throw new Error('TRIAL_CONTENT_CHANGED');
  for (const record of report.questions) {
    const current = trainingQuestions.find(q => q.id === record.id)!;
    check(record.prompt === current.prompt && record.selected.every(c => current.choices.some(now => now.id === c.id && now.text === c.text)));
  }
  return draft;
}
export function encodeTrialDraft(draft: StoredTrial): string { const raw = JSON.stringify(draft); decodeTrialDraft(raw); return raw; }
// ponytail: one local pack, single-flight page writes; cloud sync or multiple saved attempts need a separate retention/version contract.
async function write(storage: StoragePort, expectedRaw: string | null, next: string | null,
  locks: Pick<LockManager, 'request'> | undefined): Promise<string | null> {
  if (!locks) throw new Error('TRIAL_LOCK_UNAVAILABLE');
  return locks.request(TRIAL_KEY, { mode: 'exclusive', ifAvailable: true }, lock => {
    if (!lock) throw new Error('TRIAL_BUSY');
    let current: string | null;
    // Named so the page stops writing instead of offering a retry over data it cannot verify.
    try { current = storage.getItem(TRIAL_KEY); } catch { throw new Error('TRIAL_UNREADABLE'); }
    if (current !== expectedRaw) throw new Error('TRIAL_CONFLICT');
    if (next === null) storage.removeItem(TRIAL_KEY); else storage.setItem(TRIAL_KEY, next); return next;
  });
}
export async function saveTrialDraft(storage: StoragePort, expectedRaw: string | null, draft: StoredTrial,
  locks: Pick<LockManager, 'request'> | undefined = globalThis.navigator?.locks): Promise<string> {
  return (await write(storage, expectedRaw, encodeTrialDraft(draft), locks))!;
}
export async function clearTrialDraft(storage: StoragePort, expectedRaw: string | null,
  locks: Pick<LockManager, 'request'> | undefined = globalThis.navigator?.locks): Promise<void> {
  await write(storage, expectedRaw, null, locks);
}
