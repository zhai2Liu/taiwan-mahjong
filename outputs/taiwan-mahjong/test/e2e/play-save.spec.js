import { test, expect } from '@playwright/test';
import { createBrowserFixtures } from '../../scripts/browser-fixtures.mjs';
import { encodeSession, decodeSession } from '../../dist/session.js';
import { createPractice, encodePractice, decodePractice, PRACTICE_KEY } from '../../dist/practice.js';
import { REVIEW_KEY, readReviewArchive } from '../../dist/review-store.js';

const gameKey = 'tw16:TW16-CLASSIC-v1:save';
const initial = createBrowserFixtures().find(s => s.name === 'feedbackReady').session;
const originalGame = encodeSession(initial), originalPractice = encodePractice(createPractice(1234));
const markers = { 'tw16:learn:v1': 'untouched-learning-marker', 'tw16:trial:v1': 'untouched-trial-marker' };
const raw = (page, key) => page.evaluate(key => localStorage.getItem(key), key);
const guarded = page => page.evaluate(() => { const event = new Event('beforeunload', { cancelable: true }); window.dispatchEvent(event); return event.defaultPrevented; });

test('對戰與練習的「選擇玩法」整頁回首頁仍可續原局；保存失敗時取消離頁留在原局，重試後才順利離開', async ({ page }) => {
  await page.addInitScript(({ gameKey, originalGame, practiceKey, originalPractice }) => {
    for (const [k, value] of Object.entries({ [gameKey]: originalGame, [practiceKey]: originalPractice })) if (localStorage.getItem(k) === null) localStorage.setItem(k, value);
    localStorage.setItem('tw16:coach:v1', 'off'); window.__failPlayWrite = false;
    const set = Storage.prototype.setItem;
    Storage.prototype.setItem = function(k, v) { if (k === gameKey && window.__failPlayWrite) throw new DOMException('Synthetic quota', 'QuotaExceededError'); return set.call(this, k, v); };
  }, { gameKey, originalGame, practiceKey: PRACTICE_KEY, originalPractice });
  await page.goto('/');
  await page.clock.install({ time: new Date('2026-10-22T00:00:00Z') }); await page.clock.pauseAt(new Date('2026-10-22T00:00:01Z'));
  const hand = page.getByRole('group', { name: '選擇要打出的手牌', exact: true }), choose = page.getByRole('link', { name: '選擇玩法', exact: true });
  const resume = page.getByRole('button', { name: '繼續上次牌局', exact: true });
  await resume.click(); await expect(hand).toBeVisible();
  await expect(choose).toHaveAttribute('href', './');
  await choose.click(); await expect(resume).toBeVisible();
  expect(await raw(page, gameKey)).toBe(originalGame);
  await resume.click(); await expect(hand.getByRole('button')).toHaveCount(17);
  // Practice keeps "返回對戰" and adds the same home route; both saves survive.
  await page.getByRole('button', { name: '練習', exact: true }).click();
  await page.getByRole('button', { name: '繼續上次練習', exact: true }).click();
  await expect(page.getByRole('button', { name: '返回對戰', exact: true })).toBeVisible();
  await choose.click(); await expect(resume).toBeVisible();
  expect(await raw(page, PRACTICE_KEY)).toBe(originalPractice);
  expect(decodeSession(await raw(page, gameKey)).game.version).toBe(initial.game.version);
  await page.getByRole('button', { name: '純練習模式', exact: true }).click();
  await expect(page.getByRole('button', { name: '繼續上次練習', exact: true })).toBeVisible();
  await expect(choose).toHaveCount(0); // without a game the existing "返回首頁" is the home route
  await page.getByRole('button', { name: '返回首頁', exact: true }).click();
  // A failed save keeps the native leave warning on the home route; cancelling stays on the same table.
  await resume.click(); const before = await raw(page, gameKey);
  await page.evaluate(() => window.__failPlayWrite = true);
  await hand.getByRole('button').first().focus(); await page.keyboard.press('Enter');
  const retry = page.getByRole('button', { name: '重試儲存', exact: true });
  await expect(retry).toBeVisible(); await expect(hand.getByRole('button')).toHaveCount(16);
  const pending = page.waitForEvent('dialog'), leaving = choose.click({ noWaitAfter: true });
  const warning = await pending; expect(warning.type()).toBe('beforeunload'); await warning.dismiss(); await leaving;
  await expect(hand.getByRole('button')).toHaveCount(16); await expect(retry).toBeVisible();
  expect(await raw(page, gameKey)).toBe(before);
  await page.evaluate(() => window.__failPlayWrite = false); await retry.click();
  await expect.poll(() => guarded(page)).toBe(false);
  const unexpected = []; page.on('dialog', dialog => { unexpected.push(dialog.type()); void dialog.dismiss(); });
  await choose.click(); await expect(resume).toBeVisible(); expect(unexpected).toEqual([]);
  await resume.click(); await expect(hand.getByRole('button')).toHaveCount(16);
  expect(decodeSession(await raw(page, gameKey)).game.version).toBe(initial.game.version + 1);
});

