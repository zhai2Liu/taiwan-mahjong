import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { createBrowserFixtures } from '../../scripts/browser-fixtures.mjs';
import { encodeSession } from '../../dist/session.js';
import { createPractice, PRACTICE_KEY } from '../../dist/practice.js';
import { LEARN_KEY, LEGACY_LEARN_KEY, LEGACY_COURSE_VERSION, emptyProgress, markLesson, encodeLearningProgress } from '../../dist/learning-progress.js';
import { ROUND_KEY, roundSave, encodeRoundSave } from '../../dist/learning-round-store.js';
import { roundCheckpoint } from '../../dist/learning-round.js';

// Local Chromium checks of the lesson 7–8 page. Mocked storage/lock failures are not a real device or a person's understanding.
const GAME_KEY = 'tw16:TW16-CLASSIC-v1:save';
const blank = { read: false, guided: false, independent: false };
const otherSaves = {
  [GAME_KEY]: encodeSession(createBrowserFixtures().find(s => s.name === 'feedbackReady').session),
  [PRACTICE_KEY]: JSON.stringify(createPractice(20261022)), 'tw16:review:v2': '{"schemaVersion":2,"records":[]}', 'tw16:trial:v1': 'trial-sentinel', 'tw16:coach:v1': 'after',
  [LEGACY_LEARN_KEY]: JSON.stringify({ schemaVersion: 1, courseVersion: LEGACY_COURSE_VERSION, rulesVersion: 'TW16-CLASSIC-v1', lessons: [blank, blank, blank] }),
};
// A valid v2 record so the legacy v1 choice is not pending; lessons 1–6 flags must survive bit for bit.
const v2Start = encodeLearningProgress(markLesson(markLesson(emptyProgress(), 0, 'guided'), 5, 'independent'));
const saved = (course, mode, lesson, point, assisted, chi = null, outcome = null) => encodeRoundSave(roundSave(course, mode, roundCheckpoint({ lesson, point, chi, outcome, assisted })));
const read = (page, key) => page.evaluate(k => localStorage.getItem(k), key);
const course = async page => JSON.parse(await read(page, LEARN_KEY));
const others = page => page.evaluate(keys => Object.fromEntries(keys.map(k => [k, localStorage.getItem(k)])), Object.keys(otherSaves));
const button = (page, name) => page.getByRole('button', { name, exact: true }).first();
const click = (page, name) => button(page, name).click();
const lesson = page => page.locator('#lesson');
const note = page => page.locator('#lesson-feedback');
const panel = page => page.getByRole('region', { name: '第7–8課續學點', exact: true });
const hand = page => page.getByRole('group', { name: '選牌打出', exact: true });
const discardTile = (page, name) => hand(page).getByRole('button', { name, exact: true }).first().dblclick();
async function pick(page, names) { for (const name of names) await click(page, name); await click(page, '確認'); }
async function seeded(page, extra = {}) {
  await page.addInitScript(data => { for (const [k, v] of Object.entries(data)) if (localStorage.getItem(k) === null) localStorage.setItem(k, v); }, { ...otherSaves, [LEARN_KEY]: v2Start, ...extra });
  await page.goto('/learn.html');
}
async function cancelReload(page) {
  const pending = page.waitForEvent('dialog'), reload = page.evaluate(() => location.reload());
  const dialog = await pending; expect(dialog.type()).toBe('beforeunload'); await dialog.dismiss(); await reload;
}
async function noOverflowAnd44(page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.locator('#lesson :is(button, a):visible, #learning-round-save button:visible').evaluateAll(bs => bs.filter(b => b.getBoundingClientRect().height < 44).map(b => `${b.textContent}:${b.getBoundingClientRect().height}`))).toEqual([]);
}

// Lesson 7 guided, fixed L7 deal: dealer is the lower seat; you are 北門.
async function l7Opening(page) {
  await expect(lesson(page)).toContainText('這局莊家起手17張，你16張');
  await click(page, '下家'); await expect(lesson(page)).toContainText('下家打出九萬，沒有人吃碰胡');
  await click(page, '對家'); await expect(lesson(page)).toContainText('下家打出九萬 → 對家打出中 → 上家打出發');
  await click(page, '你'); await click(page, '摸一張');
  await expect(lesson(page)).toContainText('你摸到冬花');
  await expect(lesson(page)).toContainText('你的手牌：手中 16 張，花 1 張');
}
async function l7AfterFlower(page, chi) {
  await click(page, '補花：從牌尾補一張');
  await expect(lesson(page)).toContainText('示範：打出剛補入的九條');
  await discardTile(page, '打出九條');
}
async function l7Claim(page, chi) {
  await expect(lesson(page)).toContainText('剛打出的二萬是誰打的？');
  await click(page, '上家');
  await pick(page, ['一萬＋三萬', '三萬＋四萬']);
  await click(page, chi === '13' ? '吃（用一萬、三萬）' : '吃（用三萬、四萬）');
  await discardTile(page, chi === '13' ? '打出四萬' : '打出一萬');
  await pick(page, ['四條', '七條']);
  await click(page, '摸一張');
}
async function l7Result(page) {
  await expect(lesson(page)).toContainText('自摸：1台'); await expect(lesson(page)).toContainText('1 花（正花）：1台');
  await expect(lesson(page)).toContainText('你（北門） ＋160'); await expect(lesson(page)).toContainText('下家（東門・莊家） −60');
  await click(page, '2台');
  await pick(page, ['下家（東門・莊家）', '對家（南門）', '上家（西門）']);
  await click(page, '對家');
  await expect(note(page)).toContainText('下一局由對家當莊（新的一局坐東門），連0');
}
// Lesson 8 deal (lesson 7 transfer, lesson 8 guided/transfer): you are the 東門 dealer.
async function l8Round(page, { lessonNumber, mode, chi, outcome, keyboard = false }) {
  if (lessonNumber === 8) await click(page, '8. 換一局，自己試'); else await click(page, '7. 帶你打一局');
  await click(page, mode === 'guided' ? '我讀完了，開始示範' : '換例自己試');
  await click(page, '你');
  if (keyboard) { await hand(page).getByRole('button', { name: '打出九條', exact: true }).focus(); await page.keyboard.press('Enter'); }
  else await discardTile(page, '打出九條');
  await expect(lesson(page)).toContainText('你打出九條 → 下家打出中 → 對家打出發 → 上家打出二筒');
  await click(page, '上家');
  await click(page, chi === '13' ? '吃（用一筒、三筒）' : '吃（用三筒、四筒）');
  if (keyboard) await hand(page).getByRole('button', { name: chi === '13' ? '打出四筒' : '打出一筒', exact: true }).first().evaluate(b => b.click());
  else await discardTile(page, chi === '13' ? '打出四筒' : '打出一筒');
  await pick(page, ['四條', '七條']); await click(page, '摸一張');
  await expect(lesson(page)).toContainText('你摸到七條');
  if (outcome === 'selfDraw') await click(page, '自摸'); else await discardTile(page, '打出七條');
  await click(page, '1台');
  if (outcome === 'selfDraw') {
    await expect(lesson(page)).toContainText('你（東門・莊家） ＋150');
    await pick(page, ['下家（南門）', '對家（西門）', '上家（北門）']); await click(page, '你');
    await expect(note(page)).toContainText('下一局由你當莊（新的一局坐東門），連1');
  } else {
    await expect(lesson(page)).toContainText('下家（南門）胡牌，你（東門・莊家）放槍');
    await expect(lesson(page)).toContainText('你（東門・莊家） −50');
    await pick(page, ['你（東門・莊家）']); await click(page, '下家');
  }
  if (lessonNumber === 8) {
    await expect(lesson(page)).toContainText(outcome === 'selfDraw' ? '下一局：你當莊、坐東門，連1' : '下一局：下家當莊、坐東門，連0');
    await click(page, '先和同桌確認抓位、開門、台數與出錯時怎麼處理');
  }
  await expect(note(page)).toContainText('這段任務完成了');
}

