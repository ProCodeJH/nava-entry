// benchmark.mjs — Phase 1 자동 정확도 검증
//
// games.json의 10개 게임을 자동 실행:
//   1. nava-entry로 코드 생성
//   2. validate.mjs로 검증
//   3. 메트릭 수집 (정확도, 응답시간, 토큰)
//   4. results/<timestamp>.json + summary 출력
//
// 통과 기준 (자현 룰): 게임 70%+ valid → Phase 2 진입 가능.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { selectProvider } from './providers/index.mjs';
import { validateCode } from './validate.mjs';
import { generateAndRefine } from './refine.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const RESULTS_DIR = join(ROOT, 'results');
if (!existsSync(RESULTS_DIR)) mkdirSync(RESULTS_DIR, { recursive: true });

const games = JSON.parse(readFileSync(join(ROOT, 'games.json'), 'utf8')).games;
// 압축된 치트시트 (7.7KB → ~3KB) — Implicit cache로 90% 토큰 절감
const cheatsheet = readFileSync(join(ROOT, 'compact-cheatsheet.md'), 'utf8');

const SYSTEM_PROMPT = `당신은 엔트리(Entry, playentry.org) Python 코드 전문가입니다.
사용자가 게임 아이디어를 주면 작동하는 엔트리 Python 코드를 생성합니다.

${cheatsheet}

# 출력 형식
\`\`\`python ... \`\`\` 한 블록만. 코드 외 설명 금지. 한국어 주석으로 변수/오브젝트/조작법 명시.`;

function extractCode(text) {
  // 다양한 markdown fence 형태 대응 (CRLF, trailing space, 다양한 lang tag)
  const patterns = [
    /```(?:python|py|Python)?\s*\r?\n([\s\S]*?)\r?\n?```/,
    /```\s*\r?\n([\s\S]*?)```/,
    /~~~(?:python|py)?\s*\r?\n([\s\S]*?)~~~/,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m) return m[1].trim();
  }
  // No fence — strip common preambles and return as-is
  return text.replace(/^[\s\S]*?(?=def\s+when_|score\s*=|점수\s*=|#\s)/, '').trim();
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function withRetry(fn, { retries = 3, baseDelayMs = 5000 } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      const is503 = /50\d|overloaded|rate.?limit|UNAVAILABLE/i.test(e.message);
      if (!is503 || attempt === retries) throw e;
      const delay = baseDelayMs * Math.pow(2, attempt);
      process.stdout.write(` (retry in ${delay/1000}s) `);
      await sleep(delay);
    }
  }
  throw lastErr;
}

async function runOne(game, provider) {
  const t0 = Date.now();
  let refined;
  try {
    refined = await withRetry(() => generateAndRefine({
      provider,
      system: SYSTEM_PROMPT,
      user: game.prompt,
      gameSpec: game,
      maxRefinements: 1,
      temperature: 0.2,
      maxTokens: 4096,
    }));
  } catch (e) {
    return {
      game: game.id,
      ok: false,
      error: e.message,
      elapsedMs: Date.now() - t0,
    };
  }

  return {
    game: game.id,
    name: game.name,
    category: game.category,
    ok: refined.validation.valid,
    score: refined.validation.score,
    errors: refined.validation.errors,
    warnings: refined.validation.warnings,
    issues: refined.validation.issues,
    elapsedMs: Date.now() - t0,
    tokens: refined.finalUsage,
    attempts: refined.attempts,
    used_entry_fns: refined.validation.used_entry_fns.length,
    used_handlers: refined.validation.used_handlers,
    code_lines: refined.validation.code_lines,
    code_preview: refined.code.split('\n').slice(0, 8).join('\n'),
  };
}

async function main() {
  const provider = selectProvider();
  console.log(`Provider: ${provider.PROVIDER_NAME} / ${provider.DEFAULT_MODEL}`);
  console.log(`Games: ${games.length}\n`);

  const results = [];
  // gemini-2.5-flash-lite: 15 RPM 한도 → 4초/req 안전.
  // 모델별 동적 조정.
  const RPM_INTERVAL_MS = provider.DEFAULT_MODEL?.includes('lite') ? 4500 : 6500;
  for (let i = 0; i < games.length; i++) {
    const game = games[i];
    process.stdout.write(`[${game.id}] ${game.name}... `);
    const r = await runOne(game, provider);
    results.push(r);
    if (r.ok) {
      console.log(`OK score=${r.score} ${(r.elapsedMs / 1000).toFixed(1)}s`);
    } else if (r.error) {
      console.log(`ERROR: ${r.error.slice(0, 80)}`);
    } else {
      console.log(`FAIL score=${r.score} errors=${r.errors} warnings=${r.warnings}`);
    }
    // Rate limit pacing (skip after last)
    if (i < games.length - 1) await sleep(RPM_INTERVAL_MS);
  }

  const valid = results.filter(r => r.ok).length;
  const passRate = (valid / results.length * 100).toFixed(1);
  const avgScore = (results.reduce((s, r) => s + (r.score || 0), 0) / results.length).toFixed(1);
  const avgMs = (results.reduce((s, r) => s + (r.elapsedMs || 0), 0) / results.length).toFixed(0);
  const totalIn = results.reduce((s, r) => s + (r.tokens?.input_tokens || 0), 0);
  const totalOut = results.reduce((s, r) => s + (r.tokens?.output_tokens || 0), 0);

  const summary = {
    timestamp: new Date().toISOString(),
    provider: provider.PROVIDER_NAME,
    model: provider.DEFAULT_MODEL,
    total_games: results.length,
    valid: valid,
    pass_rate_percent: parseFloat(passRate),
    avg_score: parseFloat(avgScore),
    avg_response_ms: parseInt(avgMs),
    total_tokens_in: totalIn,
    total_tokens_out: totalOut,
    phase1_gate_70: valid >= Math.ceil(games.length * 0.7),
    results,
  };

  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const outFile = join(RESULTS_DIR, `bench-${ts}.json`);
  writeFileSync(outFile, JSON.stringify(summary, null, 2));

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Pass: ${valid}/${results.length} (${passRate}%) | Avg score: ${avgScore} | Avg time: ${avgMs}ms`);
  console.log(`Tokens: in=${totalIn} out=${totalOut}`);
  console.log(`Phase 1 gate (70%+): ${summary.phase1_gate_70 ? '✓ PASSED → Phase 2' : '✗ FAILED → 재훈련 필요'}`);
  console.log(`Saved: ${outFile}`);
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