for (const mode of ['game', 'practice', 'review']) test(`${mode}未存進度可取消重載，重試成功才解除離頁提醒`, async ({ page }) => {
  const key = mode === 'game' ? gameKey : mode === 'practice' ? PRACTICE_KEY : REVIEW_KEY;
  await page.addInitScript(({ gameKey, originalGame, practiceKey, originalPractice, key, markers }) => {
    for (const [k, value] of Object.entries({ [gameKey]: originalGame, [practiceKey]: originalPractice, ...markers })) if (localStorage.getItem(k) === null) localStorage.setItem(k, value);
    localStorage.setItem('tw16:coach:v1', 'off'); window.__failPlayWrite = false;
    const set = Storage.prototype.setItem;
    Storage.prototype.setItem = function(k, v) { if (k === key && window.__failPlayWrite) throw new DOMException('Synthetic quota', 'QuotaExceededError'); return set.call(this, k, v); };
  }, { gameKey, originalGame, practiceKey: PRACTICE_KEY, originalPractice, key, markers });
  await page.goto('/');
  await page.clock.install({ time: new Date('2026-10-17T00:00:00Z') }); await page.clock.pauseAt(new Date('2026-10-17T00:00:01Z'));
  expect(await guarded(page)).toBe(false);
  if (mode === 'practice') { await page.getByRole('button', { name: '純練習模式', exact: true }).click(); await page.getByRole('button', { name: '繼續上次練習', exact: true }).click(); }
  else await page.getByRole('button', { name: '繼續上次牌局', exact: true }).click();
  const before = await raw(page, key);
  await page.evaluate(() => window.__failPlayWrite = true);
  const hand = page.getByRole('group', { name: mode === 'practice' ? '練習手牌' : '選擇要打出的手牌', exact: true });
  await hand.getByRole('button').first().focus(); await page.keyboard.press('Enter');
  const retry = page.getByRole('button', { name: mode === 'review' ? '重試檢討保存' : '重試儲存', exact: true });
  await expect(retry).toBeVisible(); await expect(retry).toBeEnabled();
  await expect(hand.getByRole('button')).toHaveCount(16);
  expect(await raw(page, key)).toBe(before); expect(await guarded(page)).toBe(true);
  const pending = page.waitForEvent('dialog'), reload = page.evaluate(() => location.reload());
  const warning = await pending; expect(warning.type()).toBe('beforeunload'); await warning.dismiss(); await reload;
  await expect(hand.getByRole('button')).toHaveCount(16); expect(await raw(page, key)).toBe(before);
  await page.evaluate(() => window.__failPlayWrite = false); await retry.click();
  await expect.poll(() => guarded(page)).toBe(false);
  const stored = await raw(page, key); expect(stored).not.toBe(before);
  if (mode === 'practice') { const p = decodePractice(stored); expect(p.hand).toHaveLength(16); expect(p.discards).toHaveLength(1); expect(p.pool).toEqual(decodePractice(originalPractice).pool); }
  else if (mode === 'game') { const game = decodeSession(stored).game; expect(game.version).toBe(initial.game.version + 1); expect(game.players[0].concealed).toHaveLength(16); }
  else expect(readReviewArchive({ getItem: () => stored }).records).toHaveLength(1);
  expect(await raw(page, mode === 'practice' ? gameKey : PRACTICE_KEY)).toBe(mode === 'practice' ? originalGame : originalPractice);
  expect(await page.evaluate(keys => Object.fromEntries(keys.map(k => [k, localStorage.getItem(k)])), Object.keys(markers))).toEqual(markers);
  const unexpected = []; page.on('dialog', dialog => { unexpected.push(dialog.type()); void dialog.dismiss(); });
  await page.reload({ timeout: 5000 }); expect(unexpected).toEqual([]); expect(await raw(page, key)).toBe(stored);
  if (mode === 'practice') { await page.getByRole('button', { name: '純練習模式', exact: true }).click(); await page.getByRole('button', { name: '繼續上次練習', exact: true }).click(); }
  else await page.getByRole('button', { name: '繼續上次牌局', exact: true }).click();
  await expect(page.getByRole('group', { name: mode === 'practice' ? '練習手牌' : '選擇要打出的手牌', exact: true }).getByRole('button')).toHaveCount(16);
});
