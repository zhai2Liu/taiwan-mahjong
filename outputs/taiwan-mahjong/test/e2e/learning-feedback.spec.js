import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { LEARN_KEY, COURSE_VERSION, emptyProgress, markLesson, encodeLearningProgress } from '../../dist/learning-progress.js';

const otherSaves = { 'tw16:TW16-CLASSIC-v1:save': 'private-game-sentinel', 'tw16:practice:v1': 'private-hand-sentinel', 'tw16:trial:v1': 'private-trial-sentinel' };
const draft = '第二課補花後不知道輪到誰。<img src=x onerror="window.__injected=true">';
const values = page => page.evaluate(() => Object.fromEntries(Object.entries(localStorage)));
async function openFeedback(page) {
  await page.getByRole('link', { name: '哪裡看不懂或操作卡住？提供學習回饋' }).click();
  await expect(page.getByLabel('最不清楚的一句或最卡的操作')).toBeVisible();
}
async function cancelReload(page) {
  const pending = page.waitForEvent('dialog'), reload = page.evaluate(() => location.reload());
  const dialog = await pending; expect(dialog.type()).toBe('beforeunload'); await dialog.dismiss(); await reload;
}

test('新手回饋下載保留原文、分開範圍與當下課程，只附白名單進度；切課與重讀不丟草稿', async ({ page }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  const original = encodeLearningProgress(markLesson(emptyProgress(), 0, 'guided'));
  await page.addInitScript(data => { for (const [k, v] of Object.entries(data)) localStorage.setItem(k, v); }, { ...otherSaves, [LEARN_KEY]: original });
  await page.goto('/learn.html?private-query=secret#private-fragment');
  await openFeedback(page);
  const note = page.getByLabel('最不清楚的一句或最卡的操作');
  await note.fill('   '); await page.getByRole('button', { name: '下載學習回饋', exact: true }).click();
  await expect(page.locator('#learning-feedback-status')).toHaveText('請先寫下一個卡點或建議。');
  await expect(page.locator('#learning-feedback-preview-panel')).toBeHidden();
  await page.getByLabel('回饋針對哪裡？').selectOption({ label: '第2課：摸牌、補花與打牌' });
  await page.getByLabel('裝置與瀏覽器（選填）').fill('合成驗流程：電腦 Chrome');
  await note.fill(draft);
  await page.getByRole('button', { name: '3. 五組牌加一對眼睛', exact: true }).click();
  await page.getByRole('button', { name: '我讀完了，開始示範', exact: true }).click();
  await expect(page.locator('#save-notice')).toContainText('已保存');
  await page.getByRole('button', { name: '重新讀取保存紀錄', exact: true }).click();
  await expect(note).toHaveValue(draft);
  const before = await values(page);
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: '下載學習回饋', exact: true }).click();
  const download = await pending;
  expect(download.suggestedFilename()).toBe('taiwan-mahjong-learning-feedback.txt');
  const text = await readFile(await download.path(), 'utf8');
  expect(text).toContain(`課程版本：${COURSE_VERSION}；桌規：TW16-CLASSIC-v1`);
  expect(text).toContain('回饋範圍：第2課：摸牌、補花與打牌');
  expect(text).toContain('匯出時所在畫面：第3課 五組牌加一對眼睛／親手做示範');
  expect(text).toContain('第1課：已閱讀是／提示下完成是／換例自行完成否');
  expect(text).toContain('第3課：已閱讀是／提示下完成否／換例自行完成否');
  expect(text).toContain(draft); expect(text).toMatch(/匯出時頁面程式：.*assets\/learn-/);
  expect(text).not.toMatch(/private-|secret/);
  await expect(page.getByLabel('最近一次匯出內容（可自行複製）')).toHaveValue(text);
  expect(await values(page)).toEqual(before);
  expect(Object.fromEntries(Object.keys(otherSaves).map(k => [k, before[k]]))).toEqual(otherSaves);
  expect(await page.evaluate(() => window.__injected)).toBeUndefined();
  await cancelReload(page); await expect(note).toHaveValue(draft);
  await note.fill(`${draft}\n補充：看過提示。`);
  await expect(page.locator('#learning-feedback-status')).toContainText('有新修改');
  page.once('dialog', d => d.accept()); await page.getByRole('button', { name: '重新建立新手進度', exact: true }).click();
  await expect(page.locator('#save-notice')).toContainText('已重新建立');
  await expect(note).toHaveValue(`${draft}\n補充：看過提示。`);
  await cancelReload(page);
  await page.setViewportSize({ width: 320, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('下載失敗仍可複製，跨頁衝突保留草稿；清除回饋不會解除未存課程提醒', async ({ page, context }) => {
  const original = encodeLearningProgress(emptyProgress());
  await page.addInitScript(({ key, original, otherSaves }) => {
    for (const [k, v] of Object.entries({ ...otherSaves, [key]: original })) localStorage.setItem(k, v);
    const set = Storage.prototype.setItem;
    Storage.prototype.setItem = function(k, v) { if (k === key) throw new DOMException('Test quota', 'QuotaExceededError'); return set.call(this, k, v); };
    URL.createObjectURL = () => { throw new Error('Test download failure'); };
  }, { key: LEARN_KEY, original, otherSaves });
  await page.goto('/learn.html'); await openFeedback(page);
  const note = page.getByLabel('最不清楚的一句或最卡的操作'); await note.fill(draft);
  await page.getByRole('button', { name: '我讀完了，開始示範', exact: true }).click();
  await expect(page.locator('#save-notice')).toContainText('未能保存');
  await page.getByRole('button', { name: '下載學習回饋', exact: true }).click();
  await expect(page.locator('#learning-feedback-status')).toContainText('下載未成功');
  const preview = page.getByLabel('最近一次匯出內容（可自行複製）');
  await expect(preview).toBeVisible();
  expect(await preview.inputValue()).toContain(draft);
  expect(await preview.inputValue()).toContain('本頁有尚未保存的進度');
  const second = await context.newPage(); await second.goto('/');
  await second.evaluate(({ key, original }) => localStorage.setItem(key, original), { key: LEARN_KEY, original: encodeLearningProgress(markLesson(emptyProgress(), 1, 'read')) });
  await expect(page.locator('#save-notice')).toContainText('另一頁');
  await expect(note).toHaveValue(draft);
  await page.getByRole('button', { name: '下載學習回饋', exact: true }).click();
  expect(await preview.inputValue()).toContain('讀取或衝突未解');
  expect(await preview.inputValue()).not.toContain('第1課：已閱讀');
  await note.fill(''); await cancelReload(page);
  await expect(page.locator('.progress-list')).toContainText('第1課：已閱讀 ✓');
  expect(await page.evaluate(keys => Object.fromEntries(keys.map(k => [k, localStorage.getItem(k)])), Object.keys(otherSaves))).toEqual(otherSaves);
  await second.close();
});
