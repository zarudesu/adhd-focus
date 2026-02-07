# AI Features Plan — ADHD Focus

> Last updated: 2026-02-05
> Based on research: ADHD apps (Goblin Tools, Neurolist, Tiimo, Lifestack, Mindflow), AI coaching (CBT/DBT RCTs), LLM integration patterns.

## Key Principles

- **Scaffold, don't replace** — AI helps build skills, not create dependency
- **Max 2-3 sentences** — ADHD brain doesn't read walls of text
- **No shame, ever** — "what's next", never "you failed"
- **One question at a time** — like inbox processor
- **Cost target** — ~$0.17-0.50/month per active user

## Anti-Patterns (DO NOT)

- More than 2-3 notifications/day
- Guilt-based: "you missed", "you're behind"
- AI does ALL thinking (weakens executive function)
- Long text from AI (max 2-3 sentences)
- Comparing users to each other
- Complex onboarding / setup wizards
- Rigid schedules that don't flex

---

## Tier 1: Quick Wins (High Impact, Low Effort)

### 1. Smart Auto-Fill (Task Creation)

User types task title → AI auto-fills priority, energy, time estimate as pre-filled defaults.

- Show as suggestions user can override with one tap
- ~$0.00004/call (Gemini Flash), essentially free
- Cache common patterns locally (60-70% hit rate)
- Fits existing `CreateTaskInput` schema perfectly

### 2. Task Breakdown (Decomposition)

Button "Break down" on any task → AI splits into 5-minute micro-steps.

- Max 7 subtasks (anti-overwhelm)
- Each with: title, estimatedMinutes, energyRequired
- Adjustable granularity slider (like Goblin Tools "spiciness")
- ~$0.0017/call (Haiku), ~$0.00014 (Gemini Flash)
- #1 most requested ADHD feature across all apps

### 3. Brain Dump → Tasks

Text area: user dumps everything from head, AI categorizes into tasks/ideas/reminders.

- Assigns priority and energy automatically
- Import to inbox with one tap
- Neurolist and Saner.AI validate this pattern
- ~$0.003/call

---

## Tier 2: Smart Coach (Medium Effort, Strong Evidence)

### 4. Morning Day Plan

AI generates optimal task order based on energy hours, overdue, deadlines.

- Identifies ONE most important task (MIT)
- Suggests what to defer if WIP exceeded
- Pairs with existing `morningPlanningReminder` preference
- ~$0.003/day

### 5. "Stuck?" Helper (Task Initiation)

When task sits 3+ days, show "Stuck?" button:

- AI asks: "What's the tiniest first action?"
- Then: "Do just that. Nothing else."
- Research: 40% productivity boost from body doubling, 47% from micro-goals

### 6. Evening Reflection Prompts

Personalized questions based on actual day data:

- "You completed 4/5 — what helped?"
- "Task X postponed 3 days — break it down?"
- Integrates into existing YesterdayReviewModal
- ~$0.0015/day

---

## Tier 3: Advanced (Higher Effort)

### 7. Context-Aware Suggestions (Rule-Based, $0)

- "Peak energy in 1 hour + must task → start it?"
- "Inbox has 8 tasks → 5-min sort?"
- "This task skipped 3 times → decompose?"
- Pure logic, no LLM needed

### 8. Time Estimation Training

- AI predicts time, user tracks actual
- System improves over time
- Solves "time blindness"

### 9. Cognitive Reframe (CBT-lite)

- Detect frustration patterns
- Offer reframe: "Not lazy — executive function challenge"
- Evidence: 25% responder rate in iCBT RCTs

---

## Architecture

```
User Input → Local Parser (chrono-node, regex, cache) → 60% free
                ↓ fallback
          Model Router → Classification → Gemini Flash ($0.00004)
                       → Decomposition → Haiku ($0.0017)
                       → Planning → Haiku ($0.003)
                ↓
          Response Cache (PG) → repeat tasks = $0
          Token Counter → per-user budget tracking
```

## Cost Summary

| Feature | Calls/Day | Model | Monthly/User |
|---------|-----------|-------|-------------|
| Smart Auto-Fill | 10 | Gemini Flash | $0.012 |
| Task Decomposition | 3 | Gemini Flash | $0.013 |
| Brain Dump | 1 | Haiku | $0.09 |
| Daily Planning | 1 | Haiku | $0.09 |
| Reflection | 1 | Haiku | $0.045 |
| Suggestions | 0 (rules) | N/A | $0 |
| **Total** | | | **~$0.17/month** |

## Feature Gating

AI features unlock progressively (like existing system):
- `ai_auto_fill` — after 5 tasks created
- `ai_decompose` — after 10 tasks created
- `ai_brain_dump` — after first inbox clear
- `ai_daily_plan` — after 3-day streak
- `ai_reflection` — after 7-day streak

## Evidence Base

| Study | Key Finding |
|-------|-------------|
| Gamification meta-analysis | 48% higher retention with game elements |
| Micro-goals study (2021) | 47% improved focus duration |
| Accountability check-ins | 50% behavior improvement |
| Body doubling (ADHD Coaching Assoc.) | 80% improved task completion |
| Internet CBT RCT (n=104) | 25% responder rate, sustained 1 year |
| Online DBT-ST RCT | Improved emotion regulation + QoL |
| AI body doubling (Malmo, 2025) | Validates presence-based AI support |

## Sources

- [Goblin Tools](https://goblin.tools/About) — Task decomposition reference
- [Tiimo](https://www.tiimoapp.com/) — 2025 iPhone App of the Year
- [Lifestack](https://lifestack.ai/) — Energy-based scheduling
- [Neurolist](https://apps.apple.com/us/app/neurolist-ai-planner-for-adhd/id6468689182) — Brain dump processing
- [ArXiv: Neurodivergent-Aware Productivity](https://arxiv.org/html/2507.06864) — AI framework
- [PMC: Internet CBT for ADHD](https://pmc.ncbi.nlm.nih.gov/articles/PMC10359875/) — RCT
- [PubMed: Online DBT-ST](https://pubmed.ncbi.nlm.nih.gov/38359387/) — RCT
- [ADDitude: ChatGPT for Executive Function](https://www.additudemag.com/how-to-use-chatgpt-executive-function-adhd/)
- [Understood.org: AI for ADHD](https://www.understood.org/en/articles/adhd-ai-tools)
- [CHADD: Harnessing AI](https://chadd.org/attention-article/harnessing-artificial-intelligence-to-live-better-with-adhd/)
