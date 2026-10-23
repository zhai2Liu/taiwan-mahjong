import { test, expect } from '@playwright/test';
import { TRIAL_KEY, decodeTrialDraft, encodeTrialDraft } from '../../dist/training-draft.js';
import { trainingQuestions, trainingContentRevision } from '../../dist/training-data.js';

const raw = page => page.evaluate(key => localStorage.getItem(key), TRIAL_KEY);
const saved = async page => { const text = await raw(page); return text === null ? null : decodeTrialDraft(text); };
const status = page => page.locator('#storage-status');
const guarded = page => page.evaluate(() => { const event = new Event('beforeunload', { cancelable: true }); dispatchEvent(event); return event.defaultPrevented; });
const holdLock = page => page.evaluate(key => {
  window.__nativeRequest ??= navigator.locks.request.bind(navigator.locks); window.__releaseTrial = undefined;
  navigator.locks.request = (name, options, callback) => window.__nativeRequest(name, options, async lock => {
    if (name === key) { await new Promise(resolve => window.__releaseTrial = resolve); navigator.locks.request = window.__nativeRequest; }
    return callback(lock);
  });
}, TRIAL_KEY);
const waitHeld = page => expect.poll(() => page.evaluate(() => typeof window.__releaseTrial)).toBe('function');
const manage = async page => { const panel = page.getByText('本機保存／備份', { exact: true }); if (!(await panel.evaluate(e => e.parentElement.open))) await panel.click(); };
const retry = page => page.getByRole('button', { name: '重練本題', exact: true });
const reveal = page => page.getByRole('button', { name: '看答案與推導', exact: true });
const next = page => page.getByRole('button', { name: '下一題', exact: true });
const CONFIRM = '重練會清空本題的選項與理由，並收起答案；其他題保留。確定重練？';
const markers = { 'tw16:TW16-CLASSIC-v1:save': 'game-marker', 'tw16:practice:v1': 'practice-marker', 'tw16:learn:v1': 'learning-marker' };

// Nine mixed rows: E01 revealed correct, the next two revealed wrong, one draft; every row has a non-default legacy feedback and the three exposures rotate.
const exposures = ['seen', 'unseen-self-report', 'unknown'];
const wrongPick = q => { const off = q.choices.filter(c => !q.accepted.includes(c.id)); return off.length ? off.slice(0, 1) : q.choices.slice(0, 1); };
const original = trainingQuestions.map((q, i) => ({ id: q.id, prompt: q.prompt, feedback: `舊回饋${i} <i>原樣</i>`, exposure: exposures[i % 3],
  ...(i === 0 ? { status: 'submitted-and-revealed', selected: q.choices.filter(c => q.accepted.includes(c.id)), reason: '正解理由' }
    : i < 3 ? { status: 'submitted-and-revealed', selected: wrongPick(q), reason: `錯解理由${i}` }
    : i === 3 ? { status: 'draft', selected: q.choices.slice(0, 1), reason: '草稿理由' } : { status: 'unanswered', selected: [], reason: '' }) }));
const seed = encodeTrialDraft({ schemaVersion: 1, questionId: 'E01', skill: 'all', report: { schemaVersion: 3, contentRevision: trainingContentRevision, rulesVersion: 'TW16-CLASSIC-v1',
  mode: 'L3-B0-content-trial', reasonAssessment: 'not-reviewed', guidanceMode: 'topic-guided', questions: original } });
const reset = i => ({ ...original[i], status: 'unanswered', selected: [], reason: '' });
// Seed only into empty storage so a reload reads what the page saved; pause the clock after load so runFor() alone moves save timers.
const open = async page => {
  await page.addInitScript(({ key, seed, markers }) => {
    for (const [k, v] of Object.entries({ ...markers, [key]: seed })) if (localStorage.getItem(k) === null) localStorage.setItem(k, v);
  }, { key: TRIAL_KEY, seed, markers });
  await page.clock.install({ time: new Date('2026-10-23T00:00:00Z') }); await page.goto('/training.html'); await page.clock.pauseAt(new Date('2026-10-23T00:00:05Z'));
  await expect(status(page)).toContainText('已載入');
};

