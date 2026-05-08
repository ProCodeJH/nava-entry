// Provider router — auto-selects available API key.
// Priority: GEMINI (free) > DEEPSEEK (paid).
// Override: NAVA_ENTRY_PROVIDER=gemini|deepseek

import * as gemini from './gemini.mjs';
import * as deepseek from './deepseek.mjs';

const PROVIDERS = { gemini, deepseek };

export function selectProvider() {
  const override = process.env.NAVA_ENTRY_PROVIDER;
  if (override && PROVIDERS[override]) {
    if (!PROVIDERS[override].hasKey()) {
      throw new Error(`NAVA_ENTRY_PROVIDER=${override} but ${override.toUpperCase()}_API_KEY not set`);
    }
    return PROVIDERS[override];
  }
  if (gemini.hasKey()) return gemini;
  if (deepseek.hasKey()) return deepseek;
  throw new Error(
    'No provider key found. Set GEMINI_API_KEY (free) or DEEPSEEK_API_KEY in environment.\n' +
    '  Gemini (free): https://aistudio.google.com/apikey\n' +
    '  PowerShell: [Environment]::SetEnvironmentVariable("GEMINI_API_KEY", "AIza...", "User")'
  );
}

export { gemini, deepseek };
