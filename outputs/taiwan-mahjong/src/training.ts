import { trainingQuestions, trainingSkills, trainingContentRevision } from './training-data.js';
import { tileFace } from './tile-face.js';
import type { TileKind } from './model.js';
import { TRIAL_KEY, decodeTrialDraft, saveTrialDraft, clearTrialDraft } from './training-draft.js';
import type { StoredTrial } from './training-draft.js';
import type { Exposure, TrialRecord } from './trial-record.js';

// feedback/exposure have no UI any more; they are carried verbatim so older saves keep their values.
type Draft = { selected: Set<string>; reason: string; feedback: string; revealed: boolean; exposure: Exposure };
const emptyDrafts = (): Draft[] => trainingQuestions.map(() => ({ selected: new Set<string>(), reason: '', feedback: '', revealed: false, exposure: 'unknown' }));
let drafts = emptyDrafts();
const root = document.querySelector<HTMLElement>('#training')!;
const requestedSkill = window.location?.search ? new URLSearchParams(window.location.search).get('skill') : null;
let skill = trainingSkills.some(s => s.id === requestedSkill) ? requestedSkill! : 'all';
let index = trainingQuestions.findIndex(q => skill === 'all' || q.skill === skill);
let leaveGuardActive = false;
let answersExportSnapshot: string | undefined;
const answersSnapshot = () => JSON.stringify(drafts.map(d => [[...d.selected].sort(), d.reason, d.feedback, d.revealed, d.exposure]));
let savedRaw: string | null | undefined, savedData: string | undefined, saveBlocked = false, saveBusy = false, saveMessage = '';
const storage = { getItem: (key: string) => localStorage.getItem(key), setItem: (key: string, value: string) => localStorage.setItem(key, value), removeItem: (key: string) => localStorage.removeItem(key) };
function currentRecord(): TrialRecord {
  return { schemaVersion: 3, contentRevision: trainingContentRevision, rulesVersion: 'TW16-CLASSIC-v1', mode: 'L3-B0-content-trial', reasonAssessment: 'not-reviewed', guidanceMode: 'topic-guided',
    questions: trainingQuestions.map((q, i) => ({ id: q.id, prompt: q.prompt,
      status: drafts[i].revealed ? 'submitted-and-revealed' : drafts[i].selected.size || drafts[i].reason.trim() ? 'draft' : 'unanswered',
      selected: q.choices.filter(c => drafts[i].selected.has(c.id)), reason: drafts[i].reason, feedback: drafts[i].feedback, exposure: drafts[i].exposure })) };
}
const dataSnapshot = () => JSON.stringify(currentRecord().questions);
const safelySaved = () => !saveBlocked && savedData !== undefined && savedData === dataSnapshot();
function readSaved(preferRoute = false): void {
  savedRaw = undefined;
  try {
    savedRaw = storage.getItem(TRIAL_KEY); const saved = savedRaw === null ? null : decodeTrialDraft(savedRaw);
    drafts = saved ? trainingQuestions.map(q => {
      const row = saved.report.questions.find(r => r.id === q.id)!;
      return { selected: new Set(row.selected.map(c => c.id)), reason: row.reason, feedback: row.feedback, revealed: row.status === 'submitted-and-revealed', exposure: row.exposure! };
    }) : emptyDrafts();
    skill = saved?.skill ?? 'all'; index = saved ? trainingQuestions.findIndex(q => q.id === saved.questionId) : 0;
    if (preferRoute && requestedSkill !== null) { skill = trainingSkills.some(s => s.id === requestedSkill) ? requestedSkill : 'all'; index = trainingQuestions.findIndex(q => skill === 'all' || q.skill === skill); }
    savedData = saved ? dataSnapshot() : undefined; saveBlocked = false;
    saveMessage = saved ? '已載入此瀏覽器保存的作答；修改後請再次保存。' : '尚未在此瀏覽器保存；可手動保存續答。';
  } catch { saveBlocked = true; saveMessage = savedRaw === undefined ? '無法讀取本機保存，停止覆寫未知資料；本頁仍可作答，請下載本頁作答備份。' : '保存格式或題目版本不同，原檔已保留且停止覆寫。可下載原檔，或確認後清除本機保存。'; }
}
function checkOtherSave(): void {
  try { if (savedRaw !== undefined && storage.getItem(TRIAL_KEY) !== savedRaw) { saveBlocked = true; saveMessage = '另一頁已變更本機保存，停止覆寫；本頁作答保留。重讀前請先下載本頁作答備份。'; } }
  catch { saveBlocked = true; saveMessage = '無法核對本機保存；本頁內容仍保留，請下載本頁作答備份。'; }
}
function restoreStorageFocus(control: Element | null): void {
  // Disabling a busy button blurs it; keep a focus the player moved elsewhere while waiting.
  if (document.activeElement !== document.body || !(control instanceof HTMLButtonElement) || !control.isConnected) return;
  (control.disabled ? root.querySelector<HTMLElement>('.trial-storage summary') : control)?.focus();
}
async function saveLocal(): Promise<void> {
  if (saveBusy || saveBlocked || savedRaw === undefined) return;
  const focused = document.activeElement;
  const captured: StoredTrial = { schemaVersion: 1, questionId: trainingQuestions[index].id, skill, report: currentRecord() };
  saveBusy = true; updateDraftStatus();
  try { savedRaw = await saveTrialDraft(storage, savedRaw, captured); savedData = JSON.stringify(captured.report.questions); saveMessage = safelySaved() ? '已保存作答到此瀏覽器，下次會自動載入；不會上傳。' : '已保存按下按鈕時的作答，還有新修改未保存。'; }
  catch (error) { if (error instanceof Error && error.message === 'TRIAL_CONFLICT') { saveBlocked = true; saveMessage = '另一頁已變更保存，停止覆寫；本頁作答仍保留，請先下載本頁作答備份再重讀。'; } else saveMessage = '本次保存未成功，原檔與本頁作答仍保留；可重試或下載本頁作答備份。'; }
  finally { saveBusy = false; updateDraftStatus(); restoreStorageFocus(focused); }
}
async function clearLocal(): Promise<void> {
  if (saveBusy || savedRaw === undefined || !window.confirm('清除這個瀏覽器保存的試讀作答？本頁內容先保留，可再保存或下載備份；牌局、練習及新手進度不變。')) return;
  const focused = document.activeElement;
  saveBusy = true; updateDraftStatus();
  try { await clearTrialDraft(storage, savedRaw); savedRaw = null; savedData = undefined; saveBlocked = false; saveMessage = '本機保存已清除；本頁作答仍保留，離頁前可再保存或下載備份。'; }
  catch { saveMessage = '清除未成功或原檔已更動，原資料與本頁作答保留；請重新讀取再決定。'; }
  finally { saveBusy = false; updateDraftStatus(); restoreStorageFocus(focused); }
}
// ponytail: native leave warnings are best effort; manual local save is independent of browser downloads.
function warnBeforeLeave(event: BeforeUnloadEvent): void { event.preventDefault(); event.returnValue = 'true'; }
function updateDraftStatus(): void {
  const hasContent = drafts.some(d => d.selected.size || d.reason.length || d.feedback.length || d.revealed || d.exposure !== 'unknown');
  const needsGuard = hasContent && (!safelySaved() || saveBusy);
  if (needsGuard !== leaveGuardActive) {
    if (needsGuard) window.addEventListener('beforeunload', warnBeforeLeave);
    else window.removeEventListener('beforeunload', warnBeforeLeave);
    leaveGuardActive = needsGuard;
  }
  const storageStatus = root.querySelector<HTMLElement>('#storage-status');
  const storageNotice = `${saveMessage}${savedData !== undefined && !safelySaved() ? ' 本頁有尚未確認保存的內容。' : ''}`;
  if (storageStatus && storageStatus.textContent !== storageNotice) storageStatus.textContent = storageNotice;
  for (const [id, disabled] of [['save-local', saveBusy || saveBlocked || savedRaw === undefined], ['read-local', saveBusy], ['clear-local', saveBusy || savedRaw === undefined || savedRaw === null], ['recover-local', saveBusy || typeof savedRaw !== 'string']] as const) {
    const control = root.querySelector<HTMLButtonElement>('#' + id); if (control) control.disabled = disabled;
  }
  const status = root.querySelector<HTMLElement>('#draft-status');
  if (!status) return;
  status.hidden = !hasContent;
  const notice = answersExportSnapshot !== undefined && answersExportSnapshot !== answersSnapshot()
    ? `作答在下載備份後有新修改，備份檔不含這些修改。${safelySaved() ? '目前作答已確認保存在此瀏覽器。' : '新內容仍只留在本頁。'}`
    : safelySaved() ? '目前作答已確認保存在此瀏覽器，不會上傳。' : '內容只留在本頁。離開前請保存到此瀏覽器，或下載本頁作答備份並確認檔案；僅交由瀏覽器下載仍會提醒離頁。';
  if (status.textContent !== notice) status.textContent = notice;
}
// The browser may restore form fields after pageshow without restoring our drafts; redraw from owned state after that restoration.
window.addEventListener('pageshow', () => { checkOtherSave(); updateDraftStatus(); setTimeout(() => render(false), 0); });
window.addEventListener('storage', event => { if (event.key === null || event.key === TRIAL_KEY && event.newValue !== savedRaw) { saveBlocked = true; saveMessage = '另一頁已變更保存，停止覆寫；本頁內容保留，重讀前請先下載本頁作答備份。'; updateDraftStatus(); } });
const returnLink = document.querySelector<HTMLAnchorElement>('#return-room');
returnLink?.addEventListener('click', event => {
  if (!leaveGuardActive || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  const dialog = el('dialog'), title = el('h2', '離開決策題試讀？');
  dialog.className = 'leave-dialog'; title.id = 'leave-title'; dialog.setAttribute('aria-labelledby', title.id);
  const stay = el('button', '留在本頁'), leave = el('button', '確認離開');
  stay.type = leave.type = 'button';
  stay.addEventListener('click', () => dialog.close());
  leave.addEventListener('click', () => {
    window.removeEventListener('beforeunload', warnBeforeLeave); leaveGuardActive = false;
    window.location.assign(returnLink.href);
  });
  const actions = el('div'); actions.className = 'leave-actions'; actions.append(stay, leave);
  dialog.append(title, el('p', '本頁有尚未確認保存的內容。離開後可能無法找回；若要保留，請先保存到此瀏覽器，或下載本頁作答備份並確認檔案。'), actions);
  dialog.addEventListener('close', () => { dialog.remove(); returnLink.focus(); });
  document.body.append(dialog); dialog.showModal(); stay.focus();
});
const el = <K extends keyof HTMLElementTagNameMap>(tag: K, text = '') => {
  const item = document.createElement(tag); item.textContent = text; return item;
};
function render(focus = true): void {
  const q = trainingQuestions[index], draft = drafts[index];
  const visible = trainingQuestions.map((q, i) => ({ q, i })).filter(({ q }) => skill === 'all' || q.skill === skill);
  const position = visible.findIndex(({ i }) => i === index), category = trainingSkills.find(s => s.id === q.skill)!;
  root.replaceChildren();
  const controls = el('section'); controls.className = 'trial-controls'; controls.setAttribute('aria-label', '練習重點與保存狀態');
  const storageStatus = el('p'); storageStatus.id = 'storage-status'; storageStatus.setAttribute('role', 'status');
  const label = el('label', '練習重點'), picker = el('select'); picker.id = 'skill-picker'; label.htmlFor = picker.id;
  for (const s of [{ id: 'all', label: '全部' }, ...trainingSkills]) {
    const count = trainingQuestions.filter(q => s.id === 'all' || q.skill === s.id).length;
    const option = el('option', `${s.label}（${count} 題）`); option.value = s.id; picker.append(option);
  }
  picker.value = skill;
  picker.addEventListener('change', () => {
    if (picker.value !== 'all' && !trainingSkills.some(s => s.id === picker.value)) return;
    skill = picker.value; index = trainingQuestions.findIndex(q => skill === 'all' || q.skill === skill); render();
  });
  const pickerGroup = el('div'); pickerGroup.className = 'trial-picker'; pickerGroup.append(label, picker);
  const goals = el('div'); goals.className = 'trial-goals'; goals.append(el('p', category.goal), el('p', category.limit));
  controls.append(pickerGroup, storageStatus, goals); root.append(controls);
  const question = el('section'); question.className = 'trial-question'; question.setAttribute('aria-labelledby', 'question-heading');
  const heading = el('h2', `第 ${position + 1} / ${visible.length} 題 · ${category.label}`); heading.tabIndex = -1; heading.id = 'question-heading';
  const questionId = el('p', `題號 ${q.id}`); questionId.className = 'trial-question-id';
  const scope = el('p', `本題範圍：${q.scope}`); scope.className = 'trial-scope';
  question.append(heading, questionId, el('p', q.prompt), scope);
  const workspace = el('div'); workspace.className = 'trial-workspace';
  const board = el('div'); board.className = 'trial-board'; board.setAttribute('role', 'region'); board.setAttribute('aria-label', '題目牌例');
  for (const row of q.board) {
    const figure = el('figure'); figure.className = 'question-tiles'; figure.append(el('figcaption', row.label));
    const tiles = el('div'); tiles.className = 'tile-row';
    for (const group of row.groups) {
      const set = el('div'); set.className = 'tile-group';
      for (const kind of group) {
        const name = kind[1] === 'z' ? ['東', '南', '西', '北', '中', '發', '白'][Number(kind[0]) - 1] : `${kind[0]}${({ m: '萬', p: '筒', s: '條' } as Record<string, string>)[kind[1]]}`;
        const face = el('span'); face.className = 'question-tile'; face.setAttribute('role', 'img'); face.setAttribute('aria-label', name);
        face.append(tileFace(kind as TileKind)); set.append(face);
      }
      tiles.append(set);
    }
    figure.append(tiles); board.append(figure);
  }
  if (!q.board.length) board.append(el('p', '依上方題幹所列局況作答，本題沒有額外牌面。'));
  const form = el('form'); form.className = 'trial-form';
  const options = el('fieldset'); options.append(el('legend', '你的選擇'));
  for (const choice of q.choices) {
    const label = el('label'), input = el('input');
    input.type = 'checkbox'; input.value = choice.id; input.checked = draft.selected.has(choice.id); input.disabled = draft.revealed;
    input.addEventListener('change', () => { if (input.checked) draft.selected.add(choice.id); else draft.selected.delete(choice.id); updateDraftStatus(); });
    label.append(input, el('span', choice.text)); options.append(label);
  }
  const reasonLabel = el('label', '我的理由（選填，不會自動評分）'), reason = el('textarea');
  reason.id = 'reason'; reasonLabel.htmlFor = reason.id; reason.maxLength = 2000; reason.rows = 3;
  reason.value = draft.reason; reason.readOnly = draft.revealed;
  reason.addEventListener('input', () => { draft.reason = reason.value; updateDraftStatus(); });
  const submit = el('button', '看答案與推導'); submit.type = 'submit'; submit.disabled = draft.revealed;
  const message = el('p'); message.setAttribute('role', 'status');
  form.append(el('p', '請選出全部成立的敘述；理由可留空。'), options, reasonLabel, reason, submit, message);
  form.addEventListener('submit', event => {
    event.preventDefault(); if (draft.revealed) return;
    if (!draft.selected.size) { message.textContent = '請先選擇至少一項，再看答案。'; return; }
    draft.revealed = true; render(false); root.querySelector<HTMLElement>('#answer')?.focus();
  });
  workspace.append(board, form); question.append(workspace); root.append(question);
  if (draft.revealed) {
    const answer = el('section'); answer.className = 'answer';
    const title = el('h3', draft.selected.size === q.accepted.length && q.accepted.every(id => draft.selected.has(id)) ? '選擇集合符合本題答案' : '有選項需要再核對');
    title.id = 'answer'; title.tabIndex = -1;
    const list = el('ul');
    for (const c of q.choices) if (q.accepted.includes(c.id)) list.append(el('li', c.text));
    answer.append(title, el('p', '成立的選項：'), list, el('p', q.derivation), el('p', '理由：未評閱。請自行對照推導與適用範圍；選對不代表已證明理解或整體牌技。'));
    question.append(answer);
  }
  const nav = el('nav'); nav.setAttribute('aria-label', '題目切換');
  for (const [text, delta] of [['上一題', -1], ['下一題', 1]] as const) {
    const button = el('button', text); button.type = 'button'; button.disabled = position + delta < 0 || position + delta >= visible.length;
    button.addEventListener('click', () => { index = visible[position + delta].i; render(); }); nav.append(button);
  }
  question.append(nav, el('p', `本頁已揭示 ${drafts.filter(d => d.revealed).length} / ${trainingQuestions.length} 題；這是閱讀進度，不是成績。`));
  if (skill !== 'all') question.append(el('p', `本分類已揭示 ${visible.filter(({ i }) => drafts[i].revealed).length} / ${visible.length} 題；切換重點保留本頁作答，作答備份包含全部 ${trainingQuestions.length} 題。`));
  const answersDownload = el('button', '下載本頁作答備份'); answersDownload.type = 'button';
  const exportStatus = el('p'); exportStatus.setAttribute('role', 'status');
  const draftStatus = el('p'); draftStatus.id = 'draft-status'; draftStatus.setAttribute('role', 'status');
  const previewLabel = el('label', '最近一次下載內容（可自行複製）'), preview = el('textarea');
  preview.id = 'backup-preview'; previewLabel.htmlFor = preview.id; preview.readOnly = true; preview.rows = 5;
  const previewPanel = el('div'); previewPanel.className = 'trial-export-preview'; previewPanel.hidden = true; previewPanel.append(previewLabel, preview);
  answersDownload.addEventListener('click', () => {
    preview.value = JSON.stringify(currentRecord(), null, 2); previewPanel.hidden = false;
    let url: string | undefined;
    try {
      url = URL.createObjectURL(new Blob([preview.value], { type: 'application/json;charset=utf-8' }));
      const link = el('a'); link.href = url; link.download = 'taiwan-mahjong-trial-answers.json'; link.click();
      answersExportSnapshot = answersSnapshot();
      exportStatus.textContent = '已交由瀏覽器下載本頁作答備份，請自行確認檔案。若未出現檔案，可複製下方內容；不會上傳。';
    } catch { exportStatus.textContent = '瀏覽器無法下載，請複製下方備份內容；原內容仍保留在本頁。'; }
    finally { if (url) { const objectUrl = url; setTimeout(() => URL.revokeObjectURL(objectUrl), 1000); } updateDraftStatus(); }
  });
  const savedPanel = el('details'), savedActions = el('nav'); savedActions.setAttribute('aria-label', '本機保存與備份');
  const save = el('button', '保存作答到此瀏覽器'), read = el('button', '重新讀取保存'), clear = el('button', '清除本機保存（保留本頁）'), recover = el('button', '匯出最後讀取的保存原檔');
  save.id = 'save-local'; read.id = 'read-local'; clear.id = 'clear-local'; recover.id = 'recover-local';
  for (const control of [save, read, clear, recover]) control.type = 'button';
  save.addEventListener('click', () => { void saveLocal(); }); clear.addEventListener('click', () => { void clearLocal(); });
  read.addEventListener('click', () => {
    if (saveBusy || leaveGuardActive && !window.confirm('重新讀取會放棄本頁未保存的作答與理由。若要保留，請先下載本頁作答備份。確定？')) return;
    readSaved(); render();
  });
  recover.addEventListener('click', () => {
    if (typeof savedRaw !== 'string' || saveBusy) return;
    preview.value = savedRaw; previewPanel.hidden = false; let url: string | undefined;
    try { url = URL.createObjectURL(new Blob([savedRaw], { type: 'application/json;charset=utf-8' })); const link = el('a'); link.href = url; link.download = 'taiwan-mahjong-trial-saved-original.json'; link.click(); exportStatus.textContent = '已交由瀏覽器下載最後讀取的保存原檔；這是原樣保留的保存內容，不是本頁作答備份，請自行確認檔案。'; }
    catch { exportStatus.textContent = '下載未成功，可複製下方原始保存；本機原檔不變。'; }
    finally { if (url) { const old = url; setTimeout(() => URL.revokeObjectURL(old), 1000); } }
  });
  savedActions.append(read, clear, answersDownload, recover);
  savedPanel.append(el('summary', '本機保存／備份'), savedActions,
    el('p', '作答備份是全部九題選項與理由的JSON檔，供你自己留存；本頁不會匯入檔案，也不會上傳。'), exportStatus, previewPanel);
  const storageArea = el('section'); storageArea.className = 'trial-storage'; storageArea.setAttribute('aria-label', '本機保存與備份');
  const localArea = el('div'); localArea.append(el('strong', '留在這裡，下次接著練'), el('p', '手動保存後，下次開啟會自動載入同版作答。保存會一併記住當下的題目與分類；之後切題不會自動更新保存位置。資料只在此瀏覽器；共用裝置離開前可清除本機保存。'), save, draftStatus, savedPanel);
  storageArea.append(localArea); root.append(storageArea);
  updateDraftStatus();
  if (focus) heading.focus();
}
readSaved(true); render(false);
