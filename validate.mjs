// validate.mjs — nava-entry 출력 코드 자동 검증
//
// 검증 항목:
//   1. Python syntax 형태 (들여쓰기, def, 콜론)
//   2. 금지 키워드 (import, class, with, time.sleep, print, input, lambda, try)
//   3. Entry API 매칭 (cheatsheet의 Entry.xxx 함수만 사용)
//   4. 이벤트 핸들러 (def when_xxx():)
//   5. game-specific must_use / must_not_use / expected_handlers

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));

// cheatsheet에서 사용 가능한 Entry.xxx 함수 + when_xxx 핸들러 추출
function loadCheatsheet() {
  const text = readFileSync(join(ROOT, 'cheatsheet.md'), 'utf8');
  const allowedEntry = new Set();
  const allowedHandlers = new Set();
  for (const m of text.matchAll(/Entry\.(\w+)/g)) allowedEntry.add(m[1]);
  for (const m of text.matchAll(/def\s+(when_\w+)/g)) allowedHandlers.add(m[1]);
  return { allowedEntry, allowedHandlers };
}

const FORBIDDEN_KEYWORDS = ['import ', 'class ', 'with ', 'time.sleep', 'print(', 'input(', 'lambda ', 'try:', 'except'];
const FORBIDDEN_PATTERNS = [
  { pattern: /^\s*import\b/m, name: 'import' },
  { pattern: /^\s*from\s+\w+\s+import/m, name: 'from-import' },
  { pattern: /^\s*class\s+\w+/m, name: 'class' },
  { pattern: /^\s*with\s+/m, name: 'with' },
  { pattern: /\btime\.sleep\b/, name: 'time.sleep' },
  { pattern: /^\s*print\s*\(/m, name: 'print' },
  { pattern: /^\s*input\s*\(/m, name: 'input' },
  { pattern: /\blambda\b/, name: 'lambda' },
  { pattern: /^\s*try\s*:/m, name: 'try-except' },
];

export function validateCode(code, gameSpec = null) {
  const { allowedEntry, allowedHandlers } = loadCheatsheet();
  const issues = [];
  const usedEntry = new Set();
  const usedHandlers = new Set();

  // 1. 금지 키워드
  for (const { pattern, name } of FORBIDDEN_PATTERNS) {
    if (pattern.test(code)) issues.push({ severity: 'error', type: 'forbidden', detail: name });
  }

  // 2. Entry.xxx 사용
  for (const m of code.matchAll(/Entry\.(\w+)/g)) {
    const fn = m[1];
    usedEntry.add(fn);
    if (!allowedEntry.has(fn)) {
      issues.push({ severity: 'warn', type: 'unknown_entry_fn', detail: `Entry.${fn}` });
    }
  }

  // 3. 핸들러
  for (const m of code.matchAll(/def\s+(when_\w+)/g)) {
    const h = m[1];
    usedHandlers.add(h);
    if (!allowedHandlers.has(h)) {
      issues.push({ severity: 'warn', type: 'unknown_handler', detail: h });
    }
  }

  // 4. 들여쓰기 (4 spaces 권장 — tab/2 spaces 경고)
  if (/^\t/m.test(code)) issues.push({ severity: 'warn', type: 'tab_indent', detail: '탭 사용 (4 spaces 권장)' });

  // 5. game-specific
  if (gameSpec) {
    if (gameSpec.must_use) {
      for (const must of gameSpec.must_use) {
        // 함수명만 추출 (Entry.xxx 또는 when_xxx)
        const fnName = must.replace(/^Entry\./, '').split('(')[0];
        // 코드에 fnName 또는 풀 이름 포함되면 OK (substring 매칭)
        if (!code.includes(fnName) && !code.includes(must.split('(')[0])) {
          issues.push({ severity: 'warn', type: 'missing_must_use', detail: must });
        }
      }
    }
    if (gameSpec.must_not_use) {
      for (const banned of gameSpec.must_not_use) {
        if (code.includes(banned)) {
          issues.push({ severity: 'error', type: 'used_banned', detail: banned });
        }
      }
    }
    if (gameSpec.expected_handlers) {
      for (const h of gameSpec.expected_handlers) {
        if (!usedHandlers.has(h)) {
          issues.push({ severity: 'warn', type: 'missing_handler', detail: h });
        }
      }
    }
  }

  // 6. 기본 sanity — `def when_start():` 또는 다른 핸들러 1개 이상 있어야
  if (usedHandlers.size === 0) {
    issues.push({ severity: 'error', type: 'no_handler', detail: '이벤트 핸들러(def when_xxx) 없음' });
  }

  const errors = issues.filter(i => i.severity === 'error').length;
  const warnings = issues.filter(i => i.severity === 'warn').length;

  return {
    valid: errors === 0,
    score: Math.max(0, 100 - errors * 25 - warnings * 5),
    errors,
    warnings,
    issues,
    used_entry_fns: [...usedEntry],
    used_handlers: [...usedHandlers],
    code_lines: code.split('\n').length,
  };
}

// CLI 직접 실행 시
if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  const code = readFileSync(process.argv[2] || '/dev/stdin', 'utf8');
  const result = validateCode(code);
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.valid ? 0 : 1);
}
