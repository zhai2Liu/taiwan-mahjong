import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { createPractice, PRACTICE_KEY } from '../../dist/practice.js';
import { LEARN_KEY, LEGACY_LEARN_KEY, LEGACY_COURSE_VERSION, emptyProgress, markLesson, encodeLearningProgress } from '../../dist/learning-progress.js';

const otherSaves = { 'tw16:TW16-CLASSIC-v1:save': 'private-game-sentinel', [PRACTICE_KEY]: JSON.stringify(createPractice(20261021)), 'tw16:review:v2': '{"schemaVersion":2,"records":[]}', 'tw16:trial:v1': 'trial-sentinel' };
const blank = { read: false, guided: false, independent: false };
const legacyRaw = flags => JSON.stringify({ schemaVersion: 1, courseVersion: LEGACY_COURSE_VERSION, rulesVersion: 'TW16-CLASSIC-v1', lessons: flags });
const OLD = legacyRaw([{ read: true, guided: true, independent: false }, { read: true, guided: false, independent: true }, blank]);
const read = (page, key) => page.evaluate(k => localStorage.getItem(k), key);
const course = async page => JSON.parse(await read(page, LEARN_KEY));
const others = page => page.evaluate(keys => Object.fromEntries(keys.map(k => [k, localStorage.getItem(k)])), Object.keys(otherSaves));
// Hands can hold two identical tiles (e.g. 白白); either physical tile is the same legal choice.
const click = (page, name) => page.getByRole('button', { name, exact: true }).first().click();
async function seeded(page, extra = {}) {
  await page.addInitScript(data => { for (const [k, v] of Object.entries(data)) if (localStorage.getItem(k) === null) localStorage.setItem(k, v); }, { ...otherSaves, ...extra });
  await page.goto('/learn.html');
}
async function pick(page, names) { for (const name of names) await click(page, name); await click(page, '確認'); }
// Real pointer double click on the same tile (two clicks within the 450ms window), as in lesson 2 and battle.
const discardTile = (page, name) => page.getByRole('group', { name: '選牌打出', exact: true }).getByRole('button', { name, exact: true }).first().dblclick();
const source = page => page.getByLabel('桌面位置與打牌來源');

async function lesson4(page, transfer) {
  await click(page, transfer ? '換例自己試' : '我讀完了，開始示範');
  if (!transfer) {
    await expect(source(page)).toContainText('對家剛打出');
    await expect(page.locator('#lesson')).toContainText('圖中是對家打出二萬，可以吃嗎？');
    await click(page, '不行，吃只拿上家的牌');
  }
  await expect(source(page)).toContainText('上家剛打出');
  await pick(page, transfer ? ['一筒＋三筒', '三筒＋四筒'] : ['一萬＋三萬', '三萬＋四萬']);
  await click(page, transfer ? '吃（用三筒、四筒）' : '吃（用一萬、三萬）');
  await expect(page.locator('#lesson')).toContainText(transfer ? '這次不能打：二筒（和剛用的三筒、四筒又湊成二三四筒）、五筒' : '這次不能打：二萬（和剛用的一萬、三萬又湊成一二三萬）');
  await discardTile(page, '打出東');
  if (transfer) return;
  await expect(page.locator('#lesson-feedback')).toContainText('手中13張加桌上一組');
  await expect(page.locator('#lesson')).toContainText('本桌不能明槓上家，所以這裡沒有明槓');
  await click(page, '碰');
  await discardTile(page, '打出五萬');
  await expect(page.locator('#lesson-feedback')).toContainText('剛碰完不能立刻打出同種的五萬');
  await discardTile(page, '打出白');
  await click(page, '上家（胡）');
  await expect(page.locator('#lesson')).toContainText('若上家選過，由對家碰；上家、對家都選過，才由下家吃');
  await click(page, '暗槓五萬'); await click(page, '補牌');
  await expect(page.locator('#lesson')).toContainText('現在實體共18張');
  await click(page, '不行，本桌不能明槓上家'); await click(page, '明槓'); await click(page, '補牌');
  await click(page, '不行，這次要先打一張');
  await click(page, '加槓五萬'); await click(page, '下家搶槓胡');
  await expect(page.locator('#lesson')).toContainText('你的碰仍是3張');
  await click(page, '看另一種搶槓結果'); await click(page, '加槓五萬'); await click(page, '下家選過');
  await expect(page.locator('#lesson')).toContainText('過水同時解除');
  await click(page, '完成本課示範');
}
async function lesson5(page, transfer) {
  await click(page, transfer ? '換例自己試' : '我讀完了，開始示範');
  if (transfer) { await pick(page, ['二筒', '發']); await click(page, '不行，過水還沒解除'); return; }
  await pick(page, ['二萬', '五萬']);
  await click(page, '胡別人（上家放槍）');
  await click(page, '過'); await click(page, '摸牌');
  await click(page, '不行，還在過水中');
  await click(page, '打回五萬');
  await expect(page.locator('#lesson')).toContainText('打回五萬後仍聽二萬、五萬；五萬還在新聽口內，所以過水沒有解除');
  await discardTile(page, '打出九萬');
  await expect(page.locator('#lesson')).toContainText('出牌後過水已解除');
  await click(page, '胡');
  await pick(page, ['一筒', '四筒', '七筒']);
  await expect(page.locator('#lesson-feedback')).toContainText('打出的四筒仍在其中，所以過水沒有解除');
}
async function lesson6(page, transfer) {
  await click(page, transfer ? '換例自己試' : '我讀完了，開始示範');
  if (!transfer) await click(page, '自摸');
  await expect(page.locator('#lesson')).toContainText(transfer ? '牌型合計 2 台' : '牌型合計 8 台');
  await pick(page, transfer ? ['夏花'] : ['春花', '梅花']);
  await pick(page, transfer ? ['西門'] : ['南門', '西門', '北門']);
  await click(page, transfer ? '50分' : '160分');
  await expect(page.locator('#lesson')).toContainText(transfer ? '東門（你） 0、南門 ＋50、西門 −50、北門 0' : '東門（你） ＋480、南門 −160、西門 −160、北門 −160');
  await click(page, transfer ? '南門接莊（原莊家的下家），連0' : '東門續莊，連3');
  await expect(page.locator('#lesson-feedback')).toContainText(transfer ? '下一局由本局的南門當莊，連0' : '下一局由本局的東門當莊，連3');
}

