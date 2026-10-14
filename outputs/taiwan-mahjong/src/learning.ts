import { node, button, tileName } from './view.js';
import { tileFace } from './tile-face.js';
import { kindOf } from './tiles.js';
import { legalActions } from './engine.js';
import { isWinningHand } from './hand.js';
import type { GameState, Meld, Seat } from './model.js';
import { lessons, recognitionQuestions, createTeachingRound, runTeachingOthers, teachingStep, resolveTeachingDiscard, compositionTiles, collectGroup, collectPair, completedComposition, invalidHandChoices } from './learning-model.js';
import { LEARN_KEY, emptyProgress, decodeLearningProgress, encodeLearningProgress, markLesson, saveLearningProgress } from './learning-progress.js';
import type { LearningProgress, LessonProgress } from './learning-progress.js';

const root = document.querySelector<HTMLElement>('#lesson')!, progressPanel = document.querySelector<HTMLElement>('#learning-progress')!;
const feedback = document.querySelector<HTMLElement>('#lesson-feedback')!;
let progress = emptyProgress(), raw: string | null | undefined, blocked = false, dirty = false, busy = false, saveNotice = '';
let index = 0, stage: 'read' | 'guided' | 'transfer' | 'done' = 'read', assisted = false, step = 0;
let round: GameState | null = null, remaining: string[] = [], groups: Meld[] = [], pair: string[] = [], selected = new Set<string>(), assemblyDone = false;
const warnLeave = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = 'true'; };
function syncLeaveGuard(): void { window.removeEventListener('beforeunload', warnLeave); if (dirty) window.addEventListener('beforeunload', warnLeave); }
function loadProgress(): void {
  dirty = false;
  try { raw = localStorage.getItem(LEARN_KEY); progress = decodeLearningProgress(raw); blocked = false; dirty = false; saveNotice = '已讀取此瀏覽器的學習進度。'; }
  catch { blocked = true; saveNotice = raw === undefined ? '無法讀取學習進度；可在本頁練習，但不會覆寫未知原檔。' : '學習進度損壞或版本不符，原檔已保留；可在本頁練習，重新建立須確認。'; }
  syncLeaveGuard(); renderProgress();
}
async function save(): Promise<void> {
  if (busy || blocked || raw === undefined || !dirty) return;
  busy = true; renderProgress(); const captured = progress; let saved = false;
  try { raw = await saveLearningProgress(localStorage, raw, captured); dirty = encodeLearningProgress(progress) !== raw; saved = true; saveNotice = dirty ? '還有新變更待保存。' : '已保存新手進度；未完成操作不續存。'; }
  catch (error) {
    if (error instanceof Error && error.message === 'LEARNING_CONFLICT') { blocked = true; saveNotice = '另一頁已更新進度，停止覆寫。本頁未存紀錄仍保留；重新讀取前會確認放棄。'; }
    else saveNotice = '本次進度未能保存，原檔與本頁紀錄仍保留。請保持頁面開啟並重試。';
  }
  finally { busy = false; syncLeaveGuard(); renderProgress(); }
  if (saved && dirty) void save();
}
function mark(kind: keyof LessonProgress): void { progress = markLesson(progress, index, kind); dirty = true; syncLeaveGuard(); renderProgress(); void save(); }
function renderProgress(): void {
  const focused = progressPanel.contains(document.activeElement) ? (document.activeElement as HTMLElement).dataset.focus : undefined;
  progressPanel.replaceChildren(node('h2', '', '本機學習進度'));
  const notice = node('p', '', saveNotice || '紀錄只存在此瀏覽器，不是證書或牌技分數。'); notice.id = 'save-notice'; notice.dataset.focus = 'learn-save-notice'; notice.tabIndex = -1; notice.setAttribute('role', 'status'); progressPanel.append(notice);
  const list = node('ul', 'progress-list');
  progress.lessons.forEach((p, i) => list.append(node('li', '', `第${i + 1}課：已閱讀${p.read ? ' ✓' : ' —'} · 提示下完成${p.guided ? ' ✓' : ' —'} · 換例自行完成${p.independent ? ' ✓' : ' —'}`))); progressPanel.append(list);
  const actions = node('div', 'lesson-actions');
  if (dirty) actions.append(button('重試保存進度', 'learn-retry', () => { void save(); }, '', busy || blocked));
  actions.append(button('重新讀取保存紀錄', 'learn-load', () => {
    if (dirty && !confirm('重新讀取會放棄本頁尚未保存的新手紀錄，未完成操作仍不續存。確定？')) return;
    progress = emptyProgress(); raw = undefined; loadProgress();
  }, '', busy));
  actions.append(button('重新建立新手進度', 'learn-reset', async () => {
    if (raw === undefined || !confirm('只重建前三課的學習進度，清除已閱讀與完成標記，目前教學操作回到圖解；對戰、練習及檢討不變。確定？')) return;
    busy = true; renderProgress();
    const controls = Array.from(document.querySelectorAll<HTMLButtonElement>('#lesson button, #lesson-nav button')).map(b => ({ b, disabled: b.disabled }));
    controls.forEach(({ b }) => b.disabled = true);
    try { const next = emptyProgress(); raw = await saveLearningProgress(localStorage, raw, next); progress = next; dirty = false; blocked = false; stage = 'read'; saveNotice = '新手進度已重新建立；其他存檔不變。'; render(); }
    catch { saveNotice = '重新建立失敗或原檔已被其他頁更新；原資料及本頁紀錄保留，請重新讀取後再決定。'; }
    finally { controls.forEach(({ b, disabled }) => { if (b.isConnected) b.disabled = disabled; }); busy = false; syncLeaveGuard(); renderProgress(); }
  }, '', busy || raw === undefined));
  progressPanel.append(actions);
  if (focused) (Array.from(progressPanel.querySelectorAll<HTMLElement>('[data-focus]')).find(e => e.dataset.focus === focused && !e.matches(':disabled')) ?? notice).focus({ preventScroll: true });
}
window.addEventListener('storage', event => {
  if (event.key !== null && event.key !== LEARN_KEY) return;
  blocked = true; saveNotice = '另一頁已更動學習進度，停止覆寫。本頁內容保留；請重新讀取保存紀錄。'; renderProgress();
});

