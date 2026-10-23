import { test, expect } from '@playwright/test';
import { TRIAL_KEY, decodeTrialDraft, encodeTrialDraft } from '../../dist/training-draft.js';
import { trainingQuestions, trainingContentRevision } from '../../dist/training-data.js';

const raw = page => page.evaluate(key => localStorage.getItem(key), TRIAL_KEY);
const saved = async page => { const text = await raw(page); return text === null ? null : decodeTrialDraft(text); };
const status = page => page.locator('#storage-status');
const guarded = page => page.evaluate(() => { const event = new Event('beforeunload', { cancelable: true }); dispatchEvent(event); return event.defaultPrevented; });
// install() alone keeps time flowing; pause after load so runFor() is the only thing that moves the save timer.
const frozen = async page => { await page.clock.install({ time: new Date('2026-10-23T00:00:00Z') }); await page.goto('/training.html'); await page.clock.pauseAt(new Date('2026-10-23T00:00:05Z')); };
// Hold the trial lock until window.__releaseTrial() so a clear or save stays in flight while the player keeps working.
const holdLock = page => page.evaluate(key => {
  window.__nativeRequest ??= navigator.locks.request.bind(navigator.locks); window.__releaseTrial = undefined;
  navigator.locks.request = (name, options, callback) => window.__nativeRequest(name, options, async lock => {
    if (name === key) { await new Promise(resolve => window.__releaseTrial = resolve); navigator.locks.request = window.__nativeRequest; }
    return callback(lock);
  });
}, TRIAL_KEY);
const waitHeld = page => expect.poll(() => page.evaluate(() => typeof window.__releaseTrial)).toBe('function');
const manage = async page => { const panel = page.getByText('本機保存／備份', { exact: true }); if (!(await panel.evaluate(e => e.parentElement.open))) await panel.click(); };

test('理由停止輸入400ms後自存，注音組字中保存不重畫、不搶焦點；選項與揭示立即自存', async ({ page }) => {
  await frozen(page);
  const reason = page.locator('#reason'); await reason.evaluate(e => e.dataset.mark = 'same-field');
  await reason.fill('第一'); await page.clock.runFor(399);
  expect(await raw(page)).toBeNull(); await expect(status(page)).toHaveText('有修改，稍後自動保存…'); expect(await guarded(page)).toBe(true);
  await reason.press('End'); await reason.pressSequentially('句'); await page.clock.runFor(399); expect(await raw(page)).toBeNull();
  await page.clock.runFor(1); await expect.poll(async () => (await saved(page))?.report.questions[0].reason).toBe('第一句');
  await expect(status(page)).toContainText('已保存作答'); expect(await guarded(page)).toBe(false);
  // Chinese IME: a save during composition must not redraw the field; the committed text is the one kept.
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.imeSetComposition', { text: 'ㄘㄜˋ', selectionStart: 3, selectionEnd: 3 });
  await page.clock.runFor(400); await expect(status(page)).toContainText('已保存作答');
  await cdp.send('Input.insertText', { text: '測' }); await page.clock.runFor(400);
  await expect.poll(async () => (await saved(page))?.report.questions[0].reason).toBe('第一句測');
  await expect(page.locator('#reason[data-mark="same-field"]')).toBeFocused(); await expect(reason).toHaveValue('第一句測');
  await page.getByRole('checkbox').first().check(); await page.clock.runFor(1);
  await expect.poll(async () => (await saved(page))?.report.questions[0].selected.length).toBe(1);
  await expect(page.getByRole('checkbox').first()).toBeFocused();
  await page.getByRole('button', { name: '看答案與推導', exact: true }).click(); await expect(page.locator('#answer')).toBeFocused();
  await page.clock.runFor(1); await expect.poll(async () => (await saved(page))?.report.questions[0].status).toBe('submitted-and-revealed');
  await expect(page.locator('#answer')).toBeFocused();
});

