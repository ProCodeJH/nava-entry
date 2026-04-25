import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const RAW = join(ROOT, 'raw');

const CATEGORY_LABELS = {
  start: '시작 (이벤트)',
  flow: '흐름 (반복/조건)',
  moving: '움직임',
  looks: '생김새',
  brush: '붓',
  sound: '소리',
  judgement: '판단',
  calc: '계산',
  variable: '자료 (변수/리스트)',
  func: '함수',
  text: '글상자',
};

const ORDER = ['start', 'flow', 'moving', 'looks', 'brush', 'sound', 'judgement', 'calc', 'variable', 'func', 'text'];

function extractBlocks(content, category) {
  const blocks = [];
  const re = /^( {12})([a-z_][a-z0-9_]*)\s*:\s*\{$/gm;
  const positions = [];
  for (const m of content.matchAll(re)) positions.push({ name: m[2], idx: m.index });

  for (let i = 0; i < positions.length; i++) {
    const start = positions[i].idx;
    const end = i + 1 < positions.length ? positions[i + 1].idx : content.length;
    const slice = content.slice(start, end);

    const py = [];
    for (const arr of slice.matchAll(/py:\s*\[([\s\S]*?)\]/g)) {
      const inner = arr[1];
      const objs = [...inner.matchAll(/\{[\s\S]*?syntax:\s*['"`]([^'"`]+)['"`]/g)];
      if (objs.length) { objs.forEach((m) => py.push(m[1])); continue; }
      for (const m of inner.matchAll(/['"`]([^'"`]+)['"`]/g)) {
        if (m[1].trim()) py.push(m[1]);
      }
    }
    if (py.length) blocks.push({ category, name: positions[i].name, py });
  }
  return blocks;
}

const all = [];
for (const f of readdirSync(RAW).filter((x) => x.endsWith('.js'))) {
  const cat = f.replace(/^block_|\.js$/g, '');
  all.push(...extractBlocks(readFileSync(join(RAW, f), 'utf8'), cat));
}

const lines = [];
lines.push('# 엔트리 블록 → Python 변환 치트시트');
lines.push('');
lines.push(`총 ${all.length}블록. 출처: entryjs \`src/playground/blocks/block_*.js\` 자동 추출.`);
lines.push('');
lines.push('## 절대 규칙');
lines.push('');
lines.push('- `%1`, `%2` 등은 인자 placeholder');
lines.push('- 이벤트는 `def when_xxx():` 형식 (호출하지 않음, 엔트리 런타임이 자동)');
lines.push('- 액션은 `Entry.xxx()` 형식');
lines.push('- 변수는 일반 Python: `점수 = 0`, `점수 += 1`');
lines.push('- 들여쓰기 4 spaces');
lines.push('- 금지: `import`, `time.sleep`, `print()`, `input()`, `class`, `with`, `try`, `lambda`');
lines.push('- 표준 Python 일부 가능: `random.randint(a,b)`, `len()`, `range()`, list/str 메서드');
lines.push('');

for (const cat of ORDER) {
  const items = all.filter((b) => b.category === cat);
  if (!items.length) continue;
  lines.push(`## ${CATEGORY_LABELS[cat] || cat}`);
  lines.push('');
  for (const b of items) {
    const py = b.py.map((p) => '`' + p + '`').join(' / ');
    lines.push(`- \`${b.name}\` → ${py}`);
  }
  lines.push('');
}

writeFileSync(join(ROOT, 'cheatsheet.md'), lines.join('\n'));
writeFileSync(join(ROOT, 'blocks.json'), JSON.stringify({ total: all.length, blocks: all }, null, 2));
