import { trainingQuestions, trainingSkills, trainingContentRevision } from './training-data.js';
import { tileFace } from './tile-face.js';
import type { TileKind } from './model.js';
import { TRIAL_KEY, decodeTrialDraft, saveTrialDraft, clearTrialDraft } from './training-draft.js';
import type { StoredTrial } from './training-draft.js';
import type { Exposure, TrialRecord } from './trial-record.js';

type Draft = { selected: Set<string>; reason: string; feedback: string; revealed: boolean; exposure: Exposure };
const emptyDrafts = (): Draft[] => trainingQuestions.map(() => ({ selected: new Set<string>(), reason: '', feedback: '', revealed: false, exposure: 'unknown' }));
let drafts = emptyDrafts();
const root = document.querySelector<HTMLElement>('#training')!;
const requestedSkill = window.location?.search ? new URLSearchParams(window.location.search).get('skill') : null;
let skill = trainingSkills.some(s => s.id === requestedSkill) ? requestedSkill! : 'all';
let index = trainingQuestions.findIndex(q => skill === 'all' || q.skill === skill);
let leaveGuardActive = false;
let answersExportSnapshot: string | undefined, feedbackExportSnapshot: string | undefined;
const answersSnapshot = () => JSON.stringify(drafts.map(d => [[...d.selected].sort(), d.reason, d.feedback, d.revealed, d.exposure]));
const feedbackSnapshot = () => JSON.stringify(drafts.map(d => d.feedback.trim()));
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
    saveMessage = saved ? '已載入此瀏覽器保存的作答；修改後請再次保存。' : '尚未在此瀏覽器保存；可手動保存續答，或匯出交回。';
  } catch { saveBlocked = true; saveMessage = savedRaw === undefined ? '無法讀取本機保存，停止覆寫未知資料；本頁仍可作答，請匯出保留。' : '保存格式或題目版本不同，原檔已保留且停止覆寫。可匯出原檔，或確認後清除本機保存。'; }
}
function checkOtherSave(): void {
  try { if (savedRaw !== undefined && storage.getItem(TRIAL_KEY) !== savedRaw) { saveBlocked = true; saveMessage = '另一頁已變更本機保存，停止覆寫；本頁作答保留。重讀前請先匯出未存內容。'; } }
  catch { saveBlocked = true; saveMessage = '無法核對本機保存；本頁內容仍保留，請匯出。'; }
}
async function saveLocal(): Promise<void> {
  if (saveBusy || saveBlocked || savedRaw === undefined) return;
  const captured: StoredTrial = { schemaVersion: 1, questionId: trainingQuestions[index].id, skill, report: currentRecord() };
  saveBusy = true; updateDraftStatus();
  try { savedRaw = await saveTrialDraft(storage, savedRaw, captured); savedData = JSON.stringify(captured.report.questions); saveMessage = safelySaved() ? '已保存作答到此瀏覽器，下次會自動載入；不會上傳。' : '已保存按下按鈕時的作答，還有新修改未保存。'; }
  catch (error) { if (error instanceof Error && error.message === 'TRIAL_CONFLICT') { saveBlocked = true; saveMessage = '另一頁已變更保存，停止覆寫；本頁作答仍保留，請先匯出再重讀。'; } else saveMessage = '本次保存未成功，原檔與本頁作答仍保留；可重試或匯出。'; }
  finally { saveBusy = false; updateDraftStatus(); }
}
async function clearLocal(): Promise<void> {
  if (saveBusy || savedRaw === undefined || !window.confirm('清除這個瀏覽器保存的試讀作答？本頁內容先保留供匯出；牌局、練習及新手進度不變。')) return;
  saveBusy = true; updateDraftStatus();
  try { await clearTrialDraft(storage, savedRaw); savedRaw = null; savedData = undefined; saveBlocked = false; saveMessage = '本機保存已清除；本頁作答仍保留，離頁前可匯出。'; }
  catch { saveMessage = '清除未成功或原檔已更動，原資料與本頁作答保留；請重新讀取再決定。'; }
  finally { saveBusy = false; updateDraftStatus(); }
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
  const changed = [];
  if (answersExportSnapshot !== undefined && answersExportSnapshot !== answersSnapshot()) changed.push('作答紀錄');
  if (feedbackExportSnapshot !== undefined && feedbackExportSnapshot !== feedbackSnapshot()) changed.push('試讀回饋');
  status.hidden = !hasContent;
  const notice = changed.length
    ? `${changed.join('、')}在交由瀏覽器下載後有新修改，請再次匯出並確認檔案。${safelySaved() ? '目前作答已確認保存在此瀏覽器。' : '原內容仍只留在本頁。'}`
    : safelySaved() ? '目前作答已確認保存在此瀏覽器；需要交回時仍須匯出，不會自動上傳。' : '內容只留在本頁。離開前請保存續答或匯出並確認檔案；僅交由瀏覽器下載仍會提醒離頁。';
  if (status.textContent !== notice) status.textContent = notice;
}
// The browser may restore form fields after pageshow without restoring our drafts; redraw from owned state after that restoration.
window.addEventListener('pageshow', () => { checkOtherSave(); updateDraftStatus(); setTimeout(() => render(false), 0); });
window.addEventListener('storage', event => { if (event.key === null || event.key === TRIAL_KEY && event.newValue !== savedRaw) { saveBlocked = true; saveMessage = '另一頁已變更保存，停止覆寫；本頁內容保留，重讀前請先匯出。'; updateDraftStatus(); } });
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
  dialog.append(title, el('p', '本頁有尚未確認保存的內容。離開後可能無法找回；若要保留，請先保存到此瀏覽器，或匯出／複製並確認內容。下載不會自動回傳。'), actions);
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
  const storageStatus = el('p'); storageStatus.id = 'storage-status'; storageStatus.setAttribute('role', 'status'); root.append(storageStatus);
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
  const heading = el('h2', `第 ${position + 1} / ${visible.length} 題 · ${category.label}`); heading.tabIndex = -1;
  root.append(label, picker, el('p', category.goal), el('p', category.limit), heading,
    el('p', `題號 ${q.id} · 回報問題時可附上此題號`), el('p', q.prompt), el('p', `本題範圍：${q.scope}`), el('p', '請選出全部成立的敘述；理由可留空。'));
  const exposurePanel = el('details'), exposure = el('select'), exposureLabel = el('label', '開始這份作答前，你是否看過這題？（自行回報）');
  exposure.id = 'prior-exposure'; exposureLabel.htmlFor = exposure.id; exposure.disabled = draft.revealed; exposurePanel.open = draft.exposure !== 'unknown';
  for (const [value, text] of [['unknown', '不確定／未回報'], ['seen', '以前看過'], ['unseen-self-report', '此前沒看過（自行回報）']]) { const option = el('option', text); option.value = value; exposure.append(option); }
  exposure.value = draft.exposure;
  exposure.addEventListener('change', () => { if (!draft.revealed && ['unknown', 'seen', 'unseen-self-report'].includes(exposure.value)) { draft.exposure = exposure.value as Exposure; updateDraftStatus(); } });
  exposurePanel.append(el('summary', '選填：以前是否看過本題（預設不確定）'), exposureLabel, exposure, el('p', '揭示推導後鎖定這份紀錄；自陳不證明首次。畫面已提供類別導引，不是無提示測驗。')); root.append(exposurePanel);
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
    figure.append(tiles); root.append(figure);
  }
  const form = el('form'), options = el('fieldset'); options.append(el('legend', '你的選擇'));
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
  const submit = el('button', '提交並看推導'); submit.type = 'submit'; submit.disabled = draft.revealed;
  const message = el('p'); message.setAttribute('role', 'status');
  form.append(options, reasonLabel, reason, submit, message);
  form.addEventListener('submit', event => {
    event.preventDefault(); if (draft.revealed) return;
    if (!draft.selected.size) { message.textContent = '請先選擇至少一項，再提交。'; return; }
    draft.revealed = true; render(false); root.querySelector<HTMLElement>('#answer')?.focus();
  });
  root.append(form);
  if (draft.revealed) {
    const answer = el('section'); answer.className = 'answer';
    const title = el('h3', draft.selected.size === q.accepted.length && q.accepted.every(id => draft.selected.has(id)) ? '選擇集合符合本題答案' : '有選項需要再核對');
    title.id = 'answer'; title.tabIndex = -1;
    const list = el('ul');
    for (const c of q.choices) if (q.accepted.includes(c.id)) list.append(el('li', c.text));
    answer.append(title, el('p', '成立的選項：'), list, el('p', q.derivation), el('p', '理由：未評閱。請自行對照推導與適用範圍；選對不代表已證明理解或整體牌技。'));
    root.append(answer);
  }
  const nav = el('nav'); nav.setAttribute('aria-label', '題目切換');
  for (const [text, delta] of [['上一題', -1], ['下一題', 1]] as const) {
    const button = el('button', text); button.type = 'button'; button.disabled = position + delta < 0 || position + delta >= visible.length;
    button.addEventListener('click', () => { index = visible[position + delta].i; render(); }); nav.append(button);
  }
  root.append(nav, el('p', `本頁已揭示 ${drafts.filter(d => d.revealed).length} / ${trainingQuestions.length} 題；這是閱讀進度，不是成績。`));
  if (skill !== 'all') root.append(el('p', `本分類已揭示 ${visible.filter(({ i }) => drafts[i].revealed).length} / ${visible.length} 題；切換重點保留本頁作答，匯出包含全部 ${trainingQuestions.length} 題。`));
  const feedbackPanel = el('details'); feedbackPanel.open = !!draft.feedback;
  const feedbackLabel = el('label', `題號 ${q.id} 的題意或操作回饋`), feedback = el('textarea');
  feedback.id = 'trial-feedback'; feedbackLabel.htmlFor = feedback.id;
  feedback.maxLength = 1000; feedback.rows = 3; feedback.value = draft.feedback;
  feedback.addEventListener('input', () => { draft.feedback = feedback.value; updateDraftStatus(); });
  feedbackPanel.append(el('summary', '提供本題回饋（選填）'), feedbackLabel, feedback,
    el('p', '例如哪句看不懂、哪個操作卡住。切題會保留；離頁前請先匯出並確認檔案。'));
  const download = el('button', '下載全部試讀回饋'); download.type = 'button';
  const answersDownload = el('button', '匯出作答紀錄（含理由與回饋）'); answersDownload.type = 'button';
  const exportStatus = el('p'); exportStatus.setAttribute('role', 'status');
  const draftStatus = el('p'); draftStatus.id = 'draft-status'; draftStatus.setAttribute('role', 'status');
  const previewLabel = el('label', '最近一次匯出內容（可自行複製）'), preview = el('textarea');
  preview.id = 'feedback-export'; previewLabel.htmlFor = preview.id; preview.readOnly = true; preview.rows = 5;
  const previewPanel = el('div'); previewPanel.hidden = true; previewPanel.append(previewLabel, preview);
  const exportRecord = (includeAnswers: boolean): void => {
    const notes = drafts.flatMap((d, i) => d.feedback.trim() ? [`題號 ${trainingQuestions[i].id}\n${d.feedback.trim()}`] : []);
    if (!includeAnswers && !notes.length) { exportStatus.textContent = '目前沒有回饋；可先展開「提供本題回饋」填寫。'; return; }
    preview.value = includeAnswers ? JSON.stringify(currentRecord(), null, 2) : `台灣十六張試讀回饋 · TW16-CLASSIC-v1 · L3-B0\n只包含自行填寫的回饋，不含作答與理由。\n\n${notes.join('\n\n')}`;
    previewPanel.hidden = false;
    let url: string | undefined;
    try {
      url = URL.createObjectURL(new Blob([preview.value], { type: includeAnswers ? 'application/json;charset=utf-8' : 'text/plain;charset=utf-8' }));
      const link = el('a'); link.href = url; link.download = includeAnswers ? 'taiwan-mahjong-trial-answers.json' : 'taiwan-mahjong-trial-feedback.txt'; link.click();
      if (includeAnswers) answersExportSnapshot = answersSnapshot();
      else feedbackExportSnapshot = feedbackSnapshot();
      exportStatus.textContent = '已交由瀏覽器下載。若未出現檔案，可複製下方文字；請自行提供回饋，不會自動上傳。';
    } catch { exportStatus.textContent = '瀏覽器無法下載，請複製下方回饋文字；原內容仍保留在本頁。'; }
    finally { if (url) { const objectUrl = url; setTimeout(() => URL.revokeObjectURL(objectUrl), 1000); } updateDraftStatus(); }
  };
  download.addEventListener('click', () => exportRecord(false));
  answersDownload.addEventListener('click', () => exportRecord(true));
  const exports = el('nav'); exports.setAttribute('aria-label', '下載試讀內容'); exports.append(download, answersDownload);
  const savedPanel = el('details'), savedActions = el('nav'); savedActions.setAttribute('aria-label', '本機續答管理');
  const save = el('button', '保存作答到此瀏覽器'), read = el('button', '重新讀取保存'), clear = el('button', '清除本機保存（保留本頁）'), recover = el('button', '匯出最後讀取的保存原檔');
  save.id = 'save-local'; read.id = 'read-local'; clear.id = 'clear-local'; recover.id = 'recover-local';
  for (const control of [save, read, clear, recover]) control.type = 'button';
  save.addEventListener('click', () => { void saveLocal(); }); clear.addEventListener('click', () => { void clearLocal(); });
  read.addEventListener('click', () => {
    if (saveBusy || leaveGuardActive && !window.confirm('重新讀取會放棄本頁未保存的作答、理由與回饋。若要保留，請先匯出。確定？')) return;
    readSaved(); render();
  });
  recover.addEventListener('click', () => {
    if (typeof savedRaw !== 'string' || saveBusy) return;
    preview.value = savedRaw; previewPanel.hidden = false; let url: string | undefined;
    try { url = URL.createObjectURL(new Blob([savedRaw], { type: 'application/json;charset=utf-8' })); const link = el('a'); link.href = url; link.download = 'taiwan-mahjong-trial-saved-original.json'; link.click(); exportStatus.textContent = '已交由瀏覽器下載最後讀取的保存原檔；這是回復資料，不是一般作答匯出，請交維護者人工核對。'; }
    catch { exportStatus.textContent = '下載未成功，可複製下方原始保存；本機原檔不變。'; }
    finally { if (url) { const old = url; setTimeout(() => URL.revokeObjectURL(old), 1000); } }
  });
  savedActions.append(read, clear, recover); savedPanel.append(el('summary', '管理本機保存／回復原檔'), savedActions);
  root.append(feedbackPanel, el('p', '若要交回作答，請匯出紀錄並自行附到專案對話。檔案含選項、理由、回饋與先前曝光自陳，不含標準答案；不會自動上傳。'), exports,
    el('p', '手動保存後，下次開啟會自動載入同版作答。資料只在此瀏覽器；共用裝置離開前可清除本機保存。'), save, savedPanel, draftStatus, exportStatus, previewPanel);
  updateDraftStatus();
  if (focus) heading.focus();
}
readSaved(true); render(false);