test('只切題或刪到全空，存好前仍提醒；網址分類載入不寫入也不提醒，實際切題才保存新位置', async ({ page }) => {
  const seed = encodeTrialDraft({ schemaVersion: 1, questionId: 'E01', skill: 'all', report: {
    schemaVersion: 3, contentRevision: trainingContentRevision, rulesVersion: 'TW16-CLASSIC-v1', mode: 'L3-B0-content-trial', reasonAssessment: 'not-reviewed', guidanceMode: 'topic-guided',
    questions: trainingQuestions.map(q => ({ id: q.id, prompt: q.prompt, status: q.id === 'E01' ? 'draft' : 'unanswered', selected: [], reason: q.id === 'E01' ? '原檔理由' : '', feedback: '', exposure: 'unknown' })) } });
  await page.addInitScript(({ key, seed }) => { if (localStorage.getItem(key) === null) localStorage.setItem(key, seed); }, { key: TRIAL_KEY, seed });
  await page.goto('/training.html?skill=claim-cost'); await expect(status(page)).toContainText('已載入');
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('第 1 / 3 題 · 吃碰取捨');
  expect(await guarded(page)).toBe(false); expect(await raw(page)).toBe(seed);
  await page.getByRole('button', { name: '下一題', exact: true }).click();
  await expect.poll(async () => (await saved(page))?.questionId).toBe('C02');
  expect((await saved(page)).skill).toBe('claim-cost'); expect((await saved(page)).report.questions[0].reason).toBe('原檔理由');
  await expect(status(page)).toContainText('已保存作答'); expect(await guarded(page)).toBe(false);
  await page.locator('#reason').fill('暫時理由'); await expect.poll(async () => (await saved(page)).report.questions.find(q => q.id === 'C02').reason).toBe('暫時理由');
  await page.locator('#reason').fill(''); expect(await guarded(page)).toBe(true);
  await expect.poll(async () => (await saved(page)).report.questions.find(q => q.id === 'C02').status).toBe('unanswered');
  await expect(status(page)).toContainText('已保存作答'); expect(await guarded(page)).toBe(false);
  // Plain load with the same link after saving: nothing changed, so no write and no warning.
  const before = await raw(page); await page.goto('/training.html?skill=safety-scope'); await expect(status(page)).toContainText('已載入');
  expect(await guarded(page)).toBe(false); expect(await raw(page)).toBe(before);
});

test('清除等待中只切題／分類，完成後超過400ms仍無檔；等待中輸入理由則清除後保存最新內容', async ({ page }) => {
  await frozen(page); const clear = page.getByRole('button', { name: '清除本機保存（保留本頁）', exact: true });
  await page.getByRole('checkbox').first().check(); await page.clock.runFor(1); await expect(status(page)).toContainText('已保存作答');
  await manage(page); await holdLock(page); page.once('dialog', dialog => dialog.accept()); await clear.click(); await waitHeld(page);
  await page.getByRole('button', { name: '下一題', exact: true }).click();
  await page.getByRole('combobox', { name: '練習重點', exact: true }).selectOption('claim-cost'); await page.clock.runFor(1000);
  await page.evaluate(() => window.__releaseTrial()); await expect(status(page)).toContainText('已清除');
  await page.clock.runFor(1000); expect(await raw(page)).toBeNull();
  await page.getByRole('button', { name: '下一題', exact: true }).click(); await page.clock.runFor(1000); expect(await raw(page)).toBeNull();
  await page.getByRole('checkbox').first().check(); await page.clock.runFor(1); await expect.poll(async () => (await saved(page))?.questionId).toBe('C02');
  await manage(page); await holdLock(page); page.once('dialog', dialog => dialog.accept()); await clear.click(); await waitHeld(page);
  await page.locator('#reason').fill('清除等待時輸入'); await page.clock.runFor(100);
  await page.evaluate(() => window.__releaseTrial()); await expect.poll(() => raw(page)).toBeNull();
  await expect(status(page)).toHaveText('有修改，稍後自動保存…'); await page.clock.runFor(400);
  await expect.poll(async () => (await saved(page))?.report.questions.find(q => q.id === 'C02').reason).toBe('清除等待時輸入');
  await expect(page.locator('#reason')).toBeFocused(); expect(await guarded(page)).toBe(false);
});

