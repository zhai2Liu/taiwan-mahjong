import { test, expect } from '@playwright/test';
import { TRIAL_KEY, decodeTrialDraft } from '../../dist/training-draft.js';

test('九題牌例與作答依畫面寬度排列，320px 可鍵盤作答；切題只自存位置不產生作答', async ({ page }) => {
  const original = page.viewportSize();
  for (const width of new Set([original.width, 320])) {
    await page.setViewportSize({ width, height: original.height });
    await page.goto('/training.html');
    for (let index = 0; index < 9; index++) {
      await expect(page.getByRole('heading', { level: 2 })).toContainText(`第 ${index + 1} / 9 題`);
      const board = await page.getByRole('region', { name: '題目牌例', exact: true }).boundingBox();
      const form = await page.locator('.trial-form').boundingBox();
      if (width > 900) expect(form.x).toBeGreaterThanOrEqual(board.x + board.width);
      else expect(form.y).toBeGreaterThanOrEqual(board.y + board.height);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const choice = page.getByRole('checkbox').first();
      await choice.focus();
      expect(await choice.evaluate(el => {
        const rect = el.getBoundingClientRect();
        return rect.top >= -1 && rect.bottom <= innerHeight + 1 && el.contains(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2));
      })).toBe(true);
      await expect(choice).not.toBeChecked();
      if (index < 8) await page.getByRole('button', { name: '下一題', exact: true }).click();
    }
    await expect(page.getByRole('button', { name: '下一題', exact: true })).toBeDisabled();
    await expect(page.locator('#storage-status')).toContainText('已保存作答');
    expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([TRIAL_KEY]);
    const saved = decodeTrialDraft(await page.evaluate(key => localStorage.getItem(key), TRIAL_KEY));
    expect(saved.questionId).toBe(saved.report.questions[8].id);
    expect(saved.report.questions.every(q => q.status === 'unanswered' && !q.selected.length && !q.reason)).toBe(true);
    // Start the next width from a fresh page rather than the saved last question.
    await page.evaluate(() => localStorage.clear());
  }
});
