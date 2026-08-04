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

  // Parse keys, treating it as a comma-separated list
  const keys = env.GEMINI_API_KEY.split(',').map(k => k.trim()).filter(Boolean);
  if (keys.length === 0) {
    throw AppError.unprocessable('Gemini API key not configured.');
  }

  const MODELS = [MODEL, 'gemini-1.5-flash', 'gemini-1.5-pro'];

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

  let lastError;

  for (let m = 0; m < MODELS.length; m++) {
    const currentModel = MODELS[m];

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const url = `${GEMINI_BASE}/${currentModel}:generateContent?key=${key}`;
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
          log.error({ status: res.status, keyIndex: i, model: currentModel }, 'Gemini API error');
          
          let errMsg = `Gemini API error (${res.status})`;
          try {
            const errJson = JSON.parse(text);
            errMsg = errJson?.error?.message || errMsg;
          } catch { /* use default */ }

          // If rate limited (429), it is usually a key quota issue. Try next key.
          if (res.status === 429 && i < keys.length - 1) {
            log.info(`Key ${i + 1} rate limited (429). Retrying with next key...`);
            lastError = AppError.upstream(errMsg);
            continue; // Next key
          }

          // If server overload (5xx), it is a model capacity issue. Try next model!
          if (res.status >= 500 && m < MODELS.length - 1) {
            log.info(`Model ${currentModel} overloaded (${res.status}). Retrying with next model...`);
            lastError = AppError.upstream(errMsg);
            break; // Break key loop, go to next model
          }

          // If it's a 5xx and we have no more models, but we DO have more keys, try next key just in case.
          if (res.status >= 500 && i < keys.length - 1) {
            log.info(`Model ${currentModel} overloaded (${res.status}). Retrying with next key...`);
            lastError = AppError.upstream(errMsg);
            continue;
          }

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
            const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (match) return JSON.parse(match[1]);
            log.error({ rawText: text.slice(0, 500) }, 'Invalid JSON from Gemini');
            throw AppError.upstream('Invalid response format from Gemini — please try again');
          }
        }

        return text;
      } catch (err) {
        if (err.name === 'AbortError' && i < keys.length - 1) {
          log.warn(`Timeout on key ${i + 1}. Retrying with next key...`);
          lastError = err;
          continue;
        }
        if (err.name === 'AbortError' && m < MODELS.length - 1) {
          log.warn(`Timeout on model ${currentModel}. Retrying with next model...`);
          lastError = err;
          break;
        }

        // Re-throw if we exhausted all keys and models
        if (i === keys.length - 1 && m === MODELS.length - 1) throw err;
      } finally {
        clearTimeout(timeout);
      }
    }
  }

  if (lastError) throw lastError;
}
