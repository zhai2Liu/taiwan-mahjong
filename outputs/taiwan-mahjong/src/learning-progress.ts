export const LEARN_KEY = 'tw16:learn:v2';
export const COURSE_VERSION = 'beginner-1-8-v1';
/** Read-only legacy record: never written or deleted by this version. */
export const LEGACY_LEARN_KEY = 'tw16:learn:v1';
export const LEGACY_COURSE_VERSION = 'beginner-1-3-v1';
export const LESSON_COUNT = 8;
// ponytail: lessons 7–8 stay closed and must remain false until their content ships.
export const OPEN_LESSONS = 6;
export type LessonProgress = { read: boolean; guided: boolean; independent: boolean };
export type LearningProgress = { schemaVersion: 2; courseVersion: string; rulesVersion: 'TW16-CLASSIC-v1'; lessons: LessonProgress[] };
export type LegacyLearningProgress = { schemaVersion: 1; courseVersion: string; rulesVersion: 'TW16-CLASSIC-v1'; lessons: LessonProgress[] };
type StoragePort = Pick<Storage, 'getItem' | 'setItem'>;
type Locks = Pick<LockManager, 'request'> | undefined;
const requireValue = (ok: unknown) => { if (!ok) throw new Error('INVALID_LEARNING_PROGRESS'); };
function keys(value: unknown, expected: string): void {
  requireValue(value && typeof value === 'object' && !Array.isArray(value));
  requireValue(Object.keys(value as object).sort().join(',') === expected.split(' ').sort().join(','));
}
const blank = (): LessonProgress => ({ read: false, guided: false, independent: false });
function decodeEnvelope(raw: string, schemaVersion: 1 | 2, courseVersion: string, count: number): LessonProgress[] {
  requireValue(typeof raw === 'string' && new TextEncoder().encode(raw).length <= 4096);
  const p = JSON.parse(raw) as LearningProgress;
  keys(p, 'schemaVersion courseVersion rulesVersion lessons');
  requireValue(p.schemaVersion === schemaVersion && p.courseVersion === courseVersion && p.rulesVersion === 'TW16-CLASSIC-v1');
  requireValue(Array.isArray(p.lessons) && p.lessons.length === count);
  for (const entry of p.lessons) {
    keys(entry, 'read guided independent');
    requireValue(Object.values(entry).every(v => typeof v === 'boolean'));
    requireValue(entry.read || !entry.guided && !entry.independent);
  }
  return p.lessons;
}
export function emptyProgress(): LearningProgress {
  return { schemaVersion: 2, courseVersion: COURSE_VERSION, rulesVersion: 'TW16-CLASSIC-v1', lessons: Array.from({ length: LESSON_COUNT }, blank) };
}
export function decodeLearningProgress(raw: string | null): LearningProgress {
  if (raw === null) return emptyProgress();
  const lessons = decodeEnvelope(raw, 2, COURSE_VERSION, LESSON_COUNT);
  requireValue(lessons.slice(OPEN_LESSONS).every(p => !p.read && !p.guided && !p.independent));
  return { schemaVersion: 2, courseVersion: COURSE_VERSION, rulesVersion: 'TW16-CLASSIC-v1', lessons };
}
/** Strict v1 (three lessons) decoder kept only to preview and import the old record. */
export function decodeLegacyLearningProgress(raw: string): LegacyLearningProgress {
  return { schemaVersion: 1, courseVersion: LEGACY_COURSE_VERSION, rulesVersion: 'TW16-CLASSIC-v1', lessons: decodeEnvelope(raw, 1, LEGACY_COURSE_VERSION, 3) };
}
/** Lessons 1–3 kept the same meaning and completion rules, so their flags are copied bit for bit; 4–8 start false. */
export function importLegacyProgress(legacy: LegacyLearningProgress): LearningProgress {
  const next = emptyProgress();
  legacy.lessons.forEach((p, i) => { next.lessons[i] = { read: p.read, guided: p.guided, independent: p.independent }; });
  return decodeLearningProgress(encodeLearningProgress(next));
}
export function encodeLearningProgress(progress: LearningProgress): string {
  const raw = JSON.stringify(progress); decodeLearningProgress(raw); return raw;
}
export function markLesson(progress: LearningProgress, index: number, kind: keyof LessonProgress): LearningProgress {
  requireValue(Number.isInteger(index) && index >= 0 && index < OPEN_LESSONS && ['read', 'guided', 'independent'].includes(kind));
  const copy = decodeLearningProgress(encodeLearningProgress(progress));
  copy.lessons[index].read = true; copy.lessons[index][kind] = true; return copy;
}
/** Captures before waiting; a clear or update in another page must not be overwritten. */
export async function saveLearningProgress(storage: StoragePort, expectedRaw: string | null, progress: LearningProgress,
  locks: Locks = globalThis.navigator?.locks): Promise<string> {
  const next = encodeLearningProgress(progress);
  if (!locks) throw new Error('LEARNING_LOCK_UNAVAILABLE');
  return locks.request(LEARN_KEY, { mode: 'exclusive', ifAvailable: true }, lock => {
    if (!lock) throw new Error('LEARNING_BUSY');
    if (storage.getItem(LEARN_KEY) !== expectedRaw) throw new Error('LEARNING_CONFLICT');
    storage.setItem(LEARN_KEY, next); return next;
  });
}
/**
 * One explicit v1→v2 import: the candidate is fixed before waiting; v1 then v2 locks; inside them the old text must
 * still match and v2 must still be missing. Only v2 is written — no backup key, no v1 write or delete.
 */
export async function importLearningProgress(storage: StoragePort, legacyRaw: string, locks: Locks = globalThis.navigator?.locks): Promise<string> {
  const next = encodeLearningProgress(importLegacyProgress(decodeLegacyLearningProgress(legacyRaw)));
  if (!locks) throw new Error('LEARNING_LOCK_UNAVAILABLE');
  return locks.request(LEGACY_LEARN_KEY, { mode: 'exclusive', ifAvailable: true }, legacyLock => {
    if (!legacyLock) throw new Error('LEARNING_BUSY');
    return locks.request(LEARN_KEY, { mode: 'exclusive', ifAvailable: true }, lock => {
      if (!lock) throw new Error('LEARNING_BUSY');
      if (storage.getItem(LEGACY_LEARN_KEY) !== legacyRaw) throw new Error('LEARNING_LEGACY_CHANGED');
      if (storage.getItem(LEARN_KEY) !== null) throw new Error('LEARNING_CONFLICT');
      storage.setItem(LEARN_KEY, next); return next;
    });
  });
}
