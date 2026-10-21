import { node, button, tileName, scoreLines } from './view.js';
import { tileFace } from './tile-face.js';
import { kindOf, seatWind } from './tiles.js';
import { getObservation, legalActions } from './engine.js';
import { winningTiles } from './hand.js';
import { teachingStep } from './learning-model.js';
import { replayRound, roundCheckpoint } from './learning-round.js';
import type { RoundCheckpoint, RoundPoint } from './learning-round.js';
import { roundSave, scriptLesson } from './learning-round-store.js';
import type { RoundCourse, RoundMode, RoundSave } from './learning-round-store.js';
import type { GameState, Intent, Seat } from './model.js';

// S2.4b: lessons 7–8 walk the fixed S2.4a rounds checkpoint by checkpoint. The screen only reads
// getObservation(state, 0): other hands, the wall and the seed are never shown. Only the four replayed branches
// continue; any other legal move is accepted as legal, then stops until the player presses "重試這一段".
type Obs = ReturnType<typeof getObservation>;
export type RoundSession = {
  course: RoundCourse; mode: RoundMode; cp: RoundCheckpoint;
  /** In-segment question index; never saved, so a reload asks the segment's questions again. */
  sub: number;
  /** A legal move the fixed script does not continue; cleared only by the explicit retry. */
  off: string | null;
  /** Public view (getObservation seat 0) right after that legal move; page memory only, never saved. */
  offObs: Obs | null;
  hint: 0 | 1 | 2; hintOpen: boolean; paused: boolean; touched: boolean; quizDone: boolean; picked: Set<string>;
};
export type RoundContext = {
  say(message: string, focus?: boolean): void;
  /** Re-render the lesson and the save panel. */
  changed(): void;
  /** Only the assisted flag changed: refresh the save panel and leave guard without moving focus. */
  flagged(): void;
  complete(assisted: boolean, message: string): void;
  save(): void;
  /** Why "保存並暫停" is unavailable, or null. */
  saveBlocked(): string | null;
  saveStatus(): string;
};

const NAMES = ['你', '下家', '對家', '上家'] as const;
const wind = (seat: number, dealer: Seat) => `${'東南西北'[Number(seatWind(seat as Seat, dealer)[0]) - 1]}門`;
const who = (seat: number, dealer: Seat) => `${NAMES[seat]}（${wind(seat, dealer)}${seat === dealer ? '・莊家' : ''}）`;
const signed = (n: number) => n > 0 ? `＋${n}` : n < 0 ? `−${-n}` : '0';
const names = (ids: string[]) => ids.map(tileName).join('、');
const chiPair = (a: Intent) => a.type === 'CHI' ? a.ownTiles.map(t => kindOf(t)[0]).sort().join('') as '13' | '34' : null;
export const SEGMENTS: Record<RoundPoint, string> = {
  start: '發牌前', dealt: '已發牌、待起手補花', opening: '開局：莊家先打', flower: '摸到花、待補花', discard: '輪到你打牌',
  claim: '上家打牌、待你回應', passed: '選過之後', afterClaim: '吃牌後、待打牌', afterDiscard: '吃後已打牌、看聽牌',
  win: '摸到可胡的牌', result: '結算（小檢核未保存）', nextHand: '下一局莊位（小檢核未保存）',
};
export const modeName = (mode: RoundMode) => mode === 'guided' ? '親手做示範' : '換例自己試';

function fresh(course: RoundCourse, mode: RoundMode, cp: RoundCheckpoint): RoundSession {
  return { course, mode, cp, sub: 0, off: null, offObs: null, hint: 0, hintOpen: false, paused: false, touched: false, quizDone: false, picked: new Set() };
}
/** Guided starts assisted=true (demonstration); transfer starts false. */
export function startRound(course: RoundCourse, mode: RoundMode): RoundSession {
  return fresh(course, mode, roundCheckpoint({ lesson: scriptLesson(course, mode), point: 'opening', assisted: mode === 'guided' }));
}
export const resumeRound = (save: RoundSave, cp: RoundCheckpoint) => fresh(save.courseLesson, save.mode, cp);
export const sessionSave = (s: RoundSession) => roundSave(s.course, s.mode, s.cp);
/** Sticky: hints, recaps, wrong answers and retries set it; nothing in this module clears it. */
export function assist(s: RoundSession): boolean {
  s.touched = true;
  if (s.cp.assisted) return false;
  s.cp = roundCheckpoint({ ...s.cp, assisted: true }); return true;
}
function go(s: RoundSession, point: RoundPoint, chi: RoundCheckpoint['chi'] = null, outcome: RoundCheckpoint['outcome'] = null): void {
  s.cp = roundCheckpoint({ lesson: s.cp.lesson, point, chi, outcome, assisted: s.cp.assisted });
  Object.assign(s, { sub: 0, off: null, offObs: null, hint: 0, hintOpen: false, touched: true }); s.picked.clear();
}

