import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { TRIAL_KEY, decodeTrialDraft } from '../../dist/training-draft.js';
import { reviewTrial } from '../../scripts/review-trial.mjs';

const save = page => page.getByRole('button', { name: '保存作答到此瀏覽器', exact: true });
const raw = page => page.evaluate(key => localStorage.getItem(key), TRIAL_KEY);
const manage = async page => { const panel = page.getByText('管理本機保存／回復原檔', { exact: true }); if (!(await panel.evaluate(e => e.parentElement.open))) await panel.click(); };
const confirm = (page, accept) => page.once('dialog', dialog => accept ? dialog.accept() : dialog.dismiss());

test('手動保存 → 重載同版續答／曝光鎖定 → 真實schema3下載審閱 → 已存可離頁', async ({ page }) => {
  const markers = { 'tw16:TW16-CLASSIC-v1:save': 'game-marker', 'tw16:practice:v1': 'practice-marker', 'tw16:learn:v1': 'learning-marker', 'tw16:review:v2': 'review-marker' };
  await page.addInitScript(markers => { for (const [key, value] of Object.entries(markers)) if (localStorage.getItem(key) === null) localStorage.setItem(key, value); }, markers);
  await page.goto('/training.html?skill=claim-cost'); expect(await raw(page)).toBeNull();
  await page.getByText('選填：以前是否看過本題（預設不確定）', { exact: true }).click();
  await page.locator('#prior-exposure').selectOption('unseen-self-report');
  for (const name of ['1與3萬', '3與4萬']) await page.getByRole('checkbox', { name, exact: true }).check();
  await page.locator('#reason').fill('S3.3 合成理由，非真人資料');
  await page.getByRole('button', { name: '提交並看推導', exact: true }).click();
  await expect(page.locator('#prior-exposure')).toBeDisabled();
  await page.getByText('提供本題回饋（選填）', { exact: true }).click(); await page.locator('#trial-feedback').fill('合成回饋');
  await page.getByRole('button', { name: '下一題', exact: true }).click(); await save(page).click();
  await expect(page.locator('#storage-status')).toContainText('已保存作答');
  const stored = decodeTrialDraft(await raw(page)); expect(stored.questionId).toBe('C02'); expect(stored.report.questions.find(q => q.id === 'C01').exposure).toBe('unseen-self-report');
  const warnings = []; page.on('dialog', dialog => { warnings.push(dialog.type()); void dialog.dismiss(); });
  // No topic query on the next visit: restore the saved cursor/category.
  await page.goto('/training.html'); await expect(page.locator('#storage-status')).toContainText('已載入');
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('第 2 / 3 題 · 吃碰取捨');
  await page.getByRole('button', { name: '上一題', exact: true }).click();
  await expect(page.locator('#reason')).toHaveValue('S3.3 合成理由，非真人資料'); await expect(page.locator('#prior-exposure')).toBeDisabled();
  await expect(page.locator('#trial-feedback')).toHaveValue('合成回饋');
  const pending = page.waitForEvent('download'); await page.getByRole('button', { name: '匯出作答紀錄（含理由與回饋）', exact: true }).click();
  const text = await readFile(await (await pending).path(), 'utf8'), data = JSON.parse(text), report = reviewTrial(text);
  expect(data.schemaVersion).toBe(3); expect(data.guidanceMode).toBe('topic-guided'); expect(data.questions).toHaveLength(9);
  expect(report.questions.find(q => q.id === 'C01').exposureStatus).toBe('unseen-self-report'); expect(report.questions.find(q => q.id === 'C01').comparison).toBe('選項集合符合目前答案');
  await page.getByRole('link', { name: '返回牌室', exact: true }).click(); await expect(page).toHaveURL('http://127.0.0.1:4226/');
  expect(warnings).toEqual([]);
  expect(await page.evaluate(keys => Object.fromEntries(keys.map(key => [key, localStorage.getItem(key)])), Object.keys(markers))).toEqual(markers);
});

