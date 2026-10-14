import { test, expect } from '@playwright/test';
import { createBrowserFixtures } from '../../scripts/browser-fixtures.mjs';
import { createPractice, PRACTICE_KEY } from '../../dist/practice.js';
import { LEARN_KEY } from '../../dist/learning-progress.js';

const otherSaves = {
  'tw16:TW16-CLASSIC-v1:save': JSON.stringify(createBrowserFixtures().find(s => s.name === 'feedbackReady').session),
  [PRACTICE_KEY]: JSON.stringify(createPractice(20261014)),
  'tw16:review:v2': '{"schemaVersion":2,"records":[]}',
};
const course = page => page.evaluate(key => JSON.parse(localStorage.getItem(key)), LEARN_KEY);
async function seededPage(page) {
  await page.addInitScript(data => { for (const [k, v] of Object.entries(data)) if (localStorage.getItem(k) === null) localStorage.setItem(k, v); }, otherSaves);
  await page.goto('/learn.html');
}
async function recognition(page, transfer) {
  await page.getByRole('button', { name: transfer ? '換例自己試' : '我讀完了，開始示範', exact: true }).click();
  await page.getByRole('button', { name: transfer ? '選四筒' : '選六條', exact: true }).click();
  await page.getByRole('button', { name: transfer ? '下家（右側）' : '上家（左側）', exact: true }).click();
  await page.getByRole('button', { name: '不可以，字牌沒有連號順子', exact: true }).click();
}
async function round(page, transfer, recap = false) {
  await page.getByRole('button', { name: transfer ? '換例自己試' : '我讀完了，開始示範', exact: true }).click();
  if (recap) await page.getByText('回看圖解（本次會列提示下完成）', { exact: true }).click();
  await page.getByRole('button', { name: transfer ? '上家' : '下家', exact: true }).click();
  await page.getByRole('button', { name: '摸一張', exact: true }).click();
  await expect(page.locator('#lesson')).toContainText('一般手牌 16 張 · 花 1 張');
  await page.getByRole('button', { name: '補花', exact: true }).click();
  await expect(page.locator('#lesson')).toContainText('一般手牌 17 張');
  const hand = page.getByRole('group', { name: '教學手牌' });
  await hand.getByRole('button').first().focus(); await page.keyboard.press('Enter');
  await expect(page.locator('#lesson')).toContainText('一般手牌 16 張');
  await page.getByRole('button', { name: '下家', exact: true }).click();
}
async function select(page, ids) { for (const id of ids) await page.locator(`#lesson [data-tile="${id}"]`).click(); }
async function composition(page, transfer) {
  await page.getByRole('button', { name: transfer ? '換例自己試' : '我讀完了，開始示範', exact: true }).click();
  const sets = transfer ? [['1s#0','1s#1','1s#2','1s#3'], ['2m#0','3m#0','4m#0'], ['6p#0','7p#0','8p#0'], ['4z#0','4z#1','4z#2'], ['6z#0','6z#1','6z#2']] : [['1m#0','2m#0','3m#0'], ['4m#0','5m#0','6m#0'], ['1p#0','2p#0','3p#0'], ['7p#0','8p#0','9p#0'], ['5s#0','5s#1','5s#2']];
  for (const ids of sets) { await select(page, ids); await page.getByRole('button', { name: '收成一組', exact: true }).click(); }
  await select(page, transfer ? ['9m#0','9m#1'] : ['7z#0','7z#1']);
  await page.getByRole('button', { name: '留作眼睛', exact: true }).click();
  await page.getByRole('button', { name: /^示例B/ }).click();
}

test('三課示範與換例、含槓組牌、提示標記、重載與舊檔隔離', async ({ page }) => {
  await seededPage(page);
  await recognition(page, false); await recognition(page, true);
  await page.getByRole('button', { name: '2. 摸牌、補花與打牌', exact: true }).click();
  await round(page, false); await round(page, true);
  await page.setViewportSize({ width: 320, height: 844 });
  await page.getByRole('button', { name: '3. 五組牌加一對眼睛', exact: true }).click();
  await composition(page, false); await composition(page, true);
  await expect.poll(async () => (await course(page))?.lessons).toEqual(Array.from({ length: 3 }, () => ({ read: true, guided: true, independent: true })));
  await page.reload();
  expect((await course(page)).lessons.every(p => p.independent)).toBe(true);
  await expect(page.locator('#learning-progress')).toContainText('第3課：已閱讀 ✓');
  expect(await page.evaluate(keys => Object.fromEntries(keys.map(k => [k, localStorage.getItem(k)])), Object.keys(otherSaves))).toEqual(otherSaves);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  page.once('dialog', d => d.accept());
  await page.getByRole('button', { name: '重新建立新手進度', exact: true }).click();
  await expect.poll(async () => (await course(page)).lessons.every(p => !p.read)).toBe(true);
  await page.getByRole('button', { name: '換例自己試', exact: true }).click();
  await page.getByRole('button', { name: '看提示', exact: true }).click();
  await page.getByRole('button', { name: '選四筒', exact: true }).click();
  await page.getByRole('button', { name: '下家（右側）', exact: true }).click();
  await page.getByRole('button', { name: '不可以，字牌沒有連號順子', exact: true }).click();
  await expect.poll(async () => (await course(page)).lessons[0]).toEqual({ read: true, guided: true, independent: false });
  await page.getByRole('button', { name: '2. 摸牌、補花與打牌', exact: true }).click();
  await round(page, true, true);
  await expect.poll(async () => (await course(page)).lessons[1]).toEqual({ read: true, guided: true, independent: false });
});

