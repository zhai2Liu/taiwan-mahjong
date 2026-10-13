import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { createBrowserFixtures } from '../../scripts/browser-fixtures.mjs';
import { fixture } from '../fixtures.mjs';
import { encodeSession } from '../../dist/session.js';

const saveKey = 'tw16:TW16-CLASSIC-v1:save';
const scenarios = createBrowserFixtures();
const savedText = page => page.evaluate(key => localStorage.getItem(key), saveKey);
const savedGame = async page => JSON.parse(await savedText(page)).game;

async function loadGame(page, session) {
  const raw = encodeSession(session);
  // Only the fresh isolated context is seeded. Reload must use the game's actual updated save.
  await page.addInitScript(({ raw, saveKey }) => {
    if (location.origin === 'http://127.0.0.1:4226' && localStorage.getItem(saveKey) === null) {
      localStorage.setItem(saveKey, raw);
      localStorage.setItem('tw16:coach:v1', 'after');
    }
  }, { raw, saveKey });
  await page.goto('/');
  await page.clock.install({ time: new Date('2026-10-14T00:00:00Z') });
  await page.clock.pauseAt(new Date('2026-10-14T00:00:01Z'));
  await page.getByRole('button', { name: '繼續上次牌局', exact: true }).click();
  return raw;
}

test('雙擊出牌 → 解釋 → Escape 保持暫停 → 繼續行牌', async ({ page }) => {
  const initial = scenarios.find(s => s.name === 'feedbackReady').session;
  const raw = await loadGame(page, initial);
  const tile = page.getByRole('group', { name: '選擇要打出的手牌' }).getByRole('button', { name: '白，剛摸入', exact: true });
  await tile.click();
  await expect(tile).toHaveAttribute('aria-pressed', 'true');
  expect(await savedText(page)).toBe(raw);
  await page.clock.runFor(451);
  await tile.dblclick();
  const explanation = page.getByRole('dialog', { name: '出牌後解釋', exact: true });
  await expect(explanation).toBeVisible();
  await expect(page.getByRole('heading', { name: '出牌後解釋', exact: true })).toBeFocused();
  await expect(explanation).toContainText('出牌已生效，牌局已暫停');
  const played = await savedGame(page);
  expect(played.version).toBe(initial.game.version + 1);
  expect(played.players[0].concealed).not.toContain('7z#0');
  expect(played.players[0].discardHistory.at(-1).tileId).toBe('7z#0');
  await page.keyboard.press('Escape');
  await expect(explanation).toHaveCount(0);
  const resume = page.getByRole('banner').getByRole('button', { name: '繼續牌局', exact: true });
  await expect(resume).toBeFocused();
  await page.clock.runFor(2000);
  expect(await savedGame(page)).toEqual(played);
  await resume.click();
  await page.clock.runFor(1500);
  expect((await savedGame(page)).version).toBeGreaterThan(played.version);
});