test('鍵盤保存與清除保留焦點，等待期間的新焦點不被搶回', async ({ page }) => {
  await page.goto('/training.html'); await page.locator('#reason').fill('合成焦點檢查');
  await save(page).focus(); await page.keyboard.press('Enter');
  await expect(page.locator('#storage-status')).toContainText('已保存作答'); await expect(save(page)).toBeFocused();
  const original = await raw(page);
  await page.evaluate(key => { window.__nativeFocusSet = Storage.prototype.setItem; Storage.prototype.setItem = function(k, v) { if (k === key) throw new DOMException('full', 'QuotaExceededError'); return window.__nativeFocusSet.call(this, k, v); }; }, TRIAL_KEY);
  await page.locator('#reason').fill('按下保存時'); await save(page).focus(); await page.keyboard.press('Enter');
  await expect(page.locator('#storage-status')).toContainText('保存未成功'); await expect(save(page)).toBeFocused(); expect(await raw(page)).toBe(original);
  await page.evaluate(key => {
    Storage.prototype.setItem = window.__nativeFocusSet;
    window.__nativeFocusRequest = navigator.locks.request.bind(navigator.locks);
    navigator.locks.request = (name, options, callback) => window.__nativeFocusRequest(name, options, async lock => {
      if (name === key) await new Promise(resolve => window.__finishFocusSave = resolve);
      return callback(lock);
    });
  }, TRIAL_KEY);
  await save(page).focus(); await page.keyboard.press('Enter'); await expect(save(page)).toBeDisabled();
  await expect.poll(() => page.evaluate(() => typeof window.__finishFocusSave)).toBe('function');
  await page.locator('#reason').fill('等待時新增'); await page.evaluate(() => window.__finishFocusSave());
  await expect(save(page)).toBeEnabled(); await expect(page.locator('#reason')).toBeFocused();
  await expect(page.locator('#storage-status')).toContainText('還有新修改未保存');
  expect(JSON.parse(await raw(page)).report.questions[0].reason).toBe('按下保存時');
  await page.evaluate(() => navigator.locks.request = window.__nativeFocusRequest);
  await save(page).focus(); await page.keyboard.press('Enter'); await expect(page.locator('#storage-status')).toContainText('已保存作答');
  await manage(page); const clear = page.getByRole('button', { name: '清除本機保存（保留本頁）', exact: true });
  await clear.focus(); confirm(page, true); await page.keyboard.press('Enter');
  await expect(page.locator('#storage-status')).toContainText('已清除');
  await expect(page.getByText('管理本機保存／回復原檔', { exact: true })).toBeFocused();
  expect(await raw(page)).toBeNull(); await expect(page.locator('#reason')).toHaveValue('等待時新增');
});

