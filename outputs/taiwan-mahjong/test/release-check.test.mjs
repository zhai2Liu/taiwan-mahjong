import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, copyFile, writeFile, rm } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

test('發布CLI核對子路徑三頁／共用資源，拒絕不同HTML、資源、非200及轉址', async t => {
  const scratch = fileURLToPath(new URL('../../../work/', import.meta.url));
  await mkdir(scratch, { recursive: true });
  const folder = await mkdtemp(join(scratch, 'release-check-')), requests = new Map();
  let failure = '';
  const html = '<script type="module" src="./assets/app.js"></script><link rel="stylesheet" href="./assets/app.css">';
  const files = { 'index.html': html, 'training.html': html, 'learn.html': html, 'assets/app.js': '// synthetic release', 'assets/app.css': 'body{}' };
  const server = createServer((request, response) => {
    const path = request.url.startsWith('/mahjong/') ? request.url.slice('/mahjong/'.length) : '';
    requests.set(path, (requests.get(path) ?? 0) + 1);
    if (!Object.hasOwn(files, path)) { response.writeHead(404).end(); return; }
    if (failure === 'status' && path === 'learn.html') { response.writeHead(201).end(files[path]); return; }
    if (failure === 'missing' && path === 'learn.html') { response.writeHead(404).end(); return; }
    if (failure === 'redirect' && path === 'learn.html') { response.writeHead(302, { location: '/mahjong/index.html' }).end(); return; }
    const changed = failure === 'html' && path === 'index.html' || failure === 'asset' && path === 'assets/app.js';
    response.writeHead(200).end(files[path] + (changed ? 'changed' : ''));
  });
  t.after(async () => {
    if (server.listening) await new Promise(resolve => server.close(resolve));
    // Only remove this test's generated directory inside work/, never a computed source/build directory.
    assert.equal(dirname(resolve(folder)), resolve(scratch));
    await rm(folder, { recursive: true, force: true });
  });
  await mkdir(join(folder, 'scripts')); await mkdir(join(folder, 'site/assets'), { recursive: true });
  await copyFile(new URL('../scripts/verify-release.mjs', import.meta.url), join(folder, 'scripts/verify-release.mjs'));
  for (const [path, contents] of Object.entries(files)) await writeFile(join(folder, 'site', path), contents);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}/mahjong/`;
  const run = (...args) => new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [join(folder, 'scripts/verify-release.mjs'), ...args], { cwd: scratch, stdio: ['ignore', 'pipe', 'pipe'], timeout: 10000 });
    let output = ''; child.stdout.on('data', data => output += data); child.stderr.on('data', data => output += data);
    child.on('error', reject); child.on('close', code => resolve({ code, output }));
  });
  const good = await run(base); assert.equal(good.code, 0, good.output); assert.match(good.output, /"pages":3/); assert.match(good.output, /"verified":true/);
  assert.equal(requests.get('assets/app.js'), 1); assert.equal(requests.get('assets/app.css'), 1);
  for (failure of ['html', 'asset', 'missing', 'status', 'redirect']) {
    const bad = await run(base); assert.equal(bad.code, 1, `${failure}: ${bad.output}`); assert.match(bad.output, /發布核對失敗/); assert.doesNotMatch(bad.output, /"verified":true/);
    assert.match(bad.output, { html: /index\.html與本機site不同/, asset: /SHA-256不同/, missing: /HTTP 404/, status: /HTTP 201/, redirect: /轉址/ }[failure]);
  }
  failure = '';
  const requestCount = () => [...requests.values()].reduce((a, b) => a + b, 0), beforeInvalid = requestCount();
  for (const args of [[], ['file:///tmp/site/'], [base + '?unexpected=1'], [base.slice(0, -1)]]) {
    const bad = await run(...args); assert.equal(bad.code, 1, bad.output); assert.match(bad.output, /用法|網址須/);
  }
  assert.equal(requestCount(), beforeInvalid);
});
