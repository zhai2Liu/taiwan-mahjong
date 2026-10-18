import { test, expect } from '@playwright/test';
import { createBrowserFixtures } from '../../scripts/browser-fixtures.mjs';
import { encodeSession } from '../../dist/session.js';

const saveKey = 'tw16:TW16-CLASSIC-v1:save';

async function focusIsVisible(page) {
  return page.evaluate(() => {
    const control = document.activeElement, rect = control.getBoundingClientRect();
    return rect.top >= -1 && rect.bottom <= innerHeight + 1 && control.contains(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2));
  });
}

test('首頁三條路線可鍵盤到達，操作導覽回焦，窄畫面入口可點選', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '台灣麻將練習室', exact: true })).toBeVisible();
  await expect(page.getByRole('navigation', { name: '牌室導覽', exact: true })).toBeVisible();
  const learn = page.getByRole('link', { name: '從零學台灣麻將（前三課）', exact: true });
  const trial = page.getByRole('link', { name: '決策題試讀', exact: true });
  await expect(learn).toHaveAttribute('href', './learn.html');
  await expect(trial).toHaveAttribute('href', './training.html');
  await page.getByRole('button', { name: '新手教學', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog', { name: '認識台灣十六張', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: '新手教學', exact: true })).toBeFocused();
  const controls = [learn, page.getByRole('button', { name: '純練習模式', exact: true }), trial, page.getByRole('button', { name: '開始一將', exact: true })];
  for (const control of controls) {
    await page.keyboard.press('Tab');
    await expect(control).toBeFocused();
    expect(await focusIsVisible(page)).toBe(true);
  }
  const original = page.viewportSize();
  if (original.width >= 1000) {
    // All three main actions fit above the fold on the supported desktop baseline.
    expect(await controls.at(-1).evaluate(el => el.getBoundingClientRect().bottom + scrollY)).toBeLessThan(original.height);
  }
  await page.setViewportSize({ width: 320, height: 844 });
  for (const control of controls) {
    await control.focus();
    expect(await focusIsVisible(page)).toBe(true);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  for (const colorScheme of ['light', 'dark']) {
    await page.emulateMedia({ forcedColors: 'active', colorScheme });
    for (const control of controls) {
      await control.focus();
      expect(await focusIsVisible(page)).toBe(true);
      expect(await control.evaluate(el => {
        const style = getComputedStyle(el);
        return style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) >= 3 &&
          (el.tagName === 'A' || parseFloat(style.borderTopWidth) >= 1);
      })).toBe(true);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.emulateMedia({ forcedColors: 'none', colorScheme: 'light' });
  await page.keyboard.press('Enter');
  await expect(page.getByRole('group', { name: '選擇要打出的手牌', exact: true })).toBeVisible();
});

test('首頁優先提供續玩，取消新局保留原存檔，續玩還原原牌局', async ({ page }) => {
  const raw = encodeSession(createBrowserFixtures().find(item => item.name === 'feedbackReady').session);
  await page.addInitScript(({ key, raw }) => {
    localStorage.setItem(key, raw);
    localStorage.setItem('home-unrelated', 'keep-original');
  }, { key: saveKey, raw });
  await page.goto('/');
  await page.clock.install({ time: new Date('2026-10-18T00:00:00Z') });
  await page.clock.pauseAt(new Date('2026-10-18T00:00:01Z'));
  const resume = page.getByRole('region', { name: '繼續遊玩', exact: true }).getByRole('button', { name: '繼續上次牌局', exact: true });
  expect(await resume.evaluate(el => el.getBoundingClientRect().bottom)).toBeLessThan(page.viewportSize().height);
  page.once('dialog', dialog => dialog.dismiss());
  await page.getByRole('button', { name: '開始新的一將', exact: true }).click();
  await expect(resume).toBeVisible();
  expect(await page.evaluate(key => localStorage.getItem(key), saveKey)).toBe(raw);
  await resume.click();
  await expect(page.getByRole('group', { name: '選擇要打出的手牌', exact: true })).toBeVisible();
  expect(await page.evaluate(key => localStorage.getItem(key), saveKey)).toBe(raw);
  expect(await page.evaluate(() => localStorage.getItem('home-unrelated'))).toBe('keep-original');
  await expect(page.locator('.home-shell')).toHaveCount(0);
});

test('別頁更新牌局時，首頁連結保持鍵盤焦點且不覆寫存檔', async ({ page }) => {
  const other = await page.context().newPage();
  await page.goto('/'); await other.goto('/');
  const samples = [...new Set(createBrowserFixtures().map(item => encodeSession(item.session)))];
  for (const [index, name] of ['從零學台灣麻將（前三課）', '決策題試讀'].entries()) {
    const link = page.getByRole('link', { name, exact: true });
    await link.focus();
    await other.evaluate(({ key, raw }) => localStorage.setItem(key, raw), { key: saveKey, raw: samples[index] });
    await expect(page.getByRole('alert')).toContainText('另一個分頁已變更存檔');
    await expect(link).toBeFocused();
    expect(await page.evaluate(key => localStorage.getItem(key), saveKey)).toBe(samples[index]);
  }
  await other.close();
});
