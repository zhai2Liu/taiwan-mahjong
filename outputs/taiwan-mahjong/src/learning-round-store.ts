import { decodeCheckpoint, encodeCheckpoint } from './learning-round.js';
import type { RoundCheckpoint } from './learning-round.js';

// S2.4b: the single resume point for lessons 7–8. Completion flags stay in tw16:learn:v2; this key only holds where the
// fixed round stopped. Pure codec plus compare-and-swap save/remove; storage and locks are injectable for tests.
export const ROUND_KEY = 'tw16:learn:round:v1';
export const ROUND_MAX_BYTES = 2048;
export type RoundCourse = 7 | 8;
export type RoundMode = 'guided' | 'transfer';
/** Exactly four fields; `checkpoint` is the verbatim encodeCheckpoint text (never re-parsed into a GameState). */
export type RoundSave = { schemaVersion: 1; courseLesson: RoundCourse; mode: RoundMode; checkpoint: string };
export type DecodedRoundSave = { ok: true; save: RoundSave; checkpoint: RoundCheckpoint } | { ok: false; error: string };
export type RoundRead = { kind: 'none' } | { kind: 'valid'; raw: string; save: RoundSave; checkpoint: RoundCheckpoint }
  | { kind: 'bad'; raw: string; error: string } | { kind: 'unreadable' };
type StoragePort = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
type Locks = Pick<LockManager, 'request'> | undefined | null;
const KEYS = ['schemaVersion', 'courseLesson', 'mode', 'checkpoint'] as const;

/** Lesson 7 guided plays the lesson 7 deal; every other combination plays the lesson 8 deal. */
export const scriptLesson = (course: RoundCourse, mode: RoundMode): 7 | 8 => course === 7 && mode === 'guided' ? 7 : 8;

function saveError(value: unknown): { error: string } | { checkpoint: RoundCheckpoint } {
  if (!value || typeof value !== 'object' || Object.getPrototypeOf(value) !== Object.prototype) return { error: 'NOT_OBJECT' };
  const o = value as Record<string, unknown>;
  if (Object.keys(o).length !== KEYS.length || !KEYS.every(k => Object.hasOwn(o, k))) return { error: 'KEYS' };
  if (o.schemaVersion !== 1) return { error: 'VERSION' };
  if (o.courseLesson !== 7 && o.courseLesson !== 8) return { error: 'COURSE' };
  if (o.mode !== 'guided' && o.mode !== 'transfer') return { error: 'MODE' };
  const decoded = decodeCheckpoint(o.checkpoint);
  if (!decoded.ok) return { error: `CHECKPOINT_${decoded.error}` };
  if (decoded.checkpoint.lesson !== scriptLesson(o.courseLesson, o.mode)) return { error: 'PAIRING' };
  if (o.mode === 'guided' && !decoded.checkpoint.assisted) return { error: 'GUIDED_ASSISTED' };
  return { checkpoint: decoded.checkpoint };
}
const canonical = (save: RoundSave) => JSON.stringify(Object.fromEntries(KEYS.map(k => [k, save[k]])));

/** Builds a save from a checkpoint; throws on an impossible course/mode/checkpoint pairing. */
export function roundSave(courseLesson: RoundCourse, mode: RoundMode, checkpoint: RoundCheckpoint): RoundSave {
  const save = { schemaVersion: 1 as const, courseLesson, mode, checkpoint: encodeCheckpoint(checkpoint) };
  encodeRoundSave(save); return save;
}
/** Fixed key order, no whitespace; throws instead of writing anything invalid or oversized. */
export function encodeRoundSave(save: RoundSave): string {
  const checked = saveError(save);
  if ('error' in checked) throw new Error(`ROUND_SAVE_INVALID:${checked.error}`);
  const raw = canonical(save);
  if (new TextEncoder().encode(raw).length > ROUND_MAX_BYTES) throw new Error('ROUND_SAVE_INVALID:TOO_LONG');
  return raw;
}
/** Never throws and never repairs: only the exact canonical text is accepted. */
export function decodeRoundSave(raw: unknown): DecodedRoundSave {
  if (typeof raw !== 'string') return { ok: false, error: 'NOT_STRING' };
  if (new TextEncoder().encode(raw).length > ROUND_MAX_BYTES) return { ok: false, error: 'TOO_LONG' };
  let value: unknown;
  try { value = JSON.parse(raw); } catch { return { ok: false, error: 'MALFORMED' }; }
  const checked = saveError(value);
  if ('error' in checked) return { ok: false, error: checked.error };
  const save = value as RoundSave;
  if (canonical(save) !== raw) return { ok: false, error: 'NOT_CANONICAL' };
  return { ok: true, save: { schemaVersion: 1, courseLesson: save.courseLesson, mode: save.mode, checkpoint: save.checkpoint }, checkpoint: checked.checkpoint };
}
/** A failed getItem is reported as unreadable (raw unknown); a bad text is returned verbatim for copying. */
export function readRoundSave(storage: Pick<Storage, 'getItem'>): RoundRead {
  let raw: string | null;
  try { raw = storage.getItem(ROUND_KEY); } catch { return { kind: 'unreadable' }; }
  if (raw === null) return { kind: 'none' };
  const decoded = decodeRoundSave(raw);
  return decoded.ok ? { kind: 'valid', raw, save: decoded.save, checkpoint: decoded.checkpoint } : { kind: 'bad', raw, error: decoded.error };
}
/**
 * The text is fixed before waiting. One exclusive ifAvailable lock on this key; inside it the stored text must still
 * equal expectedRaw (null = absent) before the single write. No lock, a busy lock, quota or a conflict write nothing.
 */
export async function saveRoundProgress(storage: StoragePort, expectedRaw: string | null, save: RoundSave, locks: Locks = globalThis.navigator?.locks): Promise<string> {
  const next = encodeRoundSave(save);
  if (!locks) throw new Error('ROUND_LOCK_UNAVAILABLE');
  return locks.request(ROUND_KEY, { mode: 'exclusive', ifAvailable: true }, lock => {
    if (!lock) throw new Error('ROUND_BUSY');
    if (storage.getItem(ROUND_KEY) !== expectedRaw) throw new Error('ROUND_CONFLICT');
    storage.setItem(ROUND_KEY, next); return next;
  });
}
/** Removes only this key, and only if it still holds exactly expectedRaw. */
export async function removeRoundProgress(storage: StoragePort, expectedRaw: string, locks: Locks = globalThis.navigator?.locks): Promise<void> {
  if (typeof expectedRaw !== 'string') throw new Error('ROUND_CONFLICT');
  if (!locks) throw new Error('ROUND_LOCK_UNAVAILABLE');
  await locks.request(ROUND_KEY, { mode: 'exclusive', ifAvailable: true }, lock => {
    if (!lock) throw new Error('ROUND_BUSY');
    if (storage.getItem(ROUND_KEY) !== expectedRaw) throw new Error('ROUND_CONFLICT');
    storage.removeItem(ROUND_KEY);
  });
}