test('正確與錯誤揭示題可重練：取消保持內容與焦點；確認只重置本題並回選項焦點，空選不能揭示，重載與備份保全全部九題', async ({ page }) => {
  await open(page);
  await expect(page.locator('#answer')).toHaveText('答對了'); await expect(retry(page)).toHaveAttribute('type', 'button');
  await expect(page.getByText('同題複習，不保留歷次作答。', { exact: true })).toBeVisible();
  await expect(page.getByText('本頁目前保留的揭示進度：3 / 9 題；不是成績。', { exact: true })).toBeVisible();
  // Cancel by keyboard: Enter opens the native confirm; dismissing is the browser's cancel/Escape path.
  await retry(page).evaluate(e => e.dataset.mark = 'same'); await retry(page).focus();
  let message; page.once('dialog', dialog => { message = dialog.message(); dialog.dismiss(); }); await page.keyboard.press('Enter');
  await expect.poll(() => message).toBe(CONFIRM);
  await expect(page.locator('button[data-mark="same"]')).toBeFocused(); await page.clock.runFor(2000);
  expect(await raw(page)).toBe(seed); expect(await guarded(page)).toBe(false);
  for (const box of await page.getByRole('checkbox').all()) await expect(box).toBeDisabled();
  await expect(page.locator('#reason')).toHaveValue('正解理由');
  page.once('dialog', dialog => dialog.accept()); await retry(page).click();
  await expect(page.locator('#answer')).toHaveCount(0); await expect(retry(page)).toHaveCount(0);
  const first = page.getByRole('checkbox').first(); await expect(first).toBeFocused(); await expect(first).toBeInViewport(); await expect(first).not.toBeChecked();
  for (const box of await page.getByRole('checkbox').all()) { await expect(box).toBeEnabled(); await expect(box).not.toBeChecked(); }
  await expect(page.locator('#reason')).toHaveValue(''); await expect(page.locator('#reason')).toBeEditable();
  await page.clock.runFor(1); await expect.poll(async () => (await saved(page)).report.questions[0].status).toBe('unanswered');
  expect((await saved(page)).report.questions).toEqual([reset(0), ...original.slice(1)]); expect(await guarded(page)).toBe(false);
  await reveal(page).click(); await expect(page.getByText('請先選擇至少一項，再看答案。', { exact: true })).toBeVisible(); await expect(page.locator('#answer')).toHaveCount(0);
  await first.check(); await reveal(page).click(); await expect(page.locator('#answer')).toBeFocused(); await expect(retry(page)).toBeVisible();
  await page.clock.runFor(1); await expect.poll(async () => (await saved(page)).report.questions[0].status).toBe('submitted-and-revealed');
  await next(page).click(); await expect(page.locator('#answer')).toHaveText('還有選項要確認');
  page.once('dialog', dialog => dialog.accept()); await retry(page).click();
  await expect(page.getByRole('checkbox').first()).toBeFocused(); await expect(page.locator('#answer')).toHaveCount(0);
  await page.clock.runFor(1); await expect.poll(async () => (await saved(page)).report.questions[1].status).toBe('unanswered');
  const rows = (await saved(page)).report.questions;
  expect(rows[1]).toEqual(reset(1)); expect(rows.slice(2)).toEqual(original.slice(2));
  expect(rows.map(r => [r.feedback, r.exposure])).toEqual(original.map(r => [r.feedback, r.exposure]));
  await expect(page.getByText('本頁目前保留的揭示進度：2 / 9 題；不是成績。', { exact: true })).toBeVisible();
  await manage(page); await page.getByRole('button', { name: '下載本頁作答備份', exact: true }).click();
  const backup = JSON.parse(await page.locator('#backup-preview').inputValue());
  expect(backup.questions.map(r => [r.status, r.feedback, r.exposure])).toEqual(rows.map(r => [r.status, r.feedback, r.exposure]));
  const before = await raw(page); await page.reload(); await expect(status(page)).toContainText('已載入');
  expect(await raw(page)).toBe(before); expect(decodeTrialDraft(before).questionId).toBe(trainingQuestions[1].id);
  await expect(page.locator('#answer')).toHaveCount(0); await expect(page.getByRole('checkbox').first()).toBeEnabled();
  for (const [key, value] of Object.entries(markers)) expect(await page.evaluate(k => localStorage.getItem(k), key)).toBe(value);
});