test('保存等待中再輸入理由，保存失敗後超過400ms不再嘗試；新輸入才恢復', async ({ page }) => {
  await frozen(page);
  await page.evaluate(key => {
    window.__trialTries = 0; window.__failTrial = true; const native = Storage.prototype.setItem;
    Storage.prototype.setItem = function(k, v) { if (k === key) { window.__trialTries++; if (window.__failTrial) throw new DOMException('full', 'QuotaExceededError'); } return native.call(this, k, v); };
  }, TRIAL_KEY);
  await holdLock(page); await page.locator('#reason').fill('第一次'); await page.clock.runFor(400); await waitHeld(page);
  await page.locator('#reason').fill('等待時再改'); await page.clock.runFor(100);
  await page.evaluate(() => window.__releaseTrial()); await expect(status(page)).toContainText('保存未成功');
  expect(await page.evaluate(() => window.__trialTries)).toBe(1);
  await page.clock.runFor(2000); expect(await page.evaluate(() => window.__trialTries)).toBe(1);
  expect(await raw(page)).toBeNull(); expect(await guarded(page)).toBe(true); await expect(page.locator('#reason')).toHaveValue('等待時再改');
  await page.evaluate(() => window.__failTrial = false); await page.locator('#reason').fill('失敗後新輸入'); await page.clock.runFor(400);
  await expect.poll(async () => (await saved(page))?.report.questions[0].reason).toBe('失敗後新輸入'); expect(await guarded(page)).toBe(false);
});

test('清除時無法核對或原檔已被改即停止覆寫：恢復讀取後改理由／切題超過400ms仍不寫，確認重讀才恢復', async ({ page }) => {
  await frozen(page);
  const save = page.getByRole('button', { name: '保存作答到此瀏覽器', exact: true }), clear = page.getByRole('button', { name: '清除本機保存（保留本頁）', exact: true });
  const reread = page.getByRole('button', { name: '重新讀取保存', exact: true }), sets = () => page.evaluate(() => window.__trialSets);
  await page.locator('#reason').fill('原檔理由'); await save.click(); await expect(status(page)).toContainText('已保存作答'); const original = await raw(page);
  await page.evaluate(key => {
    window.__trialSets = 0; const nativeSet = Storage.prototype.setItem, nativeGet = Storage.prototype.getItem;
    Storage.prototype.setItem = function(k, v) { if (k === key) window.__trialSets++; return nativeSet.call(this, k, v); };
    Storage.prototype.getItem = function(k) { if (k === key && window.__failRead) throw Error('read'); return nativeGet.call(this, k); };
    window.__failRead = true;
  }, TRIAL_KEY);
  await manage(page); page.once('dialog', dialog => dialog.accept()); await clear.click();
  await expect(status(page)).toContainText('停止覆寫'); await page.evaluate(() => window.__failRead = false);
  await page.locator('#reason').fill('清除失敗後新理由'); await page.getByRole('button', { name: '下一題', exact: true }).click();
  await page.getByRole('button', { name: '上一題', exact: true }).click(); await page.clock.runFor(1000);
  expect(await sets()).toBe(0); expect(await raw(page)).toBe(original); await expect(save).toBeDisabled(); expect(await guarded(page)).toBe(true);
  await expect(page.locator('#reason')).toHaveValue('清除失敗後新理由');
  await manage(page); page.once('dialog', dialog => dialog.accept()); await reread.click();
  await expect(status(page)).toContainText('已載入'); await expect(page.locator('#reason')).toHaveValue('原檔理由'); await expect(save).toBeEnabled();
  await page.locator('#reason').fill('重讀後修改'); await page.clock.runFor(400);
  await expect.poll(async () => (await saved(page))?.report.questions[0].reason).toBe('重讀後修改');
  const foreignDraft = await saved(page); foreignDraft.report.questions[0].reason = '他頁理由'; const foreign = encodeTrialDraft(foreignDraft);
  await page.evaluate(({ key, foreign }) => { localStorage.setItem(key, foreign); window.__trialSets = 0; }, { key: TRIAL_KEY, foreign });
  await manage(page); page.once('dialog', dialog => dialog.accept()); await clear.click(); await expect(status(page)).toContainText('停止覆寫');
  await page.locator('#reason').fill('衝突後新理由'); await page.getByRole('button', { name: '下一題', exact: true }).click(); await page.clock.runFor(1000);
  expect(await sets()).toBe(0); expect(await raw(page)).toBe(foreign); await expect(save).toBeDisabled(); expect(await guarded(page)).toBe(true);
  await manage(page); page.once('dialog', dialog => dialog.accept()); await reread.click(); await expect(page.locator('#reason')).toHaveValue('他頁理由'); await expect(save).toBeEnabled();
});

