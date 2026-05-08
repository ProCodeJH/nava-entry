// refine.mjs — 자가 수정 루프
//
// 검증 실패 시 errors를 Gemini에게 다시 보내 fix 요청.
// 1차 시도 실패 → 2차 refine → 검증 → (선택) 3차.
//
// 사용:
//   import { generateAndRefine } from './refine.mjs';
//   const result = await generateAndRefine({ provider, system, user, gameSpec });

import { validateCode } from './validate.mjs';

function extractCode(text) {
  const patterns = [
    /```(?:python|py|Python)?\s*\r?\n([\s\S]*?)\r?\n?```/,
    /```\s*\r?\n([\s\S]*?)```/,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m) return m[1].trim();
  }
  return text.replace(/^[\s\S]*?(?=def\s+when_|score\s*=|점수\s*=)/, '').trim();
}

function buildRefinementPrompt(originalUser, code, validation) {
  const errorList = validation.issues
    .filter(i => i.severity === 'error')
    .map(i => `- [${i.type}] ${i.detail}`)
    .join('\n');
  const warnList = validation.issues
    .filter(i => i.severity === 'warn')
    .map(i => `- [${i.type}] ${i.detail}`)
    .join('\n');

  return `이전 응답에서 다음 문제가 발견됐다. 같은 게임 요청을 재작성해라.

원래 요청: ${originalUser}

이전 코드:
\`\`\`python
${code}
\`\`\`

수정해야 할 에러:
${errorList || '(없음)'}

경고 (가능하면 fix):
${warnList || '(없음)'}

요구사항:
1. 모든 에러 해결
2. import / class / with / try / time.sleep / print / input / lambda 절대 금지
3. cheatsheet의 Entry.xxx 함수만 사용
4. 코드만 \`\`\`python ... \`\`\` 한 블록으로 출력 (설명 없음)`;
}

export async function generateAndRefine({
  provider,
  system,
  user,
  gameSpec,
  maxRefinements = 1,
  temperature = 0.2,
  maxTokens = 4096,
}) {
  const attempts = [];

  // 1차 시도
  let result = await provider.generate({ system, user, temperature, maxTokens });
  let code = extractCode(result.text);
  let validation = validateCode(code, gameSpec);
  attempts.push({ attempt: 1, valid: validation.valid, score: validation.score, errors: validation.errors, elapsedMs: result.elapsedMs });

  // 추가 refine 라운드
  for (let i = 1; i <= maxRefinements; i++) {
    if (validation.valid && validation.errors === 0) break;
    const refinedUser = buildRefinementPrompt(user, code, validation);
    result = await provider.generate({ system, user: refinedUser, temperature: 0.1, maxTokens });
    code = extractCode(result.text);
    validation = validateCode(code, gameSpec);
    attempts.push({ attempt: i + 1, valid: validation.valid, score: validation.score, errors: validation.errors, elapsedMs: result.elapsedMs });
  }

  return {
    code,
    validation,
    attempts,
    finalProvider: result.provider,
    finalModel: result.model,
    finalUsage: result.usage,
  };
}
