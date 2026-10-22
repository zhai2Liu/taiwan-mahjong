import { node, button, tileName, scoreLines, preserveDetails } from './view.js';
import { tileFace } from './tile-face.js';
import { kindOf, seatWind } from './tiles.js';
import { legalActions } from './engine.js';
import { isWinningHand, winningTiles } from './hand.js';
import type { GameState, Intent, Meld, Seat } from './model.js';
import { lessons, recognitionQuestions, createTeachingRound, runTeachingOthers, teachingStep, resolveTeachingDiscard, compositionTiles, collectGroup, collectPair, completedComposition, invalidHandChoices } from './learning-model.js';
import { kinds, has, act, discardKind, settleClaims, chiExample, ponExample, priorityExample, PRIORITY_CHOICES, closedKongExample, openKongExample, addedKongExample, lesson4Limits,
  WAIT_HAND, WAIT_TRANSFER_HAND, ronExample, selfDrawExample, changeWaitExample, ownDiscardExample, settlementGuided, settlementTransfer, nextHand, settlementSupplements } from './learning-fixtures.js';
import { LEARN_KEY, LEGACY_LEARN_KEY, OPEN_LESSONS, emptyProgress, decodeLearningProgress, decodeLegacyLearningProgress, encodeLearningProgress, markLesson, saveLearningProgress, importLearningProgress } from './learning-progress.js';
import type { LegacyLearningProgress, LessonProgress } from './learning-progress.js';
import { ROUND_KEY, readRoundSave, decodeRoundSave, encodeRoundSave, saveRoundProgress, removeRoundProgress } from './learning-round-store.js';
import type { RoundCourse, RoundRead } from './learning-round-store.js';
import { startRound, resumeRound, sessionSave, assist, renderRound as renderWholeRound, appendix, SEGMENTS, modeName } from './learning-round-view.js';
import type { RoundSession } from './learning-round-view.js';

const root = document.querySelector<HTMLElement>('#lesson')!, progressPanel = document.querySelector<HTMLElement>('#learning-progress')!;
const roundPanel = document.querySelector<HTMLElement>('#learning-round-save')!;
const feedback = document.querySelector<HTMLElement>('#lesson-feedback')!;
let progress = emptyProgress(), raw: string | null | undefined, blocked = false, dirty = false, busy = false, saveNotice = '';
/** Old three-lesson record awaiting an explicit choice; only set while the new record is missing. */
type Legacy = { kind: 'valid'; raw: string; progress: LegacyLearningProgress } | { kind: 'bad'; raw: string } | { kind: 'unreadable' };
let legacy: Legacy | null = null, legacyDownloadNotice = '';
let index = 0, stage: 'read' | 'guided' | 'transfer' | 'done' = 'read', assisted = false, step = 0, detail = '';
let round: GameState | null = null, remaining: string[] = [], groups: Meld[] = [], pair: string[] = [], selected = new Set<string>(), assemblyDone = false;
// Lessons 7–8: one in-page round plus the separate resume key (tw16:learn:round:v1). Completion flags stay in v2.
let roundSession: RoundSession | null = null;
/** Last round-key text that was read and strictly validated, or written by this page; undefined until a read succeeds. */
let roundRaw: string | null | undefined;
let roundStored: RoundRead = { kind: 'none' };
/** The text this page saved or resumed for the current session; replacing any other saved text asks first. */
let roundOwn: string | null = null;
let roundIssue: '' | 'bad' | 'unreadable' | 'conflict' = '', roundBusy = false, roundNotice = '', roundDownloadNotice = '';
const isRound = () => index >= 6;
const frozen = () => busy || roundBusy;
function roundDirty(): boolean {
  if (!roundSession?.touched) return false;
  // A shown legal deviation is page-only and never saved, even when the segment's checkpoint text is stored.
  if (roundSession.off) return true;
  try { return encodeRoundSave(sessionSave(roundSession)) !== roundRaw; } catch { return true; }
}
const warnLeave = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = 'true'; };
function syncLeaveGuard(): void { window.removeEventListener('beforeunload', warnLeave); if (dirty || roundDirty()) window.addEventListener('beforeunload', warnLeave); }
const openLessons = () => progress.lessons.slice(0, OPEN_LESSONS);

function readLegacy(): Legacy | null {
  let text: string | null;
  try { text = localStorage.getItem(LEGACY_LEARN_KEY); } catch { return { kind: 'unreadable' }; }
  if (text === null) return null;
  try { return { kind: 'valid', raw: text, progress: decodeLegacyLearningProgress(text) }; } catch { return { kind: 'bad', raw: text }; }
}
const legacyNotice = (old: Legacy) => old.kind === 'valid' ? '找到舊版前三課紀錄。可以先在本頁練習；保存前請在下方選擇帶入或從新版開始。'
  : '舊版前三課紀錄無法使用，不會帶入，原紀錄不動。保存前請在下方確認從新版開始。';