function face(id: string): HTMLElement {
  const item = node('span', 'learn-tile'); item.setAttribute('role', 'img'); item.setAttribute('aria-label', tileName(id)); item.append(tileFace(kindOf(id))); return item;
}
function cards(ids: string[]): HTMLElement { const row = node('div', 'learn-tiles'); ids.forEach(t => row.append(face(t))); return row; }
/** Public discards that happened between two observations, in table order. */
function newDiscards(before: Obs, after: Obs): { seat: number; tileId: string }[] {
  const seen = Math.max(0, ...before.players.flatMap(p => p.discardHistory.map(d => d.eventSeq)));
  return after.players.flatMap((p, seat) => p.discardHistory.filter(d => d.eventSeq > seen).map(d => ({ seat, tileId: d.tileId, at: d.eventSeq })))
    .sort((a, b) => a.at - b.at).map(({ seat, tileId }) => ({ seat, tileId }));
}
const story = (moves: { seat: number; tileId: string }[]) => moves.map(m => `${NAMES[m.seat]}打出${tileName(m.tileId)}`).join(' → ');
function turnText(o: Obs): string {
  const me = o.turn === 0;
  switch (o.phase) {
    case 'awaitDiscard': return me ? '輪到你：打出一張牌' : `輪到${NAMES[o.turn]}打牌`;
    case 'awaitDraw': return me ? '輪到你：先摸一張' : `輪到${NAMES[o.turn]}摸牌`;
    case 'awaitReplacement': return me ? '輪到你：摸到花，先補花' : `${NAMES[o.turn]}補花中`;
    case 'awaitClaims': return o.lastDiscard ? `${NAMES[o.lastDiscard.seat]}剛打出${tileName(o.lastDiscard.tileId)}：等你決定要不要回應` : '等待回應';
    case 'handResult': return '本局已結算，分數已付過一次';
    default: return '準備發牌與起手補花';
  }
}
function seats(table: Obs, own: Obs): HTMLElement {
  const list = node('ul', 'round-seats'); list.setAttribute('aria-label', '四家公開資訊（他家暗手不顯示）');
  for (const seat of [1, 2, 3, 0]) {
    const o = seat === 0 ? own : table, p = o.players[seat], count = seat === 0 ? o.self.concealed.length : p.concealedCount;
    const sea = p.discardHistory.map(d => `${tileName(d.tileId)}${d.claimedBy !== null ? `（被${NAMES[d.claimedBy]}吃碰）` : ''}`);
    list.append(node('li', '', `${who(seat, o.dealer)}：手牌${count}張${p.melds.length ? `・桌上${p.melds.length}組` : ''}${p.flowers.length ? `・花${names(p.flowers)}` : ''}・海底：${sea.join('、') || '無'}`));
  }
  return list;
}
/** `tiles: false` when the same hand is shown as discard buttons right below, so it is not listed twice. */
function ownHand(box: HTMLElement, o: Obs, tiles = true): void {
  box.append(node('p', '', `你的手牌：手中 ${o.self.concealed.length} 張${o.self.melds.length ? `，桌上 ${o.self.melds.length} 組` : ''}${o.self.flowers.length ? `，花 ${o.self.flowers.length} 張` : ''}`));
  if (tiles) box.append(cards(o.self.concealed));
  if (o.self.melds.length || o.self.flowers.length) {
    const shown = node('div', 'grouped-tiles');
    o.self.melds.forEach(m => { const item = node('div'); item.append(node('p', '', '桌上牌組'), cards(m.tiles)); shown.append(item); });
    if (o.self.flowers.length) { const item = node('div'); item.append(node('p', '', '花'), cards(o.self.flowers)); shown.append(item); }
    box.append(shown);
  }
}

