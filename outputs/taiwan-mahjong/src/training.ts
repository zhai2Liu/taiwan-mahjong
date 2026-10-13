import { trainingQuestions, trainingContentRevision } from './training-data.js';
import { tileFace } from './tile-face.js';
import type { TileKind } from './model.js';

// ponytail: page-local drafts only; persistence needs a separate retention/clear contract.
const drafts = trainingQuestions.map(() => ({ selected: new Set<string>(), reason: '', feedback: '', revealed: false }));
const root = document.querySelector<HTMLElement>('#training')!;
let index = 0;
let leaveGuardActive = false;
let answersExportSnapshot: string | undefined, feedbackExportSnapshot: string | undefined;
const answersSnapshot = () => JSON.stringify(drafts.map(d => [[...d.selected].sort(), d.reason, d.feedback, d.revealed]));
const feedbackSnapshot = () => JSON.stringify(drafts.map(d => d.feedback.trim()));
// ponytail: native beforeunload is best effort (especially on mobile); durable drafts need a separate retention/clear contract.
function warnBeforeLeave(event: BeforeUnloadEvent): void { event.preventDefault(); event.returnValue = 'true'; }
function updateDraftStatus(): void {
  const hasContent = drafts.some(d => d.selected.size || d.reason.length || d.feedback.length || d.revealed);
  if (hasContent !== leaveGuardActive) {
    if (hasContent) window.addEventListener('beforeunload', warnBeforeLeave);
    else window.removeEventListener('beforeunload', warnBeforeLeave);
    leaveGuardActive = hasContent;
  }
  const status = root.querySelector<HTMLElement>('#draft-status');
  if (!status) return;
  const changed = [];
  if (answersExportSnapshot !== undefined && answersExportSnapshot !== answersSnapshot()) changed.push('作答紀錄');
  if (feedbackExportSnapshot !== undefined && feedbackExportSnapshot !== feedbackSnapshot()) changed.push('試讀回饋');
  status.hidden = !hasContent;
  const notice = changed.length
    ? `${changed.join('、')}在交由瀏覽器下載後有新修改，請再次匯出並確認檔案。原內容仍只留在本頁。`
    : '內容只留在本頁。離開前請匯出並確認檔案；交由瀏覽器下載後仍會提醒離頁。';
  if (status.textContent !== notice) status.textContent = notice;
}
// The browser may restore form fields after pageshow without restoring our drafts; redraw from owned state after that restoration.
window.addEventListener('pageshow', () => { updateDraftStatus(); setTimeout(() => render(false), 0); });
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
  dialog.append(title, el('p', '離開後可能無法找回本次選項、理由與回饋。若要保留，請先匯出或複製並確認內容；下載不會自動回傳。'), actions);
  dialog.addEventListener('close', () => { dialog.remove(); returnLink.focus(); });
  document.body.append(dialog); dialog.showModal(); stay.focus();
});
const el = <K extends keyof HTMLElementTagNameMap>(tag: K, text = '') => {
  const item = document.createElement(tag); item.textContent = text; return item;
};
function render(focus = true): void {
  const q = trainingQuestions[index], draft = drafts[index];
  root.replaceChildren();
  const heading = el('h2', `第 ${index + 1} / ${trainingQuestions.length} 題`); heading.tabIndex = -1;
  root.append(heading, el('p', `題號 ${q.id} · 回報問題時可附上此題號`), el('p', q.prompt), el('p', '請選出全部成立的敘述；理由可留空。'));
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
    const button = el('button', text); button.type = 'button'; button.disabled = index + delta < 0 || index + delta >= trainingQuestions.length;
    button.addEventListener('click', () => { index += delta; render(); }); nav.append(button);
  }
  root.append(nav, el('p', `本頁已揭示 ${drafts.filter(d => d.revealed).length} / 9 題；這是閱讀進度，不是成績。`));
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
    preview.value = includeAnswers ? JSON.stringify({
      schemaVersion: 2, contentRevision: trainingContentRevision, rulesVersion: 'TW16-CLASSIC-v1', mode: 'L3-B0-content-trial',
      reasonAssessment: 'not-reviewed',
      // Include the presented question snapshot so later edits cannot silently change the report's meaning.
      questions: trainingQuestions.map((q, i) => ({ id: q.id, prompt: q.prompt,
        status: drafts[i].revealed ? 'submitted-and-revealed' : drafts[i].selected.size || drafts[i].reason.trim() ? 'draft' : 'unanswered',
        selected: q.choices.filter(c => drafts[i].selected.has(c.id)),
        reason: drafts[i].reason, feedback: drafts[i].feedback,
      })),
    }, null, 2) : `台灣十六張試讀回饋 · TW16-CLASSIC-v1 · L3-B0\n只包含自行填寫的回饋，不含作答與理由。\n\n${notes.join('\n\n')}`;
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
  root.append(feedbackPanel, el('p', '若要交回作答，請匯出紀錄並自行附到專案對話。檔案含選項、理由與回饋，不含標準答案；不會自動上傳。'), exports, draftStatus, exportStatus, previewPanel);
  updateDraftStatus();
  if (focus) heading.focus();
}
render(false);