test('第4–6課示範與換例實際完成、重載保留、其他存檔不變、結束可返回牌室', async ({ page }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await seeded(page);
  await click(page, '4. 別人打牌後，我能做什麼？');
  await lesson4(page, false); await lesson4(page, true);
  await expect(page.locator('#lesson')).toContainText('牌尾可用牌只剩3張以內，不能吃、碰、明槓：本例剩4張時有2種吃法，剩3張時0種');
  await click(page, '下一課：聽什麼，不一定現在就能胡');
  await lesson5(page, false); await lesson5(page, true);
  await page.setViewportSize({ width: 320, height: 844 });
  await click(page, '下一課：看懂結算');
  await lesson6(page, false); await lesson6(page, true);
  await page.getByText('補充短例（完成主線後再看）', { exact: true }).click();
  await expect(page.locator('#lesson')).toContainText('東門莊家付160，西、北各付110，南門共收380');
  await expect(page.locator('#lesson')).toContainText('下一局由南門當莊');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.locator('#lesson :is(button, a):visible').evaluateAll(bs => bs.filter(b => b.getBoundingClientRect().height < 44).map(b => `${b.textContent}:${b.getBoundingClientRect().height}`))).toEqual([]);
  await expect(page.getByRole('link', { name: '返回牌室', exact: true }).last()).toHaveAttribute('href', './');
  const done = { read: true, guided: true, independent: true };
  await expect.poll(async () => (await course(page))?.lessons.slice(3)).toEqual([done, done, done, blank, blank]);
  await page.reload();
  await expect(page.locator('.progress-list')).toContainText('第6課：已閱讀 ✓ · 提示下完成 ✓ · 換例自行完成 ✓');
  await expect(page.locator('.progress-list')).toContainText('第8課：已閱讀 — · 提示下完成 — · 換例自行完成 —');
  await expect(page.locator('#lesson-nav button')).toHaveCount(8);
  expect(await others(page)).toEqual(otherSaves); expect(await read(page, LEGACY_LEARN_KEY)).toBeNull();
  expect(errors).toEqual([]);
});

