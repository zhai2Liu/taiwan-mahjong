import { test, expect } from '@playwright/test';
import { fixture, discard, W02 } from '../fixtures.mjs';
import { encodeSession } from '../../dist/session.js';

const saveKey = 'tw16:TW16-CLASSIC-v1:save';
const game = async page => JSON.parse(await page.evaluate(key => localStorage.getItem(key), saveKey)).game;
async function setup(page, winner = false) {
  const state = discard(fixture({ turn: 3, hands: winner ? { 0: '1345m67m123p456p789s1z', 1: W02, 3: '2m' }
    : { 0: '22s123m456m123p11z347s', 3: '2s' } }), 3, winner ? '2m' : '2s');
  const raw = encodeSession({ schemaVersion: 1, game: state, aiRandom: [17, 29, 43] });
  await page.addInitScript(({ key, raw }) => { if (!localStorage.getItem(key)) { localStorage.setItem(key, raw); localStorage.setItem('tw16:coach:v1', 'after'); } }, { key: saveKey, raw });
  await page.goto('/'); await page.clock.install({ time: new Date('2026-10-17T00:00:00Z') });
  await page.clock.pauseAt(new Date('2026-10-17T00:00:01Z'));
  await page.getByRole('button', { name: '繼續上次牌局', exact: true }).click();
  return state;
}

test('碰牌仲裁後才解釋 → 同類另開頁 → 關閉仍暫停 → 繼續合法打牌', async ({ page, context }) => {
  await setup(page);
  await expect(page.getByLabel('對戰提示模式')).toHaveValue('after');
  await page.locator('[data-focus^="action-PON-"]').click();
  await expect(page.getByRole('dialog', { name: '吃碰回應後解釋', exact: true })).toHaveCount(0);
  await page.clock.runFor(2000);
  const explanation = page.getByRole('dialog', { name: '吃碰回應後解釋', exact: true });
  await expect(explanation).toBeVisible(); await expect(explanation.getByRole('heading', { level: 2 })).toBeFocused();
  await expect(explanation).toContainText('你碰牌成立。你已取得這張牌。');
  const resolved = await game(page); expect(resolved.phase).toBe('awaitDiscard'); expect(resolved.turn).toBe(0);
  expect(resolved.players[0].melds.at(-1).kind).toBe('pon');
  const pending = context.waitForEvent('page');
  const link = explanation.getByRole('link', { name: '吃碰取捨練習（另開分頁）', exact: true });
  await expect(link).toHaveAttribute('rel', 'noopener'); await link.click();
  const training = await pending; await training.waitForLoadState();
  await expect(training.getByRole('combobox', { name: '練習重點', exact: true })).toHaveValue('claim-cost');
  await expect(training.getByRole('heading', { level: 2 })).toHaveText('第 1 / 3 題 · 吃碰取捨');
  for (const [skill, title] of [['efficiency', '牌效'], ['safety-scope', '安全牌'], ['dealer-continuation', '莊家連莊']]) {
    await training.goto('/training.html?skill=' + skill);
    await expect(training.getByRole('heading', { level: 2 })).toContainText(title);
  }
  await training.goto('/training.html?skill=%3Cscript%3E');
  await expect(training.getByRole('combobox', { name: '練習重點', exact: true })).toHaveValue('all');
  await expect(training.getByRole('heading', { level: 2 })).toHaveText('第 1 / 9 題 · 牌效'); await training.close();
  await page.clock.runFor(2000); expect(await game(page)).toEqual(resolved);
  await page.keyboard.press('Escape'); await expect(explanation).toHaveCount(0);
  const resume = page.getByRole('banner').getByRole('button', { name: '繼續牌局', exact: true });
  await expect(resume).toBeFocused(); await page.clock.runFor(1000); expect(await game(page)).toEqual(resolved);
  await resume.click();
  await page.getByRole('group', { name: '選擇要打出的手牌' }).getByRole('button', { name: '七條', exact: true }).dblclick();
  await expect(page.getByRole('dialog', { name: '出牌後解釋', exact: true })).toBeVisible();
  expect((await game(page)).version).toBe(resolved.version + 1);
});

test('吃牌被胡截走 → 說明未取得 → 關閉回結算 → 局後仍可核對同一結果', async ({ page }) => {
  await setup(page, true); await page.locator('[data-focus^="action-CHI-"]').first().click();
  await page.clock.runFor(2200);
  const explanation = page.getByRole('dialog', { name: '吃碰回應後解釋', exact: true });
  await expect(explanation).toBeVisible(); await expect(explanation).toContainText('下家胡牌成立。你送出的吃碰未取得這張牌。');
  await expect(explanation).toContainText('牌局已結算');
  const resolved = await game(page); expect(resolved.settlement.winner).toBe(1);
  await page.keyboard.press('Escape'); await expect(page.locator('[data-focus="review-open"]')).toBeFocused();
  await page.locator('[data-focus="review-open"]').click();
  const review = page.getByRole('dialog', { name: '本局決策檢討', exact: true });
  await expect(review).toBeVisible(); await expect(review).toContainText('下家胡牌成立。你送出的吃碰未取得這張牌。');
  await page.setViewportSize({ width: 320, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await review.getByRole('link', { name: '吃碰取捨練習（另開分頁）', exact: true }).focus();
  await expect(review.getByRole('link', { name: '吃碰取捨練習（另開分頁）', exact: true })).toBeInViewport();
  expect(await page.evaluate(() => {
    const link = document.activeElement, rect = link.getBoundingClientRect();
    return rect.top >= 0 && rect.bottom <= innerHeight && link.contains(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2));
  })).toBe(true);
  await page.keyboard.press('Escape'); await page.clock.runFor(1200); expect(await game(page)).toEqual(resolved);
});

test('有吃碰機會但選過 → 全過後暫停，尚未自動摸下一張', async ({ page }) => {
  await setup(page); await page.locator('[data-focus^="action-PASS-"]').click(); await page.clock.runFor(2200);
  const explanation = page.getByRole('dialog', { name: '吃碰回應後解釋', exact: true });
  await expect(explanation).toBeVisible(); await expect(explanation).toContainText('各家過，這張牌沒有被取走');
  const resolved = await game(page); expect(resolved.phase).toBe('awaitDraw'); expect(resolved.turn).toBe(0);
  await page.clock.runFor(2000); expect(await game(page)).toEqual(resolved);
});
