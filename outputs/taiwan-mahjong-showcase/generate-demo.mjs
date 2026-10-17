// Run from any directory after the game build. Requires installed Chrome and FFmpeg on PATH.
// ponytail: this fixed walkthrough uses existing fixtures; update named steps when the UI changes, not a recorder framework.
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { chromium } from '../taiwan-mahjong/node_modules/playwright/index.mjs';
import { fixture, discard } from '../taiwan-mahjong/test/fixtures.mjs';
import { encodeSession } from '../taiwan-mahjong/dist/session.js';

const root = fileURLToPath(new URL('../../', import.meta.url));
const base = 'https://zhai2liu.github.io/taiwan-mahjong/';
await mkdir(join(root, 'work'), { recursive: true });
const scratch = await mkdtemp(join(root, 'work/showcase-'));
const gameKey = 'tw16:TW16-CLASSIC-v1:save';
const raw = encodeSession({ schemaVersion: 1, aiRandom: [17, 29, 43], game: discard(fixture({ turn: 3, hands: { 0: '22s123m456m123p11z347s', 3: '2s' } }), 3, '2s') });
const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext({ viewport: { width: 1920, height: 840 }, reducedMotion: 'reduce', recordVideo: { dir: scratch, size: { width: 1920, height: 840 } } });
const chapters = [], errors = [], sources = {};
let main, lesson, cut, started;
const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
async function chapter(page, id, text, milliseconds) {
  const start = chapters.length ? (performance.now() - started) / 1000 : 0;
  chapters.push({ id, start, text });
  await page.screenshot({ path: join(scratch, id + '.png') });
  await wait(milliseconds);
}
try {
  await context.addInitScript(({ raw, origin }) => { if (location.origin !== origin) return; if (localStorage.getItem('tw16:TW16-CLASSIC-v1:save') === null) { localStorage.setItem('tw16:TW16-CLASSIC-v1:save', raw); localStorage.setItem('tw16:coach:v1', 'after'); } }, { raw, origin: new URL(base).origin });
  started = performance.now(); main = await context.newPage();
  main.on('pageerror', error => errors.push(error.message));
  await main.goto(base);
  await chapter(main, '01-room', '青竹牌室｜台灣十六張麻將學習與決策練習\n合成牌例示範：1位真人與3位本地公平電腦', 5000);
  await main.clock.install({ time: new Date('2026-10-17T00:00:00Z') }); await main.clock.pauseAt(new Date('2026-10-17T00:00:01Z'));
  await main.getByRole('button', { name: '繼續上次牌局', exact: true }).click();
  await main.locator('[data-focus^="action-PON-"]').hover();
  await chapter(main, '02-table', '上家打出二條：先自行選擇碰、吃或過\n三家暗牌不揭露，正常回應依固定台灣桌規處理', 5000);
  await main.locator('[data-focus^="action-PON-"]').click(); await main.clock.runFor(2000);
  const explanation = main.getByRole('dialog', { name: '吃碰回應後解釋', exact: true });
  assert.ok((await explanation.textContent()).includes('你碰牌成立。你已取得這張牌。'));
  const pausedGame = await main.evaluate(key => localStorage.getItem(key), gameKey);
  await chapter(main, '03-arbitration', '仲裁完成後才顯示「碰牌成立」，牌局已暫停\n原本的選擇與實際取得牌，分開說明', 6000);
  await explanation.locator('.review-chosen summary').click();
  await chapter(main, '04-evidence', '展開比較取得牌後的合法打牌與有效進牌\n同時列出門清代價；這不是整局收益或放槍率', 5000);
  const popup = main.waitForEvent('popup').then(page => ({ page, at: performance.now() }));
  await explanation.getByRole('link', { name: '吃碰取捨練習（另開分頁）', exact: true }).click();
  const opened = await popup; lesson = opened.page; cut = (opened.at - started) / 1000;
  lesson.on('pageerror', error => errors.push(error.message)); await lesson.waitForLoadState();
  assert.equal(await lesson.locator('#skill-picker').inputValue(), 'claim-cost');
  await chapter(lesson, '05-practice', '同類練習實際另開分頁，原牌局仍保持暫停\n134萬遇上家2萬：請選出全部合法吃法', 5000);
  for (const name of ['1與3萬', '3與4萬']) await lesson.getByRole('checkbox', { name, exact: true }).check();
  await lesson.locator('#reason').fill('合成示範：123萬與234萬皆為連續三張；合法不代表一定值得吃。');
  await chapter(lesson, '06-answer', '選13與34，分別組成123萬、234萬\n先作答並留下理由，再查看推導', 5000);
  await lesson.getByRole('button', { name: '提交並看推導', exact: true }).click();
  await lesson.locator('section.answer').scrollIntoViewIfNeeded();
  await chapter(lesson, '07-explanation', '答案集合與推導可核對；自由文字理由仍未評閱\n提供類別導引的練習，不是正式能力測驗', 5000);
  await lesson.getByRole('button', { name: '保存作答到此瀏覽器', exact: true }).click();
  await lesson.locator('#storage-status').filter({ hasText: '已保存作答' }).waitFor();
  await chapter(lesson, '08-save', '手動保存到此瀏覽器，下次可接續同版作答\n需要交回時仍須自行匯出，不會自動上傳', 4000);
  await lesson.reload(); await lesson.locator('#storage-status').filter({ hasText: '已載入' }).waitFor();
  await lesson.locator('#storage-status').scrollIntoViewIfNeeded();
  assert.ok((await lesson.locator('#reason').inputValue()).startsWith('合成示範：'));
  await chapter(lesson, '09-resume', '重載後顯示已載入，選擇與理由仍保留\n先前是否看過題目預設未知，不當作首次證明', 4000);
  await lesson.goto(base + 'learn.html');
  await lesson.getByRole('button', { name: '3. 五組牌加一對眼睛', exact: true }).click();
  await lesson.getByRole('button', { name: '我讀完了，開始示範', exact: true }).click();
  await chapter(lesson, '10-lesson', '新手第3課：將17張牌整理成五組加一對眼睛\n每組都由玩家親手選牌、確認，重用既有規則', 5000);
  const groups = [['1m#0','2m#0','3m#0'], ['4m#0','5m#0','6m#0'], ['1p#0','2p#0','3p#0'], ['7p#0','8p#0','9p#0'], ['5s#0','5s#1','5s#2']];
  chapters.push({ id: '11-compose', start: (performance.now() - started) / 1000, text: '把順子與三張相同的牌逐組收好\n用過的牌不能再用，最後留下兩張相同的牌' });
  for (const group of groups) { for (const id of group) await lesson.locator(`#lesson [data-tile="${id}"]`).click(); await lesson.getByRole('button', { name: '收成一組', exact: true }).click(); await wait(700); }
  for (const id of ['7z#0', '7z#1']) await lesson.locator(`#lesson [data-tile="${id}"]`).click();
  await lesson.getByRole('button', { name: '留作眼睛', exact: true }).click();
  await chapter(lesson, '12-counterexample', '五組加眼睛後，再辨認哪副不符合一般牌形\n示例B的東、南、西不能組成順子', 4000);
  await lesson.getByRole('button', { name: /^示例B/ }).click();
  await lesson.locator('#lesson').filter({ hasText: '本段完成' }).waitFor();
  await chapter(lesson, '13-finish', '本次示範完成，紀錄與「換例自行完成」分開\n目前提供前三課；真人學習成效與指定實機仍待驗證', 5000);
  assert.equal(await main.evaluate(key => localStorage.getItem(key), gameKey), pausedGame);
  assert.ok(await explanation.isVisible()); assert.deepEqual(errors, []);
} finally { await context.close(); await browser.close(); await writeFile(join(scratch, 'attempt.json'), JSON.stringify({ chapters, errors, cut }, null, 2)); }
sources.main = await main.video().path(); sources.lesson = await lesson.video().path();
const probe = path => JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration,size:stream=codec_name,width,height', '-of', 'json', path], { encoding: 'utf8' }));
const duration = cut + Number(probe(sources.lesson).format.duration);
assert.ok(duration >= 60 && duration <= 90, 'Walkthrough must be 60–90 seconds');
const stamp = (seconds, separator, digits) => new Date(Math.round(seconds * 10 ** digits) * 1000 / 10 ** digits).toISOString().slice(11, 20 + digits).replace('.', separator);
const vtt = 'WEBVTT\n\n' + chapters.map((c, i) => `${i + 1}\n${stamp(c.start,'.',3)} --> ${stamp(chapters[i + 1]?.start ?? duration,'.',3)}\n${c.text}\n`).join('\n');
await writeFile(join(scratch, 'captions.vtt'), vtt);
const assHeader = '[Script Info]\nScriptType: v4.00+\nPlayResX: 1920\nPlayResY: 1080\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\nStyle: Default,Microsoft JhengHei,34,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,1,0,2,40,40,144,1\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n';
await writeFile(join(scratch, 'captions.ass'), assHeader + chapters.map((c, i) => `Dialogue: 0,${stamp(c.start,'.',2).slice(1)},${stamp(chapters[i + 1]?.start ?? duration,'.',2).slice(1)},Default,,0,0,0,,${c.text.replaceAll('\n','\\N')}\n`).join(''));
const output = join(scratch, 'demo.mp4');
const filters = `[0:v]trim=end=${cut.toFixed(3)},setpts=PTS-STARTPTS[first];[1:v]setpts=PTS-STARTPTS[second];[first][second]concat=n=2:v=1:a=0,pad=1920:1080:0:0:black,subtitles=captions.ass[out]`;
execFileSync('ffmpeg', ['-hide_banner','-loglevel','warning','-i',sources.main,'-i',sources.lesson,'-filter_complex',filters,'-map','[out]','-c:v','libx264','-preset','medium','-crf','23','-pix_fmt','yuv420p','-movflags','+faststart','-an',output], { cwd: scratch, stdio: 'inherit' });
const metadata = { base, source: 'isolated synthetic walkthrough', browser: browser.version(), viewport: { width: 1920, height: 840 }, errors, originalTableRemainsPaused: true, actualPopup: true, scratch, sources, cut, chapters, output, probe: probe(output) };
await writeFile(join(scratch, 'capture.json'), JSON.stringify(metadata, null, 2));
console.log(JSON.stringify(metadata));
// Candidate files stay in ignored work/. Inspect playback and captions before copying video/VTT to this folder.