test('換例錯答、看提示或回看圖解列為提示下完成，不算自行完成', async ({ page }) => {
  await seeded(page);
  await click(page, '4. 別人打牌後，我能做什麼？');
  await click(page, '換例自己試');
  await pick(page, ['一筒＋四筒']);
  await expect(page.locator('#lesson-feedback')).toContainText('一筒、四筒加二筒不是連號三張');
  await click(page, '一筒＋四筒'); await pick(page, ['一筒＋三筒']);
  await expect(page.locator('#lesson-feedback')).toContainText('還有別的吃法');
  await pick(page, ['三筒＋四筒']);
  await click(page, '吃（用一筒、三筒）'); await discardTile(page, '打出東');
  await expect.poll(async () => (await course(page))?.lessons[3]).toEqual({ read: true, guided: true, independent: false });
  await click(page, '5. 聽什麼，不一定現在就能胡');
  await click(page, '換例自己試'); await click(page, '看提示');
  await pick(page, ['二筒', '發']); await click(page, '不行，過水還沒解除');
  await expect.poll(async () => (await course(page))?.lessons[4]).toEqual({ read: true, guided: true, independent: false });
  await click(page, '6. 看懂結算');
  await click(page, '換例自己試');
  await pick(page, ['春花']);
  await expect(page.locator('#lesson-feedback')).toContainText('春花不是南門的正花');
  await click(page, '春花'); await pick(page, ['夏花']);
  await pick(page, ['西門']); await click(page, '100分');
  await expect(page.locator('#lesson-feedback')).toContainText('沒有涉及莊家，不加莊家和連莊台');
  await click(page, '50分'); await click(page, '東門續莊，連3');
  await expect(page.locator('#lesson-feedback')).toContainText('閒家胡由原莊家的下家接莊');
  await click(page, '南門接莊（原莊家的下家），連0');
  await expect.poll(async () => (await course(page))?.lessons[5]).toEqual({ read: true, guided: true, independent: false });
});

