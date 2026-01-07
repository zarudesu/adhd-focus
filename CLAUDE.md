# CLAUDE.md - AI Assistant Instructions

> This file provides context and rules for Claude (AI assistant) when working on this project.
> Read this first in every new session.

## Quick Context

**ADHD Focus** - Task management app for people with ADHD.

- **Status**: Early development
- **Owner**: @zarudesu
- **Language**: Russian-speaking user, code/docs in English
- **Repo**: https://github.com/zarudesu/adhd-focus

## Critical Rules

### DO
- Ask before making UI design decisions
- Research best practices before implementing
- Use existing architecture patterns (API → Hook → Component)
- Keep code simple and minimal
- Write TypeScript with strict types
- Follow ADHD UX principles (see below)

### DON'T
- Make "топорный" (crude/ugly) UI without consulting user
- Add unnecessary features or complexity
- Guess UI design - always ask or research
- Break existing patterns
- Add emojis to code/docs unless asked
- Commit credentials or secrets

## Session Start Checklist

When starting a new session:

1. **Read this file** (CLAUDE.md)
2. **Check current state**: `git status`, look at recent commits
3. **Review docs if needed**:
   - `docs/ARCHITECTURE.md` - System design
   - `docs/DEVELOPMENT.md` - Dev workflow
   - `docs/API.md` - API reference
4. **Ask user what to work on** if not clear

## User Preferences

- **Language**: User writes in Russian, respond in Russian
- **UI Design**: Always discuss before implementing. User is picky about UX.
- **Code Style**: Clean, minimal, well-typed
- **Commits**: Conventional commits in English
- **Documentation**: English

## Tech Stack

| Layer | Technology |
|-------|------------|
| Monorepo | Turborepo |
| Mobile/Web | Expo (React Native) |
| Backend | Supabase (PostgreSQL, Auth, Realtime) |
| Functions | Edge Functions (Deno) |
| State | Zustand (local UI only) |
| Language | TypeScript |

## Architecture

### Project Structure

```
adhd-focus/
├── apps/
│   └── mobile/              # Expo app
│       ├── api/             # Supabase API calls (pure)
│       ├── hooks/           # Business logic
│       ├── components/      # UI components
│       ├── app/             # Screens (Expo Router)
│       ├── store/           # Local UI state only
│       └── lib/             # Utilities
├── packages/
│   ├── shared/              # Types, constants, utils
│   └── ui/                  # Shared UI components
├── supabase/
│   ├── migrations/          # Database SQL
│   └── functions/           # Edge Functions
├── docker/                  # Self-hosted deployment
└── docs/                    # Documentation
```

### Code Layers

```
Screen → Component → Hook → API → Supabase
                       ↓
                    State
```

| Layer | Location | Responsibility |
|-------|----------|----------------|
| API | `api/*.ts` | Pure Supabase calls, no logic |
| Hooks | `hooks/*.ts` | Business logic, state, caching |
| Components | `components/*.tsx` | UI rendering |
| Screens | `app/*.tsx` | Page composition |
| Store | `store/*.ts` | LOCAL UI state only (not data) |

### Pattern Examples

**API Layer** (pure, no hooks):
```typescript
// api/tasks.ts
export const tasksApi = {
  async list(filters: TaskFilters): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .match(filters);
    if (error) throw error;
    return data;
  },
};
```

**Hook** (business logic):
```typescript
// hooks/useTasks.ts
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    const data = await tasksApi.list({});
    setTasks(data);
    setLoading(false);
  }, []);

  return { tasks, loading, fetch };
}
```

## ADHD UX Principles

**This app is for ADHD brains. Every design decision must consider:**

### Core Principles
1. **Minimal cognitive load** - Every element must earn its place
2. **One thing at a time** - Progressive disclosure, hide complexity
3. **Instant feedback** - Respond to every action immediately
4. **Reduce decisions** - Smart defaults, simple choices
5. **Forgiveness** - Easy undo, no data loss

### Key Features
- **Energy matching** - Tasks tagged low/medium/high energy
- **Simple priority** - Must/Should/Want (not 1-5 numbers)
- **WIP limit** - Max 3 tasks per day default
- **Streaks** - Dopamine rewards
- **Quick capture** - Instant inbox, process later

### Anti-Patterns (NEVER DO)
- Busy/cluttered interfaces
- Too many options
- Complex setup required
- Notification spam
- Assuming users will remember

## Database Schema

### Main Tables
- `profiles` - User preferences, integrations
- `tasks` - Core task data
- `focus_sessions` - Pomodoro tracking
- `daily_stats` - Streak calculation
- `api_keys` - External API auth
- `webhooks` - Outgoing notifications

### Task-Specific Fields
```typescript
interface Task {
  energy_required: 'low' | 'medium' | 'high';
  priority: 'must' | 'should' | 'want' | 'someday';
  status: 'inbox' | 'today' | 'in_progress' | 'done';
  estimated_minutes?: number;
  actual_minutes?: number;
  pomodoros_completed: number;
}
```

## Integrations

### REST API
Auto-generated by Supabase PostgREST. Docs: `docs/API.md`

### Telegram Bot
- Edge Function: `supabase/functions/telegram-webhook/`
- User sends message → task created in inbox
- Syntax: `!must #low Call doctor`

### Google Calendar
- Edge Function: `supabase/functions/google-calendar-sync/`
- Tasks with scheduled_date sync to calendar

## Development Commands

```bash
# Install
pnpm install

# Run app
cd apps/mobile && npx expo start

# Supabase local
supabase start
supabase db push

# Self-hosted
cd docker && docker compose up -d
```

## Current State (Update This!)

### Done
- [x] Project structure (Turborepo + Expo)
- [x] Shared types package
- [x] Database schema (migrations)
- [x] API layer (tasks, auth, profile, sessions)
- [x] Hooks layer (useTasks, useAuth, useFocusSession)
- [x] Telegram bot Edge Function
- [x] Google Calendar Edge Function
- [x] Docker self-hosted setup
- [x] API documentation
- [x] Project documentation

### In Progress
- [ ] Set up actual Supabase project
- [ ] Test with real database
- [ ] Design UI (need user input)

### Planned
- [ ] Quick capture feature
- [ ] Streak tracking UI
- [ ] Settings screen
- [ ] Dark mode
- [ ] Offline support

## How to Add Features

1. **Types first** - Add to `packages/shared/src/types/`
2. **Migration** - If DB change: `supabase migration new xxx`
3. **API layer** - Add to `apps/mobile/api/`
4. **Hook** - Add to `apps/mobile/hooks/`
5. **Component** - Add to `apps/mobile/components/`
6. **Screen** - Add to `apps/mobile/app/`

## File Locations Quick Reference

| Need | Location |
|------|----------|
| Types | `packages/shared/src/types/` |
| API calls | `apps/mobile/api/` |
| Business logic | `apps/mobile/hooks/` |
| UI components | `apps/mobile/components/` |
| Screens | `apps/mobile/app/` |
| DB schema | `supabase/migrations/` |
| Edge Functions | `supabase/functions/` |
| Docs | `docs/` |

## Commit Style

```
feat(scope): description
fix(scope): description
docs: description
refactor(scope): description
```

Scopes: `tasks`, `auth`, `timer`, `api`, `ui`, `db`

## Questions to Ask User

Before implementing:
- UI design choices
- Feature prioritization
- UX flow decisions

## Resources

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - System design
- [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) - Dev guide
- [docs/API.md](docs/API.md) - API reference
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guide