test('配額／鎖忙／缺鎖／讀取失敗保留原檔，恢復後可重試', async ({ page, context }) => {
  await page.goto('/training.html'); await page.locator('#reason').fill('原作答'); await save(page).click(); await expect(page.locator('#storage-status')).toContainText('已保存作答');
  const original = await raw(page);
  await page.evaluate(key => { window.__nativeTrialSet = Storage.prototype.setItem; Storage.prototype.setItem = function(k, v) { if (k === key) throw new DOMException('full', 'QuotaExceededError'); return window.__nativeTrialSet.call(this, k, v); }; }, TRIAL_KEY);
  await page.locator('#reason').fill('保存後新增'); await save(page).click(); await expect(page.locator('#storage-status')).toContainText('保存未成功'); expect(await raw(page)).toBe(original);
  await expect(page.locator('#reason')).toHaveValue('保存後新增');
  await page.evaluate(() => Storage.prototype.setItem = window.__nativeTrialSet);
  const locker = await context.newPage(); await locker.goto('/training.html');
  await locker.evaluate(key => { void navigator.locks.request(key, async () => { window.__holdingTrial = true; await new Promise(resolve => window.__releaseTrial = resolve); }); }, TRIAL_KEY);
  await locker.waitForFunction(() => window.__holdingTrial);
  await save(page).click(); await expect(page.locator('#storage-status')).toContainText('保存未成功'); expect(await raw(page)).toBe(original);
  await locker.evaluate(() => window.__releaseTrial()); await locker.close();
  await page.evaluate(() => { window.__nativeLocks = navigator.locks; Object.defineProperty(navigator, 'locks', { configurable: true, value: undefined }); });
  await save(page).click(); await expect(page.locator('#storage-status')).toContainText('保存未成功'); expect(await raw(page)).toBe(original);
  await page.evaluate(() => Object.defineProperty(navigator, 'locks', { configurable: true, value: window.__nativeLocks }));
  await save(page).click(); await expect(page.locator('#storage-status')).toContainText('已保存作答'); const latest = await raw(page); expect(latest).not.toBe(original);
  await page.evaluate(key => { window.__nativeTrialGet = Storage.prototype.getItem; Storage.prototype.getItem = function(k) { if (k === key) throw Error('read'); return window.__nativeTrialGet.call(this, k); }; }, TRIAL_KEY);
  await manage(page); await page.getByRole('button', { name: '重新讀取保存', exact: true }).click(); await expect(page.locator('#storage-status')).toContainText('無法讀取'); await expect(save(page)).toBeDisabled();
  await expect(page.locator('#reason')).toHaveValue('保存後新增'); expect(await page.evaluate(key => window.__nativeTrialGet.call(localStorage, key), TRIAL_KEY)).toBe(latest);
  await page.evaluate(() => Storage.prototype.getItem = window.__nativeTrialGet); await manage(page); confirm(page, true);
  await page.getByRole('button', { name: '重新讀取保存', exact: true }).click(); await expect(page.locator('#storage-status')).toContainText('已載入');
});

test('跨頁衝突不覆寫，重讀先確認；舊內容原檔可下載，清除也須確認', async ({ page, context }) => {
  await page.goto('/training.html'); const other = await context.newPage(); await other.goto('/training.html');
  await page.locator('#reason').fill('A'); await save(page).click(); await expect(page.locator('#storage-status')).toContainText('已保存作答');
  await expect(save(other)).toBeDisabled(); await manage(other); await other.getByRole('button', { name: '重新讀取保存', exact: true }).click();
  await other.locator('#reason').fill('B未存'); await page.locator('#reason').fill('A更新'); await save(page).click();
  await expect(save(other)).toBeDisabled(); await expect(other.locator('#reason')).toHaveValue('B未存');
  await manage(other); confirm(other, false); await other.getByRole('button', { name: '重新讀取保存', exact: true }).click(); await expect(other.locator('#reason')).toHaveValue('B未存');
  confirm(other, true); await other.getByRole('button', { name: '重新讀取保存', exact: true }).click(); await expect(other.locator('#reason')).toHaveValue('A更新');
  const old = JSON.parse(await raw(other)); old.report.contentRevision = '0'.repeat(64); const bad = JSON.stringify(old);
  await page.evaluate(({ key, raw }) => localStorage.setItem(key, raw), { key: TRIAL_KEY, raw: bad });
  await manage(other); confirm(other, true); await other.getByRole('button', { name: '重新讀取保存', exact: true }).click();
  await expect(other.locator('#storage-status')).toContainText('原檔已保留'); await expect(save(other)).toBeDisabled(); expect(await raw(other)).toBe(bad);
  await manage(other); const pending = other.waitForEvent('download'); await other.getByRole('button', { name: '匯出最後讀取的保存原檔', exact: true }).click();
  expect(await readFile(await (await pending).path(), 'utf8')).toBe(bad);
  confirm(other, false); await other.getByRole('button', { name: '清除本機保存（保留本頁）', exact: true }).click(); expect(await raw(other)).toBe(bad);
  confirm(other, true); await other.getByRole('button', { name: '清除本機保存（保留本頁）', exact: true }).click(); await expect(other.locator('#storage-status')).toContainText('已清除'); expect(await raw(other)).toBeNull();
  await expect(other.locator('#reason')).toHaveValue('A更新'); await other.setViewportSize({ width: 320, height: 844 });
  expect(await other.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
