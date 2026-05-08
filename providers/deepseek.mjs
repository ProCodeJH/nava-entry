// DeepSeek V3 provider for nava-entry (legacy, retained for compatibility).
// Reads DEEPSEEK_API_KEY from environment ONLY.

const ENDPOINT = 'https://api.deepseek.com/v1/chat/completions';

export const PROVIDER_NAME = 'deepseek';
export const DEFAULT_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

export function hasKey() {
  return !!process.env.DEEPSEEK_API_KEY;
}

export async function generate({ system, user, temperature = 0.2, maxTokens = 4096, model = DEFAULT_MODEL }) {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) throw new Error('DEEPSEEK_API_KEY env missing');

  const t0 = Date.now();
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature,
      max_tokens: maxTokens,
      stream: false,
    }),
  });
  const elapsedMs = Date.now() - t0;

  if (!res.ok) {
    const err = await res.text();
    const safeErr = err.replace(new RegExp(key, 'g'), '[REDACTED]');
    throw new Error(`DeepSeek API ${res.status}: ${safeErr.slice(0, 400)}`);
  }

  const data = await res.json();
  const u = data.usage || {};
  return {
    provider: 'deepseek',
    model: data.model || model,
    text: data.choices?.[0]?.message?.content || '',
    elapsedMs,
    usage: {
      input_tokens: u.prompt_tokens || 0,
      output_tokens: u.completion_tokens || 0,
      total_tokens: u.total_tokens || 0,
      cached_tokens: u.prompt_cache_hit_tokens || 0,
    },
    finish_reason: data.choices?.[0]?.finish_reason || 'unknown',
  };
}

export const PRICING = {
  'deepseek-chat': { input: 0.14, output: 0.28, cached: 0.014, note: 'V3, prompt caching' },
};