test('第7–8課：示範與換例、兩種吃法、自摸與合法不胡都完成；鍵盤／雙擊、實桌附錄、320px與正常對戰入口', async ({ page }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await seeded(page);
  await expect(page.locator('#lesson-nav button')).toHaveCount(8);
  await click(page, '7. 帶你打一局'); await click(page, '我讀完了，開始示範');
  await expect(lesson(page)).toContainText('固定教學示例，其他三家按劇本行動。');
  await expect(lesson(page)).toContainText('目前段落：開局：莊家先打 · 輪到下家打牌');
  await l7Opening(page); await l7AfterFlower(page); await l7Claim(page, '13');
  await click(page, '自摸'); await l7Result(page);
  await expect.poll(async () => (await course(page)).lessons[6]).toEqual({ read: true, guided: true, independent: false });
  await l8Round(page, { lessonNumber: 7, mode: 'transfer', chi: '34', outcome: 'selfDraw', keyboard: true });
  await expect.poll(async () => (await course(page)).lessons[6]).toEqual({ read: true, guided: true, independent: true });
  await page.setViewportSize({ width: 320, height: 844 });
  await click(page, '8. 換一局，自己試');
  await page.getByText('實桌附錄：網頁替你做了哪些事？', { exact: true }).first().click();
  const appendix = page.locator('#lesson .round-appendix').first();
  await expect(appendix.getByRole('table')).toContainText('四邊、每墩兩張時，每邊18墩');
  await expect(appendix.getByRole('rowheader')).toHaveText(['抓位', '起莊', '洗牌、砌牌', '擲骰、開門與取牌', '補花與槓後補牌', '相公', '詐胡', '海底與牌尾']);
  await expect(appendix.locator('ol > li')).toHaveCount(6);
  await noOverflowAnd44(page);
  await l8Round(page, { lessonNumber: 8, mode: 'guided', chi: '13', outcome: 'ron' });
  await expect(note(page)).toContainText('這次你沒有胡，一樣讀完了結算與下一局莊位');
  await l8Round(page, { lessonNumber: 8, mode: 'transfer', chi: '34', outcome: 'selfDraw' });
  const done = { read: true, guided: true, independent: true };
  await expect.poll(async () => (await course(page)).lessons.slice(6)).toEqual([done, done]);
  expect((await course(page)).lessons.slice(0, 6)).toEqual(JSON.parse(v2Start).lessons.slice(0, 6));
  await expect(page.locator('#learning-progress .progress-list')).toContainText('第8課：已閱讀 ✓ · 提示下完成 ✓ · 換例自行完成 ✓');
  await noOverflowAnd44(page);
  expect(await read(page, ROUND_KEY)).toBeNull();
  // Normal play: an untouched lesson leaves without a prompt; the room offers the original game, untouched.
  await click(page, '我讀完了，開始示範');
  await expect(page.locator('#save-notice')).toContainText('已保存新手進度');
  await expect(lesson(page)).toContainText('正常對戰使用原牌局；新開一將仍須確認，不帶入教學牌序。');
  await noOverflowAnd44(page);
  await page.getByRole('link', { name: '前往正常對戰（回牌室）', exact: true }).click();
  await expect(page.getByRole('region', { name: '繼續遊玩', exact: true }).getByRole('button', { name: '繼續上次牌局', exact: true })).toBeVisible();
  expect(await others(page)).toEqual(otherSaves);
  expect(errors).toEqual([]);
});

