import { test, expect } from '@playwright/test';
import { LEARN_KEY, emptyProgress, markLesson, encodeLearningProgress } from '../../dist/learning-progress.js';

const otherSaves = { 'tw16:TW16-CLASSIC-v1:save': 'private-game-sentinel', 'tw16:practice:v1': 'private-hand-sentinel', 'tw16:trial:v1': 'private-trial-sentinel' };
const values = page => page.evaluate(() => Object.fromEntries(Object.entries(localStorage)));
async function cancelReload(page) {
  const pending = page.waitForEvent('dialog'), reload = page.evaluate(() => location.reload());
  const dialog = await pending; expect(dialog.type()).toBe('beforeunload'); await dialog.dismiss(); await reload;
}

test('學習頁已撤下回饋收集：無表單、連結或文字檔下載；八課照常，只寫學習進度', async ({ page }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  const downloads = []; page.on('download', d => downloads.push(d.suggestedFilename()));
  const original = encodeLearningProgress(markLesson(emptyProgress(), 0, 'guided'));
  await page.addInitScript(data => { for (const [k, v] of Object.entries(data)) if (localStorage.getItem(k) === null) localStorage.setItem(k, v); }, { ...otherSaves, [LEARN_KEY]: original });
  await page.goto('/learn.html');
  await expect(page.locator('#lesson-nav button')).toHaveCount(8);
  await expect(page.locator('#learning-feedback-form, .learning-feedback, textarea, form')).toHaveCount(0);
  await expect(page.getByRole('link', { name: /回饋/ })).toHaveCount(0);
  await expect(page.locator('body')).not.toContainText(/學習回饋|試用回饋|附回專案|交回/);
  await page.getByRole('button', { name: '3. 五組牌加一對眼睛', exact: true }).click();
  await page.getByRole('button', { name: '我讀完了，開始示範', exact: true }).click();
  await expect(page.locator('#save-notice')).toContainText('已保存');
  await expect(page.locator('.progress-list')).toContainText('第3課：已閱讀 ✓');
  const after = await values(page);
  expect(Object.keys(after).sort()).toEqual([...Object.keys(otherSaves), LEARN_KEY].sort());
  expect(Object.fromEntries(Object.keys(otherSaves).map(k => [k, after[k]]))).toEqual(otherSaves);
  // Nothing unsaved remains, so reloading does not warn and the saved flags come back.
  await page.reload(); await expect(page.locator('.progress-list')).toContainText('第3課：已閱讀 ✓');
  expect(await values(page)).toEqual(after);
  await page.setViewportSize({ width: 320, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(downloads).toEqual([]); expect(errors).toEqual([]);
});

test('保存失敗與跨頁衝突仍保留本頁未存進度，重載前提醒', async ({ page, context }) => {
  const original = encodeLearningProgress(emptyProgress());
  await page.addInitScript(({ key, original, otherSaves }) => {
    for (const [k, v] of Object.entries({ ...otherSaves, [key]: original })) localStorage.setItem(k, v);
    const set = Storage.prototype.setItem;
    Storage.prototype.setItem = function(k, v) { if (k === key) throw new DOMException('Test quota', 'QuotaExceededError'); return set.call(this, k, v); };
  }, { key: LEARN_KEY, original, otherSaves });
  await page.goto('/learn.html');
  await page.getByRole('button', { name: '我讀完了，開始示範', exact: true }).click();
  await expect(page.locator('#save-notice')).toContainText('未能保存');
  await cancelReload(page);
  await expect(page.locator('.progress-list')).toContainText('第1課：已閱讀 ✓');
  const second = await context.newPage(); await second.goto('/');
  await second.evaluate(({ key, original }) => localStorage.setItem(key, original), { key: LEARN_KEY, original: encodeLearningProgress(markLesson(emptyProgress(), 1, 'read')) });
  await expect(page.locator('#save-notice')).toContainText('另一頁');
  await cancelReload(page);
  await expect(page.locator('.progress-list')).toContainText('第1課：已閱讀 ✓');
  expect(await page.evaluate(keys => Object.fromEntries(keys.map(k => [k, localStorage.getItem(k)])), Object.keys(otherSaves))).toEqual(otherSaves);
  await second.close();
});
