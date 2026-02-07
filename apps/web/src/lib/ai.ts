/**
 * AI Helper — Google Gemini Flash integration
 * Free tier: 15 req/min, sufficient for MVP
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

let genAI: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI | null {
  if (!apiKey) return null;
  if (!genAI) {
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

const ADHD_SYSTEM_PROMPT = `You are an AI assistant for an ADHD task management app.
Rules:
- Be concise (max 2-3 sentences if text output)
- No shame or guilt language
- Focus on practical, actionable output
- Always return valid JSON when asked`;

interface CallGeminiOptions {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}

export class AIRateLimitError extends Error {
  constructor(public retryAfterSeconds?: number) {
    super('AI rate limit exceeded');
    this.name = 'AIRateLimitError';
  }
}

/**
 * Call Gemini Flash and parse JSON response.
 * Returns null if API key is missing or call fails.
 * Throws AIRateLimitError on 429 so callers can show appropriate message.
 */
export async function callGemini<T>(options: CallGeminiOptions): Promise<T | null> {
  const client = getClient();
  if (!client) return null;

  const model = client.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: ADHD_SYSTEM_PROMPT,
    generationConfig: {
      maxOutputTokens: options.maxTokens || 256,
      temperature: options.temperature ?? 0.3,
      responseMimeType: 'application/json',
    },
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: options.prompt }] }],
    });

    const text = result.response.text();
    return JSON.parse(text) as T;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '';
    if (message.includes('429') || message.includes('quota') || message.includes('Too Many Requests')) {
      throw new AIRateLimitError();
    }
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Check if AI features are available (API key configured)
 */
export function isAIEnabled(): boolean {
  return !!apiKey;
}
