// Gemini Flash 2.0 provider for nava-entry.
// Reads GEMINI_API_KEY from environment ONLY — never logs or returns the key.

const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';

export const PROVIDER_NAME = 'gemini';
// Note: gemini-2.0-flash is deprecated for new users (2026-04). Use 2.5 family.
// Free tier 한도 (낮은 → 높은): 2.5-pro < 2.5-flash < 2.5-flash-lite
//   - 2.5-flash:      10 RPM /  250K TPM /  250 RPD
//   - 2.5-flash-lite: 15 RPM /  250K TPM / 1500 RPD ← 학원 운영에 권장
//   - 2.5-pro: 5 RPM / 250K TPM / 25 RPD (유료 권장)
export const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';

export function hasKey() {
  return !!process.env.GEMINI_API_KEY;
}

export async function generate({ system, user, temperature = 0.2, maxTokens = 4096, model = DEFAULT_MODEL }) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY env missing');

  const url = `${ENDPOINT}/${model}:generateContent`;
  const body = {
    systemInstruction: system ? { parts: [{ text: system }] } : undefined,
    contents: [{ role: 'user', parts: [{ text: user }] }],
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
      responseMimeType: 'text/plain',
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ],
  };

  const t0 = Date.now();
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': key,
    },
    body: JSON.stringify(body),
  });
  const elapsedMs = Date.now() - t0;

  if (!res.ok) {
    const err = await res.text();
    // Strip key from any error message just in case
    const safeErr = err.replace(new RegExp(key, 'g'), '[REDACTED]');
    throw new Error(`Gemini API ${res.status}: ${safeErr.slice(0, 400)}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts
    ?.map((p) => p.text || '')
    .join('') || '';

  const usage = data.usageMetadata || {};
  return {
    provider: 'gemini',
    model: data.modelVersion || model,
    text,
    elapsedMs,
    usage: {
      input_tokens: usage.promptTokenCount || 0,
      output_tokens: usage.candidatesTokenCount || 0,
      total_tokens: usage.totalTokenCount || 0,
      cached_tokens: usage.cachedContentTokenCount || 0,
    },
    finish_reason: data.candidates?.[0]?.finishReason || 'unknown',
  };
}

export const PRICING = {
  'gemini-2.0-flash':       { input: 0,    output: 0,    cached: 0,    free_tier: '1M tokens/day, 15 req/min' },
  'gemini-2.0-flash-lite':  { input: 0,    output: 0,    cached: 0,    free_tier: 'higher RPM' },
  'gemini-2.5-flash':       { input: 0.30, output: 2.50, cached: 0.075, note: 'paid (free tier limits stricter)' },
  'gemini-2.5-pro':         { input: 1.25, output: 10.0, cached: 0.31,  note: 'best quality' },
};
