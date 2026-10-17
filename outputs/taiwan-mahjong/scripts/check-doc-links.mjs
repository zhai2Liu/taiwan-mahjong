import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, isAbsolute, posix, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = execFileSync('git', ['rev-parse', '--show-toplevel'], { cwd: dirname(fileURLToPath(import.meta.url)), encoding: 'utf8' }).trim();
const tracked = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean);
const files = new Set(tracked), directories = new Set(['.']);
for (const file of tracked) for (let dir = posix.dirname(file); dir !== '.'; dir = posix.dirname(dir)) directories.add(dir);
const documents = tracked.filter(file => file.endsWith('.md') && (['README.md', 'AGENTS.md'].includes(file) || /^outputs\/taiwan-mahjong(?:-m0|-showcase)?\//.test(file)));
let checked = 0; const errors = [];
for (const file of documents) {
  let fence = null;
  for (const [index, line] of readFileSync(resolve(root, file), 'utf8').split(/\r?\n/).entries()) {
    const marker = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (fence) { if (marker && marker[1][0] === fence[0] && marker[1].length >= fence.length && !marker[2].trim()) fence = null; continue; }
    if (marker) { fence = marker[1]; continue; }
    // ponytail: current inline/image links outside fences; use a Markdown parser if reference/nested links are adopted.
    for (const match of line.matchAll(/!?\[[^\]\n]*\]\(\s*(<[^>\n]+>|[^\s)]+)(?:\s+"[^"\n]*")?\s*\)/g)) {
      const target = match[1].replace(/^<|>$/g, '');
      if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(target)) continue;
      checked++;
      try {
        const local = decodeURIComponent(target.split(/[?#]/)[0]);
        const destination = local ? resolve(root, dirname(file), local) : resolve(root, file);
        const name = relative(root, destination).split(sep).join('/') || '.';
        const outside = name === '..' || name.startsWith('../') || isAbsolute(name);
        if (outside || !existsSync(destination) || !files.has(name) && !directories.has(name)) errors.push(`${file}:${index + 1} → ${target}（不存在、未追蹤、大小寫不符或不在專案內）`);
      } catch { errors.push(`${file}:${index + 1} → ${target}（路徑編碼無效）`); }
    }
  }
}
console.log(`文件 ${documents.length} 份，本機連結 ${checked} 個，問題 ${errors.length} 個。`);
for (const error of errors) console.error(error);
if (errors.length) process.exitCode = 1;