test('保存等待中重練再修改，最後保存最新完整快照；明確清除中禁用重練，清除後重練恢復自存', async ({ page }) => {
  await open(page);
  await holdLock(page); await next(page).click(); await page.clock.runFor(1); await waitHeld(page);
  await page.getByRole('button', { name: '上一題', exact: true }).click(); await expect(retry(page)).toBeEnabled();
  page.once('dialog', dialog => dialog.accept()); await retry(page).click(); await page.clock.runFor(1);
  await page.getByRole('checkbox').first().check(); await page.locator('#reason').fill('重練新理由'); await page.clock.runFor(400);
  expect(await raw(page)).toBe(seed);
  await page.evaluate(() => window.__releaseTrial());
  await expect.poll(async () => (await saved(page)).report.questions[0].reason).toBe('重練新理由');
  const latest = await saved(page); expect(latest.questionId).toBe('E01');
  expect(latest.report.questions).toEqual([{ ...original[0], status: 'draft', selected: [trainingQuestions[0].choices[0]], reason: '重練新理由' }, ...original.slice(1)]);
  await expect(status(page)).toContainText('已保存作答'); expect(await guarded(page)).toBe(false);
  await reveal(page).click(); await page.clock.runFor(1); await expect.poll(async () => (await saved(page)).report.questions[0].status).toBe('submitted-and-revealed');
  await manage(page); await holdLock(page); page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: '清除本機保存（保留本頁）', exact: true }).click(); await waitHeld(page);
  await expect(retry(page)).toBeDisabled();
  await page.evaluate(() => window.__releaseTrial()); await expect(status(page)).toContainText('已清除'); await expect(retry(page)).toBeEnabled();
  await page.clock.runFor(1000); expect(await raw(page)).toBeNull();
  page.once('dialog', dialog => dialog.accept()); await retry(page).click(); await page.clock.runFor(1);
  await expect.poll(async () => (await saved(page))?.report.questions[0].status).toBe('unanswered');
  expect((await saved(page)).report.questions[0].feedback).toBe(original[0].feedback); expect(await guarded(page)).toBe(false);
});

test('配額失敗、缺鎖或原檔衝突時仍可重練：原檔不被覆寫、停寫與離頁保護不變', async ({ page }) => {
  await open(page);
  await page.evaluate(key => {
    window.__nativeSet = Storage.prototype.setItem;
    Storage.prototype.setItem = function(k, v) { if (k === key) throw new DOMException('full', 'QuotaExceededError'); return window.__nativeSet.call(this, k, v); };
  }, TRIAL_KEY);
  page.once('dialog', dialog => dialog.accept()); await retry(page).click(); await page.clock.runFor(1);
  await expect(status(page)).toContainText('保存未成功'); expect(await raw(page)).toBe(seed); expect(await guarded(page)).toBe(true);
  await expect(page.getByRole('checkbox').first()).toBeFocused(); await expect(page.getByRole('checkbox').first()).toBeEnabled();
  await page.evaluate(() => { Storage.prototype.setItem = window.__nativeSet; Object.defineProperty(navigator, 'locks', { value: undefined, configurable: true }); });
  await next(page).click(); page.once('dialog', dialog => dialog.accept()); await retry(page).click(); await page.clock.runFor(1000);
  await expect(status(page)).toContainText('保存未成功'); expect(await raw(page)).toBe(seed); expect(await guarded(page)).toBe(true);
  await expect(page.getByRole('checkbox').first()).toBeEnabled();
  await page.evaluate(() => delete navigator.locks);
  const foreignDraft = decodeTrialDraft(seed); foreignDraft.report.questions[8].reason = '他頁理由'; foreignDraft.report.questions[8].status = 'draft';
  const foreign = encodeTrialDraft(foreignDraft); await page.evaluate(({ key, foreign }) => localStorage.setItem(key, foreign), { key: TRIAL_KEY, foreign });
  await next(page).click(); page.once('dialog', dialog => dialog.accept()); await retry(page).click(); await page.clock.runFor(1);
  await expect(status(page)).toContainText('停止覆寫'); expect(await raw(page)).toBe(foreign);
  await expect(page.getByRole('button', { name: '保存作答到此瀏覽器', exact: true })).toBeDisabled(); expect(await guarded(page)).toBe(true);
  await page.getByRole('checkbox').first().check(); await page.locator('#reason').fill('衝突後新理由'); await page.clock.runFor(1000);
  expect(await raw(page)).toBe(foreign); expect(await guarded(page)).toBe(true);
});
