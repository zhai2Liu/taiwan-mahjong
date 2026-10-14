export const LEARN_KEY = 'tw16:learn:v1';
export const COURSE_VERSION = 'beginner-1-3-v1';
export type LessonProgress = { read: boolean; guided: boolean; independent: boolean };
export type LearningProgress = { schemaVersion: 1; courseVersion: string; rulesVersion: 'TW16-CLASSIC-v1'; lessons: LessonProgress[] };
type StoragePort = Pick<Storage, 'getItem' | 'setItem'>;
const requireValue = (ok: unknown) => { if (!ok) throw new Error('INVALID_LEARNING_PROGRESS'); };
function keys(value: unknown, expected: string): void {
  requireValue(value && typeof value === 'object' && !Array.isArray(value));
  requireValue(Object.keys(value as object).sort().join(',') === expected.split(' ').sort().join(','));
}
export function emptyProgress(): LearningProgress {
  // ponytail: only the first three lessons; define a version migration preserving these flags before adding lessons.
  return { schemaVersion: 1, courseVersion: COURSE_VERSION, rulesVersion: 'TW16-CLASSIC-v1', lessons: Array.from({ length: 3 }, () => ({ read: false, guided: false, independent: false })) };
}
export function decodeLearningProgress(raw: string | null): LearningProgress {
  if (raw === null) return emptyProgress();
  requireValue(typeof raw === 'string' && new TextEncoder().encode(raw).length <= 4096);
  const p = JSON.parse(raw) as LearningProgress;
  keys(p, 'schemaVersion courseVersion rulesVersion lessons');
  requireValue(p.schemaVersion === 1 && p.courseVersion === COURSE_VERSION && p.rulesVersion === 'TW16-CLASSIC-v1');
  requireValue(Array.isArray(p.lessons) && p.lessons.length === 3);
  for (const entry of p.lessons) {
    keys(entry, 'read guided independent');
    requireValue(Object.values(entry).every(v => typeof v === 'boolean'));
    requireValue(entry.read || !entry.guided && !entry.independent);
  }
  return p;
}
export function encodeLearningProgress(progress: LearningProgress): string {
  const raw = JSON.stringify(progress); decodeLearningProgress(raw); return raw;
}
export function markLesson(progress: LearningProgress, index: number, kind: keyof LessonProgress): LearningProgress {
  requireValue(Number.isInteger(index) && index >= 0 && index < 3 && ['read', 'guided', 'independent'].includes(kind));
  const copy = decodeLearningProgress(encodeLearningProgress(progress));
  copy.lessons[index].read = true; copy.lessons[index][kind] = true; return copy;
}
/** Captures before waiting; a clear or update in another page must not be overwritten. */
export async function saveLearningProgress(storage: StoragePort, expectedRaw: string | null, progress: LearningProgress,
  locks: Pick<LockManager, 'request'> | undefined = globalThis.navigator?.locks): Promise<string> {
  const next = encodeLearningProgress(progress);
  if (!locks) throw new Error('LEARNING_LOCK_UNAVAILABLE');
  return locks.request(LEARN_KEY, { mode: 'exclusive', ifAvailable: true }, lock => {
    if (!lock) throw new Error('LEARNING_BUSY');
    if (storage.getItem(LEARN_KEY) !== expectedRaw) throw new Error('LEARNING_CONFLICT');
    storage.setItem(LEARN_KEY, next); return next;
  });
}