test('合法偏離：非劇本捨牌與「過」都說明合法、停在本段，按重試才回；改列提示下完成，偏離中不能保存', async ({ page }) => {
  await seeded(page);
  await click(page, '7. 帶你打一局'); await click(page, '換例自己試');
  await click(page, '你');
  // The hand is listed once, as discard buttons (no duplicate static row).
  await expect(page.locator('#lesson .learn-tile[aria-label="九條"]')).toHaveCount(1);
  await discardTile(page, '打出一筒');
  await expect(lesson(page)).toContainText('打出一筒是合法的選擇，引擎已照做（下方是打出後的手牌與海底）；但這個固定示例沒有接續這條路');
  await expect(hand(page)).toHaveCount(0);
  await expect(panel(page)).toContainText('偏離固定示範的這一步不保存');
  await expect(button(page, '保存並暫停')).toBeDisabled();
  await expect(lesson(page)).toContainText('暫不能保存：先按「重試這一段」');
  await expect(lesson(page)).toContainText('目前段落：輪到你打牌');
  await click(page, '重試這一段');
  await expect(note(page)).toContainText('本次改列提示下完成');
  await discardTile(page, '打出九條'); await click(page, '上家');
  const choices = page.getByRole('group', { name: '你可以選的動作', exact: true }).getByRole('button');
  await expect(choices).toHaveCount(3);
  for (const name of ['吃（用一筒、三筒）', '吃（用三筒、四筒）', '過']) await expect(choices.filter({ hasText: name })).toHaveCount(1);
  await click(page, '過');
  await expect(lesson(page)).toContainText('你選了「過」：這是合法選擇，手牌不拆開，接著輪到你摸牌');
  await expect(lesson(page)).toContainText('目前段落：選過之後 · 輪到你：先摸一張');
  await expect(lesson(page)).toContainText('你的手牌：手中 16 張');
  await page.waitForTimeout(300);
  await expect(lesson(page)).toContainText('選過之後'); // no silent rewind
  await click(page, '保存並暫停');
  await expect.poll(() => read(page, ROUND_KEY)).toBe(saved(7, 'transfer', 8, 'passed', true));
  await click(page, '繼續'); await click(page, '重試這一段');
  await click(page, '吃（用一筒、三筒）'); await discardTile(page, '打出四筒');
  await pick(page, ['四條', '七條']); await click(page, '摸一張');
  await discardTile(page, '打出五條');
  await expect(lesson(page)).toContainText('打出五條是合法的選擇');
  await click(page, '重試這一段'); await click(page, '自摸');
  await click(page, '1台'); await pick(page, ['下家（南門）', '對家（西門）', '上家（北門）']); await click(page, '你');
  await expect.poll(async () => (await course(page)).lessons[6]).toEqual({ read: true, guided: true, independent: false });
});

for (const kind of ['hint', 'mistake', 'recap']) test(`受助黏住（${kind}）：保存、重載、接續、暫停都不清掉，收起提示不清除，完成列提示下`, async ({ page }) => {
  await seeded(page);
  await click(page, '8. 換一局，自己試'); await click(page, '換例自己試');
  await expect(lesson(page)).not.toContainText('示範：打出九條');
  if (kind === 'hint') {
    await click(page, '看提示'); await expect(lesson(page)).toContainText('提示：看誰的手牌有十七張');
    await expect(lesson(page)).not.toContainText('本局莊家是你');
    await click(page, '再看一層提示'); await expect(lesson(page)).toContainText('再一層：本局莊家是你');
    await click(page, '收起提示'); await expect(lesson(page)).not.toContainText('再一層：');
  } else if (kind === 'mistake') {
    await click(page, '下家'); await expect(note(page)).toContainText('莊家起手已有十七張'); await expect(note(page)).toBeFocused();
  } else await page.getByText('回看圖解（本次會列提示下完成）', { exact: true }).click();
  await expect(panel(page)).toContainText('本段尚未保存');
  await click(page, '暫停'); await click(page, '繼續');
  await click(page, '保存並暫停');
  await expect.poll(() => read(page, ROUND_KEY)).toBe(saved(8, 'transfer', 8, 'opening', true));
  await page.reload();
  await expect(lesson(page)).toContainText('第1課');
  await click(page, '接續已存教學');
  await click(page, '你'); await discardTile(page, '打出九條'); await click(page, '上家'); await click(page, '吃（用三筒、四筒）'); await discardTile(page, '打出一筒');
  await pick(page, ['四條', '七條']); await click(page, '摸一張'); await click(page, '自摸');
  await click(page, '1台'); await pick(page, ['下家（南門）', '對家（西門）', '上家（北門）']); await click(page, '你');
  await click(page, '先和同桌確認抓位、開門、台數與出錯時怎麼處理');
  await expect.poll(async () => (await course(page)).lessons[7]).toEqual({ read: true, guided: true, independent: false });
});

test('保存並暫停→重載→接續：補花、吃牌回應、可胡、結算各點不重摸不重付；暫停焦點、返回圖解保留本段', async ({ page }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await seeded(page);
  await click(page, '7. 帶你打一局'); await click(page, '我讀完了，開始示範');
  await l7Opening(page);
  const reload = async () => {
    await page.reload();
    await expect(lesson(page)).toContainText('第1課'); // never auto-expanded
    await expect(panel(page)).toContainText('此瀏覽器有第7課（親手做示範）的續學點');
    await click(page, '接續已存教學');
  };
  // Pause and recap keep the segment.
  await click(page, '暫停');
  await expect(page.getByRole('heading', { name: '已暫停', exact: true })).toBeFocused();
  await expect(button(page, '補花：從牌尾補一張')).toHaveCount(0);
  await click(page, '繼續'); await expect(button(page, '補花：從牌尾補一張')).toBeVisible();
  await click(page, '回到本課圖解'); await click(page, '繼續本段（親手做示範・摸到花、待補花）');
  await expect(button(page, '補花：從牌尾補一張')).toBeVisible();
  await click(page, '保存並暫停');
  await expect(panel(page)).toContainText('已保存並暫停');
  await expect.poll(() => read(page, ROUND_KEY)).toBe(saved(7, 'guided', 7, 'flower', true));
  await reload();
  await expect(lesson(page)).toContainText('你的手牌：手中 16 張，花 1 張');
  await expect(lesson(page)).toContainText('海底：九萬');
  await l7AfterFlower(page);
  await expect(panel(page)).toContainText('本段尚未保存');
  await click(page, '保存並暫停');
  await expect.poll(() => read(page, ROUND_KEY)).toBe(saved(7, 'guided', 7, 'claim', true));
  await reload();
  await expect(lesson(page)).toContainText('你的手牌：手中 16 張');
  await l7Claim(page, '34');
  await expect(lesson(page)).toContainText('你摸到七條');
  await click(page, '保存並暫停');
  await expect.poll(() => read(page, ROUND_KEY)).toBe(saved(7, 'guided', 7, 'win', true, '34'));
  await reload();
  await expect(lesson(page)).toContainText('你的手牌：手中 14 張，桌上 1 組');
  await click(page, '自摸');
  await expect(lesson(page)).toContainText('你（北門） ＋160');
  await click(page, '2台');
  await click(page, '保存並暫停');
  await expect.poll(() => read(page, ROUND_KEY)).toBe(saved(7, 'guided', 7, 'result', true, '34', 'selfDraw'));
  await reload();
  await expect(note(page)).toContainText('結算小檢核的作答沒有保存，會重新問一次');
  await expect(lesson(page)).toContainText('依上面明細，這次牌型合計幾台？');
  await expect(lesson(page)).toContainText('你（北門） ＋160'); await expect(lesson(page)).not.toContainText('＋320');
  await l7Result(page);
  await expect.poll(async () => (await course(page)).lessons[6]).toEqual({ read: true, guided: true, independent: false });
  await expect(panel(page)).toContainText('已存：第7課（親手做示範）・結算');
  await click(page, '8. 換一局，自己試'); await click(page, '接續已存教學');
  await expect(lesson(page)).toContainText('依上面明細，這次牌型合計幾台？');
  // Clearing the resume point needs a confirmation and touches only the round key.
  page.once('dialog', d => d.dismiss()); await click(page, '清掉續學點');
  expect(await read(page, ROUND_KEY)).not.toBeNull();
  page.once('dialog', d => d.accept()); await click(page, '清掉續學點');
  await expect(panel(page)).toContainText('已清掉續學點');
  await expect.poll(() => read(page, ROUND_KEY)).toBeNull();
  expect(await others(page)).toEqual(otherSaves);
  expect(errors).toEqual([]);
});