test('第4–5課打牌沿用單擊選牌、同張雙擊或Enter／空白鍵打出；快點不同張、長按重複及禁打牌都不送出', async ({ page }) => {
  await seeded(page);
  await click(page, '4. 別人打牌後，我能做什麼？');
  await click(page, '我讀完了，開始示範'); await click(page, '不行，吃只拿上家的牌');
  await pick(page, ['一萬＋三萬', '三萬＋四萬']); await click(page, '吃（用一萬、三萬）');
  const hand = page.getByRole('group', { name: '選牌打出', exact: true }), lesson = page.locator('#lesson'), note = page.locator('#lesson-feedback');
  const tile = name => hand.getByRole('button', { name, exact: true }).first();
  await expect(lesson).toContainText('單擊選牌，雙擊同一張或Enter／空白鍵打出。');
  await tile('打出東').click();
  await expect(tile('打出東')).toHaveAttribute('aria-pressed', 'true'); await expect(tile('打出東')).toBeFocused();
  await page.waitForTimeout(600);
  await expect(lesson).toContainText('你的手牌：手中 14 張'); await expect(hand).toBeVisible();
  await tile('打出南').click(); await tile('打出西').click();
  await expect(tile('打出西')).toHaveAttribute('aria-pressed', 'true'); await expect(tile('打出南')).toHaveAttribute('aria-pressed', 'false');
  await expect(lesson).toContainText('你的手牌：手中 14 張');
  await page.waitForTimeout(500);
  await tile('打出西').dblclick();
  await expect(note).toContainText('手中13張加桌上一組');
  // Forbidden pon tile: double click and Enter both explain, never submit.
  await click(page, '碰');
  await tile('打出五萬').dblclick();
  await expect(note).toContainText('剛碰完不能立刻打出同種的五萬'); await expect(tile('打出五萬')).toBeVisible();
  await page.evaluate(() => { document.querySelector('#lesson-feedback').textContent = ''; });
  await tile('打出五萬').focus(); await page.keyboard.press('Enter');
  await expect(note).toContainText('剛碰完不能立刻打出同種的五萬'); await expect(lesson).toContainText('你的手牌：手中 14 張，桌上 1 組');
  // A held-key repeat alone never discards; a real held Enter discards once.
  await tile('打出白').focus();
  await tile('打出白').evaluate(b => b.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', repeat: true, bubbles: true, cancelable: true })));
  await expect(lesson).toContainText('你的手牌：手中 14 張，桌上 1 組'); await expect(hand).toBeVisible();
  await page.keyboard.down('Enter'); await page.keyboard.down('Enter'); await page.keyboard.up('Enter');
  await expect(note).toContainText('碰後打完了'); await expect(lesson).toContainText('三家都提出要這張時，誰取得？');
  // Space submits on the transfer, and keyboard use is not counted as help.
  page.once('dialog', d => d.accept()); await click(page, '重新開始／換例'); await click(page, '換例自己試');
  await pick(page, ['一筒＋三筒', '三筒＋四筒']); await click(page, '吃（用三筒、四筒）');
  await tile('打出東').focus(); await page.keyboard.press(' ');
  await expect.poll(async () => (await course(page))?.lessons[3]).toEqual({ read: true, guided: false, independent: true });
  // Lesson 5: assistive-technology activation (click with detail 0) submits once; a legal but off-task tile is not adopted.
  await click(page, '下一課：聽什麼，不一定現在就能胡'); await click(page, '我讀完了，開始示範');
  await pick(page, ['二萬', '五萬']); await click(page, '胡別人（上家放槍）'); await click(page, '過'); await click(page, '摸牌');
  await click(page, '不行，還在過水中'); await click(page, '打回五萬');
  await tile('打出東').evaluate(b => b.click());
  await expect(note).toContainText('不再聽二萬、五萬'); await expect(tile('打出九萬')).toBeVisible();
  await tile('打出九萬').evaluate(b => b.click());
  await expect(lesson).toContainText('出牌後過水已解除'); await expect(page.getByRole('button', { name: '胡', exact: true })).toBeVisible();
});

test('有效舊版紀錄：預覽實際旗標、下載原文、明確帶入只寫新版，舊檔逐字保留、重載不再詢問', async ({ page }) => {
  await seeded(page, { [LEGACY_LEARN_KEY]: OLD });
  const panel = page.getByRole('region', { name: '舊版學習紀錄' });
  await expect(panel).toContainText('第1課：已閱讀 ✓ · 提示下完成 ✓ · 換例自行完成 —');
  await expect(panel).toContainText('第2課：已閱讀 ✓ · 提示下完成 — · 換例自行完成 ✓');
  await expect(panel).toContainText('之後在舊版新增的完成不會自動同步');
  await expect(page.getByLabel('舊版紀錄原文（唯讀，可複製）')).toHaveValue(OLD);
  const pending = page.waitForEvent('download'); await click(page, '下載舊版紀錄原文');
  const download = await pending; expect(download.suggestedFilename()).toBe('taiwan-mahjong-learning-v1.json');
  expect(await readFile(await download.path(), 'utf8')).toBe(OLD);
  expect(await read(page, LEARN_KEY)).toBeNull();
  await click(page, '帶入現有進度');
  await expect(page.locator('#save-notice')).toContainText('已帶入並另存新版進度');
  const saved = await course(page);
  expect(saved.lessons.slice(0, 3)).toEqual(JSON.parse(OLD).lessons); expect(saved.lessons.slice(3).every(p => !p.read && !p.guided && !p.independent)).toBe(true);
  expect(await read(page, LEGACY_LEARN_KEY)).toBe(OLD);
  await page.reload();
  await expect(panel).toHaveCount(0);
  await expect(page.locator('.progress-list')).toContainText('第2課：已閱讀 ✓ · 提示下完成 — · 換例自行完成 ✓');
  // A later old-version change neither syncs nor blocks the valid new record.
  await page.evaluate(({ key, value }) => localStorage.setItem(key, value), { key: LEGACY_LEARN_KEY, value: legacyRaw([blank, blank, { read: true, guided: true, independent: true }]) });
  await click(page, '4. 別人打牌後，我能做什麼？'); await click(page, '我讀完了，開始示範');
  await expect.poll(async () => (await course(page)).lessons[3].read).toBe(true);
  expect((await course(page)).lessons[2]).toEqual(blank);
  expect(await others(page)).toEqual(otherSaves);
});

test('未選擇前先練習：本頁紀錄不保存、不被舊候選覆蓋；帶入停用，改選新版開始時一併保存', async ({ page }) => {
  await seeded(page, { [LEGACY_LEARN_KEY]: OLD });
  await click(page, '我讀完了，開始示範');
  await expect(page.locator('#save-notice')).toContainText('尚未決定如何處理舊版紀錄');
  expect(await read(page, LEARN_KEY)).toBeNull();
  await expect(page.getByRole('button', { name: '帶入現有進度', exact: true })).toBeDisabled();
  await expect(page.getByRole('region', { name: '舊版學習紀錄' })).toContainText('本頁已有尚未保存的新完成');
  const warning = page.waitForEvent('dialog'), reload = page.evaluate(() => location.reload());
  const dialog = await warning; expect(dialog.type()).toBe('beforeunload'); await dialog.dismiss(); await reload;
  page.once('dialog', d => d.dismiss()); await click(page, '從新版重新開始');
  expect(await read(page, LEARN_KEY)).toBeNull();
  page.once('dialog', d => d.accept()); await click(page, '從新版重新開始');
  await expect.poll(async () => (await course(page))?.lessons[0]).toEqual({ read: true, guided: false, independent: false });
  expect((await course(page)).lessons[1]).toEqual(blank);
  expect(await read(page, LEGACY_LEARN_KEY)).toBe(OLD);
});

for (const kind of ['broken', 'future', 'unreadable']) test(`舊版${kind}：不帶入、原檔不動，只能明確從新版開始`, async ({ page }) => {
  const bad = kind === 'future' ? JSON.stringify({ ...JSON.parse(OLD), courseVersion: 'beginner-1-3-v9' }) : '{broken';
  if (kind === 'unreadable') await page.addInitScript(key => {
    const get = Storage.prototype.getItem;
    Storage.prototype.getItem = function(k) { if (k === key) throw new DOMException('Test read failure', 'SecurityError'); return get.call(this, k); };
  }, LEGACY_LEARN_KEY);
  await seeded(page, kind === 'unreadable' ? {} : { [LEGACY_LEARN_KEY]: bad });
  const panel = page.getByRole('region', { name: '舊版學習紀錄' });
  await expect(panel).toContainText(kind === 'unreadable' ? '讀不到' : '損壞或版本不符');
  await expect(page.getByRole('button', { name: '帶入現有進度', exact: true })).toHaveCount(0);
  await expect(page.getByLabel('舊版紀錄原文（唯讀，可複製）')).toHaveCount(kind === 'unreadable' ? 0 : 1);
  await click(page, '我讀完了，開始示範');
  expect(await read(page, LEARN_KEY)).toBeNull();
  page.once('dialog', d => d.accept()); await click(page, '從新版重新開始');
  await expect.poll(async () => (await course(page))?.lessons[0].read).toBe(true);
  expect(await page.evaluate(key => { try { return localStorage.getItem(key); } catch { return 'unreadable'; } }, LEGACY_LEARN_KEY)).toBe(kind === 'unreadable' ? 'unreadable' : bad);
});

test('已有新版紀錄優先；新版壞檔不改讀舊版也不覆寫', async ({ page, context }) => {
  const v2 = encodeLearningProgress(markLesson(emptyProgress(), 4, 'guided'));
  await seeded(page, { [LEGACY_LEARN_KEY]: OLD, [LEARN_KEY]: v2 });
  await expect(page.getByRole('region', { name: '舊版學習紀錄' })).toHaveCount(0);
  await expect(page.locator('.progress-list')).toContainText('第5課：已閱讀 ✓ · 提示下完成 ✓');
  const second = await context.newPage();
  await second.addInitScript(data => { for (const [k, v] of Object.entries(data)) localStorage.setItem(k, v); }, { [LEGACY_LEARN_KEY]: OLD, [LEARN_KEY]: JSON.stringify({ ...JSON.parse(v2), schemaVersion: 3 }) });
  await second.goto('/learn.html');
  await expect(second.locator('#save-notice')).toContainText('原檔已保留');
  await expect(second.getByRole('region', { name: '舊版學習紀錄' })).toHaveCount(0);
  await second.getByRole('button', { name: '我讀完了，開始示範', exact: true }).click();
  expect(JSON.parse(await read(second, LEARN_KEY)).schemaVersion).toBe(3); expect(await read(second, LEGACY_LEARN_KEY)).toBe(OLD);
  await second.close();
});

test('帶入失敗可重試：配額、鎖忙、舊原文已變需重新預覽、下載失敗仍可複製、取消零寫入', async ({ page }) => {
  await page.addInitScript(key => {
    window.__failNew = true; window.__newWrites = 0; const set = Storage.prototype.setItem;
    Storage.prototype.setItem = function(k, v) { if (k === key) { if (window.__failNew) throw new DOMException('Test quota', 'QuotaExceededError'); window.__newWrites++; } return set.call(this, k, v); };
    URL.createObjectURL = () => { throw new Error('Test download failure'); };
  }, LEARN_KEY);
  await seeded(page, { [LEGACY_LEARN_KEY]: OLD });
  await click(page, '下載舊版紀錄原文');
  await expect(page.getByRole('region', { name: '舊版學習紀錄' })).toContainText('下載未成功；可複製上方原文');
  await expect(page.getByLabel('舊版紀錄原文（唯讀，可複製）')).toHaveValue(OLD);
  await click(page, '帶入現有進度');
  await expect(page.locator('#save-notice')).toContainText('帶入沒有完成');
  expect(await read(page, LEARN_KEY)).toBeNull(); await expect(page.locator('#learning-progress > .progress-list')).toContainText('第1課：已閱讀 — ');
  await page.evaluate(() => { window.__failNew = false; window.__releaseHold = null; navigator.locks.request('tw16:learn:v1', () => new Promise(r => window.__releaseHold = r)); });
  await expect.poll(() => page.evaluate(() => typeof window.__releaseHold)).toBe('function');
  await click(page, '帶入現有進度');
  await expect(page.locator('#save-notice')).toContainText('帶入沒有完成');
  await page.evaluate(() => window.__releaseHold());
  const changed = legacyRaw([{ read: true, guided: false, independent: false }, blank, blank]);
  await page.evaluate(({ key, value }) => localStorage.setItem(key, value), { key: LEGACY_LEARN_KEY, value: changed });
  await click(page, '帶入現有進度');
  await expect(page.locator('#save-notice')).toContainText('舊版紀錄已在其他頁變更，沒有帶入');
  await expect(page.getByLabel('舊版紀錄原文（唯讀，可複製）')).toHaveValue(changed);
  expect(await read(page, LEARN_KEY)).toBeNull();
  page.once('dialog', d => d.dismiss()); await click(page, '從新版重新開始');
  expect(await read(page, LEARN_KEY)).toBeNull(); expect(await page.evaluate(() => window.__newWrites)).toBe(0);
  await click(page, '帶入現有進度');
  await expect.poll(async () => (await course(page))?.lessons[0]).toEqual({ read: true, guided: false, independent: false });
  expect(await page.evaluate(() => window.__newWrites)).toBe(1); expect(await read(page, LEGACY_LEARN_KEY)).toBe(changed);
});

test('等待鎖時停用課程與導覽、雙擊只寫一次；兩頁同時預覽時另一頁停止覆寫', async ({ page, context }) => {
  await page.addInitScript(key => {
    window.__newWrites = 0; const set = Storage.prototype.setItem;
    Storage.prototype.setItem = function(k, v) { if (k === key) window.__newWrites++; return set.call(this, k, v); };
  }, LEARN_KEY);
  await seeded(page, { [LEGACY_LEARN_KEY]: OLD });
  const second = await context.newPage(); await second.goto('/learn.html');
  await expect(second.getByRole('button', { name: '帶入現有進度', exact: true })).toBeEnabled();
  await page.evaluate(key => {
    window.__pause = true; const request = navigator.locks.request.bind(navigator.locks);
    navigator.locks.request = (name, options, callback) => request(name, options, async lock => {
      if (name === key && window.__pause) await new Promise(resolve => window.__releaseLock = resolve);
      return callback(lock);
    });
  }, LEARN_KEY);
  const importButton = page.getByRole('button', { name: '帶入現有進度', exact: true });
  await importButton.dblclick();
  await expect.poll(() => page.evaluate(() => typeof window.__releaseLock)).toBe('function');
  await expect(importButton).toBeDisabled();
  await expect(page.getByRole('button', { name: '1. 認牌與桌面', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: '我讀完了，開始示範', exact: true })).toBeDisabled();
  await page.evaluate(() => { window.__pause = false; window.__releaseLock(); });
  await expect(page.locator('#save-notice')).toContainText('已帶入並另存新版進度');
  await expect(page.getByRole('button', { name: '1. 認牌與桌面', exact: true })).toBeEnabled();
  expect(await page.evaluate(() => window.__newWrites)).toBe(1);
  await expect(second.locator('#save-notice')).toContainText('另一頁已更動學習進度');
  await expect(second.getByRole('button', { name: '帶入現有進度', exact: true })).toHaveCount(0);
  await second.getByRole('button', { name: '我讀完了，開始示範', exact: true }).click();
  expect(await read(page, LEARN_KEY)).toBe(await read(second, LEARN_KEY));
  expect((await course(page)).lessons[0]).toEqual(JSON.parse(OLD).lessons[0]);
  await second.close();
});