function loadProgress(): void {
  let candidate: string | null | undefined;
  try {
    candidate = localStorage.getItem(LEARN_KEY); const loaded = decodeLearningProgress(candidate);
    // A valid new record never depends on the old one; the old record is only consulted when the new one is missing.
    const old = candidate === null ? readLegacy() : null;
    // Commit a reread only after validation; failed reads keep in-page progress and its leave guard.
    raw = candidate; progress = loaded; blocked = false; dirty = false; legacy = old; legacyDownloadNotice = '';
    saveNotice = old ? legacyNotice(old) : '已讀取此瀏覽器的學習進度。';
  }
  catch { raw = candidate; blocked = true; saveNotice = raw === undefined ? '無法讀取學習進度；本頁紀錄仍保留，可在本頁練習，但不會覆寫未知原檔。' : '學習進度損壞或版本不符，原檔已保留；本頁紀錄仍保留，可在本頁練習，重新建立須確認。'; }
  syncLeaveGuard(); renderProgress();
}
/** Disables progress-changing lesson/navigation controls while a write waits; returns the restore step. */
function freezeControls(): () => void {
  const controls = Array.from(document.querySelectorAll<HTMLButtonElement>('#lesson button, #lesson-nav button, #learning-progress button, #learning-round-save button')).map(b => ({ b, disabled: b.disabled }));
  controls.forEach(({ b }) => b.disabled = true);
  // Native inert also stops non-button lesson actions (recap/appendix details, tile focus); the status regions stay outside.
  const wasInert = root.inert; root.inert = true;
  return () => { controls.forEach(({ b, disabled }) => { if (b.isConnected) b.disabled = disabled; }); root.inert = wasInert; };
}
async function save(): Promise<void> {
  if (busy || blocked || raw === undefined || !dirty) return;
  if (legacy) { saveNotice = '尚未決定如何處理舊版紀錄，本頁完成暫不保存；請在進度區選擇。'; renderProgress(); return; }
  busy = true; renderProgress(); const captured = progress; let saved = false;
  try { raw = await saveLearningProgress(localStorage, raw, captured); dirty = encodeLearningProgress(progress) !== raw; saved = true; saveNotice = dirty ? '還有新變更待保存。' : '已保存新手進度（只存閱讀與完成紀錄，不存未完成的操作）；第7–8課的牌局段落另用「保存並暫停」保存。'; }
  catch (error) {
    if (error instanceof Error && error.message === 'LEARNING_CONFLICT') { blocked = true; saveNotice = '另一頁已更新進度，停止覆寫。本頁未存紀錄仍保留；重新讀取前會確認放棄。'; }
    else saveNotice = '本次進度未能保存，原檔與本頁紀錄仍保留。請保持頁面開啟並重試。';
  }
  finally { busy = false; syncLeaveGuard(); syncSavePanels(); }
  if (saved && dirty) void save();
}
async function importLegacy(captured: string): Promise<void> {
  if (busy || dirty || blocked || raw !== null) return;
  busy = true; const restore = freezeControls(); renderProgress(); let reread = '';
  try {
    const saved = await importLearningProgress(localStorage, captured);
    raw = saved; progress = decodeLearningProgress(saved); legacy = null; dirty = false;
    saveNotice = '已帶入並另存新版進度；舊版前三課紀錄原樣保留。之後在舊版新增的完成不會自動同步。';
  } catch (error) {
    const code = error instanceof Error ? error.message : '';
    if (code === 'LEARNING_LEGACY_CHANGED') reread = '舊版紀錄已在其他頁變更，沒有帶入；請看新的預覽後再決定。';
    else if (code === 'LEARNING_CONFLICT') reread = '另一頁已建立新版紀錄，沒有帶入，也沒有覆蓋；已改讀新版紀錄。';
    else saveNotice = '帶入沒有完成（其他頁正在保存、瀏覽器不支援或空間不足）。舊版紀錄與本頁內容都保留，可稍後重試。';
  } finally { busy = false; restore(); syncLeaveGuard(); }
  // Nothing unsaved exists here (import is offered only before new work), so a fresh read is safe.
  if (reread) { loadProgress(); if (!blocked) saveNotice = reread; }
  syncSavePanels();
}
async function startFresh(): Promise<void> {
  if (busy || blocked || raw !== null || !legacy) return;
  if (!confirm(`另建新版第1–8課進度，不帶入舊版紀錄；舊版紀錄保留不動。${dirty ? '本頁尚未保存的完成會一起保存。' : ''}確定？`)) return;
  busy = true; const restore = freezeControls(); renderProgress(); const captured = progress;
  try { raw = await saveLearningProgress(localStorage, null, captured); legacy = null; dirty = encodeLearningProgress(progress) !== raw; saveNotice = '已建立新版進度；舊版前三課紀錄原樣保留，之後不會自動同步。'; }
  catch (error) {
    if (error instanceof Error && error.message === 'LEARNING_CONFLICT') { blocked = true; saveNotice = '另一頁已建立新版紀錄，停止覆寫。本頁未存紀錄仍保留；重新讀取前會確認放棄。'; }
    else saveNotice = '新版進度未能建立，舊版紀錄與本頁內容都保留，可稍後重試。';
  }
  finally { busy = false; restore(); syncLeaveGuard(); syncSavePanels(); }
}
function mark(kind: keyof LessonProgress): void { progress = markLesson(progress, index, kind); dirty = true; syncLeaveGuard(); renderProgress(); void save(); }
function renderLegacy(old: Legacy): HTMLElement {
  const box = node('section', 'legacy-panel'); box.setAttribute('aria-label', '舊版學習紀錄');
  box.append(node('h3', '', '舊版前三課學習紀錄'));
  if (old.kind === 'valid') {
    box.append(node('p', '', '帶入時照舊紀錄原值，沒完成的不會補成完成：'));
    const list = node('ul', 'progress-list');
    old.progress.lessons.forEach((p, i) => list.append(node('li', '', `第${i + 1}課：已閱讀${p.read ? ' ✓' : ' —'} · 提示下完成${p.guided ? ' ✓' : ' —'} · 換例自行完成${p.independent ? ' ✓' : ' —'}`)));
    list.append(node('li', '', '第4–6課：新課，從未開始。'));
    box.append(list, node('p', '', '帶入後另存新版進度；舊版紀錄保留不動，之後在舊版新增的完成不會自動同步。未完成的操作仍不續存。'));
    if (dirty) box.append(node('p', '', '本頁已有尚未保存的新完成，不能直接帶入以免蓋掉。可選「從新版重新開始」保存本頁紀錄；或先重新讀取（放棄本頁未存內容）再帶入。'));
  } else box.append(node('p', '', old.kind === 'bad' ? '舊版紀錄損壞或版本不符，不會帶入；原紀錄保留不動。' : '舊版紀錄讀不到，不會帶入，也不會改動它。'));
  const actions = node('div', 'lesson-actions');
  if (old.kind === 'valid') actions.append(button('帶入現有進度', 'learn-import', () => { void importLegacy(old.raw); }, '', frozen() || dirty || blocked));
  actions.append(button('從新版重新開始', 'learn-fresh', () => { void startFresh(); }, '', frozen() || blocked));
  box.append(actions);
  if (old.kind !== 'unreadable') {
    const label = node('label', '', '舊版紀錄原文（唯讀，可複製）'), text = node('textarea'); label.htmlFor = 'legacy-raw';
    text.id = 'legacy-raw'; text.readOnly = true; text.rows = 3; text.value = old.raw;
    box.append(label, text, button('下載舊版紀錄原文', 'learn-legacy-download', () => {
      let url: string | undefined;
      try {
        url = URL.createObjectURL(new Blob([old.raw], { type: 'application/json;charset=utf-8' }));
        const link = node('a'); link.href = url; link.download = 'taiwan-mahjong-learning-v1.json'; link.click();
        legacyDownloadNotice = '已交由瀏覽器下載，請自行確認檔案；舊版紀錄仍留在此瀏覽器。';
      } catch { legacyDownloadNotice = '下載未成功；可複製上方原文。舊版紀錄仍留在此瀏覽器，沒有任何變更。'; }
      finally { if (url) { const done = url; setTimeout(() => URL.revokeObjectURL(done), 1000); } renderProgress(); }
    }, ''));
    if (legacyDownloadNotice) box.append(node('p', 'muted', legacyDownloadNotice));
  }
  return box;
}
function renderProgress(): void {
  const focused = progressPanel.contains(document.activeElement) ? (document.activeElement as HTMLElement).dataset.focus : undefined;
  const restoreDetails = preserveDetails(progressPanel);
  progressPanel.replaceChildren(node('h2', '', '本機學習進度'));
  const notice = node('p', '', saveNotice || '紀錄只存在此瀏覽器，不是證書或牌技分數。'); notice.id = 'save-notice'; notice.dataset.focus = 'learn-save-notice'; notice.tabIndex = -1; notice.setAttribute('role', 'status'); progressPanel.append(notice);
  const list = node('ul', 'progress-list');
  openLessons().forEach((p, i) => list.append(node('li', '', `第${i + 1}課：已閱讀${p.read ? ' ✓' : ' —'} · 提示下完成${p.guided ? ' ✓' : ' —'} · 換例自行完成${p.independent ? ' ✓' : ' —'}`)));
  progressPanel.append(list);
  if (legacy && raw === null && !blocked) progressPanel.append(renderLegacy(legacy));
  if (dirty && !legacy) { const retry = node('div', 'lesson-actions'); retry.append(button('重試保存進度', 'learn-retry', () => { void save(); }, '', frozen() || blocked)); progressPanel.append(retry); }
  // Secondary tools fold away; any read error, conflict or pending old-record choice opens them for rescue.
  const tools = node('details', 'learn-tools'); tools.dataset.persist = 'learn-progress-tools';
  tools.append(node('summary', '', '重新讀取或重建進度'));
  const actions = node('div', 'lesson-actions');
  actions.append(button('重新讀取保存紀錄', 'learn-load', () => {
    if (dirty && !confirm('重新讀取成功後會放棄本頁尚未保存的新手紀錄，未完成操作仍不續存。確定？')) return;
    loadProgress();
  }, '', frozen()));
  actions.append(button('重新建立新手進度', 'learn-reset', async () => {
    if (raw === undefined || !confirm('只重建新版第1–8課的完成旗標，清除已閱讀與完成標記，目前教學操作回到圖解；第7–8課續學點另外保存、不受影響（要清掉請用續學點區的按鈕）；舊版前三課紀錄、對戰、練習及檢討不變。確定？')) return;
    busy = true; renderProgress(); const restore = freezeControls();
    try { const next = emptyProgress(); raw = await saveLearningProgress(localStorage, raw, next); progress = next; dirty = false; blocked = false; legacy = null; stage = 'read'; saveNotice = '新手進度已重新建立；其他存檔不變。'; render(); }
    catch { saveNotice = '重新建立失敗或原檔已被其他頁更新；原資料及本頁紀錄保留，請重新讀取後再決定。'; }
    finally { restore(); busy = false; syncLeaveGuard(); syncSavePanels(); }
  }, '', frozen() || raw === undefined));
  tools.append(actions, node('p', 'muted', '只有六課的舊版頁面讀到第7–8課完成時，會停止覆寫、不會降格；請重新整理成新版頁面再繼續。'));
  progressPanel.append(tools); restoreDetails();
  if (blocked || legacy) tools.open = true;
  if (focused) (Array.from(progressPanel.querySelectorAll<HTMLElement>('[data-focus]')).find(e => e.dataset.focus === focused && !e.matches(':disabled')) ?? notice).focus({ preventScroll: true });
}
/** The round-key text this page currently believes is stored (the bad text itself while it is shown read-only). */
const knownRoundRaw = () => roundIssue === 'bad' && roundStored.kind === 'bad' ? roundStored.raw : roundRaw;
function roundChangedElsewhere(value: string | null): void {
  if (roundRaw === undefined && roundIssue !== 'bad') return; // nothing known yet; writes are already blocked
  if (value === knownRoundRaw()) return;
  roundIssue = 'conflict';
  roundNotice = '另一頁已變更或清除第7–8課續學點，本頁停止覆寫；目前段落仍保留。按「重新讀取續學點」看看最新內容後再決定。';
  syncLeaveGuard(); renderRoundPanel(); refreshRoundControls();
}
window.addEventListener('pageshow', event => {
  // A page restored from the back/forward cache missed storage events: compare the round key once, never reload.
  if (!event.persisted) return;
  let value: string | null;
  try { value = localStorage.getItem(ROUND_KEY); }
  catch { roundIssue = 'unreadable'; roundNotice = '返回本頁後讀不到續學點；本頁段落保留，暫不寫入。'; renderRoundPanel(); refreshRoundControls(); return; }
  roundChangedElsewhere(value);
});
window.addEventListener('storage', event => {
  if (event.key === ROUND_KEY || event.key === null) {
    roundChangedElsewhere(event.key === null ? null : event.newValue);
    // The round key and the v2 completion record are judged separately.
    if (event.key === ROUND_KEY) return;
  }
  if (event.key === LEGACY_LEARN_KEY) {
    // The old record matters only while a choice about it is pending; a valid new record is never blocked by it.
    if (!legacy || busy || raw !== null || blocked) return;
    legacy = readLegacy(); legacyDownloadNotice = '';
    saveNotice = legacy ? '舊版紀錄剛在其他頁變更，已重新預覽；請重新確認。' : '舊版紀錄已在其他頁移除；可直接在新版保存。';
    renderProgress(); return;
  }
  if (event.key !== null && event.key !== LEARN_KEY) return;
  blocked = true; saveNotice = '另一頁已更動學習進度，停止覆寫。本頁內容保留；請重新讀取保存紀錄。'; renderProgress();
});

/**
 * Rebuilds both save panels and the in-lesson save control from the current busy flags. Called whenever any
 * save/import/rebuild/clear ends, so buttons created while the other write was still pending never stay disabled.
 */