/** Renders the current segment into `activity`. Every advance replays the core from the fixed deal. */
export function renderRound(s: RoundSession, activity: HTMLElement, ctx: RoundContext): void {
  const state = replayRound(s.cp), o = getObservation(state, 0), l7 = s.cp.lesson === 7, suit = l7 ? 'm' : 'p';
  const guided7 = s.course === 7 && s.mode === 'guided', claimSub = guided7 ? 2 : 1;
  const prompt = (text: string) => { const p = node('p', 'round-prompt', text); p.tabIndex = -1; p.dataset.roundFocus = ''; activity.append(p); return p; };
  const flag = () => { if (assist(s)) ctx.flagged(); };
  const mistake = (message: string) => { flag(); ctx.say(message); };
  const next = (message: string) => { ctx.changed(); ctx.say(message, false); };
  const ask = (text: string, choices: string[], correct: number, wrong: string, right: () => void) => {
    prompt(text);
    const row = node('div', 'lesson-actions'); row.setAttribute('role', 'group'); row.setAttribute('aria-label', '選一個答案');
    choices.forEach((choice, i) => row.append(button(choice, `round-ask-${i}`, () => { if (i !== correct) { mistake(wrong); return; } s.touched = true; right(); }, '')));
    activity.append(row);
  };
  const pick = (text: string, label: string, items: { key: string; label: string; tiles: string[] }[], answer: string[], wrong: (key: string) => string, missing: string, right: () => void) => {
    prompt(text);
    const row = node('div', 'learn-tiles'); row.setAttribute('role', 'group'); row.setAttribute('aria-label', label);
    for (const item of items) {
      const b = button(item.tiles.length ? '' : item.label, `round-pick-${item.key}`, () => { if (s.picked.has(item.key)) s.picked.delete(item.key); else s.picked.add(item.key); b.setAttribute('aria-pressed', String(s.picked.has(item.key))); }, '');
      b.setAttribute('aria-label', item.label); b.setAttribute('aria-pressed', String(s.picked.has(item.key))); item.tiles.forEach(t => b.append(face(t))); row.append(b);
    }
    activity.append(row, button('確認', 'round-pick-confirm', () => {
      const keys = [...s.picked], bad = keys.find(k => !answer.includes(k));
      if (bad) { mistake(wrong(bad)); return; }
      if (keys.length < answer.length) { mistake(missing); return; }
      s.picked.clear(); s.touched = true; right();
    }, ''));
  };
  /** Same gesture as lessons 2–5: click selects, double click/tap on the same tile or Enter/Space discards once. */
  const discards = (choose: (id: string, after: GameState) => void, forbidden: (kind: string) => string) => {
    const legal = new Set(legalActions(state, 0).flatMap(a => a.type === 'DISCARD' ? [a.tileId] : []));
    activity.append(node('p', 'muted', '單擊選牌，雙擊同一張或Enter／空白鍵打出。'));
    const hand = node('div', 'learn-tiles'); hand.setAttribute('role', 'group'); hand.setAttribute('aria-label', '選牌打出');
    let last: { id: string; time: number } | null = null;
    const play = (id: string) => {
      last = null;
      if (!legal.has(id)) { mistake(forbidden(kindOf(id))); return; }
      choose(id, teachingStep(state, 0, { type: 'DISCARD', tileId: id })); // the engine applies (and so confirms) the discard
    };
    for (const id of o.self.concealed) {
      const select = () => { for (const b of Array.from(hand.querySelectorAll<HTMLButtonElement>('button'))) b.setAttribute('aria-pressed', String(b.dataset.tile === id)); };
      const b = button('', `round-discard-${id}`, event => {
        if (!event.detail) { play(id); return; }
        const now = performance.now();
        // ponytail: same 450ms double-tap window as battle and lessons 2–5.
        if (last?.id === id && now - last.time <= 450) play(id); else { last = { id, time: now }; select(); }
      }, '');
      b.dataset.tile = id; b.setAttribute('aria-label', `打出${tileName(id)}`); b.setAttribute('aria-pressed', 'false'); b.append(face(id));
      b.addEventListener('focus', () => { last = null; select(); });
      b.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); if (!event.repeat) play(id); } });
      hand.append(b);
    }
    activity.append(hand);
  };
  const offScript = (label: string, rest: string, after: GameState | null = null) => {
    s.off = `${label}是合法的選擇，引擎已照做（下方是打出後的手牌與海底）；但這個固定示例沒有接續這條路，${rest}要繼續，請按「重試這一段」回到本段開頭再選。這不是規則錯誤；這一步不會保存，也不會偷偷改回。`;
    s.offObs = after ? getObservation(after, 0) : null; s.touched = true; next(s.off);
  };
  const controls = () => {
    // Pause / save / normal play are always reachable here.
    const bar = node('div', 'lesson-actions'); bar.setAttribute('role', 'group'); bar.setAttribute('aria-label', '暫停與保存');
    if (!s.paused) bar.append(button('暫停', 'round-pause', () => { s.paused = true; next('已暫停；目前段落與提示紀錄保留。'); }, ''));
    const blocked = ctx.saveBlocked();
    bar.append(button(s.paused ? '保存續學點' : '保存並暫停', 'round-save', () => ctx.save(), '', !!blocked));
    activity.append(bar, node('p', 'muted round-save-line', blocked ? `暫不能保存：${blocked}` : ctx.saveStatus()));
    const play = node('p', 'muted round-play'), link = node('a', '', '前往正常對戰（回牌室）'); link.href = './';
    play.append('正常對戰使用原牌局；新開一將仍須確認，不帶入教學牌序。', link);
    activity.append(play);
  };

  // Status, public table and layered hints.
  const scripted = s.cp.point === 'opening' && s.sub > 0 ? (s.sub === 3 ? '輪到你：先摸一張' : '示例劇本：其他家依序摸打')
    : s.cp.point === 'afterDiscard' && s.sub === 1 ? '其他家依序摸打後，輪到你：先摸一張' : s.cp.point === 'nextHand' ? '本局已結算；下一局準備開始' : null;
  const offText = s.off ? '你已打出一張固定示範以外的牌；示例沒有接續，等你按「重試這一段」' : null;
  const status = node('p', 'round-status'); status.append(node('strong', '', `目前段落：${SEGMENTS[s.cp.point]}`), node('span', '', ` · ${offText ?? scripted ?? turnText(o)}`));
  // The fixed-example / not-an-unseen-question boundary is stated once in the lesson text and opening message.
  activity.append(status, node('p', 'muted', '固定教學示例，其他三家按劇本行動。'));
  if (s.paused) {
    const box = node('section', 'round-paused'); box.setAttribute('aria-label', '課程已暫停');
    const title = node('h4', '', '已暫停'); title.tabIndex = -1; title.dataset.roundFocus = '';
    box.append(title, node('p', '', `停在「${SEGMENTS[s.cp.point]}」。目前段落與提示紀錄都保留，不會替你摸打。`),
      button('繼續', 'round-resume', () => { s.paused = false; next('已繼續，回到剛才的段落。'); }, ''));
    activity.append(box); controls(); return;
  }
  // The other seats' public view moves ahead with the script narration; your own row stays at the current point.
  const ahead = s.cp.point === 'opening' && s.sub >= 2 ? 'flower' : s.cp.point === 'afterDiscard' && s.sub === 1 ? 'win' : null;
  if (s.offObs) activity.append(seats(s.offObs, s.offObs));
  else if (s.cp.point === 'result' || s.cp.point === 'nextHand') {
    // At the settlement the public table is optional reading; opening it is not a hint and changes nothing.
    const r = s.cp.point === 'result' ? o : getObservation(replayRound({ ...s.cp, point: 'result' }), 0);
    const box = node('details', 'round-public'); box.append(node('summary', '', '查看四家海底與公開資訊'), seats(r, r)); activity.append(box);
  } else activity.append(seats(ahead ? getObservation(replayRound({ ...s.cp, point: ahead }), 0) : o, o));
  const [h1, h2] = hintsFor(s, o);
  const hintRow = node('div', 'lesson-actions');
  if (!s.hintOpen) hintRow.append(button('看提示', 'round-hint', () => { flag(); s.hintOpen = true; if (s.hint === 0) s.hint = 1; ctx.changed(); ctx.say(`提示：${s.hint === 2 ? `${h1} ${h2}` : h1}`, false); }, ''));
  else {
    const note = node('div', 'learn-note'); note.setAttribute('aria-label', '提示');
    note.append(node('p', '', `提示：${h1}`)); if (s.hint === 2) note.append(node('p', '', `再一層：${h2}`));
    activity.append(note);
    if (s.hint === 1) hintRow.append(button('再看一層提示', 'round-hint-more', () => { flag(); s.hint = 2; ctx.changed(); ctx.say(`再一層提示：${h2}`, false); }, ''));
    hintRow.append(button('收起提示', 'round-hint-close', () => { s.hintOpen = false; ctx.changed(); ctx.say('已收起提示；本次仍記為看過提示。', false); }, ''));
  }
  activity.append(hintRow);

  const task = node('section', 'round-task'); task.setAttribute('aria-label', '本段操作');
  const outer = activity; activity = task;
  try { segment(); } finally { activity = outer; }
  activity.append(task);
  controls();

  function segment(): void {
    const point = s.cp.point;
    if (s.off) {
      prompt(s.off);
      if (s.offObs) ownHand(activity, s.offObs);
      activity.append(button('重試這一段', 'round-retry', () => {
        s.off = null; s.offObs = null; const changed = assist(s); s.touched = true;
        next(`已回到「${SEGMENTS[s.cp.point]}」開頭。${changed ? '本次改列提示下完成。' : ''}`);
      }, ''));
      return;
    }
    if (point === 'start' || point === 'dealt') {
      prompt('教學牌局已準備好：發牌後，莊家先完成起手補花，接著才開始打牌。');
      activity.append(button('發牌並完成起手補花', 'round-deal', () => { go(s, 'opening'); next('已發牌；起手都沒有花。'); }, ''));
      return;
    }
    if (point === 'opening') {
      ownHand(activity, o);
      if (s.sub === 0) {
        ask(`這局莊家起手${o.players[o.dealer].concealedCount}張，你${o.self.concealed.length}張。起手補花處理完後，誰先打牌？`, [...NAMES], o.dealer,
          '莊家起手已有十七張，補花後先打，不再多摸一張。看看誰的手牌是十七張。', () => {
            if (!l7) { go(s, 'discard'); next('對：你是莊家，十七張先打，不再摸牌。'); return; }
            s.sub = 1; s.hint = 0; s.hintOpen = false; next(`對：莊家是${NAMES[o.dealer]}，十七張先打，沒有再摸一張。`);
          });
        return;
      }
      const after = getObservation(replayRound({ ...s.cp, point: 'flower' }), 0), moves = newDiscards(o, after);
      if (s.sub === 1) {
        prompt(`示例劇本：${story(moves.slice(0, 1))}，沒有人吃碰胡。`);
        const nextSeat = (moves[0].seat + 1) % 4;
        ask('接著輪到誰摸牌、打牌？', [...NAMES], nextSeat, '沒有人吃碰胡時，輪到剛打牌那一家的下家。',
          () => { s.sub = 2; s.hint = 0; s.hintOpen = false; next(`對：輪到${NAMES[nextSeat]}。`); });
        return;
      }
      if (s.sub === 2) {
        prompt(`示例劇本：${story(moves)}；每次都沒有人吃碰胡。`);
        ask(`${NAMES[moves.at(-1)!.seat]}打完後，輪到誰？`, [...NAMES], (moves.at(-1)!.seat + 1) % 4, '沒有吃碰胡改變順序時，輪到下家。上家的下家就是你。',
          () => { s.sub = 3; s.hint = 0; s.hintOpen = false; next('對：輪到你。先摸一張。'); });
        return;
      }
      prompt('輪到你了：先摸一張。');
      activity.append(button('摸一張', 'round-draw', () => { go(s, 'flower'); next('你摸到一張花，已先亮出；一般手牌仍十六張。'); }, ''));
      return;
    }
    if (point === 'flower') {
      ownHand(activity, o);
      ask(`你摸到${names(o.self.flowers)}，已亮在旁邊。接著先做什麼？`, ['補花：從牌尾補一張', '直接打一張', '把花放進手牌一起算'], 0,
        '花牌不放進一般手牌，也不能直接打牌；先從牌尾補一張。', () => {
          if (!legalActions(state, 'engine').some(a => a.type === 'REPLACE')) throw new Error('LESSON_ROUND_REPLACE');
          go(s, 'discard'); next('補到一張一般牌，現在十七張；打一張回十六張。');
        });
      return;
    }
    if (point === 'discard') {
      ownHand(activity, o, false);
      const demo = s.mode === 'guided';
      prompt(l7 ? `補花後十七張，打一張回十六張。${demo ? '示範：打出剛補入的九條。' : ''}`
        : `你是莊家，起手十七張，先打一張回十六張（不再摸）。${demo ? '示範：打出九條。' : ''}`);
      discards((id, after) => {
        if (kindOf(id) === '9s') { go(s, 'claim'); next('已打出九條，其他家依劇本繼續摸打。'); return; }
        offScript(`打出${tileName(id)}`, '本段只接續其中一張牌的打法；', after);
      }, () => '這張現在不能打。');
      return;
    }
    if (point === 'claim') {
      const before = getObservation(replayRound({ ...s.cp, point: 'discard' }), 0), source = o.lastDiscard!, two = tileName(source.tileId);
      if (s.sub === 0) {
        prompt(`示例劇本：${story(newDiscards(before, o))}。`);
        ownHand(activity, o);
        ask(`剛打出的${two}是誰打的？`, ['下家', '對家', '上家'], source.seat - 1, '看海底：這張牌在打出那一家的前面。吃只看上家的牌。',
          () => { s.sub = 1; s.hint = 0; s.hintOpen = false; next(`對：${two}由上家打出，可以檢查吃法。`); });
        return;
      }
      ownHand(activity, o);
      if (s.sub === 1 && guided7) {
        const legal = legalActions(state, 0).flatMap(a => a.type === 'CHI' ? [a.ownTiles.map(kindOf).sort().join(',')] : []);
        pick(`上家打出${two}。選出所有能和它湊成連號三張的兩張手牌（可複選），再按確認。`, '候選吃法',
          [['1', '3'], ['3', '4'], ['1', '4']].map(p => p.map(n => n + suit)).map(p => ({ key: p.join(','), label: p.map(tileName).join('＋'), tiles: p })),
          legal, key => `${names(key.split(','))}加${two}不是連號三張，不能吃。`, `還有別的吃法：把${two}放在連號中間或前端試試。`,
          () => { s.sub = 2; next('都找到了：兩種吃法都合法，選哪一種都可以。'); });
        return;
      }
      prompt(`選一種回應：吃法${guided7 ? '兩種都合法' : '可能不只一種'}，「過」也是合法選擇。要等其他家都回應完才確定由誰取得。`);
      const row = node('div', 'lesson-actions'); row.setAttribute('role', 'group'); row.setAttribute('aria-label', '你可以選的動作');
      legalActions(state, 0).filter(a => a.type !== 'DISCARD').forEach((a, i) => row.append(button(a.type === 'CHI' ? `吃（用${names(a.ownTiles)}）` : a.type === 'PASS' ? '過' : a.type, `round-claim-${a.type}-${i}`, () => {
        if (a.type === 'CHI') { const pair = chiPair(a)!; go(s, 'afterClaim', pair); next('其他家都選過，這張由你取得。吃後先打一張，不再摸牌。'); return; }
        if (a.type === 'PASS') { go(s, 'passed'); next('你選了過：合法，手牌不拆。'); return; }
        offScript(`選擇${a.type}`, '');
      }, '')));
      activity.append(row);
      return;
    }
    if (point === 'passed') {
      ownHand(activity, o);
      prompt('你選了「過」：這是合法選擇，手牌不拆開，接著輪到你摸牌。這個固定示例只接續吃牌的路線，示範到此；可以按「重試這一段」回到回應選擇。正常對戰可以自由選擇。');
      activity.append(button('重試這一段', 'round-retry', () => {
        const changed = assist(s); go(s, 'claim'); s.sub = claimSub;
        next(`已回到上家打牌、待你回應的段落。${changed ? '本次改列提示下完成。' : ''}`);
      }, ''));
      return;
    }
    if (point === 'afterClaim') {
      ownHand(activity, o, false);
      const left = `${s.cp.chi === '13' ? 4 : 1}${suit}`, demo = s.mode === 'guided';
      prompt(`吃到了。吃後先打一張，不再摸牌。${demo ? `示範：打出剩下的${tileName(left)}。` : ''}`);
      discards((id, after) => {
        if (kindOf(id) === left) { go(s, 'afterDiscard', s.cp.chi); next(`已打出${tileName(left)}：手中十三張加桌上一組。`); return; }
        offScript(`打出${tileName(id)}`, '', after);
      }, k => `剛吃完不能立刻打${tileName(k)}：它會和你剛用來吃的兩張又湊成順子。換一張。`);
      return;
    }
    if (point === 'afterDiscard') {
      ownHand(activity, o);
      if (s.sub === 0) {
        const waits = winningTiles(o.self.concealed.map(kindOf), o.self.melds);
        pick('現在再進哪一種牌就能湊成五組加眼睛？（可複選，選好按確認）', '候選聽口',
          ['1s', '2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s', '2z'].map(k => ({ key: k, label: tileName(k), tiles: [k] })), waits,
          k => `${tileName(k)}放進來拆不成五組加眼睛。`, '還有聽口沒找到：看五六條的兩端。',
          () => { s.sub = 1; s.hint = 0; s.hintOpen = false; next(`對：聽${names(waits)}。`); });
        return;
      }
      const after = getObservation(replayRound({ ...s.cp, point: 'win' }), 0);
      prompt(`示例劇本：${story(newDiscards(o, after))}；都沒有人吃碰胡。現在輪到你。`);
      activity.append(button('摸一張', 'round-draw', () => { go(s, 'win', s.cp.chi); next('摸好了，看看牌型。'); }, ''));
      return;
    }
    if (point === 'win') {
      const before = getObservation(replayRound({ ...s.cp, point: 'afterDiscard' }), 0), pool = [...before.self.concealed];
      const drawn = o.self.concealed.find(t => { const i = pool.indexOf(t); if (i < 0) return true; pool.splice(i, 1); return false; })!;
      ownHand(activity, o, false);
      prompt(l7 ? `你摸到${tileName(drawn)}，牌型完成。${s.mode === 'guided' ? '示範：按「自摸」。' : ''}`
        : `你摸到${tileName(drawn)}。可以自摸；也可以合法選擇不胡、改打一張（放棄能胡的牌會過水，打出的牌也可能被別人胡）。兩種都能讀完結算、完成本課。`);
      const row = node('div', 'lesson-actions'); row.setAttribute('role', 'group'); row.setAttribute('aria-label', '你可以選的動作');
      legalActions(state, 0).filter(a => a.type === 'WIN').forEach(a => row.append(button('自摸', 'round-win', () => {
        if (a.type !== 'WIN') return;
        go(s, 'result', s.cp.chi, 'selfDraw'); next('自摸成立，已結算一次。接著讀結算。');
      }, '')));
      activity.append(row);
      discards((id, after) => {
        if (!l7 && kindOf(id) === '7s') {
          go(s, 'result', s.cp.chi, 'ron');
          next('你放棄自摸、打出七條：合法，但這時過水；下家剛好可以胡七條，由你放槍。這不是推薦打法，只是另一種結果，一樣讀完結算。');
          return;
        }
        offScript(`打出${tileName(id)}`, l7 ? '第7課這一段只接續自摸；' : '', after);
      }, () => '這張現在不能打。');
      return;
    }
    // result / nextHand: read the engine settlement; only answered checks complete the lesson.
    const resultState = point === 'result' ? state : replayRound({ ...s.cp, point: 'result' }), r = getObservation(resultState, 0);
    const nextObs = point === 'nextHand' ? o : getObservation(replayRound({ ...s.cp, point: 'nextHand' }), 0);
    if (!s.quizDone) { settlementQuiz(r, nextObs); return; }
    nextHandPanel(r, nextObs);
  }

  function settlementView(r: Obs): void {
    const st = r.settlement!, score = st.score!, winner = st.winner!, payers = [0, 1, 2, 3].filter(x => st.delta[x] < 0);
    activity.append(node('p', '', st.source === 'selfDraw' ? `${who(winner, r.dealer)}自摸。` : `${who(winner, r.dealer)}胡牌，${who(payers[0], r.dealer)}放槍。`));
    const lines = node('ul', 'progress-list'); lines.setAttribute('aria-label', '胡牌明細');
    scoreLines(score).forEach(line => lines.append(node('li', '', `${line.reason}：${line.tai}台`)));
    const pay = node('ul', 'progress-list'); pay.setAttribute('aria-label', '四家分數變動');
    [0, 1, 2, 3].forEach(x => pay.append(node('li', '', `${who(x, r.dealer)} ${signed(st.delta[x])}`)));
    activity.append(lines, node('p', '', `牌型合計 ${score.tai} 台。一底30、每台10；涉及莊家的那一筆另加莊家1台及連莊2N台（本局開始時連${r.streak}），所以各家付款不一定同額。`), pay);
  }
  function settlementQuiz(r: Obs, nextObs: Obs): void {
    const st = r.settlement!, score = st.score!, winner = st.winner!, payers = [0, 1, 2, 3].filter(x => st.delta[x] < 0);
    settlementView(r);
    if (s.sub === 0) {
      const choices = [...new Set([Math.max(0, score.tai - 1), score.tai, score.tai + 1, score.tai + 2])];
      ask('依上面明細，這次牌型合計幾台？', choices.map(n => `${n}台`), choices.indexOf(score.tai), '逐條把胡牌明細的台數加起來；莊家台是付款時另加的，不在牌型合計裡。',
        () => { s.sub = 1; s.hint = 0; s.hintOpen = false; next(`對：${scoreLines(score).map(l => `${l.reason}${l.tai}台`).join('＋')}，合計${score.tai}台。`); });
      return;
    }
    if (s.sub === 1) {
      pick('這次誰要付款？（可複選）', '付款的人', [0, 1, 2, 3].filter(x => x !== winner).map(x => ({ key: String(x), label: who(x, r.dealer), tiles: [] })),
        payers.map(String), () => st.source === 'selfDraw' ? '一般自摸由其他三家各付。' : '胡別人只由放槍的一家付，其他人不付。',
        st.source === 'selfDraw' ? '一般自摸由其他三家各付，還有人沒選。' : '胡別人由放槍的一家付。',
        () => { s.sub = 2; s.hint = 0; s.hintOpen = false; next(`對：付款的是${payers.map(x => NAMES[x]).join('、')}，本局只付一次。`); });
      return;
    }
    const stay = nextObs.dealer === r.dealer;
    ask('下一局誰當莊？（看座位，不看本局門風）', [...NAMES], nextObs.dealer,
      `莊家胡或流局才連莊；閒家胡由原莊家的下家接莊${stay ? '' : '，不一定是胡牌的人'}。`, () => {
        s.touched = true;
        if (s.cp.point === 'result') { s.cp = roundCheckpoint({ ...s.cp, point: 'nextHand' }); s.hint = 0; s.hintOpen = false; }
        s.quizDone = true; s.sub = 0;
        const message = `下一局由${NAMES[nextObs.dealer]}當莊（新的一局坐東門），連${nextObs.streak}。${stay ? '莊家胡牌，所以留莊。' : `原莊家${NAMES[r.dealer]}沒有胡，由他的下家接莊。`}`;
        if (s.course === 7) { ctx.complete(s.cp.assisted, `${message}你走完了一局：從開局、摸打、吃牌到結算。`); return; }
        next(message);
      });
  }
  function nextHandPanel(r: Obs, nextObs: Obs): void {
    activity.append(node('p', '', `下一局：${NAMES[nextObs.dealer]}當莊、坐東門，連${nextObs.streak}。累計分數：${[0, 1, 2, 3].map(x => `${NAMES[x]} ${signed(nextObs.scores[x])}`).join('、')}（本局只付一次）。`));
    const won = r.settlement!.winner === 0;
    ask('最後一題：準備到實體牌桌打牌時，怎麼做比較好？（可先看下方「實桌附錄」；在這裡展開附錄會列提示下完成）', ['照這個網站的規則直接開打', '先和同桌確認抓位、開門、台數與出錯時怎麼處理', '用網路上看到的罰則現場處理'], 1,
      '每桌規則可能不同；本網站的規則不能自動帶到別桌，網路罰則也不能直接套用。上桌前先問清楚。',
      () => ctx.complete(s.cp.assisted, `${won ? '你自摸留莊' : '這次你沒有胡'}，一樣讀完了結算與下一局莊位。完成條件不看輸贏。`));
    activity.append(appendix(() => { flag(); ctx.say('已展開實桌附錄，本次完成將列提示下完成。', false); }));
  }
}

