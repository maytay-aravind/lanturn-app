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

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);

  try {
    const res = await fetch(DEEPSEEK_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text();
      log.error({ status: res.status, body: text }, 'Deepseek API error');
      throw AppError.upstream(`Deepseek API error (${res.status})`);
    }

    const json = await res.json();
    const text = json.choices?.[0]?.message?.content;
    if (!text) {
      throw AppError.upstream('Empty response from Deepseek');
    }

    return text;
  } finally {
    clearTimeout(timeout);
  }
}