function syncSavePanels(): void { renderProgress(); renderRoundPanel(); refreshRoundControls(); }
/** Reads the round key; only a successful, strictly valid read (or an absent key) replaces the snapshot. */
function readRound(): void {
  const result = readRoundSave(localStorage);
  roundDownloadNotice = '';
  if (result.kind === 'unreadable') {
    roundIssue = 'unreadable';
    roundNotice = '讀不到第7–8課續學點；本頁仍可練習，但不會寫入或清除未知內容。可稍後按「重新讀取續學點」。';
  } else if (result.kind === 'bad') {
    roundStored = result; roundIssue = 'bad';
    roundNotice = '續學點內容無法使用（損壞或版本不符），原文保留不動、不會被覆寫。可複製或下載原文；要改存新的續學點，請先確認清掉它。';
  } else {
    roundStored = result; roundRaw = result.kind === 'valid' ? result.raw : null; roundIssue = '';
    roundNotice = result.kind === 'valid' ? `此瀏覽器有第${result.save.courseLesson}課（${modeName(result.save.mode)}）的續學點：${SEGMENTS[result.checkpoint.point]}。要繼續請按「接續已存教學」。` : '';
  }
  syncLeaveGuard(); renderRoundPanel(); refreshRoundControls();
}
function roundSaveBlocked(): string | null {
  if (roundBusy) return '正在保存，請稍候。';
  if (!roundSession) return '沒有進行中的段落。';
  if (roundSession.off) return '先按「重試這一段」回到固定示範的段落。';
  if (roundIssue === 'bad') return '已存內容無法使用；請先在續學點區確認清掉它。';
  if (roundIssue === 'unreadable' || roundRaw === undefined) return '讀不到目前的續學點，請先在續學點區重新讀取。';
  if (roundIssue === 'conflict') return '另一頁已變更續學點；請先重新讀取（本頁段落保留）。';
  return null;
}
function roundSaveStatus(): string {
  if (!roundSession) return '';
  if (roundSession.off) return '偏離固定示範的這一步不保存；按「重試這一段」回到本段開頭後才能保存。';
  if (roundDirty()) return '本段尚未保存；只存牌局段落，作答選項不存。';
  return roundOwn !== null && roundOwn === roundRaw ? '已保存目前段落。' : '尚未保存續學點。';
}
/** Updates the in-lesson save button and line in place, without re-rendering or moving focus. */
function refreshRoundControls(): void {
  const blockedReason = roundSaveBlocked(), saveButton = root.querySelector<HTMLButtonElement>('[data-focus="round-save"]');
  if (saveButton && !roundBusy) saveButton.disabled = !!blockedReason;
  const line = root.querySelector('.round-save-line'); if (line) line.textContent = blockedReason ? `暫不能保存：${blockedReason}` : roundSaveStatus();
}
const describeRound = (r: RoundRead) => r.kind === 'valid' ? `第${r.save.courseLesson}課（${modeName(r.save.mode)}）・${SEGMENTS[r.checkpoint.point]}・${r.checkpoint.assisted ? '本次已有提示或求助' : '本次尚未求助'}` : '';
async function saveRound(): Promise<void> {
  if (roundSaveBlocked() || !roundSession) return;
  const session = roundSession, save = sessionSave(session), expected = roundRaw as string | null;
  if (expected !== null && expected !== roundOwn && !confirm(`以本頁的第${session.course}課段落取代已存的續學點（${describeRound(roundStored)}）？完成旗標不受影響。`)) return;
  roundBusy = true; const restore = freezeControls(); renderRoundPanel();
  try {
    const saved = await saveRoundProgress(localStorage, expected, save), decoded = decodeRoundSave(saved);
    roundRaw = saved; roundOwn = saved; if (decoded.ok) roundStored = { kind: 'valid', raw: saved, save: decoded.save, checkpoint: decoded.checkpoint };
    if (roundSession === session) session.paused = true;
    roundNotice = '已保存並暫停：只存目前牌局段落與提示紀錄；結算小檢核的作答不保存，接續時會重新問。';
  } catch (error) {
    const code = error instanceof Error ? error.message : '';
    if (code === 'ROUND_CONFLICT') { roundIssue = 'conflict'; roundNotice = '另一頁已變更續學點，這次沒有覆寫。本頁段落保留；請先重新讀取再決定。'; }
    else if (code === 'ROUND_BUSY') roundNotice = '其他頁正在保存續學點，這次沒有寫入；本頁段落保留，可稍後再按保存。';
    else if (code === 'ROUND_LOCK_UNAVAILABLE') roundNotice = '此瀏覽器不支援安全保存，這次沒有寫入；本頁段落保留，可以繼續在本頁練習，或換用支援的瀏覽器再試。';
    else roundNotice = '續學點沒有保存成功（可能空間不足），原內容未變；本頁段落保留，可稍後再試。';
  } finally {
    roundBusy = false; restore(); syncLeaveGuard(); syncSavePanels();
    if (isRound() && roundSession === session && stage !== 'read') render(); else refreshRoundControls();
    say(roundNotice, false);
  }
}
async function clearRound(): Promise<void> {
  if (roundBusy || roundIssue === 'unreadable' || roundIssue === 'conflict') return;
  const expected = knownRoundRaw();
  if (typeof expected !== 'string') return;
  if (!confirm('只清掉第7–8課的續學點；第1–8課完成旗標、本頁目前段落、對戰、練習、檢討與試讀都不變。確定？')) return;
  roundBusy = true; const restore = freezeControls(); renderRoundPanel();
  try {
    await removeRoundProgress(localStorage, expected);
    roundRaw = null; roundStored = { kind: 'none' }; roundOwn = null; roundIssue = '';
    roundNotice = `已清掉續學點，其他資料不變。${roundSession ? '本頁目前段落仍保留，但尚未保存。' : ''}`;
  } catch (error) {
    if (error instanceof Error && error.message === 'ROUND_CONFLICT') { roundIssue = 'conflict'; roundNotice = '續學點已在其他頁變更，這次沒有清除；請先重新讀取。'; }
    else roundNotice = '續學點沒有清除成功（其他頁正在保存或瀏覽器不支援），原內容未變。';
  } finally { roundBusy = false; restore(); syncLeaveGuard(); syncSavePanels(); }
}
function resumeStored(): void {
  if (roundBusy) return;
  const latest = readRoundSave(localStorage);
  if (latest.kind !== 'valid' || latest.raw !== knownRoundRaw()) {
    readRound();
    if (latest.kind === 'valid') { roundNotice = '續學點剛被其他頁更新，已重新讀取；請看內容後再按「接續已存教學」。'; renderRoundPanel(); }
    return;
  }
  if (roundSession && roundDirty() && !confirm(`接續已存教學會放棄本頁第${roundSession.course}課尚未保存的段落。確定？`)) return;
  roundSession = resumeRound(latest.save, latest.checkpoint); roundOwn = latest.raw; roundRaw = latest.raw; roundStored = latest; roundIssue = '';
  index = latest.save.courseLesson - 1; stage = latest.save.mode; assisted = latest.checkpoint.assisted; detail = '';
  const quiz = ['result', 'nextHand'].includes(latest.checkpoint.point) ? '結算小檢核的作答沒有保存，會重新問一次。' : '';
  roundNotice = `已接續第${latest.save.courseLesson}課（${modeName(latest.save.mode)}）：${SEGMENTS[latest.checkpoint.point]}。${quiz}`;
  syncLeaveGuard(); render(); renderRoundPanel(); say(roundNotice, false);
}
function renderRoundPanel(): void {
  const focused = roundPanel.contains(document.activeElement) ? (document.activeElement as HTMLElement).dataset.focus : undefined;
  const restoreDetails = preserveDetails(roundPanel);
  roundPanel.replaceChildren(node('h2', '', '第7–8課續學點'));
  const notice = node('p', '', roundNotice || '第7–8課可另存一個續學點，只存牌局段落與提示紀錄；完成旗標仍存在上方學習進度，兩者分開。');
  notice.id = 'round-notice'; notice.dataset.focus = 'round-notice'; notice.tabIndex = -1; notice.setAttribute('role', 'status'); roundPanel.append(notice);
  if (roundStored.kind === 'valid') roundPanel.append(node('p', '', `已存：${describeRound(roundStored)}`));
  if (roundSession) roundPanel.append(node('p', 'muted', `本頁：第${roundSession.course}課・${SEGMENTS[roundSession.cp.point]}。${roundSaveStatus()}`));
  if (roundIssue === 'bad' && roundStored.kind === 'bad') {
    const bad = roundStored.raw, label = node('label', '', '續學點原文（唯讀，可複製）'), text = node('textarea');
    label.htmlFor = 'round-raw'; text.id = 'round-raw'; text.readOnly = true; text.rows = 3; text.value = bad;
    roundPanel.append(label, text, button('下載續學點原文', 'round-download', () => {
      let url: string | undefined;
      try {
        url = URL.createObjectURL(new Blob([bad], { type: 'application/json;charset=utf-8' }));
        const link = node('a'); link.href = url; link.download = 'taiwan-mahjong-learning-round.json'; link.click();
        roundDownloadNotice = '已交由瀏覽器下載，請自行確認檔案；原文仍留在此瀏覽器。';
      } catch { roundDownloadNotice = '下載未成功；可複製上方原文。原文仍留在此瀏覽器，沒有任何變更。'; }
      finally { if (url) { const done = url; setTimeout(() => URL.revokeObjectURL(done), 1000); } renderRoundPanel(); }
    }, ''));
    if (roundDownloadNotice) roundPanel.append(node('p', 'muted', roundDownloadNotice));
  }
  if (roundStored.kind === 'valid') { const resume = node('div', 'lesson-actions'); resume.append(button('接續已存教學', 'round-continue', () => resumeStored(), '', frozen() || roundIssue === 'unreadable')); roundPanel.append(resume); }
  const tools = node('details', 'learn-tools'); tools.dataset.persist = 'round-tools';
  tools.append(node('summary', '', '重新讀取或清掉續學點'));
  const actions = node('div', 'lesson-actions');
  actions.append(button('重新讀取續學點', 'round-reload', () => readRound(), '', frozen()));
  if (roundStored.kind !== 'none' && (roundIssue === '' || roundIssue === 'bad')) actions.append(button('清掉續學點', 'round-clear', () => { void clearRound(); }, '', frozen()));
  tools.append(actions); roundPanel.append(tools); restoreDetails();
  if (roundIssue) tools.open = true;
  if (focused) (Array.from(roundPanel.querySelectorAll<HTMLElement>('[data-focus]')).find(e => e.dataset.focus === focused && !e.matches(':disabled')) ?? notice).focus({ preventScroll: true });
}