function hintsFor(s: RoundSession, o: Obs): [string, string] {
  const point = s.cp.point, suit = s.cp.lesson === 7 ? 'm' : 'p';
  if (s.off) return ['這是合法的選擇，只是固定示例沒有接續。', '按「重試這一段」回到本段開頭，再選固定示範的那一步。'];
  switch (point) {
    case 'opening':
      if (s.sub === 0) return ['看誰的手牌有十七張：莊家起手補花後先打，不再摸。', `本局莊家是${NAMES[o.dealer]}。`];
      if (s.sub < 3) return ['沒有人吃碰胡時，輪到剛打牌那一家的下家。', '下家→對家→上家→你，依序輪流。'];
      return ['輪到你時先摸一張。', '按「摸一張」。'];
    case 'flower': return ['花牌不放進一般手牌。', '先補花：從牌尾補一張，再打牌。'];
    case 'discard': return [s.cp.lesson === 7 ? '看看剛補進來的那張，和手上其他牌連不連得起來。' : '你是莊家，先打一張；找一張和其他牌連不起來的牌。', '固定示範打九條。'];
    case 'claim':
      if (s.sub === 0) return ['看海底：剛打出的牌放在打出那一家的前面。', `是${NAMES[o.lastDiscard?.seat ?? 3]}打的。`];
      return [`吃只拿上家的牌：把二${suit === 'm' ? '萬' : '筒'}放在連號的前、中、後試試；過也合法。`, '一＋三或三＋四都能吃，選一種即可；固定示範接續吃牌。'];
    case 'passed': return ['過是合法的；固定示範只接續吃牌。', '按「重試這一段」回到回應選擇。'];
    case 'afterClaim': return ['吃後先打一張，不再摸；不能打會和剛用的兩張又湊成順子的牌。', `固定示範打剩下的${tileName(`${s.cp.chi === '13' ? 4 : 1}${suit}`)}。`];
    case 'afterDiscard':
      if (s.sub === 0) return ['先只看牌型：把候選牌放進來，看能不能拆成五組加眼睛。', `聽${names(winningTiles(o.self.concealed.map(kindOf), o.self.melds))}。`];
      return ['其他家依序摸打，輪到你時先摸牌。', '按「摸一張」。'];
    case 'win': return s.cp.lesson === 7 ? ['摸到的牌讓牌型完成，可以自摸。', '按「自摸」。']
      : ['牌型完成時可以自摸，也可以合法選擇不胡、改打一張。', '自摸，或打出七條由下家胡，兩種都會進入結算。'];
    case 'result': case 'nextHand': {
      const r = point === 'result' ? o : getObservation(replayRound({ ...s.cp, point: 'result' }), 0);
      if (s.quizDone) return ['看實桌附錄最後的「先問六件事」。', '上桌前先和同桌約定桌規，不把本網站或網路上的規則直接套用。'];
      if (s.sub === 0) return ['逐條把胡牌明細的台數加起來。', `合計${r.settlement!.score!.tai}台。`];
      if (s.sub === 1) return ['自摸由其他三家付；胡別人只由放槍的一家付。', `付款的是${[0, 1, 2, 3].filter(x => r.settlement!.delta[x] < 0).map(x => NAMES[x]).join('、')}。`];
      return ['莊家胡或流局才連莊；閒家胡由原莊家的下家接莊。', `本局莊家是${NAMES[r.dealer]}，${r.settlement!.winner === r.dealer ? '他胡了' : '他沒有胡'}。`];
    }
    default: return ['先看目前輪到誰。', '按畫面上的下一步。'];
  }
}