test('保存失敗0寫入：配額、無Web Locks、鎖忙；保留本頁段落與離頁提醒，修好後一次寫入', async ({ page }) => {
  await page.addInitScript(key => {
    window.__failRound = true; window.__roundWrites = 0; const set = Storage.prototype.setItem;
    Storage.prototype.setItem = function(k, v) { if (k === key) { if (window.__failRound) throw new DOMException('Test quota', 'QuotaExceededError'); window.__roundWrites++; } return set.call(this, k, v); };
  }, ROUND_KEY);
  await seeded(page);
  await click(page, '7. 帶你打一局'); await click(page, '我讀完了，開始示範'); await l7Opening(page);
  await click(page, '保存並暫停');
  await expect(panel(page)).toContainText('續學點沒有保存成功（可能空間不足）');
  await expect(button(page, '補花：從牌尾補一張')).toBeVisible();
  await expect(lesson(page)).toContainText('本段尚未保存');
  await page.evaluate(() => { window.__failRound = false; Object.defineProperty(navigator, 'locks', { configurable: true, get: () => undefined }); });
  await click(page, '保存並暫停');
  await expect(panel(page)).toContainText('此瀏覽器不支援安全保存，這次沒有寫入；本頁段落保留');
  await page.evaluate(() => { delete navigator.locks; });
  await page.evaluate(key => { window.__release = null; navigator.locks.request(key, () => new Promise(r => window.__release = r)); }, ROUND_KEY);
  await expect.poll(() => page.evaluate(() => typeof window.__release)).toBe('function');
  await click(page, '保存並暫停');
  await expect(panel(page)).toContainText('其他頁正在保存續學點');
  expect(await read(page, ROUND_KEY)).toBeNull(); expect(await page.evaluate(() => window.__roundWrites)).toBe(0);
  await cancelReload(page);
  await expect(button(page, '補花：從牌尾補一張')).toBeVisible();
  await page.evaluate(() => window.__release());
  await click(page, '保存並暫停');
  await expect(panel(page)).toContainText('已保存並暫停');
  expect(await page.evaluate(() => window.__roundWrites)).toBe(1);
  await expect.poll(() => read(page, ROUND_KEY)).toBe(saved(7, 'guided', 7, 'flower', true));
  expect(await others(page)).toEqual(otherSaves);
});

test('壞原文與讀不到：唯讀原文可下載、下載失敗可複製；不覆寫，確認清掉後才保存；v2與其他資料照常', async ({ page, context }) => {
  const bad = '{"schemaVersion":1,"courseLesson":9}';
  await seeded(page, { [ROUND_KEY]: bad });
  await expect(panel(page)).toContainText('續學點內容無法使用（損壞或版本不符）');
  await expect(page.getByLabel('續學點原文（唯讀，可複製）')).toHaveValue(bad);
  await expect(page.getByLabel('續學點原文（唯讀，可複製）')).toHaveJSProperty('readOnly', true);
  const pending = page.waitForEvent('download'); await click(page, '下載續學點原文');
  expect(await readFile(await (await pending).path(), 'utf8')).toBe(bad);
  await expect(button(page, '接續已存教學')).toHaveCount(0);
  await click(page, '7. 帶你打一局'); await click(page, '我讀完了，開始示範'); await l7Opening(page);
  await expect(button(page, '保存並暫停')).toBeDisabled();
  await expect(lesson(page)).toContainText('暫不能保存：已存內容無法使用');
  page.once('dialog', d => d.dismiss()); await click(page, '清掉續學點');
  expect(await read(page, ROUND_KEY)).toBe(bad);
  page.once('dialog', d => d.accept()); await click(page, '清掉續學點');
  await expect.poll(() => read(page, ROUND_KEY)).toBeNull();
  await expect(button(page, '保存並暫停')).toBeEnabled();
  await click(page, '保存並暫停');
  await expect.poll(() => read(page, ROUND_KEY)).toBe(saved(7, 'guided', 7, 'flower', true));
  expect((await course(page)).lessons[6].read).toBe(true);
  expect(await others(page)).toEqual(otherSaves);
  // Unreadable key: practice still works and v2 still saves, but nothing is written to or removed from the round key.
  const unreadable = await context.newPage();
  await unreadable.addInitScript(key => { const get = Storage.prototype.getItem; Storage.prototype.getItem = function(k) { if (k === key) throw new DOMException('Test read failure', 'SecurityError'); return get.call(this, k); }; }, ROUND_KEY);
  await unreadable.goto('/learn.html');
  await expect(panel(unreadable)).toContainText('讀不到第7–8課續學點');
  await expect(unreadable.getByRole('button', { name: '清掉續學點', exact: true })).toHaveCount(0);
  await unreadable.getByRole('button', { name: '8. 換一局，自己試', exact: true }).click();
  await unreadable.getByRole('button', { name: '換例自己試', exact: true }).click();
  await expect(unreadable.getByRole('button', { name: '保存並暫停', exact: true })).toBeDisabled();
  await expect.poll(async () => (await course(page)).lessons[7].read).toBe(true);
  await expect.poll(() => read(page, ROUND_KEY)).toBe(saved(7, 'guided', 7, 'flower', true));
  await unreadable.close();
});