function face(id: string): HTMLElement {
  const item = node('span', 'learn-tile'); item.setAttribute('role', 'img'); item.setAttribute('aria-label', tileName(id)); item.append(tileFace(kindOf(id))); return item;
}
function cards(ids: string[]): HTMLElement { const row = node('div', 'learn-tiles'); ids.forEach(t => row.append(face(t))); return row; }
function say(message: string, focus = true): void { feedback.textContent = message; if (focus) feedback.focus(); }
function mistake(message: string): void { assisted = true; say(message); }
function start(transfer: boolean): void {
  if (isRound()) {
    if (roundDirty() && !confirm('重新開始會放棄本頁尚未保存的段落（已存的續學點不受影響）。確定？')) return;
    mark('read'); stage = transfer ? 'transfer' : 'guided'; detail = '';
    roundSession = startRound((index + 1) as RoundCourse, stage); roundOwn = null; assisted = roundSession.cp.assisted;
    syncLeaveGuard(); render(); renderRoundPanel();
    say(transfer ? `${index === 6 ? '換例：改用第8課那一副固定牌例自己試。' : '同一副第8課固定牌例，這次自己試（不是新洗的牌，也不是陌生題）。'}看提示、回看圖解、錯答看推導或按重試，本次會列為提示下完成。` : '示範開始：會一步一步告訴你做什麼，示範完成列為提示下完成。', false);
    return;
  }
  mark('read'); stage = transfer ? 'transfer' : 'guided'; assisted = !transfer; detail = '';
  step = transfer && (index === 3 || index === 5) ? 1 : 0;
  round = index === 1 ? createTeachingRound(transfer) : index === 3 ? chiExample(transfer ? 'p' : 'm')
    : index === 5 ? (transfer ? settlementTransfer() : settlementGuided()) : null;
  remaining = index === 2 ? compositionTiles(transfer) : []; groups = []; pair = []; selected.clear(); assemblyDone = false;
  render(); say(transfer ? '換一副示例再試。本次看提示、回看圖解或錯答看推導後完成，會列為提示下完成。' : '示範開始。可以犯錯再試；示範完成會列為提示下完成。', false);
}
function complete(prefix = ''): void {
  mark(stage === 'transfer' && !assisted ? 'independent' : 'guided'); stage = 'done'; render();
  say(`${prefix}這段任務完成了！你親手核對了牌與操作。這是本次練習紀錄，還不是陌生題能力或實戰成效。`, false);
}
function safe(action: () => void): void {
  try { action(); }
  catch { say('示例操作未能套用，沒有記為完成。請重開此示例再試；正常牌局與原進度不受影響。'); }
}
function table(source: number, tile: string): HTMLElement {
  const board = node('div', 'learn-table'); board.setAttribute('aria-label', '桌面位置與打牌來源');
  for (const [position, label] of [['across', '對家'], ['upper', '上家（左側）'], ['lower', '下家（右側）'], ['self', '你']] as const) board.append(node('div', position, label));
  const sea = node('div', 'sea', `${['上家','對家','下家'][source]}剛打出`); sea.append(face(tile)); board.append(sea); return board;
}
function renderRecognition(activity: HTMLElement): void {
  const qs = recognitionQuestions(stage === 'transfer');
  if (step >= qs.length) { complete(); return; }
  const q = qs[step]; activity.append(node('p', '', `任務 ${step + 1}／${qs.length} · ${q.prompt}`));
  if (step === 1) activity.append(table(stage === 'transfer' ? 2 : 0, stage === 'transfer' ? '9s' : '2p'));
  if (q.choices) activity.append(cards(q.tiles));
  const answers = node('div', q.choices ? 'lesson-actions' : 'learn-tiles');
  (q.choices ?? q.tiles).forEach((choice, i) => {
    const b = button(q.choices ? choice : '', `recognize-${i}`, () => {
      if (!q.answers.includes(i)) { mistake(`再看一次：${q.explanation}`); return; }
      step++; if (step === qs.length) complete(); else { render(); say(`這題做對了。${q.explanation}`, false); }
    }, '');
    if (!q.choices) { b.setAttribute('aria-label', `選${tileName(choice)}`); b.append(face(choice)); } answers.append(b);
  }); activity.append(answers);
}
function renderRound(activity: HTMLElement): void {
  const game = round!; const names = ['你', '下家', '對家', '上家'];
  activity.append(node('p', '', `固定教學牌序：莊家是${names[game.dealer]}；其他家本例依序摸打、都按過。一般對戰的吃碰槓胡可能改變順序，第4課才展開。`));
  activity.append(node('p', '', `你的一般手牌 ${game.players[0].concealed.length} 張 · 花 ${game.players[0].flowers.length} 張`));
  if (game.players[0].flowers.length) activity.append(cards(game.players[0].flowers));
  if (step === 0 || step === 4) {
    activity.append(node('p', '', step === 0 ? '一般起手補花處理完後，誰先打牌？' : '已打回十六張，沒有人吃碰槓胡。接著輪到誰摸牌？'));
    const answers = node('div', 'lesson-actions'); names.forEach((name, seat) => answers.append(button(name, `round-seat-${seat}`, () => safe(() => {
      if (seat !== (step === 0 ? game.dealer : game.turn)) { mistake(step === 0 ? '莊家起手已有十七張，補花後先打；不能再多摸一張。' : '在沒有人回應改變順序時，輪到下家摸牌。'); return; }
      if (step === 4) complete();
      else { round = runTeachingOthers(game); step = 1; render(); say('莊家先打；示例其他人已依序摸打，現在輪到你，手牌仍十六張。', false); }
    }), ''))); activity.append(answers); return;
  }
  if (step === 1 || step === 2) {
    activity.append(cards(game.players[0].concealed));
    activity.append(button(step === 1 ? '摸一張' : '補花', 'round-draw', () => safe(() => {
      round = teachingStep(game, 'engine', { type: step === 1 ? 'DRAW' : 'REPLACE' }); step++;
      render(); say(step === 2 ? '摸到花，已亮出；一般手牌仍十六張。補花後才選牌打出。' : '補到一般牌，現在十七張；打一張回十六張。', false);
    }), '')); return;
  }
  activity.append(node('p', '', '單擊選牌，雙擊同一張或Enter／空白鍵打出。'));
  const hand = node('div', 'learn-tiles'); hand.setAttribute('role', 'group'); hand.setAttribute('aria-label', '教學手牌');
  let last: { id: string; time: number } | null = null;
  const play = (id: string) => safe(() => {
    round = resolveTeachingDiscard(teachingStep(game, 0, { type: 'DISCARD', tileId: id })); step = 4; render(); say('已合法打出一張，手牌回十六張。最後確認下一位。', false);
  });
  for (const intent of legalActions(game, 0)) if (intent.type === 'DISCARD') {
    const id = intent.tileId;
    const select = () => { for (const b of Array.from(hand.querySelectorAll<HTMLButtonElement>('button'))) b.setAttribute('aria-pressed', String(b.dataset.tile === id)); };
    const b = button('', `round-tile-${id}`, event => {
      if (!event.detail) { play(id); return; }
      const now = performance.now();
      // ponytail: same 450ms double-tap window as battle; expand only with accessibility feedback.
      if (last?.id === id && now - last.time <= 450) { last = null; play(id); } else { last = { id, time: now }; select(); }
    }, '');
    b.dataset.tile = id; b.setAttribute('aria-label', tileName(id)); b.setAttribute('aria-pressed', 'false'); b.append(face(id));
    b.addEventListener('focus', () => { last = null; select(); });
    b.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); if (!event.repeat) play(id); } }); hand.append(b);
  } activity.append(hand);
}
function renderComposition(activity: HTMLElement): void {
  if (assemblyDone) {
    activity.append(node('p', '', '最後找反例：哪副不符合一般胡牌形？'));
    invalidHandChoices(stage === 'transfer').forEach((hand, i) => {
      const answer = button(`示例${i === 0 ? 'A' : 'B'}`, `composition-invalid-${i}`, () => {
        if (isWinningHand(hand)) { mistake('這副能拆成五組加眼睛。另一副有字牌連號或混花色連號，不能當順子。'); return; }
        complete();
      }, 'learn-answer'); answer.append(cards(hand)); activity.append(answer);
    }); return;
  }
  activity.append(node('p', '', `已收 ${groups.length}／5 組 · 眼睛 ${pair.length ? '已留' : '未留'} · 剩 ${remaining.length} 張${stage === 'transfer' ? '；本例含一槓，起手實體十八張' : ''}`));
  activity.append(node('p', '', '單擊選三張收一組，四張同牌也算一組；選兩張同牌留作眼睛。用過的牌會移到下方，不可重用。'));
  const hand = node('div', 'learn-tiles'); hand.setAttribute('role', 'group'); hand.setAttribute('aria-label', '組牌練習');
  for (const id of remaining) {
    const b = button('', `composition-tile-${id}`, () => { if (selected.has(id)) selected.delete(id); else selected.add(id); b.setAttribute('aria-pressed', String(selected.has(id))); }, '');
    b.dataset.tile = id; b.setAttribute('aria-label', tileName(id)); b.setAttribute('aria-pressed', 'false'); b.append(face(id)); hand.append(b);
  } activity.append(hand);
  const collect = (eye: boolean) => {
    const ids = [...selected];
    if (eye) {
      const result = !pair.length && collectPair(remaining, ids);
      if (!result) { mistake('眼睛要兩張相同、尚未使用的牌，且只留一對。'); return; }
      remaining = result.remaining; pair = result.pair;
    } else {
      const result = collectGroup(remaining, groups, ids);
      if (!result) { mistake('這組尚未成立：要同花色三張連號，或三／四張同牌；字牌不能連號，每張不可重用。'); return; }
      remaining = result.remaining; groups = result.groups;
    }
    selected.clear();
    if (completedComposition(remaining, pair, groups)) assemblyDone = true;
    render(); say(assemblyDone ? '你用完每張牌，收齊五組加一對眼睛！再找一副反例。' : eye ? '眼睛留好了。繼續收其他完整牌組。' : '這組合法，已收好。繼續整理剩下的牌。', false);
  };
  const actions = node('div', 'lesson-actions'); actions.append(button('收成一組', 'collect-group', () => collect(false), ''), button('留作眼睛', 'collect-pair', () => collect(true), ''), button('重排本副', 'rearrange', () => {
    remaining = compositionTiles(stage === 'transfer'); groups = []; pair = []; selected.clear(); render(); say('本副已重新排，已有提示／錯答推導仍保留在本次紀錄。', false);
  }, '')); activity.append(actions);
  const collected = node('div', 'grouped-tiles');
  groups.forEach((g, i) => { const item = node('div'); item.append(node('p', '', `第${i + 1}組${g.kind === 'concealedKong' ? '（槓）' : ''}`), cards(g.tiles)); collected.append(item); });
  if (pair.length) { const item = node('div'); item.append(node('p', '', '眼睛'), cards(pair)); collected.append(item); } activity.append(collected);
}

