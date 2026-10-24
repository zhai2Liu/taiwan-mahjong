import { test, expect } from '@playwright/test';
import { createPractice, PRACTICE_KEY } from '../../dist/practice.js';
import { LEARN_KEY } from '../../dist/learning-progress.js';
import { ROUND_KEY, decodeRoundSave } from '../../dist/learning-round-store.js';

// Local Chrome checks of looking back at the explanation mid-task (lessons 1–6) and returning to it (lessons 7–8).
const otherSaves = { 'tw16:TW16-CLASSIC-v1:save': 'private-game-sentinel', [PRACTICE_KEY]: JSON.stringify(createPractice(20261024)), 'tw16:review:v2': '{"schemaVersion":2,"records":[]}', 'tw16:trial:v1': 'trial-sentinel' };
const RESTART = '重新開始或換例會放棄本次未完成的操作，已保存完成紀錄保留。確定？';
const read = (page, key) => page.evaluate(k => localStorage.getItem(k), key);
const course = async page => JSON.parse(await read(page, LEARN_KEY));
const others = page => page.evaluate(keys => Object.fromEntries(keys.map(k => [k, localStorage.getItem(k)])), Object.keys(otherSaves));
const button = (page, name) => page.getByRole('button', { name, exact: true }).first();
const click = (page, name) => button(page, name).click();
const lesson = page => page.locator('#lesson');
const note = page => page.locator('#lesson-feedback');
const recap = page => page.locator('#lesson > details').first();
const discardTile = (page, name) => page.getByRole('group', { name: '選牌打出', exact: true }).getByRole('button', { name, exact: true }).first().dblclick();
async function pick(page, names) { for (const name of names) await click(page, name); await click(page, '確認'); }
async function seeded(page) {
  await page.addInitScript(data => { for (const [k, v] of Object.entries(data)) if (localStorage.getItem(k) === null) localStorage.setItem(k, v); }, otherSaves);
  await page.goto('/learn.html');
}
// Tags the current task section; a re-render replaces it, so the tag tells whether the page was rebuilt.
const tag = page => page.locator('#lesson section').evaluate(s => { s.dataset.kept = 'yes'; });
const kept = page => expect(page.locator('#lesson section[data-kept="yes"]')).toHaveCount(1);
/** Opens the recap from the bottom entry, checks nothing was rebuilt, then folds it with the keyboard on its summary. */
async function lookBack(page, keyboard = false) {
  await tag(page);
  if (keyboard) { await button(page, '回看本課圖解').focus(); await page.keyboard.press('Enter'); } else await click(page, '回看本課圖解');
  await expect(recap(page)).toHaveAttribute('open', '');
  await expect(recap(page).locator('summary')).toBeFocused();
  await expect(note(page)).toContainText('本次完成將列提示下完成');
  await kept(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.keyboard.press('Enter');
  await expect(recap(page)).not.toHaveAttribute('open', '');
  await kept(page);
}
/** Cancelling the restart prompt changes nothing: same DOM, same focus. */
async function cancelRestart(page) {
  await tag(page);
  page.once('dialog', d => { expect(d.message()).toBe(RESTART); d.dismiss(); });
  await click(page, '重新開始／換例');
  await kept(page); await expect(button(page, '重新開始／換例')).toBeFocused();
}
async function confirmRestart(page) {
  page.once('dialog', d => { expect(d.message()).toBe(RESTART); d.accept(); });
  await click(page, '重新開始／換例');
  await expect(note(page)).toContainText('未完成操作已回到起點');
  await expect(button(page, '我讀完了，開始示範')).toBeVisible(); await expect(button(page, '換例自己試')).toBeVisible();
  await expect(page.locator('#lesson section')).toHaveCount(0);
}

test('第2–3課回看圖解：鍵盤進出、不重繪，摸花／已收牌組／眼睛／未確認選牌保留，完成只列提示下；同課導航不清空；320px不溢出', async ({ page }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  const dialogs = []; page.on('dialog', d => dialogs.push(d.message()));
  await page.setViewportSize({ width: 320, height: 844 });
  await seeded(page);
  const current = button(page, '2. 摸牌、補花與打牌');
  await current.click(); await click(page, '換例自己試');
  await click(page, '上家'); await click(page, '摸一張');
  await expect(lesson(page)).toContainText('一般手牌 16 張 · 花 1 張');
  await lookBack(page, true);
  await expect(lesson(page)).toContainText('一般手牌 16 張 · 花 1 張');
  await current.click();
  await expect(lesson(page)).toContainText('一般手牌 16 張 · 花 1 張');
  await click(page, '補花'); await expect(lesson(page)).toContainText('一般手牌 17 張');
  await page.getByRole('group', { name: '教學手牌' }).getByRole('button').first().focus(); await page.keyboard.press('Enter');
  await expect(lesson(page)).toContainText('一般手牌 16 張'); await click(page, '下家');
  await expect.poll(async () => (await course(page))?.lessons[1]).toEqual({ read: true, guided: true, independent: false });

  await click(page, '3. 五組牌加一對眼睛'); await click(page, '換例自己試');
  const tile = id => page.locator(`#lesson [data-tile="${id}"]`);
  const select = async ids => { for (const id of ids) await tile(id).click(); };
  await select(['1s#0', '1s#1', '1s#2', '1s#3']); await click(page, '收成一組');
  await select(['9m#0', '9m#1']); await click(page, '留作眼睛');
  await select(['2m#0', '3m#0']);
  await lookBack(page);
  await expect(lesson(page)).toContainText('已收 1／5 組 · 眼睛 已留');
  for (const id of ['2m#0', '3m#0']) await expect(tile(id)).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#lesson .grouped-tiles')).toContainText('眼睛');
  await select(['4m#0']); await click(page, '收成一組');
  await expect(lesson(page)).toContainText('已收 2／5 組');
  for (const ids of [['6p#0', '7p#0', '8p#0'], ['4z#0', '4z#1', '4z#2'], ['6z#0', '6z#1', '6z#2']]) { await select(ids); await click(page, '收成一組'); }
  await page.getByRole('button', { name: /^示例B/ }).click();
  await expect.poll(async () => (await course(page))?.lessons[2]).toEqual({ read: true, guided: true, independent: false });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(dialogs).toEqual([]); expect(errors).toEqual([]);
  expect(await others(page)).toEqual(otherSaves);
});

test('第4–6課：中途回看保留步驟；重開取消不變、確認回圖解無殘留，換例未求助仍可自行完成', async ({ page }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await seeded(page);
  await click(page, '4. 別人打牌後，我能做什麼？'); await click(page, '我讀完了，開始示範');
  await click(page, '不行，吃只拿上家的牌');
  await pick(page, ['一萬＋三萬', '三萬＋四萬']); await click(page, '吃（用一萬、三萬）');
  const forbidden = '這次不能打：二萬（和剛用的一萬、三萬又湊成一二三萬）';
  await lookBack(page);
  await expect(lesson(page)).toContainText(forbidden);
  await cancelRestart(page);
  await discardTile(page, '打出東');
  await expect(note(page)).toContainText('手中13張加桌上一組');
  await confirmRestart(page);
  await click(page, '換例自己試');
  await expect(page.getByRole('group', { name: '選牌打出', exact: true })).toHaveCount(0);
  await pick(page, ['一筒＋三筒', '三筒＋四筒']); await click(page, '吃（用三筒、四筒）'); await discardTile(page, '打出東');
  await expect.poll(async () => (await course(page))?.lessons[3]).toEqual({ read: true, guided: false, independent: true });

  await click(page, '5. 聽什麼，不一定現在就能胡'); await click(page, '換例自己試');
  await click(page, '二筒');
  await cancelRestart(page);
  await expect(page.locator('#lesson [data-pick][aria-pressed="true"]')).toHaveCount(1);
  await confirmRestart(page); await click(page, '換例自己試');
  await expect(page.locator('#lesson [data-pick][aria-pressed="true"]')).toHaveCount(0);
  await click(page, '二筒'); await click(page, '發');
  await lookBack(page);
  await expect(page.locator('#lesson [data-pick][aria-pressed="true"]')).toHaveCount(2);
  await click(page, '確認'); await click(page, '不行，過水還沒解除');
  await expect.poll(async () => (await course(page))?.lessons[4]).toEqual({ read: true, guided: true, independent: false });
  await expect(page.locator('.progress-list')).toContainText('第5課：已閱讀 ✓ · 提示下完成 ✓ · 換例自行完成 —');

  await click(page, '6. 看懂結算'); await click(page, '我讀完了，開始示範');
  await click(page, '自摸'); await expect(lesson(page)).toContainText('牌型合計 8 台');
  await pick(page, ['春花', '梅花']);
  await lookBack(page);
  await expect(lesson(page)).toContainText('牌型合計 8 台');
  await pick(page, ['南門', '西門', '北門']); await click(page, '160分');
  await expect(lesson(page)).toContainText('東門（你） ＋480、南門 −160、西門 −160、北門 −160');
  await click(page, '東門續莊，連3');
  await expect.poll(async () => (await course(page))?.lessons[5]).toEqual({ read: true, guided: true, independent: false });
  expect(errors).toEqual([]);
  expect(await others(page)).toEqual(otherSaves);
});

test('第7課未求助的換例回整頁圖解：列受助、已存續學點不變直到明確保存，保存後assisted=true、重載接續完成列提示下', async ({ page }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await seeded(page);
  await click(page, '7. 帶你打一局'); await click(page, '換例自己試');
  await click(page, '你'); await discardTile(page, '打出九條');
  await expect(lesson(page)).toContainText('你打出九條 → 下家打出中 → 對家打出發 → 上家打出二筒');
  await click(page, '保存並暫停');
  await expect.poll(() => read(page, ROUND_KEY)).not.toBeNull();
  const stored = await read(page, ROUND_KEY), before = decodeRoundSave(stored);
  expect(before.ok && before.checkpoint.assisted).toBe(false);
  await click(page, '繼續');
  await click(page, '回到本課圖解');
  await expect(note(page)).toContainText('已看圖解，本次完成將列提示下完成');
  await expect(page.getByRole('region', { name: '第7–8課續學點', exact: true })).toContainText('本段尚未保存');
  expect(await read(page, ROUND_KEY)).toBe(stored);
  await page.getByRole('button', { name: /^繼續本段（換例自己試・/ }).click();
  await expect(button(page, '上家')).toBeVisible();
  expect(await read(page, ROUND_KEY)).toBe(stored);
  await click(page, '保存並暫停');
  await expect.poll(() => read(page, ROUND_KEY)).not.toBe(stored);
  const after = decodeRoundSave(await read(page, ROUND_KEY));
  expect(after.ok && after.checkpoint.assisted).toBe(true);
  expect(after.checkpoint.point).toBe(before.checkpoint.point);
  await page.reload();
  await click(page, '接續已存教學');
  await click(page, '上家'); await click(page, '吃（用三筒、四筒）'); await discardTile(page, '打出一筒');
  await pick(page, ['四條', '七條']); await click(page, '摸一張'); await click(page, '自摸');
  await click(page, '1台'); await pick(page, ['下家（南門）', '對家（西門）', '上家（北門）']); await click(page, '你');
  await expect(note(page)).toContainText('這段任務完成了');
  await expect.poll(async () => (await course(page))?.lessons[6]).toEqual({ read: true, guided: true, independent: false });
  expect(errors).toEqual([]);
  expect(await others(page)).toEqual(otherSaves);
});