test('壞原文下載失敗時仍可複製，原文不變', async ({ page }) => {
  const bad = '{broken-round';
  await page.addInitScript(() => { URL.createObjectURL = () => { throw new Error('Test download failure'); }; });
  await seeded(page, { [ROUND_KEY]: bad });
  await click(page, '下載續學點原文');
  await expect(panel(page)).toContainText('下載未成功；可複製上方原文');
  await expect(page.getByLabel('續學點原文（唯讀，可複製）')).toHaveValue(bad);
  expect(await read(page, ROUND_KEY)).toBe(bad);
});

test('他頁變更：round鍵改寫或clear會停止覆寫並保留本頁；v2事件不擋續學點；重讀後確認才取代', async ({ page, context }) => {
  await seeded(page);
  await click(page, '7. 帶你打一局'); await click(page, '我讀完了，開始示範'); await l7Opening(page);
  await click(page, '保存並暫停'); await click(page, '繼續');
  const mine = saved(7, 'guided', 7, 'flower', true), theirs = saved(8, 'transfer', 8, 'claim', false);
  const other = await context.newPage(); await other.goto('/');
  // A v2 change elsewhere blocks only the v2 record.
  await other.evaluate(([key, value]) => localStorage.setItem(key, value), [LEARN_KEY, encodeLearningProgress(markLesson(emptyProgress(), 2, 'read'))]);
  await expect(page.locator('#save-notice')).toContainText('另一頁已更動學習進度');
  await l7AfterFlower(page);
  await expect(button(page, '保存並暫停')).toBeEnabled();
  await other.evaluate(([key, value]) => localStorage.setItem(key, value), [ROUND_KEY, theirs]);
  await expect(panel(page)).toContainText('另一頁已變更或清除第7–8課續學點，本頁停止覆寫');
  await expect(button(page, '保存並暫停')).toBeDisabled();
  await expect(lesson(page)).toContainText('剛打出的二萬是誰打的？'); // the page is kept, never reloaded
  await click(page, '上家');
  expect(await read(page, ROUND_KEY)).toBe(theirs);
  await click(page, '重新讀取續學點');
  await expect(panel(page)).toContainText('已存：第8課（換例自己試）・上家打牌、待你回應・本次尚未求助');
  await expect(lesson(page)).toContainText('選出所有能和它湊成連號三張的兩張手牌');
  page.once('dialog', d => d.dismiss()); await click(page, '保存並暫停');
  expect(await read(page, ROUND_KEY)).toBe(theirs);
  page.once('dialog', d => d.accept()); await click(page, '保存並暫停');
  await expect.poll(() => read(page, ROUND_KEY)).toBe(saved(7, 'guided', 7, 'claim', true));
  await click(page, '繼續');
  // A clear elsewhere (key null) also stops overwriting.
  const before = await others(page);
  await other.evaluate(() => localStorage.clear());
  await expect(panel(page)).toContainText('另一頁已變更或清除');
  await expect(button(page, '保存並暫停')).toBeDisabled();
  await expect(lesson(page)).toContainText('選出所有能和它湊成連號三張的兩張手牌');
  expect(await read(page, ROUND_KEY)).toBeNull();
  expect(before).toEqual(otherSaves);
  expect(mine).not.toBe(theirs);
  await other.close();
});

test('等鎖時雙擊只寫一次：課程、導覽、保存與重建全部暫停，完成後回復原狀態', async ({ page }) => {
  await page.addInitScript(key => {
    window.__roundWrites = 0; const set = Storage.prototype.setItem;
    Storage.prototype.setItem = function(k, v) { if (k === key) window.__roundWrites++; return set.call(this, k, v); };
  }, ROUND_KEY);
  await seeded(page);
  await click(page, '7. 帶你打一局'); await click(page, '我讀完了，開始示範'); await l7Opening(page);
  await page.evaluate(key => {
    window.__pause = true; const request = navigator.locks.request.bind(navigator.locks);
    navigator.locks.request = (name, options, callback) => request(name, options, async lock => {
      if (name === key && window.__pause) await new Promise(resolve => window.__releaseLock = resolve);
      return callback(lock);
    });
  }, ROUND_KEY);
  await button(page, '保存並暫停').dblclick();
  await expect.poll(() => page.evaluate(() => typeof window.__releaseLock)).toBe('function');
  for (const name of ['保存並暫停', '補花：從牌尾補一張', '1. 認牌與桌面', '重新讀取續學點', '重新建立新手進度', '重新讀取保存紀錄']) await expect(button(page, name)).toBeDisabled();
  await expect(lesson(page)).toHaveJSProperty('inert', true);
  await page.getByText('回看圖解（本次會列提示下完成）', { exact: true }).click({ force: true });
  await expect(page.locator('#lesson details').first()).not.toHaveAttribute('open', '');
  await page.evaluate(() => { window.__pause = false; window.__releaseLock(); });
  await expect(panel(page)).toContainText('已保存並暫停');
  for (const name of ['1. 認牌與桌面', '重新讀取續學點', '重新建立新手進度', '繼續']) await expect(button(page, name)).toBeEnabled();
  expect(await page.evaluate(() => window.__roundWrites)).toBe(1);
  // Rebuilding the completion flags never touches the round key.
  page.once('dialog', d => d.accept()); await click(page, '重新建立新手進度');
  await expect.poll(async () => (await course(page)).lessons.every(p => !p.read)).toBe(true);
  await expect.poll(() => read(page, ROUND_KEY)).toBe(saved(7, 'guided', 7, 'flower', true));
  await expect(panel(page)).toContainText('已存：第7課（親手做示範）・摸到花、待補花');
});

