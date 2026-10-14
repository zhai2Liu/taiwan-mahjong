import { chromium } from '@playwright/test';
import { preview } from 'vite';
import { performance } from 'node:perf_hooks';
import { cpus, release, platform } from 'node:os';
import { readdirSync } from 'node:fs';
import { createBrowserFixtures } from './browser-fixtures.mjs';
import { coachAnalysis } from '../dist/coach.js';
import { getObservation } from '../dist/engine.js';

const channel = process.argv[2] ?? 'chromium';
if (!['chromium', 'chrome', 'msedge'].includes(channel)) throw new Error('Use chromium, chrome or msedge.');
const session = createBrowserFixtures().find(s => s.name === 'feedbackReady').session;
const samples = [];
const server = await preview({ preview: { host: '127.0.0.1', port: 4228, strictPort: true }, logLevel: 'silent' });
let browser;
try {
  browser = await chromium.launch(channel === 'chromium' ? {} : { channel });
  // ponytail: one fixed public-information scene, 9 samples after one warm-up; add scenes only after measured gaps.
  for (let i = 0; i < 10; i++) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    try {
      const page = await context.newPage();
      await page.addInitScript(raw => localStorage.setItem('tw16:TW16-CLASSIC-v1:save', raw), JSON.stringify(session));
      await page.goto('http://127.0.0.1:4228/');
      await page.getByRole('button', { name: '繼續上次牌局', exact: true }).waitFor();
      const homeReady = await page.evaluate(() => performance.now());
      await page.getByRole('button', { name: '繼續上次牌局', exact: true }).click();
      const tile = page.getByRole('group', { name: '選擇要打出的手牌' }).getByRole('button', { name: '白，剛摸入', exact: true });
      const markClick = () => page.evaluate(() => document.addEventListener('click', () => performance.mark('input-start'), { capture: true, once: true }));
      const paintedMs = () => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => {
        resolve(performance.now() - performance.getEntriesByName('input-start').at(-1).startTime);
      }))));
      await markClick(); await tile.click();
      const selection = await paintedMs();
      await page.getByLabel('對戰提示模式', { exact: true }).selectOption('after');
      await page.evaluate(() => document.addEventListener('click', event => { if (event.detail === 2) performance.mark('explain-start'); }, { capture: true }));
      await tile.dblclick();
      await page.getByRole('dialog', { name: '出牌後解釋', exact: true }).waitFor();
      const explanation = await page.evaluate(() => new Promise(resolve => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve(performance.now() - performance.getEntriesByName('explain-start').at(-1).startTime)));
      }));
      const start = performance.now(); coachAnalysis(getObservation(session.game, 0));
      const analysis = performance.now() - start;
      if (i) samples.push({ homeReady, selection, explanation, analysis });
    } finally { await context.close(); }
  }
  const summary = Object.fromEntries(Object.keys(samples[0]).map(metric => {
    const values = samples.map(s => s[metric]).sort((a, b) => a - b);
    return [metric, { medianMs: +values[4].toFixed(2), p90Ms: +values[8].toFixed(2), maxMs: +values[8].toFixed(2) }];
  }));
  console.log(JSON.stringify({ channel, browser: browser.version(), os: `${platform()} ${release()}`, cpu: cpus()[0].model, node: process.version, viewport: { width: 1440, height: 900 }, samples: 9, warmups: 1, network: 'loopback, fresh contexts, no throttling', units: 'ms', siteAssets: readdirSync('site/assets'), summary, raw: samples }, null, 2));
} finally {
  await browser?.close();
  await new Promise(resolve => server.httpServer.close(resolve));
}