test('保存失敗保留本頁、重試；壞檔清除要確認，跨頁更新不覆蓋', async ({ page, context }) => {
  await page.addInitScript(key => {
    window.__failLearningWrite = true; const set = Storage.prototype.setItem;
    Storage.prototype.setItem = function(k, v) { if (k === key && window.__failLearningWrite) throw new DOMException('Test quota', 'QuotaExceededError'); return set.call(this, k, v); };
  }, LEARN_KEY);
  await seededPage(page); await recognition(page, false);
  await expect(page.locator('#save-notice')).toContainText('未能保存');
  expect(await course(page)).toBeNull();
  await expect(page.locator('#learning-progress')).toContainText('提示下完成 ✓');
  const warningPending = page.waitForEvent('dialog');
  const reload = page.evaluate(() => location.reload());
  const warning = await warningPending; expect(warning.type()).toBe('beforeunload'); await warning.dismiss(); await reload;
  await expect(page.locator('#learning-progress')).toContainText('提示下完成 ✓');
  await page.evaluate(() => window.__failLearningWrite = false);
  await page.getByRole('button', { name: '重試保存進度', exact: true }).click();
  await expect.poll(async () => (await course(page))?.lessons[0].guided).toBe(true);
  await page.evaluate(key => {
    window.__pauseLearningLock = true; const request = navigator.locks.request.bind(navigator.locks);
    navigator.locks.request = (name, options, callback) => request(name, options, async lock => {
      if (name === key && window.__pauseLearningLock) await new Promise(resolve => window.__releaseLearningLock = resolve);
      return callback(lock);
    });
  }, LEARN_KEY);
  page.once('dialog', d => d.accept()); await page.getByRole('button', { name: '重新建立新手進度', exact: true }).click();
  await expect(page.getByRole('button', { name: '1. 認牌與桌面', exact: true })).toBeDisabled();
  await expect.poll(async () => page.evaluate(() => typeof window.__releaseLearningLock)).toBe('function');
  await page.evaluate(() => { window.__pauseLearningLock = false; window.__releaseLearningLock(); });
  await expect.poll(async () => (await course(page)).lessons.every(p => !p.read)).toBe(true);
  await expect(page.getByRole('button', { name: '1. 認牌與桌面', exact: true })).toBeEnabled();
  const second = await context.newPage(); await seededPage(second);
  await page.getByRole('button', { name: '2. 摸牌、補花與打牌', exact: true }).click();
  await page.getByRole('button', { name: '我讀完了，開始示範', exact: true }).click();
  await expect(second.locator('#save-notice')).toContainText('另一頁');
  const fresh = await course(page);
  await second.getByRole('button', { name: '3. 五組牌加一對眼睛', exact: true }).click();
  await second.getByRole('button', { name: '換例自己試', exact: true }).click();
  expect(await course(second)).toEqual(fresh);
  await expect(second.getByRole('button', { name: '重試保存進度', exact: true })).toBeDisabled();
  second.once('dialog', d => d.dismiss()); await second.getByRole('button', { name: '重新讀取保存紀錄', exact: true }).click();
  await expect(second.locator('#learning-progress')).toContainText('第3課：已閱讀 ✓');
  second.once('dialog', d => d.accept()); await second.getByRole('button', { name: '重新讀取保存紀錄', exact: true }).click();
  await expect(second.locator('#learning-progress')).toContainText('第3課：已閱讀 —');
  await second.close();
  const broken = '{"schemaVersion":999}';
  await page.evaluate(({ key, broken }) => localStorage.setItem(key, broken), { key: LEARN_KEY, broken });
  await page.reload();
  await expect(page.locator('#save-notice')).toContainText('原檔已保留');
  page.once('dialog', d => d.dismiss()); await page.getByRole('button', { name: '重新建立新手進度', exact: true }).click();
  expect(await page.evaluate(key => localStorage.getItem(key), LEARN_KEY)).toBe(broken);
  await page.evaluate(() => window.__failLearningWrite = false);
  page.once('dialog', d => d.accept()); await page.getByRole('button', { name: '重新建立新手進度', exact: true }).click();
  await expect.poll(async () => (await course(page))?.lessons?.every(p => !p.read)).toBe(true);
  expect(await page.evaluate(keys => Object.fromEntries(keys.map(k => [k, localStorage.getItem(k)])), Object.keys(otherSaves))).toEqual(otherSaves);
  const unreadable = await context.newPage();
  await unreadable.addInitScript(key => {
    const get = Storage.prototype.getItem;
    Storage.prototype.getItem = function(k) { if (k === key) throw new DOMException('Test read failure', 'SecurityError'); return get.call(this, k); };
  }, LEARN_KEY);
  await unreadable.goto('/learn.html');
  await expect(unreadable.locator('#save-notice')).toContainText('無法讀取');
  await expect(unreadable.getByRole('button', { name: '重新建立新手進度', exact: true })).toBeDisabled();
  await unreadable.getByRole('button', { name: '我讀完了，開始示範', exact: true }).click();
  await expect(unreadable.getByRole('button', { name: '重試保存進度', exact: true })).toBeDisabled();
  expect((await course(page)).lessons.every(p => !p.read)).toBe(true);
  await unreadable.close();
});