function face(id: string): HTMLElement {
  const item = node('span', 'learn-tile'); item.setAttribute('role', 'img'); item.setAttribute('aria-label', tileName(id)); item.append(tileFace(kindOf(id))); return item;
}
function cards(ids: string[]): HTMLElement { const row = node('div', 'learn-tiles'); ids.forEach(t => row.append(face(t))); return row; }
function say(message: string, focus = true): void { feedback.textContent = message; if (focus) feedback.focus(); }
function mistake(message: string): void { assisted = true; say(message); }
function start(transfer: boolean): void {
  mark('read'); stage = transfer ? 'transfer' : 'guided'; assisted = !transfer; step = 0;
  round = index === 1 ? createTeachingRound(transfer) : null;
  remaining = index === 2 ? compositionTiles(transfer) : []; groups = []; pair = []; selected.clear(); assemblyDone = false;
  render(); say(transfer ? '換一副示例再試。本次看提示、回看圖解或錯答看推導後完成，會列為提示下完成。' : '示範開始。可以犯錯再試；示範完成會列為提示下完成。', false);
}
function complete(): void {
  mark(stage === 'transfer' && !assisted ? 'independent' : 'guided'); stage = 'done'; render();
  say('這段任務完成了！你親手核對了牌與操作。這是本次練習紀錄，還不是陌生題能力或實戰成效。', false);
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
function render(): void {
  const nav = document.querySelector<HTMLElement>('#lesson-nav')!; nav.replaceChildren();
  lessons.forEach((l, i) => { const b = button(`${i + 1}. ${l.title}`, `lesson-${i}`, () => { index = i; stage = 'read'; render(); say('可跳課；本頁未完成的操作不續存，已保存完成紀錄保留。', false); }, ''); if (i === index) b.setAttribute('aria-current', 'step'); nav.append(b); });
  root.replaceChildren(); const heading = node('h2', '', `第${index + 1}課：${lessons[index].title}`); heading.tabIndex = -1; root.append(heading);
  const explanation = node('div'); explanation.append(node('p', '', lessons[index].text));
  if (index === 0) explanation.append(cards(['1m','1p','1s','1z','5z','7z','f1','f5']));
  if (index === 2) explanation.append(cards(['1m','2m','3m','5z','5z','5z','7z','7z']));
  const actions = node('div', 'lesson-actions');
  actions.append(button('我讀完了，開始示範', 'learn-guided', () => start(false), ''), button('換例自己試', 'learn-transfer', () => start(true), ''));
  if (stage === 'read' || stage === 'done') root.append(explanation, actions);
  if (stage === 'done') root.append(node('p', 'learn-note', '本段完成。可以換例、重練或選下一課；前三課完成後仍需學吃碰槓胡與結算。'));
  else if (stage !== 'read') {
    const recap = node('details'), summary = node('summary', '', '回看圖解（本次會列提示下完成）');
    summary.addEventListener('click', () => { if (!recap.open) { assisted = true; say('已回看圖解，本次完成將列提示下完成。', false); } });
    recap.append(summary, explanation); root.append(recap);
    const activity = node('section'); activity.setAttribute('aria-label', '本課操作任務');
    const taskTitle = node('h3', '', `第${index + 1}課 · ${stage === 'transfer' ? '換例自己試' : '親手做示範'}`); taskTitle.tabIndex = -1; activity.append(taskTitle);
    activity.append(button('看提示', 'learn-hint', () => { assisted = true; say(lessons[index].hint); }, ''));
    if (index === 0) renderRecognition(activity); else if (index === 1) renderRound(activity); else renderComposition(activity);
    activity.append(button('回到本課圖解', 'learn-back', () => { stage = 'read'; render(); say('未完成操作已回到起點，已保存紀錄保留。', false); }, ''));
    root.append(activity); taskTitle.focus(); taskTitle.scrollIntoView({ block: 'start' }); return;
  }
  heading.focus();
}
loadProgress(); render();
