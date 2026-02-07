// AI Auto-Fill — suggest priority, energy, time from task title
// POST /api/ai/suggest

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/mobile-auth';
import { callGemini, isAIEnabled, AIRateLimitError } from '@/lib/ai';
import { rateLimiters } from '@/lib/rate-limit';
import { z } from 'zod';

const requestSchema = z.object({
  title: z.string().min(1).max(500),
});

interface SuggestResult {
  priority: 'must' | 'should' | 'want' | 'someday';
  energyRequired: 'low' | 'medium' | 'high';
  estimatedMinutes: number;
}

const PROMPT_TEMPLATE = (title: string) => `Classify this task for an ADHD user.

Task: "${title}"

Return JSON with exactly these fields:
- "priority": one of "must", "should", "want", "someday"
  - "must" = urgent/deadline/essential (bills, appointments, work deadlines)
  - "should" = important but not urgent (exercise, cleaning, planning)
  - "want" = nice to have (hobbies, shopping, entertainment)
  - "someday" = aspirational/low priority (learn guitar, organize photos)
- "energyRequired": one of "low", "medium", "high"
  - "low" = passive/simple (reply to text, take out trash, watch lecture)
  - "medium" = moderate effort (cook dinner, write email, grocery shop)
  - "high" = demanding focus (study, deep work, difficult conversation)
- "estimatedMinutes": realistic time in minutes (5, 10, 15, 25, 30, 45, 60, 90, 120)

Return ONLY the JSON object, nothing else.`;

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
    const { title } = requestSchema.parse(body);

    const result = await callGemini<SuggestResult>({
      prompt: PROMPT_TEMPLATE(title),
      maxTokens: 64,
      temperature: 0.1,
    });

    if (!result) {
      return NextResponse.json(
        { priority: 'should', energyRequired: 'medium', estimatedMinutes: 15 },
      );
    }

    // Validate and clamp values
    const validPriorities = ['must', 'should', 'want', 'someday'] as const;
    const validEnergy = ['low', 'medium', 'high'] as const;
    const validMinutes = [5, 10, 15, 25, 30, 45, 60, 90, 120];

    return NextResponse.json({
      priority: validPriorities.includes(result.priority as typeof validPriorities[number])
        ? result.priority
        : 'should',
      energyRequired: validEnergy.includes(result.energyRequired as typeof validEnergy[number])
        ? result.energyRequired
        : 'medium',
      estimatedMinutes: validMinutes.includes(result.estimatedMinutes)
        ? result.estimatedMinutes
        : 15,
    });
  } catch (error) {
    if (error instanceof AIRateLimitError) {
      return NextResponse.json(
        { priority: 'should', energyRequired: 'medium', estimatedMinutes: 15 },
      );
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    console.error('AI suggest error:', error);
    return NextResponse.json(
      { priority: 'should', energyRequired: 'medium', estimatedMinutes: 15 },
    );
  }
}
