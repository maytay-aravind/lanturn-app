import { env } from '#config';
import { logger_for } from '#utils/logger.js';
import { AppError } from '#utils/httpErrors.js';

const log = logger_for('deepseek.client');

const DEEPSEEK_BASE = 'https://api.deepseek.com/chat/completions';
const MODEL = 'deepseek-chat';

export async function callDeepseek({ systemPrompt, userContent, temperature = 0.7 }) {
  if (!env.DEEPSEEK_API_KEY) {
    throw AppError.unprocessable('Deepseek API key not configured. Set DEEPSEEK_API_KEY in your .env file.');
  }

  // Parse keys, treating it as a comma-separated list
  const keys = env.DEEPSEEK_API_KEY.split(',').map(k => k.trim()).filter(Boolean);
  if (keys.length === 0) {
    throw AppError.unprocessable('Deepseek API key not configured.');
  }

  const messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: userContent });

  const body = {
    model: MODEL,
    messages,
    temperature,
    max_tokens: 2048,
  };

  let lastError;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);

    try {
      const res = await fetch(DEEPSEEK_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!res.ok) {
        const text = await res.text();
        log.error({ status: res.status, keyIndex: i }, 'Deepseek API error');
        
        // If rate limited (429) or server overload (5xx) and we have more keys, retry
        if ((res.status === 429 || res.status >= 500) && i < keys.length - 1) {
          log.info(`Key ${i + 1} overloaded/limited (${res.status}). Retrying with next key...`);
          lastError = AppError.upstream(`Deepseek API error (${res.status})`);
          continue;
        }

        throw AppError.upstream(`Deepseek API error (${res.status})`);
      }

      const json = await res.json();
      const text = json.choices?.[0]?.message?.content;
      if (!text) {
        throw AppError.upstream('Empty response from Deepseek');
      }

      return text;
    } catch (err) {
      if (err.name === 'AbortError' && i < keys.length - 1) {
        log.warn(`Timeout on key ${i + 1}. Retrying with next key...`);
        lastError = err;
        continue;
      }
      // Re-throw if it's the last key or not a retryable error
      if (i === keys.length - 1) throw err;
    } finally {
      clearTimeout(timeout);
    }
  }

  if (lastError) throw lastError;
}