test('合法偏離呈現真實打出結果：已存段落接續後打非劇本牌，未按重試不回復；離頁與切課都提醒；重試才回、無完成旗標', async ({ page }) => {
  await seeded(page);
  await click(page, '7. 帶你打一局'); await click(page, '換例自己試'); await click(page, '你');
  await click(page, '保存並暫停');
  const stored = saved(7, 'transfer', 8, 'discard', false);
  await expect.poll(() => read(page, ROUND_KEY)).toBe(stored);
  await page.reload(); await click(page, '接續已存教學');
  await expect(lesson(page)).toContainText('你的手牌：手中 17 張');
  await discardTile(page, '打出一筒');
  await expect(lesson(page)).toContainText('打出一筒是合法的選擇，引擎已照做');
  await expect(lesson(page)).toContainText('你（東門・莊家）：手牌16張・海底：一筒');
  await expect(lesson(page)).toContainText('你的手牌：手中 16 張');
  await expect(hand(page)).toHaveCount(0);
  await expect(button(page, '保存並暫停')).toBeDisabled();
  await page.waitForTimeout(300);
  await expect(lesson(page)).toContainText('海底：一筒'); // no silent rewind to 17
  await cancelReload(page);
  await expect(lesson(page)).toContainText('海底：一筒');
  page.once('dialog', d => { expect(d.message()).toContain('尚未保存的段落'); d.dismiss(); }); await click(page, '8. 換一局，自己試');
  await expect(lesson(page)).toContainText('海底：一筒');
  await click(page, '重試這一段');
  await expect(note(page)).toContainText('本次改列提示下完成');
  await expect(lesson(page)).toContainText('你的手牌：手中 17 張');
  await expect(lesson(page)).not.toContainText('海底：一筒');
  await expect(hand(page)).toBeVisible();
  expect((await course(page)).lessons[6]).toMatchObject({ guided: false, independent: false });
  expect(await read(page, ROUND_KEY)).toBe(stored);
});

test('等鎖期間教學區inert：回看、提示、導覽都不能改受助；寫一次且與畫面一致，完成後恢復；重建v2等待時亦同', async ({ page }) => {
  await page.addInitScript(key => {
    window.__roundWrites = 0; const set = Storage.prototype.setItem;
    Storage.prototype.setItem = function(k, v) { if (k === key) window.__roundWrites++; return set.call(this, k, v); };
  }, ROUND_KEY);
  await seeded(page);
  await click(page, '8. 換一局，自己試'); await click(page, '換例自己試'); await click(page, '你');
  await expect(page.locator('#save-notice')).toContainText('已保存新手進度（只存閱讀與完成紀錄');
  await page.evaluate(keys => {
    window.__pause = true; const request = navigator.locks.request.bind(navigator.locks);
    navigator.locks.request = (name, options, callback) => request(name, options, async lock => {
      if (keys.includes(name) && window.__pause) await new Promise(resolve => window.__releaseLock = resolve);
      return callback(lock);
    });
  }, [ROUND_KEY, LEARN_KEY]);
  await click(page, '保存並暫停');
  await expect.poll(() => page.evaluate(() => typeof window.__releaseLock)).toBe('function');
  await expect(lesson(page)).toHaveJSProperty('inert', true);
  await page.getByText('回看圖解（本次會列提示下完成）', { exact: true }).click({ force: true });
  await button(page, '看提示').click({ force: true });
  await expect(button(page, '1. 認牌與桌面')).toBeDisabled();
  await expect(page.locator('#lesson details').first()).not.toHaveAttribute('open', '');
  await page.evaluate(() => { window.__pause = false; window.__releaseLock(); });
  await expect.poll(() => read(page, ROUND_KEY)).toBe(saved(8, 'transfer', 8, 'discard', false));
  expect(await page.evaluate(() => window.__roundWrites)).toBe(1);
  await expect(panel(page)).toContainText('已存：第8課（換例自己試）・輪到你打牌・本次尚未求助');
  await expect(panel(page)).toContainText('已保存目前段落。');
  await expect(lesson(page)).toHaveJSProperty('inert', false);
  await expect(lesson(page)).not.toContainText('提示：');
  await click(page, '繼續');
  await page.getByText('回看圖解（本次會列提示下完成）', { exact: true }).click();
  await expect(panel(page)).toContainText('本段尚未保存');
  await page.evaluate(() => { window.__releaseLock = null; window.__pause = true; });
  page.once('dialog', d => d.accept()); await click(page, '重新建立新手進度');
  await expect.poll(() => page.evaluate(() => typeof window.__releaseLock)).toBe('function');
  await expect(lesson(page)).toHaveJSProperty('inert', true);
  await page.evaluate(() => { window.__pause = false; window.__releaseLock(); });
  await expect(lesson(page)).toHaveJSProperty('inert', false);
  await expect.poll(async () => (await course(page)).lessons.every(p => !p.read)).toBe(true);
});

test('第8課活動中展開實桌附錄列受助：保存重載後仍為true，重問小檢核，完成列提示下', async ({ page }) => {
  await seeded(page);
  await click(page, '8. 換一局，自己試'); await click(page, '換例自己試');
  await click(page, '你'); await discardTile(page, '打出九條'); await click(page, '上家'); await click(page, '吃（用三筒、四筒）'); await discardTile(page, '打出一筒');
  await pick(page, ['四條', '七條']); await click(page, '摸一張'); await click(page, '自摸');
  await click(page, '1台'); await pick(page, ['下家（南門）', '對家（西門）', '上家（北門）']); await click(page, '你');
  await expect(lesson(page)).toContainText('在這裡展開附錄會列提示下完成');
  await page.locator('.round-task .round-appendix > summary').click();
  await expect(note(page)).toContainText('已展開實桌附錄');
  await click(page, '保存並暫停');
  await expect.poll(() => read(page, ROUND_KEY)).toBe(saved(8, 'transfer', 8, 'nextHand', true, '34', 'selfDraw'));
  await page.reload(); await click(page, '接續已存教學');
  await expect(lesson(page)).toContainText('依上面明細，這次牌型合計幾台？');
  await click(page, '1台'); await pick(page, ['下家（南門）', '對家（西門）', '上家（北門）']); await click(page, '你');
  await click(page, '先和同桌確認抓位、開門、台數與出錯時怎麼處理');
  await expect.poll(async () => (await course(page)).lessons[7]).toEqual({ read: true, guided: true, independent: false });
});