// Lessons 4–6: every claim, discard and settlement below is an engine action on a fixed teaching example.
const seatNames = ['你', '下家', '對家', '上家'] as const;
const fromSeat = (seat: number) => [2, 1, 0][seat - 1]; // table(): 0 upper, 1 across, 2 lower
const names = (ks: string[]) => ks.map(tileName).join('、');
/** "一二三萬" for a same-suit run. */
const run = (ks: string[]) => { const sorted = [...ks].sort(); return `${sorted.map(k => tileName(k).slice(0, -1)).join('')}${tileName(sorted[0]).slice(-1)}`; };
function next(nextStep: number, message: string): void { step = nextStep; render(); say(message, false); }
function ask(activity: HTMLElement, prompt: string, choices: string[], correct: number, wrong: string, right: () => void): void {
  activity.append(node('p', '', prompt));
  const row = node('div', 'lesson-actions');
  choices.forEach((choice, i) => row.append(button(choice, `ask-${i}`, () => safe(() => { if (i !== correct) { mistake(wrong); return; } right(); }), '')));
  activity.append(row);
}
/** Multi-select without pre-highlighted answers; the answer is checked only after "確認". */
function pick(activity: HTMLElement, label: string, items: { key: string; label: string; tiles: string[] }[], check: (keys: string[]) => string | null, right: () => void): void {
  const row = node('div', 'learn-tiles'); row.setAttribute('role', 'group'); row.setAttribute('aria-label', label);
  for (const item of items) {
    const b = button('', `pick-${item.key}`, () => { if (selected.has(item.key)) selected.delete(item.key); else selected.add(item.key); b.setAttribute('aria-pressed', String(selected.has(item.key))); }, '');
    b.dataset.pick = item.key; b.setAttribute('aria-label', item.label); b.setAttribute('aria-pressed', String(selected.has(item.key)));
    if (!item.tiles.length) b.textContent = item.label;
    item.tiles.forEach(t => b.append(face(t))); row.append(b);
  }
  activity.append(row, button('確認', 'pick-confirm', () => safe(() => { const problem = check([...selected]); if (problem) { mistake(problem); return; } selected.clear(); right(); }), ''));
}
function setCheck(answer: string[], extra: (key: string) => string, missing: string): (keys: string[]) => string | null {
  return keys => { const wrong = keys.find(k => !answer.includes(k)); return wrong ? extra(wrong) : keys.length < answer.length ? missing : null; };
}
const intentLabel = (a: Intent) => a.type === 'CHI' ? `吃（用${names(a.ownTiles)}）` : a.type === 'WIN' ? (a.source === 'selfDraw' ? '自摸' : '胡') : a.type === 'KAN_CLOSED' ? `暗槓${tileName(a.ownTiles[0])}`
  : a.type === 'KAN_ADDED' ? `加槓${tileName(a.tileId)}` : ({ PON: '碰', KAN_OPEN: '明槓', PASS: '過' } as Record<string, string>)[a.type] ?? a.type;
function claims(activity: HTMLElement, game: GameState, choose: (a: Intent) => void, only: (a: Intent) => boolean = a => a.type !== 'DISCARD'): void {
  const row = node('div', 'lesson-actions'); row.setAttribute('role', 'group'); row.setAttribute('aria-label', '你可以選的動作');
  legalActions(game, 0).filter(only).forEach((a, i) => row.append(button(intentLabel(a), `claim-${a.type}-${i}`, () => safe(() => choose(a)), '')));
  activity.append(row);
}
function showHand(activity: HTMLElement, game: GameState): void {
  const p = game.players[0];
  activity.append(node('p', '', `你的手牌：手中 ${p.concealed.length} 張${p.melds.length ? `，桌上 ${p.melds.length} 組` : ''}${p.flowers.length ? `，花 ${p.flowers.length} 張` : ''}`), cards(p.concealed));
  if (p.melds.length) { const shown = node('div', 'grouped-tiles'); p.melds.forEach(m => { const item = node('div'); item.append(node('p', '', '桌上牌組'), cards(m.tiles)); shown.append(item); }); activity.append(shown); }
}
/** Same gesture as lesson 2: single click selects, double click/tap or Enter/Space discards; a forbidden tile explains why. */
function discards(activity: HTMLElement, game: GameState, done: (after: GameState) => void, forbidden: (kind: string) => string): void {
  const legal = new Set(legalActions(game, 0).flatMap(a => a.type === 'DISCARD' ? [a.tileId] : []));
  activity.append(node('p', '', '單擊選牌，雙擊同一張或Enter／空白鍵打出。'));
  const hand = node('div', 'learn-tiles'); hand.setAttribute('role', 'group'); hand.setAttribute('aria-label', '選牌打出');
  let last: { id: string; time: number } | null = null;
  const play = (id: string) => safe(() => {
    last = null;
    if (!legal.has(id)) { mistake(forbidden(kindOf(id))); return; }
    done(teachingStep(game, 0, { type: 'DISCARD', tileId: id }));
  });
  for (const id of game.players[0].concealed) {
    const select = () => { for (const b of Array.from(hand.querySelectorAll<HTMLButtonElement>('button'))) b.setAttribute('aria-pressed', String(b.dataset.tile === id)); };
    const b = button('', `discard-${id}`, event => {
      if (!event.detail) { play(id); return; }
      const now = performance.now();
      // ponytail: same 450ms double-tap window as lesson 2 and battle.
      if (last?.id === id && now - last.time <= 450) play(id); else { last = { id, time: now }; select(); }
    }, '');
    b.dataset.tile = id; b.setAttribute('aria-label', `打出${tileName(id)}`); b.setAttribute('aria-pressed', 'false'); b.append(face(id));
    b.addEventListener('focus', () => { last = null; select(); });
    b.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); if (!event.repeat) play(id); } }); hand.append(b);
  }
  activity.append(hand);
}

