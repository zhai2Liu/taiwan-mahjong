import { trainingQuestions } from './training-data.js';

// ponytail: page-local drafts only; persistence needs a separate retention/clear contract.
const drafts = trainingQuestions.map(() => ({ selected: new Set<string>(), reason: '', revealed: false }));
const root = document.querySelector<HTMLElement>('#training')!;
let index = 0;
const el = <K extends keyof HTMLElementTagNameMap>(tag: K, text = '') => {
  const item = document.createElement(tag); item.textContent = text; return item;
};
function render(focus = true): void {
  const q = trainingQuestions[index], draft = drafts[index];
  root.replaceChildren();
  const heading = el('h2', `第 ${index + 1} / ${trainingQuestions.length} 題`); heading.tabIndex = -1;
  root.append(heading, el('p', q.prompt), el('p', '請選出全部成立的敘述；理由可留空。'));
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
  if (focus) heading.focus();
}
render(false);
