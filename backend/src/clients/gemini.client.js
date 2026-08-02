import { env } from '#config';
import { logger_for } from '#utils/logger.js';
import { AppError } from '#utils/httpErrors.js';

const log = logger_for('gemini.client');

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const MODEL = 'gemini-3.5-flash-lite';

/**
 * Call the Gemini API with a structured prompt.
 * Returns parsed JSON if responseFormat is set, else raw text.
 */
export async function callGemini({ systemPrompt, userContent, responseFormat, temperature = 0.3 }) {
  if (!env.GEMINI_API_KEY) {
    throw AppError.unprocessable('Gemini API key not configured. Set GEMINI_API_KEY in your .env file.');
  }

  const url = `${GEMINI_BASE}/${MODEL}:generateContent?key=${env.GEMINI_API_KEY}`;

  const body = {
    contents: [
      { role: 'user', parts: [{ text: userContent }] },
    ],
    generationConfig: {
      temperature,
      maxOutputTokens: 2048,
      ...(responseFormat
        ? { responseMimeType: 'application/json' }
        : {}),
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
    ],
  };

  // Prepend system instruction
  if (systemPrompt) {
    body.systemInstruction = { parts: [{ text: systemPrompt }] };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text();
      log.error({ status: res.status, body: text }, 'Gemini API error');
      // Parse the error for a user-friendly message
      let errMsg = `Gemini API error (${res.status})`;
      try {
        const errJson = JSON.parse(text);
        errMsg = errJson?.error?.message || errMsg;
      } catch { /* use default */ }
      throw AppError.upstream(errMsg);
    }

    const json = await res.json();
    const candidate = json.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text;
    if (!text) {
      if (candidate?.finishReason === 'SAFETY') {
        throw AppError.unprocessable('Response blocked by safety filters. Try rephrasing your input.');
      }
      log.error({ json: JSON.stringify(json).slice(0, 500) }, 'Empty response from Gemini');
      throw AppError.upstream('Empty response from Gemini — please try again');
    }

    if (responseFormat) {
      try {
        return JSON.parse(text);
      } catch {
        // Attempt to extract JSON from markdown code blocks
        const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (match) return JSON.parse(match[1]);
        log.error({ rawText: text.slice(0, 500) }, 'Invalid JSON from Gemini');
        throw AppError.upstream('Invalid response format from Gemini — please try again');
      }
    }

    return text;
  } finally {
    clearTimeout(timeout);
  }
}