test('自摸逐條結算 → 重載不重付 → 下一局保留分數', async ({ page }) => {
  const initial = { schemaVersion: 1, game: fixture({ hands: { 0: '123m456m789p555z666z77s' }, flowers: { 0: 'f1f5f2' } }), aiRandom: [17, 29, 43] };
  await loadGame(page, initial);
  await page.locator('[data-focus^="action-WIN-"]').click();
  const result = page.getByRole('dialog', { name: '你自摸', exact: true });
  await expect(result).toBeVisible();
  await expect(page.getByRole('heading', { name: '你自摸', exact: true })).toBeFocused();
  for (const pattern of ['門清一摸三', '紅中', '發財', '正花']) await expect(result).toContainText(pattern);
  const settled = await savedGame(page);
  expect(settled.phase).toBe('handResult');
  expect(settled.scores).toEqual(settled.settlement.delta);
  expect(settled.scores[0]).toBeGreaterThan(0);
  expect(settled.scores.reduce((a, b) => a + b, 0)).toBe(0);
  await result.getByRole('button', { name: '本局決策檢討', exact: true }).click();
  await expect(page.getByRole('dialog', { name: '本局決策檢討', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '回到本局結算', exact: true }).click();
  await expect(result.getByRole('button', { name: '本局決策檢討', exact: true })).toBeFocused();
  expect(await savedGame(page)).toEqual(settled);
  await page.reload();
  await page.getByRole('button', { name: '繼續上次牌局', exact: true }).click();
  await expect(result).toBeVisible();
  expect(await savedGame(page)).toEqual(settled);
  await result.getByRole('button', { name: '下一局', exact: true }).click();
  await expect(result).toHaveCount(0);
  const next = await savedGame(page);
  expect(next.handId).toBe(settled.handId + 1);
  expect(next.scores).toEqual(settled.scores);
  expect(next.settlement).toBeNull();
  expect(next.streak).toBe(settled.streak + 1);
  await page.reload();
  await page.getByRole('button', { name: '繼續上次牌局', exact: true }).click();
  expect(await savedGame(page)).toEqual(next);
});

test('試讀作答／真實匯出 → 修改提醒 → 取消離頁／重載 → 確認返回', async ({ page }) => {
  await page.goto('/training.html');
  await page.getByRole('button', { name: '提交並看推導', exact: true }).click();
  await expect(page.getByText('請先選擇至少一項，再提交。', { exact: true })).toBeVisible();
  await page.getByRole('checkbox').first().check();
  await page.getByLabel('我的理由（選填，不會自動評分）', { exact: true }).fill('S1.2b 合成理由');
  await page.getByRole('button', { name: '提交並看推導', exact: true }).click();
  await expect(page.locator('#answer')).toBeFocused();
  await page.getByRole('button', { name: '下一題', exact: true }).click();
  await page.getByRole('button', { name: '上一題', exact: true }).click();
  await expect(page.locator('#reason')).toHaveValue('S1.2b 合成理由');
  await expect(page.getByRole('checkbox').first()).toBeChecked();
  await expect(page.getByRole('checkbox').first()).toBeDisabled();
  await page.getByText('提供本題回饋（選填）', { exact: true }).click();
  await page.locator('#trial-feedback').fill('S1.2b 合成回饋，非真人試讀');
  const answersPending = page.waitForEvent('download');
  await page.getByRole('button', { name: '匯出作答紀錄（含理由與回饋）', exact: true }).click();
  const answersDownload = await answersPending;
  expect(answersDownload.suggestedFilename()).toBe('taiwan-mahjong-trial-answers.json');
  const answers = JSON.parse(await readFile(await answersDownload.path(), 'utf8'));
  expect(answers.schemaVersion).toBe(2);
  expect(answers.contentRevision).toMatch(/^[0-9a-f]{64}$/);
  expect(answers.questions).toHaveLength(9);
  expect(answers.questions[0]).toMatchObject({ id: 'E01', status: 'submitted-and-revealed', reason: 'S1.2b 合成理由', feedback: 'S1.2b 合成回饋，非真人試讀' });
  expect(answers.questions[0].selected).toHaveLength(1);
  const feedbackPending = page.waitForEvent('download');
  await page.getByRole('button', { name: '下載全部試讀回饋', exact: true }).click();
  const notes = await readFile(await (await feedbackPending).path(), 'utf8');
  expect(notes).toContain('題號 E01\nS1.2b 合成回饋，非真人試讀');
  expect(notes).not.toContain('S1.2b 合成理由');
  await page.locator('#trial-feedback').fill('匯出後新增的合成回饋');
  await expect(page.locator('#draft-status')).toContainText('作答紀錄、試讀回饋在交由瀏覽器下載後有新修改');
  await page.getByRole('link', { name: '返回牌室', exact: true }).click();
  const leave = page.getByRole('dialog', { name: '離開決策題試讀？', exact: true });
  await expect(leave.getByRole('button', { name: '留在本頁', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(leave).toHaveCount(0);
  await expect(page.getByRole('link', { name: '返回牌室', exact: true })).toBeFocused();
  const dialogPending = page.waitForEvent('dialog');
  // A cancelled reload never commits a navigation, so do not wait for a new document's load event.
  const reload = page.evaluate(() => location.reload());
  const warning = await dialogPending;
  expect(warning.type()).toBe('beforeunload');
  await warning.dismiss();
  await reload;
  await expect(page.locator('#trial-feedback')).toHaveValue('匯出後新增的合成回饋');
  await page.getByRole('link', { name: '返回牌室', exact: true }).click();
  await leave.getByRole('button', { name: '留在本頁', exact: true }).click();
  await expect(page.locator('#reason')).toHaveValue('S1.2b 合成理由');
  await page.getByRole('link', { name: '返回牌室', exact: true }).click();
  await leave.getByRole('button', { name: '確認離開', exact: true }).click();
  await expect(page.getByRole('button', { name: '開始一將', exact: true })).toBeVisible();
  expect(await savedText(page)).toBeNull();
});
