// AI Task Decomposition — break task into subtasks
// POST /api/ai/decompose

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/mobile-auth';
import { callGemini, isAIEnabled, AIRateLimitError } from '@/lib/ai';
import { rateLimiters } from '@/lib/rate-limit';
import { z } from 'zod';

const requestSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(2000).optional(),
  estimatedMinutes: z.number().positive().optional(),
});

interface Subtask {
  title: string;
  estimatedMinutes: number;
  energyRequired: 'low' | 'medium' | 'high';
}

interface DecomposeResult {
  subtasks: Subtask[];
}

const PROMPT_TEMPLATE = (title: string, description?: string, estimatedMinutes?: number) => {
  let prompt = `Break this task into concrete micro-steps for someone with ADHD.

Task: "${title}"`;

  if (description) {
    prompt += `\nDetails: "${description}"`;
  }
  if (estimatedMinutes) {
    prompt += `\nEstimated total time: ${estimatedMinutes} minutes`;
  }

  prompt += `

Rules:
- Maximum 7 subtasks (to avoid overwhelm)
- Each subtask should be a single, concrete physical action
- Target ~5 minutes per subtask
- Start each with an action verb (Open, Write, Call, Pick up, etc.)
- Order them logically (what to do first)

Return JSON with a "subtasks" array. Each subtask has:
- "title": string (the action, max 100 chars)
- "estimatedMinutes": number (5, 10, 15, or 25)
- "energyRequired": "low" | "medium" | "high"

Return ONLY the JSON object.`;

  return prompt;
};

export async function POST(request: NextRequest) {
  try {
    if (!isAIEnabled()) {
      return NextResponse.json({ error: 'AI features not configured' }, { status: 503 });
    }

    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rateLimit = rateLimiters.ai(user.id);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many AI requests', retryAfter: rateLimit.retryAfter },
        { status: 429 }
      );
    }

    const body = await request.json();
    const data = requestSchema.parse(body);

    const result = await callGemini<DecomposeResult>({
      prompt: PROMPT_TEMPLATE(data.title, data.description, data.estimatedMinutes),
      maxTokens: 512,
      temperature: 0.4,
    });

    if (!result?.subtasks?.length) {
      return NextResponse.json({ error: 'Could not decompose task' }, { status: 422 });
    }

    // Validate and sanitize subtasks
    const validEnergy = ['low', 'medium', 'high'] as const;
    const validMinutes = [5, 10, 15, 25];

    const subtasks = result.subtasks.slice(0, 7).map((s) => ({
      title: String(s.title).slice(0, 100),
      estimatedMinutes: validMinutes.includes(s.estimatedMinutes) ? s.estimatedMinutes : 5,
      energyRequired: validEnergy.includes(s.energyRequired as typeof validEnergy[number])
        ? s.energyRequired
        : 'medium' as const,
    }));

    return NextResponse.json({ subtasks });
  } catch (error) {
    if (error instanceof AIRateLimitError) {
      return NextResponse.json({ error: 'AI is busy, try again in a minute' }, { status: 429 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    console.error('AI decompose error:', error);
    return NextResponse.json({ error: 'Decomposition failed' }, { status: 500 });
  }
}
