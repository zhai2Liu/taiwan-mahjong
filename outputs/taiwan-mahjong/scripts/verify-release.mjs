import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const build = new URL('../site/', import.meta.url);
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
try {
  if (process.argv.length !== 3) throw Error('用法：npm run verify:release -- https://目前正式網址/專案路徑/');
  const base = new URL(process.argv[2]);
  if (!['http:', 'https:'].includes(base.protocol) || base.username || base.password || base.search || base.hash || !base.pathname.endsWith('/')) throw Error('網址須為無帳密、查詢或錨點，且以 / 結尾的HTTP(S)專案目錄。');
  const assets = new Map();
  async function remote(url) {
    let response;
    try { response = await fetch(url, { redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(15000) }); }
    catch { throw Error(`${url}無法讀取；請檢查連線／逾時，若網址轉址請改用最終網址。`); }
    if (response.status !== 200) throw Error(`${url}: HTTP ${response.status}`);
    return Buffer.from(await response.arrayBuffer());
  }
  for (const page of ['index.html', 'training.html', 'learn.html']) {
    const local = (await readFile(new URL(page, build), 'utf8')).replace(/\r\n/g, '\n');
    const published = (await remote(new URL(page, base))).toString('utf8').replace(/\r\n/g, '\n');
    if (digest(published) !== digest(local)) throw Error(`${page}與本機site不同；先核對指定提交及部署是否完成。`);
    // ponytail: current Vite HTML references only; use its manifest when dynamic chunks or other asset types are added.
    const refs = [...local.matchAll(/(?:src|href)="([^" ]+\.(?:js|css))"/g)].map(m => m[1]);
    if (!refs.some(r => r.endsWith('.js')) || !refs.some(r => r.endsWith('.css'))) throw Error(`${page}缺少JS或CSS引用。`);
    for (const ref of refs) {
      if (!/^\.\/assets\/[A-Za-z0-9_-]+\.(js|css)$/.test(ref)) throw Error(`${page}有非預期的資源路徑：${ref}`);
      if (assets.has(ref)) continue;
      const expected = digest(await readFile(new URL(ref, build))), actual = digest(await remote(new URL(ref, base)));
      if (actual !== expected) throw Error(`${ref}與本機site的SHA-256不同。`);
      assets.set(ref, actual);
    }
    console.log(JSON.stringify({ page, status: 200, htmlSha256: digest(published), refs }));
  }
  console.log(JSON.stringify({ base: base.href, pages: 3, assets: Object.fromEntries(assets), verified: true }));
} catch (error) { console.error(`發布核對失敗：${error.message}`); process.exitCode = 1; }
