// 比較 TypeScript 檔在指定 Git 版本與工作樹之間的語法差異（忽略空白、換行、註解與尾逗號）。
// 兩邊各自解析成語法樹，依序取出每個詞，在 ; { } 後統一斷行，再以 git diff 顯示。
// 純換行／縮排調整不會產生差異；有輸出就代表程式文字真的不同，需逐項核對。
// 用法：node scripts/compare-tokens.mjs <git-ref> <src/檔案.ts>...
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, basename } from 'node:path';
import ts from 'typescript';

const [ref, ...files] = process.argv.slice(2);
if (!ref || !files.length) throw new Error('用法：compare-tokens.mjs <git-ref> <file>...');
function normalize(name, text) {
  const source = ts.createSourceFile(name, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  let out = '';
  const visit = node => {
    const children = node.getChildren(source);
    if (!children.length) {
      const word = node.getText(source);
      if (!word) return;
      out += word + (/^[;{}]$/.test(word) ? '\n' : ' ');
      return;
    }
    children.forEach(visit);
  };
  visit(source);
  out = out.replace(/, (?=[}\])](?:\s|$))/g, ''); // 尾逗號不影響語意。
  return out.split('\n').map(line => line.trim()).filter(Boolean).join('\n') + '\n';
}
const dir = mkdtempSync(join(tmpdir(), 'compare-tokens-'));
let changed = 0;
try {
  for (const file of files) {
    const path = execFileSync('git', ['ls-files', '--full-name', file], { encoding: 'utf8' }).trim();
    if (!path) throw new Error(`不在 Git 追蹤中：${file}`);
    const before = join(dir, `before-${basename(file)}`), after = join(dir, `after-${basename(file)}`);
    writeFileSync(before, normalize(file, execFileSync('git', ['show', `${ref}:${path}`], { encoding: 'utf8', maxBuffer: 1 << 26 })));
    writeFileSync(after, normalize(file, readFileSync(file, 'utf8')));
    const diff = spawnSync('git', ['diff', '--no-index', '--no-color', '-U0', before, after], { encoding: 'utf8' });
    if (diff.status === 0) console.log(`${file}：語法相同（只有空白、換行或註解不同）。`);
    else { changed++; console.log(`${file}：有語法差異，請逐項核對：\n${diff.stdout.split('\n').slice(4).join('\n')}`); }
  }
} finally { rmSync(dir, { recursive: true, force: true }); }
console.log(changed ? `${changed} 個檔案有語法差異。` : '全部檔案語法相同。');