test('切課與重開前有未存段落要確認；取消則留在原段落', async ({ page }) => {
  await seeded(page);
  await click(page, '7. 帶你打一局'); await click(page, '我讀完了，開始示範'); await click(page, '下家');
  page.once('dialog', d => { expect(d.message()).toContain('尚未保存的段落'); d.dismiss(); }); await click(page, '8. 換一局，自己試');
  await expect(lesson(page)).toContainText('下家打出九萬，沒有人吃碰胡');
  await click(page, '回到本課圖解');
  page.once('dialog', d => { expect(d.message()).toContain('重新開始會放棄'); d.dismiss(); }); await click(page, '換例自己試');
  await click(page, '繼續本段（親手做示範・開局：莊家先打）');
  await expect(lesson(page)).toContainText('下家打出九萬，沒有人吃碰胡');
  await cancelReload(page);
  page.once('dialog', d => d.accept()); await click(page, '8. 換一局，自己試');
  await expect(lesson(page)).toContainText('第8課：換一局，自己試');
});

for (const first of ['v2', 'round']) test(`兩把鎖並行（先放${first === 'v2' ? '完成旗標' : '續學點'}）：等待中停用、兩者結束後兩個保存區都恢復，各寫一次`, async ({ page }) => {
  await page.addInitScript(([round, learn]) => {
    window.__writes = { [round]: 0, [learn]: 0 }; window.__counting = false; const set = Storage.prototype.setItem;
    Storage.prototype.setItem = function(k, v) { if (window.__counting && k in window.__writes) window.__writes[k]++; return set.call(this, k, v); };
  }, [ROUND_KEY, LEARN_KEY]);
  await seeded(page);
  await page.evaluate(keys => {
    window.__counting = true; window.__hold = Object.fromEntries(keys.map(k => [k, true])); window.__release = {};
    const request = navigator.locks.request.bind(navigator.locks);
    navigator.locks.request = (name, options, callback) => request(name, options, async lock => {
      if (window.__hold[name]) await new Promise(resolve => window.__release[name] = resolve);
      return callback(lock);
    });
  }, [ROUND_KEY, LEARN_KEY]);
  const pending = key => page.evaluate(k => typeof window.__release[k] === 'function', key);
  await click(page, '8. 換一局，自己試'); await click(page, '換例自己試'); // mark(read) -> v2 save waits
  await expect.poll(() => pending(LEARN_KEY)).toBe(true);
  await click(page, '你');
  await click(page, '保存並暫停'); // round save waits too
  await expect.poll(() => pending(ROUND_KEY)).toBe(true);
  for (const name of ['保存並暫停', '1. 認牌與桌面', '重新讀取續學點', '重新建立新手進度', '重新讀取保存紀錄']) await expect(button(page, name)).toBeDisabled();
  await expect(lesson(page)).toHaveJSProperty('inert', true);
  const release = key => page.evaluate(k => { window.__hold[k] = false; window.__release[k](); }, key);
  const [a, b] = first === 'v2' ? [LEARN_KEY, ROUND_KEY] : [ROUND_KEY, LEARN_KEY];
  await release(a);
  await expect(button(page, '重新建立新手進度')).toBeDisabled(); // the other write is still pending
  await expect(button(page, '重新讀取續學點')).toBeDisabled();
  await release(b);
  await expect.poll(() => read(page, ROUND_KEY)).toBe(saved(8, 'transfer', 8, 'discard', false));
  await expect.poll(async () => (await course(page)).lessons[7].read).toBe(true);
  for (const name of ['重新建立新手進度', '重新讀取保存紀錄', '重新讀取續學點', '清掉續學點', '接續已存教學', '繼續', '1. 認牌與桌面']) await expect(button(page, name)).toBeEnabled();
  await expect(lesson(page)).toHaveJSProperty('inert', false);
  expect(await page.evaluate(() => window.__writes)).toEqual({ [ROUND_KEY]: 1, [LEARN_KEY]: 1 });
  expect(await others(page)).toEqual(otherSaves);
  await click(page, '重新讀取續學點');
  await expect(panel(page)).toContainText('此瀏覽器有第8課（換例自己試）的續學點');
  page.once('dialog', d => d.accept()); await click(page, '重新建立新手進度');
  await expect.poll(async () => (await course(page)).lessons.every(p => !p.read)).toBe(true);
  expect(await read(page, ROUND_KEY)).toBe(saved(8, 'transfer', 8, 'discard', false));
  expect(await page.evaluate(() => window.__writes)).toEqual({ [ROUND_KEY]: 1, [LEARN_KEY]: 2 });
});