test('配額失敗停止本次保存，時間推進不自我重試；按鈕或下一次修改才重試', async ({ page }) => {
  await frozen(page);
  await page.evaluate(key => {
    window.__trialTries = 0; window.__nativeSet = Storage.prototype.setItem;
    Storage.prototype.setItem = function(k, v) { if (k === key) { window.__trialTries++; throw new DOMException('full', 'QuotaExceededError'); } return window.__nativeSet.call(this, k, v); };
  }, TRIAL_KEY);
  await page.locator('#reason').fill('配額失敗'); await page.clock.runFor(400);
  await expect(status(page)).toContainText('保存未成功'); expect(await page.evaluate(() => window.__trialTries)).toBe(1);
  await page.clock.runFor(10000); expect(await page.evaluate(() => window.__trialTries)).toBe(1);
  await expect(status(page)).toContainText('保存未成功'); expect(await guarded(page)).toBe(true); expect(await raw(page)).toBeNull();
  await page.locator('#reason').fill('配額失敗再改'); await page.clock.runFor(400);
  await expect.poll(() => page.evaluate(() => window.__trialTries)).toBe(2); await page.clock.runFor(10000); expect(await page.evaluate(() => window.__trialTries)).toBe(2);
  await page.evaluate(() => Storage.prototype.setItem = window.__nativeSet);
  const save = page.getByRole('button', { name: '保存作答到此瀏覽器', exact: true }); await expect(save).toBeEnabled(); await save.click();
  await expect(status(page)).toContainText('已保存作答'); expect((await saved(page)).report.questions[0].reason).toBe('配額失敗再改'); expect(await guarded(page)).toBe(false);
});

test('取消清除保留待存；確認清除後切題、分類與返回快取都不重建，勾選作答才恢復自存', async ({ page }) => {
  await frozen(page);
  await page.locator('#reason').fill('已存'); await page.clock.runFor(400); await expect(status(page)).toContainText('已保存作答');
  await page.locator('#reason').fill('清除前'); await manage(page);
  page.once('dialog', dialog => dialog.dismiss()); await page.getByRole('button', { name: '清除本機保存（保留本頁）', exact: true }).click();
  expect((await saved(page)).report.questions[0].reason).toBe('已存');
  await page.clock.runFor(400); await expect.poll(async () => (await saved(page))?.report.questions[0].reason).toBe('清除前');
  page.once('dialog', dialog => dialog.accept()); await page.getByRole('button', { name: '清除本機保存（保留本頁）', exact: true }).click();
  await expect(status(page)).toContainText('已清除'); expect(await raw(page)).toBeNull(); expect(await guarded(page)).toBe(true);
  await page.getByRole('button', { name: '下一題', exact: true }).click();
  await page.getByRole('combobox', { name: '練習重點', exact: true }).selectOption('claim-cost');
  await page.evaluate(() => dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
  await page.clock.runFor(5000); expect(await raw(page)).toBeNull(); await expect(status(page)).toContainText('已清除');
  await page.getByRole('checkbox').first().check(); await page.clock.runFor(1);
  await expect.poll(async () => (await saved(page))?.questionId).toBe('C01');
  expect((await saved(page)).report.questions[0].reason).toBe('清除前'); await expect(status(page)).toContainText('已保存作答');
});
