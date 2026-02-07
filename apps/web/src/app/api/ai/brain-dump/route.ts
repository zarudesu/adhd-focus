// AI Brain Dump — parse unstructured text into categorized tasks
// POST /api/ai/brain-dump

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/mobile-auth';
import { callGemini, isAIEnabled } from '@/lib/ai';
import { rateLimiters } from '@/lib/rate-limit';
import { z } from 'zod';

const requestSchema = z.object({
  text: z.string().min(1).max(5000),
});

interface BrainDumpItem {
  title: string;
  type: 'task' | 'idea' | 'reminder';
  priority: 'must' | 'should' | 'want' | 'someday';
  energyRequired: 'low' | 'medium' | 'high';
  estimatedMinutes: number;
}

interface BrainDumpResult {
  items: BrainDumpItem[];
}

const PROMPT_TEMPLATE = (text: string) => `Parse this brain dump from an ADHD user into individual actionable items.

Brain dump:
"""
${text}
"""

Rules:
- Extract each distinct thought/task/idea as a separate item
- Write clear, actionable titles starting with a verb
- Categorize as: "task" (something to do), "idea" (something to think about), "reminder" (something to remember)
- For tasks, assign realistic priority and energy levels
- Maximum 15 items (combine related thoughts)
- Keep titles under 100 characters

Return JSON with an "items" array. Each item has:
- "title": string (clear, actionable title)
- "type": "task" | "idea" | "reminder"
- "priority": "must" | "should" | "want" | "someday"
- "energyRequired": "low" | "medium" | "high"
- "estimatedMinutes": number (5, 10, 15, 25, 30, 45, 60)

Return ONLY the JSON object.`;

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
    const { text } = requestSchema.parse(body);

    const result = await callGemini<BrainDumpResult>({
      prompt: PROMPT_TEMPLATE(text),
      maxTokens: 1024,
      temperature: 0.3,
    });

    if (!result?.items?.length) {
      return NextResponse.json({ error: 'Could not process brain dump' }, { status: 422 });
    }

    // Validate and sanitize items
    const validTypes = ['task', 'idea', 'reminder'] as const;
    const validPriorities = ['must', 'should', 'want', 'someday'] as const;
    const validEnergy = ['low', 'medium', 'high'] as const;
    const validMinutes = [5, 10, 15, 25, 30, 45, 60];

    const items = result.items.slice(0, 15).map((item) => ({
      title: String(item.title).slice(0, 100),
      type: validTypes.includes(item.type as typeof validTypes[number]) ? item.type : 'task' as const,
      priority: validPriorities.includes(item.priority as typeof validPriorities[number]) ? item.priority : 'should' as const,
      energyRequired: validEnergy.includes(item.energyRequired as typeof validEnergy[number]) ? item.energyRequired : 'medium' as const,
      estimatedMinutes: validMinutes.includes(item.estimatedMinutes) ? item.estimatedMinutes : 15,
    }));

    return NextResponse.json({ items });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    console.error('AI brain-dump error:', error);
    return NextResponse.json({ error: 'Brain dump processing failed' }, { status: 500 });
  }
}