function renderClaims(activity: HTMLElement): void {
  const suit = stage === 'transfer' ? 'p' : 'm', two = `2${suit}`, game = round!;
  if (step <= 3) activity.append(node('p', '', `教學示例：手中有${names(['1' + suit, '3' + suit, '4' + suit])}，另兩門各一四七，加七種字牌。`));
  if (step === 0) {
    activity.append(table(1, two)); showHand(activity, game);
    ask(activity, `圖中是對家打出${tileName(two)}，可以吃嗎？`, ['可以，哪一家打的都能吃', '不行，吃只拿上家的牌'], has(chiExample(suit, 2), 0, 'CHI') ? 0 : 1,
      '再想想：吃只拿上家的牌；對家打的牌可以考慮合法的碰或胡，不能吃。', () => next(1, '對。吃只拿上家的牌；對家這張可以考慮合法碰或胡，不能吃。現在這張是上家打的。'));
  } else if (step === 1) {
    activity.append(table(0, two)); showHand(activity, game);
    const legal = legalActions(game, 0).flatMap(a => a.type === 'CHI' ? [a.ownTiles.map(kindOf).sort().join(',')] : []);
    activity.append(node('p', '', `上家打出${tileName(two)}。選出所有能和它湊成連號三張的兩張手牌（可複選），再按確認。`));
    pick(activity, '候選吃法', [['1', '3'], ['3', '4'], ['1', '4']].map(p => p.map(n => n + suit)).map(p => ({ key: p.join(','), label: p.map(tileName).join('＋'), tiles: p })),
      setCheck(legal, key => `${names(key.split(','))}加${tileName(two)}不是連號三張，不能吃。`, `還有別的吃法：把${tileName(two)}放在連號中間或前端試試。`),
      () => next(2, `都找到了：${legal.map(k => run([...k.split(','), two])).join('、')}兩種都合法，選哪一種都可以。`));
  } else if (step === 2) {
    activity.append(table(0, two)); showHand(activity, game);
    activity.append(node('p', '', '選一種吃法。要等這張牌的回應結束才確定由誰取得（胡＞碰／明槓＞吃）。'));
    claims(activity, game, a => {
      if (a.type !== 'CHI') return;
      const own = a.ownTiles.map(kindOf), after = settleClaims(game, { 0: x => x.type === 'CHI' && x.ownTiles.join() === a.ownTiles.join() });
      if (after.phase !== 'awaitDiscard' || after.turn !== 0) throw new Error('LESSON_CHI_NOT_TAKEN');
      const left = ['1', '3', '4'].map(n => n + suit).find(k => !own.includes(k))!, ban = after.players[0].restrictions.forbiddenDiscards;
      round = after;
      detail = `你用${names(own)}吃成${run([...own, two])}，${tileName(left)}還留在手中。這次不能打：${ban.map(k => `${tileName(k)}（和剛用的${names(own)}又湊成${run([...own, k])}）`).join('、')}。`;
      next(3, '其他家都選過，這張由你取得。吃後先打一張，不再摸牌。');
    }, a => a.type === 'CHI');
  } else if (step === 3) {
    showHand(activity, game);
    discards(activity, game, after => {
      round = resolveTeachingDiscard(after); detail = '';
      const message = `已吃好並打完：手中${round.players[0].concealed.length}張加桌上一組，接著等下一家的動作。`;
      if (stage === 'transfer') complete(`${message} `); else { round = ponExample(3); next(4, `${message}接著看碰。`); }
    }, k => `剛吃完不能立刻打${tileName(k)}：它會和你剛用來吃的兩張湊成順子。換一張打。`);
  } else if (step === 4) {
    activity.append(table(0, '5m')); showHand(activity, game);
    activity.append(node('p', '', `碰的短例：上家打出五萬，你手上有三張五萬。碰可以拿任何一家的牌${has(game, 0, 'KAN_OPEN') ? '' : '；本桌不能明槓上家，所以這裡沒有明槓'}。本例請選碰。`));
    claims(activity, game, a => {
      if (a.type !== 'PON') { say('選過也合法，但會記「過碰」：到你下次打牌前不能再碰五萬。本例請選碰。'); return; }
      round = settleClaims(game, { 0: 'PON' }); detail = '碰可取任一家；手上留下的第四張五萬，這次不能立即打出或加槓。';
      next(5, '碰到了。先打一張合法的牌，不再摸牌。');
    });
  } else if (step === 5) {
    showHand(activity, game);
    discards(activity, game, after => { round = resolveTeachingDiscard(after); detail = ''; next(6, '碰後打完了。接著看同一張牌有好幾家要時誰拿到。'); },
      k => `剛碰完不能立刻打出同種的${tileName(k)}，也不能馬上加槓。換一張，例如白板。`);
  } else if (step === 6) {
    const outcomes = PRIORITY_CHOICES.map(c => settleClaims(priorityExample(), c)), taker = (s: GameState) => s.settlement?.winner ?? s.turn;
    activity.append(node('p', '', '看仲裁：你打出二萬。下家可以吃、對家可以碰、上家剛好能胡。'));
    ask(activity, '三家都提出要這張時，誰取得？', ['下家（吃）', '對家（碰）', '上家（胡）', '最先按的人'], [1, 2, 3].indexOf(taker(outcomes[0])),
      '不是比誰快：胡優先於碰／明槓，碰／明槓又優先於吃。', () => {
        detail = `${seatNames[taker(outcomes[0])]}胡牌取得。若上家選過，由${seatNames[taker(outcomes[1])]}碰；上家、對家都選過，才由${seatNames[taker(outcomes[2])]}吃。沒拿到牌的人手牌不拆開。`;
        round = closedKongExample(); next(7, '仲裁看順序：胡＞碰／明槓＞吃。接下來分開看三種槓。');
      });
  } else if (step === 7) {
    showHand(activity, game);
    activity.append(node('p', '', '暗槓短例：你自己有四張五萬，輪到你出牌時可以開槓。'));
    claims(activity, game, a => { round = teachingStep(game, 0, a); next(8, '已暗槓：四張只算一組。槓後先補一張牌。'); }, a => a.type === 'KAN_CLOSED');
  } else if (step === 8) {
    showHand(activity, game);
    activity.append(button('補牌', 'kong-replace', () => safe(() => {
      round = act(game, 'engine', 'REPLACE'); const p = round.players[0], total = p.concealed.length + p.melds.reduce((n, m) => n + m.tiles.length, 0);
      detail = `補到${tileName(round.drawContext.lastTile!)}。暗槓四張只算一組，現在實體共${total}張，仍是五組加眼睛；其他人只看到你有一組暗槓，看不到牌種。`;
      next(9, '補好了。接著看明槓。');
    }), ''));
  } else if (step === 9) {
    showHand(activity, game);
    ask(activity, '明槓短例：上家打出五萬，你手上有三張五萬。可以明槓嗎？', ['可以', '不行，本桌不能明槓上家'], has(openKongExample(3), 0, 'KAN_OPEN') ? 0 : 1,
      '本桌規定不能明槓上家；上家的牌只能考慮吃、碰或胡。', () => { round = openKongExample(2); detail = ''; next(10, '對。改由對家打出五萬，這次可以明槓。'); });
  } else if (step === 10) {
    activity.append(table(1, '5m')); showHand(activity, game);
    activity.append(node('p', '', '對家打出五萬。本例請選明槓。'));
    claims(activity, game, a => {
      if (a.type !== 'KAN_OPEN') { say(a.type === 'PON' ? '碰也合法；本例要看明槓，請選明槓。' : '選過也合法；本例要看明槓，請選明槓。'); return; }
      round = settleClaims(game, { 0: 'KAN_OPEN' }); next(11, '明槓成立，先補牌。');
    });
  } else if (step === 11) {
    showHand(activity, game);
    activity.append(button('補牌', 'kong-replace', () => safe(() => { round = act(game, 'engine', 'REPLACE'); next(12, `補到${tileName(round.drawContext.lastTile!)}。`); }), ''));
  } else if (step === 12) {
    showHand(activity, game);
    const p = game.players[0], formed = isWinningHand(p.concealed.map(kindOf), p.melds);
    ask(activity, `補牌後牌型${formed ? '已經完成' : '還沒完成'}。現在可以自摸嗎？`, ['可以，補到就能胡', '不行，這次要先打一張'], has(game, 0, 'WIN') ? 0 : 1,
      '明槓後到這次打牌前都不能一般自摸；連續補花或再開槓也一樣。這不是過水，是明槓的限制。', () => {
        round = addedKongExample(); detail = ''; next(13, '對。明槓補成牌型也要先打一張。最後看加槓。');
      });
  } else if (step === 13) {
    showHand(activity, game);
    activity.append(node('p', '', '加槓短例：你已碰五萬，又摸進第四張五萬。（本例設定你先前放過一次胡，正在過水中；第5課會說明。）'));
    claims(activity, game, a => { round = teachingStep(game, 0, a); next(14, '加槓要先等其他人能不能搶槓。'); }, a => a.type === 'KAN_ADDED');
  } else if (step === 14) {
    showHand(activity, game);
    activity.append(node('p', '', '下家剛好聽五萬，可以搶槓胡。選一種結果看看：'));
    const row = node('div', 'lesson-actions');
    if (has(game, 1, 'WIN')) row.append(button('下家搶槓胡', 'rob-win', () => safe(() => {
      round = settleClaims(game, { 1: 'WIN' });
      detail = `下家搶槓胡：你的碰仍是${round.players[0].melds[0].tiles.length}張，第四張五萬歸下家，你不補牌。`; next(15, '加槓被搶，不成槓。');
    }), ''));
    row.append(button('下家選過', 'rob-pass', () => safe(() => {
      round = act(settleClaims(game, { 1: 'PASS' }), 'engine', 'REPLACE'); const p = round.players[0];
      detail = `無人搶槓，加槓正式成立（${p.melds[0].tiles.length}張一組），過水${p.restrictions.passedWin ? '仍未解除' : '同時解除'}，並已補牌。`; next(15, '加槓成立並補牌。');
    }), ''));
    activity.append(row);
  } else {
    activity.append(node('p', '', '三種槓分開看：暗槓自己四張、明槓拿別家（不能拿上家）、加槓先等搶槓。'));
    const row = node('div', 'lesson-actions');
    row.append(button('看另一種搶槓結果', 'rob-again', () => safe(() => { round = addedKongExample(); detail = ''; next(13, '重新開始加槓短例。'); }), ''),
      button('完成本課示範', 'claims-finish', () => complete(), ''));
    activity.append(row);
  }
}
function renderWaits(activity: HTMLElement): void {
  const transfer = stage === 'transfer', hand = kinds(transfer ? WAIT_TRANSFER_HAND : WAIT_HAND), waits = winningTiles(hand);
  const waitCheck = (answer: string[], missing: string) => setCheck(answer, k => `${tileName(k)}放進來拆不成五組加眼睛。`, missing);
  if (step === 0) {
    activity.append(node('p', '', `教學示例手牌（16張）：再進哪一種牌，就能湊成五組加一對眼睛？可複選，選好按確認。`), cards(hand));
    const candidates = transfer ? ['1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p', '5z', '6z', '7z'] : ['1m', '2m', '3m', '4m', '5m', '6m', '7m', '8m', '9m', '1z'];
    pick(activity, '候選聽口', candidates.map(k => ({ key: k, label: tileName(k), tiles: [k] })),
      waitCheck(waits, transfer ? '還有聽口沒找到：兩對都可能變成三張，另一對留作眼睛。' : '還有聽口沒找到：重新檢查三四萬的兩端。'),
      () => next(1, `都找到了：聽${names(waits)}。`));
  } else if (transfer) {
    const drawn = act(settleClaims(ronExample(WAIT_TRANSFER_HAND, '2p', '6z')), 'engine', 'DRAW');
    activity.append(cards(hand));
    ask(activity, '上家打出二筒時你能胡卻選了過。之後自己摸到發財，牌型完成。現在可以自摸嗎？', ['可以，發財是另一種聽口', '不行，過水還沒解除'], has(drawn, 0, 'WIN') ? 0 : 1,
      '過水限制全部聽口的胡、自摸和搶槓，不只剛放過的那一種；要打出不在新聽口的牌才解除。', () => complete('對：你分開確認了聽口和當下胡牌資格。'));
  } else if (step === 1) {
    activity.append(cards(hand));
    const ron = legalActions(ronExample(WAIT_HAND, '2m'), 0).find(a => a.type === 'WIN'), self = legalActions(selfDrawExample(WAIT_HAND, '5m'), 0).find(a => a.type === 'WIN');
    ask(activity, '上家打出二萬，你胡這張，叫什麼？', ['自摸', '胡別人（上家放槍）'], ron?.type === 'WIN' && ron.source === 'ron' ? 1 : 0,
      '自摸是自己摸進來；別人打出被你胡，打的人叫放槍。', () => next(2, `對。${self ? '自己摸到五萬也能合法胡，那叫自摸。' : ''}本桌不必宣告聽牌，零台也能胡。`));
  } else if (step === 2) {
    if (!round) round = ronExample(WAIT_HAND, '2m', '5m');
    const game = round; activity.append(table(0, '2m'), cards(game.players[0].concealed));
    activity.append(node('p', '', '上家打出二萬，你可以胡。本示範要看選過的代價：請按「過」。'));
    claims(activity, game, a => {
      if (a.type !== 'PASS') { say(`${a.type === 'WIN' ? '這是合法胡牌' : '這也是合法選擇'}；本示範要看選過的代價，請改按「過」。`); return; }
      round = settleClaims(game); detail = round.players[0].restrictions.passedWin ? '你剛才有合法胡牌機會但選了過，現在尚未解除（過水）。' : '';
      next(3, '已選過。輪到你時摸一張。');
    });
  } else if (step === 3) {
    showHand(activity, round!);
    activity.append(button('摸牌', 'wait-draw', () => safe(() => { round = act(round!, 'engine', 'DRAW'); next(4, `摸到${tileName(round.drawContext.lastTile!)}。`); }), ''));
  } else if (step === 4) {
    const game = round!; showHand(activity, game);
    ask(activity, `摸到${tileName(game.drawContext.lastTile!)}，牌型${isWinningHand(game.players[0].concealed.map(kindOf)) ? '完成了' : '未完成'}。現在可以自摸嗎？`, ['可以', '不行，還在過水中'], has(game, 0, 'WIN') ? 0 : 1,
      '你剛才有合法胡牌機會但選了過，現在尚未解除。過水限制全部聽口，不只剛放過的二萬。', () => next(5, '對。牌型完成不等於現在合法能胡。'));
  } else if (step === 5) {
    showHand(activity, round!);
    activity.append(button('打回五萬', 'wait-discard-5m', () => safe(() => {
      const after = discardKind(round!, 0, '5m'), p = after.players[0];
      detail = `打回五萬後仍聽${names(winningTiles(p.concealed.map(kindOf)))}；五萬還在新聽口內，所以過水${p.restrictions.passedWin ? '沒有解除' : '已解除'}。`;
      round = act(settleClaims(ronExample(WAIT_HAND, '2m', '9m 2m')), 'engine', 'DRAW');
      next(6, '換一個走法：同一副牌放過二萬後，改摸到九萬。');
    }), ''));
  } else if (step === 6) {
    const game = round!; showHand(activity, game);
    activity.append(node('p', '', '過水中摸到九萬。打哪一張，可以保持聽二萬、五萬，並解除過水？'));
    discards(activity, game, after => {
      const p = after.players[0], kept = winningTiles(p.concealed.map(kindOf)).join() === waits.join(), tile = tileName(p.discardHistory.at(-1)!.tileId);
      if (p.restrictions.passedWin) { mistake(`${tile}還在打後的新聽口內，過水沒有解除。`); return; }
      if (!kept) { mistake(`打${tile}雖然解除過水，但不再聽二萬、五萬了。本例請保留原聽口。`); return; }
      let s = act(resolveTeachingDiscard(after), 'engine', 'DRAW'); s = discardKind(s, 1, '2m'); round = s;
      detail = `打出的${tile}不在新聽口內，出牌後過水已解除。`; next(7, '下家接著打出二萬。');
    }, () => '這張現在不能打。');
  } else if (step === 7) {
    const game = round!; activity.append(table(fromSeat(1), '2m')); showHand(activity, game);
    claims(activity, game, a => {
      if (a.type !== 'WIN') { say('本例要確認已能合法胡，請按「胡」。'); return; }
      const won = settleClaims(game, { 0: 'WIN' });
      detail = `合法胡牌（胡別人，下家放槍），本例${won.settlement!.score!.tai}台。過水在你打出九萬時已解除。`;
      round = changeWaitExample(); next(8, '最後看一個反例：換聽不等於解除。');
    });
  } else {
    const game = round!, after = winningTiles(game.players[0].concealed.map(kindOf));
    activity.append(node('p', '', '另一種情況：過水中摸到五萬，改打四筒。打後手牌如下。新聽口有哪些？（可複選）'), cards(game.players[0].concealed));
    pick(activity, '候選聽口', ['1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p'].map(k => ({ key: k, label: tileName(k), tiles: [k] })),
      waitCheck(after, '還有聽口沒找到：留下的筒子是二三四五六，前、中、後都試試。'),
      () => complete(`新聽口是${names(after)}；打出的四筒仍在其中，所以過水${game.players[0].restrictions.passedWin ? '沒有解除' : '已解除'}。換聽不等於解除。`));
  }
}
const windLabel = (s: GameState, seat: number) => `${'東南西北'[Number(seatWind(seat as Seat, s.dealer)[0]) - 1]}門${seat === 0 ? '（你）' : ''}`;
const signed = (n: number) => n > 0 ? `＋${n}` : n < 0 ? `−${-n}` : '0';
function renderSettlement(activity: HTMLElement): void {
  const game = round!, transfer = stage === 'transfer';
  if (step === 0) {
    activity.append(node('p', '', `教學示例：你是東門莊家，本局開始時連${game.streak}。剛摸進${tileName(game.drawContext.lastTile!)}。花：`), cards(game.players[0].flowers));
    showHand(activity, game);
    claims(activity, game, a => { round = teachingStep(game, 0, a); next(1, '已自摸，結算已完成。下面只讀這次結算，不會重算或再付一次。'); }, a => a.type === 'WIN');
    return;
  }
  const result = game.settlement!, score = result.score!, winner = result.winner!, payers = [0, 1, 2, 3].filter(s => result.delta[s] < 0);
  activity.append(node('p', '', transfer ? `教學示例：莊家東門本局開始時連${game.streak}。南門已吃一二三萬，西門打出紅中，南門胡。` : `東門莊家（你）連${game.streak}自摸。`));
  activity.append(node('p', '', `${windLabel(game, winner)}的花：`), cards(game.players[winner].flowers));
  const lines = node('ul', 'progress-list'); lines.setAttribute('aria-label', '胡牌明細');
  scoreLines(score).forEach(line => lines.append(node('li', '', `${line.reason}：${line.tai}台`)));
  activity.append(lines, node('p', '', `牌型合計 ${score.tai} 台（還不含每筆付款的莊家／連莊台）。`));
  if (detail) activity.append(node('p', 'learn-note', detail));
  const wind = Number(seatWind(winner, game.dealer)[0]), flowers = game.players[winner].flowers;
  if (step === 1) {
    const answer = flowers.filter(f => [wind, wind + 4].includes(Number(kindOf(f)[1])));
    activity.append(node('p', '', `${windLabel(game, winner)}的花裡，哪幾張是本門正花、有台？（可複選）`));
    pick(activity, '花牌', flowers.map(f => ({ key: f, label: tileName(f), tiles: [f] })),
      setCheck(answer, f => `${tileName(f)}不是${windLabel(game, winner)}的正花。正花看門風：東春梅、南夏蘭、西秋菊、北冬竹。`, '還有正花沒選：正花看門風，東春梅、南夏蘭、西秋菊、北冬竹。'),
      () => next(2, `你分清了${flowers.length}張花和${answer.length}張正花。`));
  } else if (step === 2) {
    activity.append(node('p', '', '這次誰要付款？（可複選）'));
    pick(activity, '付款的人', [0, 1, 2, 3].filter(s => s !== winner).map(s => ({ key: String(s), label: windLabel(game, s), tiles: [] })),
      setCheck(payers.map(String), () => result.source === 'selfDraw' ? '一般自摸由其他三家各付。' : '胡別人只由放槍的一家付，其他人不付。', result.source === 'selfDraw' ? '一般自摸由其他三家各付，還有人沒選。' : '胡別人由放槍的一家付。'),
      () => next(3, `付款的是${payers.map(s => windLabel(game, s)).join('、')}。`));
  } else if (step === 3) {
    const payer = payers.find(s => s === game.dealer) ?? payers[0], amount = -result.delta[payer], dealerPays = [winner, payer].includes(game.dealer);
    const choices = [...new Set([30 + 10 * score.tai, 30 + 10 * (score.tai + 1), 30 + 10 * (score.tai + 1 + 2 * game.streak), amount])].sort((a, b) => a - b);
    ask(activity, `${windLabel(game, payer)}付多少分？（一底30、每台10）`, choices.map(n => `${n}分`), choices.indexOf(amount),
      `一底30＋每台10。這筆${dealerPays ? `涉及莊家，要加莊家1台及連莊${2 * game.streak}台` : '沒有涉及莊家，不加莊家和連莊台'}。`, () => {
        detail = `四家分數變動：${[0, 1, 2, 3].map(s => `${windLabel(game, s)} ${signed(result.delta[s])}`).join('、')}。本局只付一次，重看畫面不會再付。`;
        next(4, `對：${dealerPays ? `30＋10×(${score.tai}＋1＋${2 * game.streak})` : `30＋10×${score.tai}`}＝${amount}分。`);
      });
  } else {
    const after = nextHand(game), stay = after.dealer === game.dealer;
    ask(activity, '下一局誰當莊？', [`東門續莊，連${game.streak + 1}`, `南門接莊（原莊家的下家），連0`], stay ? 0 : 1,
      '莊家胡或流局才連莊；閒家胡由原莊家的下家接莊，不是胡的人坐莊。', () => complete(`下一局由本局的${windLabel(game, after.dealer).replace('（你）', '')}當莊，連${after.streak}。`));
  }
}
function supplement(): HTMLElement | null {
  if (![3, 4, 5].includes(index)) return null;
  const box = node('details', 'learn-note'); box.append(node('summary', '', '補充短例（完成主線後再看）'));
  const list = node('ul'); box.append(list); const add = (text: string) => list.append(node('li', '', text));
  try {
    if (index === 3) {
      const limit = lesson4Limits();
      add(`牌尾可用牌只剩3張以內，不能吃、碰、明槓：本例剩4張時有${limit.chiAt4}種吃法，剩3張時${limit.chiAt3}種。`);
      add(`放棄合法的碰會記「過碰」：到你下次打牌前，同種牌再出現${limit.ponAfterPass ? '仍可' : '也不能'}碰；摸牌或補花不會清除。`);
      add(`自己最後打出的同種牌，${limit.claimOwnLast ? '仍可' : '暫時不能'}回吃或回碰。`);
      add('明槓後到這次打牌前不能一般自摸；連續補花或再開暗槓、加槓也不能繞過。');
    } else if (index === 4) {
      add(`曾打過某張牌，不會因此一律不能胡它：本例你剛打過二萬，上家再打二萬時${has(ownDiscardExample(), 0, 'WIN') ? '仍可' : '不能'}合法胡。`);
      add('被別人攔胡不算自願放過；放棄合法自摸也會過水；摸花、暗槓不會自行解除；加槓要沒被搶、正式成立才解除。');
      add('本課不把桌上看得到的牌數比例當成下一張一定摸中的機率。');
    } else {
      const x = settlementSupplements(), z = x.zeroTai, moved = nextHand(x.dealerMoves), drawn = nextHand(x.exhaustiveDraw);
      add(`自摸不一定同額：南門閒家自摸${x.nonDealerSelfDraw.settlement!.score!.tai}台，東門莊家付${-x.nonDealerSelfDraw.settlement!.delta[0]}，西、北各付${-x.nonDealerSelfDraw.settlement!.delta[2]}，南門共收${x.nonDealerSelfDraw.settlement!.delta[1]}。`);
      add(`換莊不等於胡的人坐莊：西門胡北門放槍，下一局由${windLabel(x.dealerMoves, moved.dealer).replace('（你）', '')}當莊。`);
      add(`零台也能胡：本例${z.settlement!.score!.tai}台，兩家都不是莊家，放槍的${windLabel(z, z.settlement!.delta.findIndex(n => n < 0))}付${-Math.min(...z.settlement!.delta)}分（一底）。`);
      add(`花槓取代正花：持春夏秋冬梅時，明細是${scoreLines(x.flowerKong.settlement!.score!).map(l => `${l.reason}${l.tai}台`).join('、')}，共${x.flowerKong.settlement!.score!.tai}台。`);
      add(`流局：四家分數都不變（${x.exhaustiveDraw.settlement!.delta.map(signed).join('／')}），莊家留莊，下一局連${drawn.streak}。`);
    }
  } catch { add('補充短例未能套用；正常牌局與進度不受影響。'); }
  return box;
}
function render(): void {
  if (isRound() && !roundSession && (stage === 'guided' || stage === 'transfer')) stage = 'read';
  const nav = document.querySelector<HTMLElement>('#lesson-nav')!; nav.replaceChildren();
  const go = (i: number) => {
    if (roundSession && roundDirty() && !confirm(`第${roundSession.course}課有尚未保存的段落；切換課程後本頁段落不保留（已存的續學點不受影響）。確定？`)) return;
    roundSession = null; roundOwn = null; index = i; stage = 'read'; round = null; detail = ''; syncLeaveGuard(); render(); renderRoundPanel();
    say(i >= 6 ? '可跳課；第7–8課的段落可用「保存並暫停」另存續學點，其他未完成操作不續存。' : '可跳課；本頁未完成的操作不續存，已保存完成紀錄保留。', false);
  };
  lessons.forEach((l, i) => { const b = button(`${i + 1}. ${l.title}`, `lesson-${i}`, () => go(i), ''); if (i === index) b.setAttribute('aria-current', 'step'); nav.append(b); });
  root.replaceChildren(); const heading = node('h2', '', `第${index + 1}課：${lessons[index].title}`); heading.tabIndex = -1; root.append(heading);
  const explanation = node('div'); explanation.append(node('p', '', lessons[index].text));
  if (index === 0) explanation.append(cards(['1m','1p','1s','1z','5z','7z','f1','f5']));
  if (index === 2) explanation.append(cards(['1m','2m','3m','5z','5z','5z','7z','7z']));
  if (index === 6) explanation.append(node('p', 'muted', '「換例自己試」會改用第8課的那一副固定牌例。'));
  if (index === 7) explanation.append(appendix());
  const actions = node('div', 'lesson-actions');
  actions.append(button('我讀完了，開始示範', 'learn-guided', () => start(false), ''), button('換例自己試', 'learn-transfer', () => start(true), ''));
  const kept = isRound() && roundSession?.course === index + 1 ? roundSession : null;
  if (stage === 'read' && kept) actions.append(button(`繼續本段（${modeName(kept.mode)}・${SEGMENTS[kept.cp.point]}）`, 'learn-continue', () => { stage = kept.mode; render(); say('回到剛才的段落。', false); }, ''));
  if (stage === 'read' || stage === 'done') root.append(explanation, actions);
  if (stage === 'done') {
    const last = index === lessons.length - 1, more = supplement();
    if (more) root.append(more);
    root.append(node('p', 'learn-note', last ? '本段完成。第1–8課入門到此；可以換例、重練，或返回牌室。教學示例結束，正常對戰使用另一次洗牌及原存檔；牌室會提供繼續原局，新開一將仍會先確認。'
      : isRound() ? '本段完成。可以換例、重練或選下一課。已存的續學點不會自動清掉，可在續學點區自行清除。' : '本段完成。可以換例、重練或選下一課。'));
    const after = node('div', 'lesson-actions');
    if (last) { const home = node('a', '', '返回牌室'); home.href = './'; after.append(home); }
    else after.append(button(`下一課：${lessons[index + 1].title}`, 'learn-next', () => go(index + 1), ''));
    root.append(after);
  }
  else if (stage !== 'read' && isRound() && roundSession) {
    const session = roundSession;
    const recap = node('details'), summary = node('summary', '', '回看圖解（本次會列提示下完成）');
    // While a save waits for its lock the lesson is frozen: the recap cannot open (or change the assisted flag) either.
    summary.addEventListener('click', event => { if (roundBusy) { event.preventDefault(); return; } if (!recap.open) { if (assist(session)) { syncLeaveGuard(); renderRoundPanel(); refreshRoundControls(); } say('已回看圖解，本次完成將列提示下完成。', false); } });
    recap.append(summary, explanation); root.append(recap);
    const activity = node('section'); activity.setAttribute('aria-label', '本課操作任務');
    const taskTitle = node('h3', '', `第${index + 1}課 · ${modeName(session.mode)}`); taskTitle.tabIndex = -1; activity.append(taskTitle);
    try {
      renderWholeRound(session, activity, {
        say, changed: () => { syncLeaveGuard(); render(); renderRoundPanel(); },
        flagged: () => { syncLeaveGuard(); renderRoundPanel(); refreshRoundControls(); },
        complete: (wasAssisted, message) => { assisted = wasAssisted; roundSession = null; roundOwn = null; complete(`${message} `); syncLeaveGuard(); renderRoundPanel(); },
        save: () => { void saveRound(); }, saveBlocked: roundSaveBlocked, saveStatus: roundSaveStatus,
      });
    } catch { activity.append(node('p', 'learn-note', '示例操作未能套用，沒有記為完成。請重開此示例再試；正常牌局與原進度不受影響。')); }
    activity.append(button('回到本課圖解', 'learn-back', () => { stage = 'read'; render(); say('本段保留在本頁，可按「繼續本段」回來；尚未保存的段落離頁不保留。', false); }, ''));
    root.append(activity);
    // Keep the reader near the next action instead of jumping to the top on every step.
    const target = activity.querySelector<HTMLElement>('[data-round-focus]') ?? taskTitle;
    target.focus({ preventScroll: true }); target.scrollIntoView({ block: 'nearest' }); return;
  }
  else if (stage !== 'read') {
    const recap = node('details'), summary = node('summary', '', '回看圖解（本次會列提示下完成）');
    summary.addEventListener('click', () => { if (!recap.open) { assisted = true; say('已回看圖解，本次完成將列提示下完成。', false); } });
    recap.append(summary, explanation); root.append(recap);
    const activity = node('section'); activity.setAttribute('aria-label', '本課操作任務');
    const taskTitle = node('h3', '', `第${index + 1}課 · ${stage === 'transfer' ? '換例自己試' : '親手做示範'}`); taskTitle.tabIndex = -1; activity.append(taskTitle);
    activity.append(button('看提示', 'learn-hint', () => { assisted = true; say(lessons[index].hint); }, ''));
    if (detail && index !== 5) activity.append(node('p', 'learn-note', detail));
    if (index === 0) renderRecognition(activity); else if (index === 1) renderRound(activity); else if (index === 2) renderComposition(activity);
    else if (index === 3) renderClaims(activity); else if (index === 4) renderWaits(activity); else renderSettlement(activity);
    activity.append(button('回到本課圖解', 'learn-back', () => { stage = 'read'; round = null; detail = ''; render(); say('未完成操作已回到起點，已保存紀錄保留。', false); }, ''));
    root.append(activity); taskTitle.focus(); taskTitle.scrollIntoView({ block: 'start' }); return;
  }
  heading.focus();
}
loadProgress(); readRound(); render();