test('結算時四家公開資訊預設收起、可展開收合（滑鼠與鍵盤）；台項、收付與小題一直可見，開關不改續學點／v2／不重付，320px無溢出', async ({ page }) => {
  await seeded(page);
  await page.setViewportSize({ width: 320, height: 844 });
  await click(page, '8. 換一局，自己試'); await click(page, '換例自己試');
  await click(page, '你'); await discardTile(page, '打出九條'); await click(page, '上家'); await click(page, '吃（用三筒、四筒）'); await discardTile(page, '打出一筒');
  await pick(page, ['四條', '七條']); await click(page, '摸一張'); await click(page, '自摸');
  const box = page.locator('#lesson details.round-public'), summary = box.locator('summary');
  const seatsList = page.getByRole('list', { name: '四家公開資訊（他家暗手不顯示）', exact: true });
  await expect(summary).toHaveText('查看四家海底與公開資訊');
  await expect(box).not.toHaveAttribute('open', '');
  await expect(seatsList).toBeHidden();
  const always = async () => {
    await expect(page.getByRole('list', { name: '胡牌明細', exact: true })).toBeVisible();
    await expect(page.getByRole('list', { name: '四家分數變動', exact: true })).toContainText('你（東門・莊家） ＋150');
    await expect(lesson(page)).toContainText('依上面明細，這次牌型合計幾台？');
    await expect(button(page, '1台')).toBeVisible();
  };
  await always();
  const before = { round: await read(page, ROUND_KEY), v2: await read(page, LEARN_KEY) };
  await summary.click(); await expect(box).toHaveAttribute('open', ''); await expect(seatsList).toBeVisible();
  await expect(seatsList).toContainText('海底：');
  await always();
  await summary.click(); await expect(seatsList).toBeHidden();
  await summary.focus(); await page.keyboard.press('Enter'); await expect(seatsList).toBeVisible();
  await page.keyboard.press('Enter'); await expect(seatsList).toBeHidden();
  expect(await summary.evaluate(el => el.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);
  await always();
  expect({ round: await read(page, ROUND_KEY), v2: await read(page, LEARN_KEY) }).toEqual(before);
  await expect(page.getByRole('list', { name: '四家分數變動', exact: true })).not.toContainText('＋300');
  await noOverflowAnd44(page);
  // Finishing still counts as unassisted: the table toggle never changed the classification.
  await click(page, '1台'); await pick(page, ['下家（南門）', '對家（西門）', '上家（北門）']); await click(page, '你');
  await expect(page.locator('#lesson details.round-public summary')).toHaveText('查看四家海底與公開資訊');
  await click(page, '先和同桌確認抓位、開門、台數與出錯時怎麼處理');
  await expect.poll(async () => (await course(page)).lessons[7]).toEqual({ read: true, guided: false, independent: true });
});

test('合成pageshow persisted事件（非真實BFCache）：原文不同時停止覆寫、保留本頁；相同時不阻擋', async ({ page }) => {
  await seeded(page);
  await click(page, '7. 帶你打一局'); await click(page, '我讀完了，開始示範'); await l7Opening(page);
  await click(page, '保存並暫停');
  await expect.poll(() => read(page, ROUND_KEY)).toBe(saved(7, 'guided', 7, 'flower', true));
  await click(page, '繼續');
  await page.evaluate(() => dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
  await expect(button(page, '保存並暫停')).toBeEnabled();
  await page.evaluate(([key, value]) => localStorage.setItem(key, value), [ROUND_KEY, saved(8, 'guided', 8, 'claim', true)]);
  await page.evaluate(() => dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
  await expect(panel(page)).toContainText('另一頁已變更或清除第7–8課續學點');
  await expect(button(page, '保存並暫停')).toBeDisabled();
  await expect(button(page, '補花：從牌尾補一張')).toBeVisible();
});

// Playwright disables the back/forward cache and its default headless shell cannot restore from it, so this case
// launches a full browser with the cache enabled: TW16_BROWSER_CHANNEL / TW16_BROWSER_PATH win, else the full
// Chromium build; only on Windows, when that build fails to spawn ("spawn UNKNOWN"), the installed Chrome. No skip.
async function launchWithBfcache(playwright) {
  const base = { ignoreDefaultArgs: ['--disable-back-forward-cache'] }, channel = process.env.TW16_BROWSER_CHANNEL, path = process.env.TW16_BROWSER_PATH;
  if (channel || path) return playwright.chromium.launch({ ...base, channel, executablePath: path || undefined });
  try { return await playwright.chromium.launch({ ...base, channel: 'chromium' }); }
  catch (error) {
    if (process.platform !== 'win32' || !String(error?.message).includes('spawn UNKNOWN')) throw error;
    return playwright.chromium.launch({ ...base, channel: 'chrome' });
  }
}
test('真實BFCache返回：外頁改了續學點時停止覆寫、保留本頁，不自動重載', async ({ playwright, viewport }) => {
  const browser = await launchWithBfcache(playwright);
  try {
    const context = await browser.newContext({ baseURL: 'http://127.0.0.1:4226', viewport }), page = await context.newPage();
    await page.addInitScript(() => { addEventListener('pageshow', e => { if (e.persisted) window.__restored = (window.__restored ?? 0) + 1; }); });
    await seeded(page);
    await click(page, '7. 帶你打一局'); await click(page, '我讀完了，開始示範'); await l7Opening(page);
    await click(page, '保存並暫停');
    await expect.poll(() => read(page, ROUND_KEY)).toBe(saved(7, 'guided', 7, 'flower', true));
    await page.evaluate(() => { window.__marker = 'same-document'; });
    await page.goto('/');
    await page.evaluate(([key, value]) => localStorage.setItem(key, value), [ROUND_KEY, saved(8, 'guided', 8, 'claim', true)]);
    // A cache restore fires pageshow but no load event, so only wait for the navigation to commit.
    await page.goBack({ waitUntil: 'commit' });
    await expect.poll(() => page.evaluate(() => window.__restored ?? 0).catch(() => 0)).toBeGreaterThan(0).catch(() => {});
    const restored = await page.evaluate(() => window.__restored ?? 0);
    const reasons = JSON.stringify(await page.evaluate(() => performance.getEntriesByType('navigation')[0]?.notRestoredReasons?.reasons ?? null));
    expect(restored, `page was not restored from the back/forward cache: ${reasons}`).toBe(1);
    expect(await page.evaluate(() => window.__marker)).toBe('same-document');
    await expect(panel(page)).toContainText('另一頁已變更或清除第7–8課續學點');
    await expect(page.getByRole('heading', { name: '已暫停', exact: true })).toBeVisible();
    await click(page, '繼續');
    await expect(button(page, '保存並暫停')).toBeDisabled();
    await expect.poll(() => read(page, ROUND_KEY)).toBe(saved(8, 'guided', 8, 'claim', true));
    await context.close();
  } finally { await browser.close(); }
});
