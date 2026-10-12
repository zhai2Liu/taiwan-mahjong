import { trainingQuestions } from './training-data.js';

// ponytail: page-local drafts only; persistence needs a separate retention/clear contract.
const drafts = trainingQuestions.map(() => ({ selected: new Set<string>(), reason: '', feedback: '', revealed: false }));
const root = document.querySelector<HTMLElement>('#training')!;
let index = 0;
const el = <K extends keyof HTMLElementTagNameMap>(tag: K, text = '') => {
  const item = document.createElement(tag); item.textContent = text; return item;
};
function render(focus = true): void {
  const q = trainingQuestions[index], draft = drafts[index];
  root.replaceChildren();
  const heading = el('h2', `第 ${index + 1} / ${trainingQuestions.length} 題`); heading.tabIndex = -1;
  root.append(heading, el('p', `題號 ${q.id} · 回報問題時可附上此題號`), el('p', q.prompt), el('p', '請選出全部成立的敘述；理由可留空。'));
  const form = el('form'), options = el('fieldset'); options.append(el('legend', '你的選擇'));
  for (const choice of q.choices) {
    const label = el('label'), input = el('input');
    input.type = 'checkbox'; input.value = choice.id; input.checked = draft.selected.has(choice.id); input.disabled = draft.revealed;
    input.addEventListener('change', () => { if (input.checked) draft.selected.add(choice.id); else draft.selected.delete(choice.id); });
    label.append(input, el('span', choice.text)); options.append(label);
  }
  const reasonLabel = el('label', '我的理由（選填，不會自動評分）'), reason = el('textarea');
  reason.id = 'reason'; reasonLabel.htmlFor = reason.id; reason.maxLength = 2000; reason.rows = 3;
  reason.value = draft.reason; reason.readOnly = draft.revealed;
  reason.addEventListener('input', () => { draft.reason = reason.value; });
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
  feedback.addEventListener('input', () => { draft.feedback = feedback.value; });
  feedbackPanel.append(el('summary', '提供本題回饋（選填）'), feedbackLabel, feedback,
    el('p', '例如哪句看不懂、哪個操作卡住。切題會保留；離頁會清除，請先下載。'));
  const download = el('button', '下載全部試讀回饋'); download.type = 'button';
  const exportStatus = el('p'); exportStatus.setAttribute('role', 'status');
  const previewLabel = el('label', '本次匯出內容（可自行複製）'), preview = el('textarea');
  preview.id = 'feedback-export'; previewLabel.htmlFor = preview.id; preview.readOnly = true; preview.rows = 5;
  const previewPanel = el('div'); previewPanel.hidden = true; previewPanel.append(previewLabel, preview);
  download.addEventListener('click', () => {
    const notes = drafts.flatMap((d, i) => d.feedback.trim() ? [`題號 ${trainingQuestions[i].id}\n${d.feedback.trim()}`] : []);
    if (!notes.length) { exportStatus.textContent = '目前沒有回饋；可先展開「提供本題回饋」填寫。'; return; }
    preview.value = `台灣十六張試讀回饋 · TW16-CLASSIC-v1 · L3-B0\n只包含自行填寫的回饋，不含作答與理由。\n\n${notes.join('\n\n')}`;
    previewPanel.hidden = false;
    let url: string | undefined;
    try {
      url = URL.createObjectURL(new Blob([preview.value], { type: 'text/plain;charset=utf-8' }));
      const link = el('a'); link.href = url; link.download = 'taiwan-mahjong-trial-feedback.txt'; link.click();
      exportStatus.textContent = '已交由瀏覽器下載。若未出現檔案，可複製下方文字；請自行提供回饋，不會自動上傳。';
    } catch { exportStatus.textContent = '瀏覽器無法下載，請複製下方回饋文字；原內容仍保留在本頁。'; }
    finally { if (url) { const objectUrl = url; setTimeout(() => URL.revokeObjectURL(objectUrl), 1000); } }
  });
  root.append(feedbackPanel, download, exportStatus, previewPanel);
  if (focus) heading.focus();
}
render(false);
