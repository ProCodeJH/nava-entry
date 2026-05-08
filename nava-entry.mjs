#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { selectProvider } from './providers/index.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const CHEATSHEET = readFileSync(join(ROOT, 'cheatsheet.md'), 'utf8');

const SYSTEM_PROMPT = `당신은 엔트리(Entry, playentry.org) 파이썬 코드 전문가입니다.
사용자가 게임 아이디어를 자연어로 주면, 작동하는 엔트리 Python 코드를 생성합니다.

# 엔트리 Python 규칙

1. 함수: 아래 cheatsheet의 \`Entry.xxx\` 함수만 사용. 다른 이름 만들면 안 됨.
2. 표준 Python 일부 가능: \`random.randint(a,b)\`, \`len()\`, \`range()\`, list/str 메서드
3. 이벤트 핸들러:
   - \`def when_start():\` (시작 버튼)
   - \`def when_press_key("space"):\` (키 입력)
   - \`def when_click_object_on():\` (오브젝트 클릭)
   - \`def when_get_signal("신호명"):\` (신호 받음)
4. 변수: 일반 Python (\`점수 = 0\`, \`점수 += 1\`). 사용 전 엔트리에서 변수 생성 필요.
5. 들여쓰기: 4 spaces
6. 금지: \`import\`, \`time.sleep\`, \`print()\`, \`input()\`, \`class\`, \`with\`, \`try\`, \`lambda\`

# 엔트리 함수 레퍼런스

${CHEATSHEET}

# 출력 형식

Python 코드만 \`\`\`python ... \`\`\` 블록 하나로 출력.
코드 시작 부분에 한국어 주석으로:
- 필요 변수 (있으면)
- 필요 신호 (있으면)
- 필요 오브젝트 (있으면)
- 조작법 (있으면)

코드 외 설명/잡담 금지. 자현이 복사해서 엔트리에 붙여넣을 수 있어야 함.`;

async function callProvider(query, opts = {}) {
  const provider = selectProvider();
  const result = await provider.generate({
    system: SYSTEM_PROMPT,
    user: query,
    temperature: opts.temperature ?? 0.2,
    maxTokens: opts.maxTokens ?? 4096,
  });
  return result;
}

function extractCode(text) {
  const m = text.match(/```(?:python|py)?\s*\n([\s\S]*?)```/);
  return m ? m[1].trim() : text.trim();
}

async function main() {
  const args = process.argv.slice(2);
  const flags = { json: false, raw: false, copy: false };
  const queryParts = [];
  for (const a of args) {
    if (a === '--json') flags.json = true;
    else if (a === '--raw') flags.raw = true;
    else if (a === '--copy') flags.copy = true;
    else if (a === '-h' || a === '--help') {
      process.stdout.write(`nava-entry — 엔트리 파이썬 코드 생성기 (Gemini Flash 2.0 / DeepSeek V3)

사용법:
  nava-entry "<게임 아이디어>"      # 코드 출력
  nava-entry "<game>" --raw         # 코드만 (헤더 없이)
  nava-entry "<game>" --json        # JSON 응답 (디버그)
  nava-entry "<game>" --copy        # 코드 + 클립보드 복사 (Windows)

예시:
  nava-entry "벽돌깨기 게임"
  nava-entry "플래피 버드"
  nava-entry "좀비 슈팅 게임"
  nava-entry "스네이크 게임"

환경변수 (provider auto-select, Gemini 우선):
  GEMINI_API_KEY     무료 (https://aistudio.google.com/apikey)
  DEEPSEEK_API_KEY   유료 ($0.14/1M, prompt caching)
  NAVA_ENTRY_PROVIDER=gemini|deepseek  override
`);
      process.exit(0);
    } else queryParts.push(a);
  }

  const query = queryParts.join(' ');
  if (!query) {
    process.stderr.write('Error: 게임 아이디어 입력 필요. --help 참조.\n');
    process.exit(2);
  }

  const result = await callProvider(query);
  const elapsed = (result.elapsedMs / 1000).toFixed(1);

  if (flags.json) {
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    return;
  }

  const code = extractCode(result.text);

  if (flags.raw) {
    process.stdout.write(code + '\n');
  } else {
    const u = result.usage || {};
    const cached = u.cached_tokens > 0 ? ` (cache ${u.cached_tokens})` : '';
    process.stdout.write(`\n${'─'.repeat(60)}\n`);
    process.stdout.write(`nava-entry [${result.provider}/${result.model}] — "${query}"\n`);
    process.stdout.write(`${'─'.repeat(60)}\n`);
    process.stdout.write(`${elapsed}s | in=${u.input_tokens}${cached} out=${u.output_tokens}\n\n`);
    process.stdout.write(code + '\n');
    process.stdout.write(`\n${'─'.repeat(60)}\n`);
    process.stdout.write('위 코드 복사 → 엔트리 → 텍스트 코딩 (Python) → 붙여넣기\n');
  }

  if (flags.copy && process.platform === 'win32') {
    const { spawn } = await import('node:child_process');
    const clip = spawn('clip');
    clip.stdin.write(code);
    clip.stdin.end();
    process.stdout.write('📋 클립보드 복사 완료\n');
  }
}

main().catch((e) => {
  process.stderr.write(`Error: ${e.message}\n`);
  process.exit(1);
});