/** Real-table appendix (S24): concepts and questions only — no dice, wall-building or penalty rules are simulated. */
/** `onOpen` runs when it is opened during a task (it holds the answer to the last check); plain reading passes none. */
export function appendix(onOpen?: () => void): HTMLElement {
  const box = node('details', 'round-appendix'); box.append(node('summary', '', '實桌附錄：網頁替你做了哪些事？'));
  if (onOpen) box.addEventListener('toggle', () => { if (box.open) onOpen(); });
  box.append(node('p', '', '給已學完網頁流程、準備看懂實體牌桌的新手。只說概念與要問的問題，不替未約定的牌桌裁罰；本網站的規則不是全台唯一桌規。'));
  const table = node('table'), head = node('thead'), headRow = node('tr'), body = node('tbody');
  ['實桌步驟／名詞', '是什麼', '網頁差異與開打前要問的事'].forEach(t => { const th = node('th', '', t); th.scope = 'col'; headRow.append(th); });
  head.append(headRow);
  for (const [term, meaning, diff] of [
    ['抓位', '決定四人的座位，可用混合的東南西北牌配合擲骰或抽牌。', '本頁已安排畫面座位；實桌先確認如何抓位、何時換位，不把抓位和之後每次換莊混為一談。'],
    ['起莊', '決定第一位莊家；之後依桌規續莊或換莊。', '網頁正常局由引擎決定初莊，教學例明示固定莊家；實桌確認採哪種起莊方式，不背成「抽到東就永遠當莊」。'],
    ['洗牌、砌牌', '洗混後把牌疊成牌牆。本網站用144張；四邊、每墩兩張時，每邊18墩。', '網頁直接洗牌成一列；實桌核對完整牌數及花牌是否採用，不把網頁的排列當成實桌取牌教學。'],
    ['擲骰、開門與取牌', '決定從哪裡開始取牌，再按桌上約定從牌牆依序取牌。', '骰子數、從哪邊數與開門法請當桌示範確認。本網站沒有骰子或砌牆模擬，不能當作已練過取牌手勢。'],
    ['補花與槓後補牌', '花另放、從補牌端補；槓的實體牌多一張，但仍只算一組。', '網頁自動判定補牌位置與待補狀態。數牌時不能看到18張就說相公，要先看已槓幾組、花是否另放、目前是否欠補。'],
    ['相公', '牌數或摸打行為出錯的俗稱，細分和後果依桌規。', '網頁會拒絕不合法的操作，沒有另設相公罰則。實桌有疑義先停下核對，怎麼處理要當桌約定。'],
    ['詐胡', '還不符合當桌合法胡牌條件就宣告胡牌；不因名稱就推定一定是故意。', '網頁只提供引擎判定合法的胡牌，沒有另設懲罰；實桌怎麼處理需要先約定。'],
    ['海底與牌尾', '各家打出的牌是海底；還沒摸完的牌尾和保留牌是另一件事。', '本網站固定保留16張、槓不加留；別桌的留牌、過水、明槓與花胡可能不同，先確認。'],
  ]) {
    const row = node('tr'), th = node('th', '', term); th.scope = 'row';
    row.append(th, node('td', '', meaning), node('td', '', diff)); body.append(row);
  }
  table.append(head, body); box.append(table);
  box.append(node('h4', '', '上實桌前，先問這六件事'));
  const list = node('ol');
  for (const q of ['這桌打十六張嗎？有沒有八張花？怎麼抓位、起莊、開門與補牌？',
    '一底幾分、每台幾分？有沒有起胡台數、封頂、本網站沒列的牌型或特殊花台？本網站的30／10不能自動帶到別桌。',
    '吃後禁打哪些牌？可不可以明槓上家？尾局什麼時候不能吃碰槓？',
    '怎樣算過水、過碰、回吃回碰，什麼時候解除？',
    '花胡、搶槓、多人要胡、流局續莊及連莊怎麼算？',
    '牌數拿錯、摸錯、宣告錯誤時，怎麼停下確認與處理？先知道約定，不現場套用網路上看到的罰則。']) list.append(node('li', '', q));
  box.append(list);
  return box;
}
