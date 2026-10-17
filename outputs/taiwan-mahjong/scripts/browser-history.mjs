import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { preview } from 'vite';
import { createBrowserFixtures } from './browser-fixtures.mjs';
import { advance, encodeSession } from '../dist/session.js';
import { createPractice, discardPractice, encodePractice, PRACTICE_KEY } from '../dist/practice.js';
import { emptyProgress, markLesson, encodeLearningProgress, LEARN_KEY } from '../dist/learning-progress.js';
import { trainingQuestions, trainingContentRevision } from '../dist/training-data.js';
import { encodeTrialDraft, TRIAL_KEY } from '../dist/training-draft.js';

const channel = process.argv[2] ?? 'chrome';
assert(['chrome', 'msedge'].includes(channel), '使用已安裝的chrome或msedge；不以headless shell推定真正快取返回。');
const session = createBrowserFixtures().find(s => s.name === 'feedbackReady').session, gameKey = 'tw16:TW16-CLASSIC-v1:save', practice = createPractice(1234);
const trial = reason => encodeTrialDraft({ schemaVersion: 1, questionId: trainingQuestions[0].id, skill: 'all', report: {
  schemaVersion: 3, contentRevision: trainingContentRevision, rulesVersion: 'TW16-CLASSIC-v1', mode: 'L3-B0-content-trial', reasonAssessment: 'not-reviewed', guidanceMode: 'topic-guided',
  questions: trainingQuestions.map((q, i) => ({ id: q.id, prompt: q.prompt, status: i ? 'unanswered' : 'draft', selected: [], reason: i ? '' : reason, feedback: '', exposure: 'unknown' })),
} });
const originalReason = '原頁合成理由，不是真人資料', remoteReason = '他頁合成理由，不是真人資料';
const seeds = { [gameKey]: encodeSession(session), [PRACTICE_KEY]: encodePractice(practice), [LEARN_KEY]: encodeLearningProgress(emptyProgress()), [TRIAL_KEY]: trial(originalReason) };
const modes = [
  { mode: 'game', key: gameKey, path: '/', newer: encodeSession(advance(session, 0, { type: 'DISCARD', tileId: '7z#0' }, session.game.version)), notice: '.notice' },
  { mode: 'practice', key: PRACTICE_KEY, path: '/', newer: encodePractice(discardPractice(practice, practice.hand[0])), notice: '.notice' },
  { mode: 'learning', key: LEARN_KEY, path: '/learn.html', newer: encodeLearningProgress(markLesson(emptyProgress(), 2, 'read')), notice: '#save-notice' },
  { mode: 'trial', key: TRIAL_KEY, path: '/training.html', newer: trial(remoteReason), notice: '#storage-status' },
];
const server = await preview({ root: fileURLToPath(new URL('../', import.meta.url)), preview: { host: '127.0.0.1', port: 4231, strictPort: true }, logLevel: 'silent' });
const base = 'http://127.0.0.1:4231'; let browser;
try {
  // ponytail: named desktop Chrome/Edge and four fixed flows; add devices only after a separate support decision.
  browser = await chromium.launch({ channel, ignoreDefaultArgs: ['--disable-back-forward-cache'] });
  for (const { mode, key, path, newer, notice } of modes) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    try {
      const page = await context.newPage(), errors = []; page.on('pageerror', error => errors.push(error.message));
      await page.addInitScript(seeds => {
        for (const [key, value] of Object.entries(seeds)) if (localStorage.getItem(key) === null) localStorage.setItem(key, value);
        localStorage.setItem('tw16:coach:v1', 'off'); window.__historyShows = [];
        addEventListener('pageshow', event => window.__historyShows.push(event.persisted));
      }, seeds);
      await page.goto(base + path);
      if (mode === 'game') { await page.getByRole('button', { name: '繼續上次牌局', exact: true }).click(); await page.getByRole('button', { name: '暫停', exact: true }).click(); }
      if (mode === 'practice') { await page.getByRole('button', { name: '純練習模式', exact: true }).click(); await page.getByRole('button', { name: '繼續上次練習', exact: true }).click(); }
      assert.equal(await page.evaluate(() => { const event = new Event('beforeunload', { cancelable: true }); dispatchEvent(event); return event.defaultPrevented; }), false);
      await page.goto(base + (mode === 'learning' || mode === 'trial' ? '/' : '/learn.html'));
      const other = await context.newPage(); await other.goto(base + '/'); await other.evaluate(({ key, newer }) => localStorage.setItem(key, newer), { key, newer });
      await page.goBack({ waitUntil: 'commit', timeout: 5000 });
      try { await page.waitForFunction(() => window.__historyShows?.includes(true), null, { timeout: 5000 }); }
      catch { throw new Error(`${mode}此次返回未確實進入BFCache，不能列為快取驗收通過。`); }
      await page.locator(notice).filter({ hasText: '另一' }).waitFor();
      if (mode === 'game' || mode === 'practice') {
        assert.equal(await page.locator('.hand-tile').count(), 17); assert.equal(await page.locator('.hand-tile:enabled').count(), 0);
      } else if (mode === 'learning') {
        await page.getByRole('button', { name: '重新讀取保存紀錄', exact: true }).click();
        assert.match(await page.locator('.progress-list').innerText(), /第3課：已閱讀 ✓/);
      } else {
        assert.equal(await page.locator('#save-local').isDisabled(), true); assert.equal(await page.locator('#reason').inputValue(), originalReason);
        await page.getByText('管理本機保存／回復原檔', { exact: true }).click();
        page.once('dialog', dialog => { assert.equal(dialog.type(), 'confirm'); void dialog.accept(); });
        await page.getByRole('button', { name: '重新讀取保存', exact: true }).click();
        assert.equal(await page.locator('#reason').inputValue(), remoteReason);
      }
      assert.deepEqual(await page.evaluate(keys => Object.fromEntries(keys.map(key => [key, localStorage.getItem(key)])), Object.keys(seeds)), { ...seeds, [key]: newer });
      assert.deepEqual(errors, []);
      console.log(JSON.stringify({ channel, version: browser.version(), mode, cachedReturn: true, conflictHandled: true, otherKeysPreserved: true, pageErrors: 0 }));
    } finally { await context.close(); }
  }
} finally {
  try { await browser?.close(); }
  finally { await new Promise((resolve, reject) => server.httpServer.close(error => error ? reject(error) : resolve())); }
}
