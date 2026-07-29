import { env } from '#config';
import { logger_for } from '#utils/logger.js';

const log = logger_for('gemini.client');

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const MODEL = env.GEMINI_API_KEY ? 'gemini-2.0-flash' : null;

/**
 * Call the Gemini API with a structured prompt.
 * Returns parsed JSON if responseFormat is set, else raw text.
 */
export async function callGemini({ systemPrompt, userContent, responseFormat, temperature = 0.3 }) {
  if (!env.GEMINI_API_KEY || !MODEL) {
    throw new Error('Gemini API key not configured');
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
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ],
  };

  // Prepend system instruction
  if (systemPrompt) {
    body.systemInstruction = { parts: [{ text: systemPrompt }] };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

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
      throw new Error(`Gemini API ${res.status}`);
    }

    const json = await res.json();
    const candidate = json.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text;
    if (!text) {
      if (candidate?.finishReason === 'SAFETY') {
        throw new Error('Blocked by safety filters');
      }
      throw new Error('Empty response from Gemini');
    }

    if (responseFormat) {
      try {
        return JSON.parse(text);
      } catch {
        // Attempt to extract JSON from markdown code blocks
        const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (match) return JSON.parse(match[1]);
        throw new Error('Invalid JSON from Gemini');
      }
    }

    return text;
  } finally {
    clearTimeout(timeout);
  }
}
