import { test, expect } from '@playwright/test';
import { fixture, discard } from '../fixtures.mjs';
import { encodeSession } from '../../dist/session.js';

test('靜態牌面有圖片名稱，海底可讀、暗槓不揭牌種，未更動局面', async ({ page }) => {
  const game = discard(fixture({ turn: 3, hands: { 0: '134m', 3: '2m' },
    melds: { 2: [{ kind: 'concealedKong', tiles: '5555p' }] } }), 3, '2m');
  const raw = encodeSession({ schemaVersion: 1, game, aiRandom: [17, 29, 43] });
  const key = 'tw16:TW16-CLASSIC-v1:save';
  await page.addInitScript(({ key, raw }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, raw); }, { key, raw });
  await page.goto('/');
  await expect(page.locator('.tile-fan').getByRole('img')).toHaveCount(0);
  await page.clock.install({ time: new Date('2026-10-17T00:00:00Z') });
  await page.clock.pauseAt(new Date('2026-10-17T00:00:01Z'));
  await page.getByRole('button', { name: '繼續上次牌局', exact: true }).click();
  const river = page.getByRole('region', { name: '左席的海底', exact: true });
  await expect(river.getByRole('img', { name: '二萬，剛打出的牌', exact: true })).toBeVisible();
  expect(await river.ariaSnapshot()).toContain('img "二萬，剛打出的牌"');
  await expect(page.locator('.latest-offer').getByRole('img', { name: '二萬', exact: true })).toBeVisible();
  const opponent = page.locator('.player-north');
  await expect(opponent.locator('.meld').getByRole('img', { name: '暗牌', exact: true })).toHaveCount(4);
  await expect(opponent.locator('.opponent-hand').getByRole('img')).toHaveCount(0);
  expect(await opponent.ariaSnapshot()).not.toContain('五筒');
  expect(JSON.parse(await page.evaluate(key => localStorage.getItem(key), key)).game).toEqual(game);
});

for (const colorScheme of ['light', 'dark']) test(`強制色彩${colorScheme}下已選牌與鍵盤焦點可分辨，選取不改尺寸、空白鍵可取消`, async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active', colorScheme });
  await page.goto('/learn.html');
  await page.getByRole('button', { name: '3. 五組牌加一對眼睛', exact: true }).click();
  await page.getByRole('button', { name: '我讀完了，開始示範', exact: true }).click();
  const first = page.locator('[data-tile="1m#0"]'), second = page.locator('[data-tile="2m#0"]');
  const before = await first.boundingBox();
  await first.click(); await page.keyboard.press('Tab'); await expect(second).toBeFocused();
  await expect(first).toHaveAttribute('aria-pressed', 'true'); await expect(second).toHaveAttribute('aria-pressed', 'false');
  const cue = control => control.evaluate(e => { const c = getComputedStyle(e); return { border: c.borderTopStyle, width: c.borderTopWidth, outline: c.outlineStyle, outlineWidth: c.outlineWidth }; });
  const selected = await cue(first), unselected = await cue(second);
  expect([selected.border, selected.width]).not.toEqual([unselected.border, unselected.width]);
  expect(unselected.outline).not.toBe('none'); expect(parseFloat(unselected.outlineWidth)).toBeGreaterThan(0);
  const after = await first.boundingBox(); expect(after.width).toBe(before.width); expect(after.height).toBe(before.height);
  await page.keyboard.press('Shift+Tab'); await expect(first).toBeFocused(); await page.keyboard.press('Space');
  await expect(first).toHaveAttribute('aria-pressed', 'false');
  const cleared = await cue(first); expect([cleared.border, cleared.width]).toEqual([unselected.border, unselected.width]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
