# CLAUDE.md - AI Assistant Instructions

> Read this file FIRST in every new session.
> Last updated: 2026-01-14

## Quick Context

**ADHD Focus** - Task management app optimized for ADHD brains.

| Key | Value |
|-----|-------|
| Status | Active development |
| Stack | Next.js 16 + Drizzle + NextAuth + PostgreSQL |
| Language | User: Russian, Code/Docs: English |
| Repo | https://github.com/zarudesu/adhd-focus |

## Critical Rules

### DO
- **Use existing solutions first** - Check community templates, shadcn blocks, npm packages before writing from scratch
- Use MCP tools: `context7` for docs, `playwright` for testing, `shadcn` for components
- Follow existing patterns in codebase
- Keep code minimal and typed
- Test with real database before marking done

### DON'T
- Write from scratch what already exists
- Make UI decisions without asking user
- Add unnecessary complexity
- Skip testing

## Session Workflow

### Start
```bash
# 1. Check what's running
docker ps
lsof -i :3000

# 2. Start database if needed
cd docker && docker compose up -d db

# 3. Start dev server
cd apps/web && npx next dev

# 4. Read current state
git status && git log --oneline -5
```

### End
- Update this file if architecture changed
- Commit with conventional commits
- Note blockers in commit message

## Tech Stack (Current)

| Layer | Technology | Docs |
|-------|------------|------|
| Framework | Next.js 16.1 | Use `context7` MCP |
| Database | PostgreSQL 17 | Docker container |
| ORM | Drizzle | `npm run db:push` |
| Auth | NextAuth v5 | JWT + Credentials |
| UI | shadcn/ui + Tailwind | Use `shadcn` MCP |
| Testing | Playwright | Use `playwright` MCP |

## Project Structure

```
adhd-focus/
├── apps/web/                    # Next.js app
│   ├── src/
│   │   ├── app/                 # Pages (App Router)
│   │   │   ├── (dashboard)/     # Protected routes
│   │   │   ├── (public)/        # Public pages
│   │   │   ├── api/             # API routes
│   │   │   └── login, signup/   # Auth pages
│   │   ├── components/
│   │   │   ├── ui/              # shadcn components
│   │   │   ├── layout/          # Header, Sidebar
│   │   │   ├── tasks/           # TaskCard, TaskList
│   │   │   └── inbox/           # InboxProcessor
│   │   ├── db/
│   │   │   ├── index.ts         # Drizzle client
│   │   │   └── schema.ts        # Database schema
│   │   ├── hooks/               # useTasks, useAuth, etc
│   │   ├── lib/
│   │   │   ├── auth.ts          # NextAuth config
│   │   │   └── utils.ts         # cn() helper
│   │   └── proxy.ts             # Route protection (Next.js 16)
│   ├── drizzle.config.ts
│   └── .env.local               # Local environment
├── docker/
│   ├── docker-compose.yml       # PostgreSQL + Caddy
│   └── Caddyfile
└── packages/shared/             # Types, constants (legacy)
```

## Key Files

| Purpose | File |
|---------|------|
| Database schema | `apps/web/src/db/schema.ts` |
| Auth config | `apps/web/src/lib/auth.ts` |
| Route protection | `apps/web/src/proxy.ts` |
| Task hooks | `apps/web/src/hooks/useTasks.ts` |
| API routes | `apps/web/src/app/api/tasks/route.ts` |

## Development Commands

```bash
# Database
cd docker && docker compose up -d db     # Start PostgreSQL
npm run db:push                           # Sync schema
npm run db:studio                         # Visual editor

# Dev server
cd apps/web && npx next dev              # Start on :3000

# Type check
npx tsc --noEmit

# Add shadcn component
npx shadcn@latest add [component]
```

## Environment Variables

```bash
# apps/web/.env.local
DATABASE_URL=postgres://postgres:PASSWORD@localhost:5434/postgres
AUTH_SECRET=your-secret-here
AUTH_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Community Resources (USE THESE!)

### Starter Templates
- [Vercel NextAuth + Drizzle Starter](https://github.com/vercel/nextjs-postgres-auth-starter) - Official auth template
- [Next.js 16 Shadcn Dashboard](https://github.com/Kiranism/next-shadcn-dashboard-starter) - Kanban + dnd-kit
- [Shadcn Admin](https://github.com/satnaing/shadcn-admin) - Full admin dashboard

### UI Components
- [shadcn/ui](https://ui.shadcn.com) - Base components
- [shadcn/ui blocks](https://ui.shadcn.com/blocks) - Ready-made sections
- [Magic UI](https://magicui.design) - Animated components

### Task/Productivity Patterns
- [dnd-kit](https://dndkit.com) - Drag and drop
- [cmdk](https://cmdk.paco.me) - Command palette (Quick Capture)
- [sonner](https://sonner.emilkowal.ski) - Toast notifications

## ADHD UX Principles

Every feature must consider:

1. **Minimal cognitive load** - One thing at a time
2. **Instant feedback** - Respond immediately to actions
3. **Reduce decisions** - Smart defaults
4. **Forgiveness** - Easy undo, no data loss

### Key Features
- Energy levels: low/medium/high
- Simple priority: must/should/want/someday
- WIP limit: max 3 tasks/day
- Quick capture: instant inbox

## Database Schema (Drizzle)

```typescript
// Key types from src/db/schema.ts
type TaskStatus = 'inbox' | 'today' | 'scheduled' | 'in_progress' | 'done' | 'archived';
type EnergyLevel = 'low' | 'medium' | 'high';
type Priority = 'must' | 'should' | 'want' | 'someday';

interface Task {
  id: string;
  userId: string;
  title: string;
  status: TaskStatus;
  energyRequired: EnergyLevel;
  priority: Priority;
  estimatedMinutes?: number;
  dueDate?: string;
  scheduledDate?: string;
  projectId?: string;
  // ... more fields
}
```

## API Pattern

```typescript
// API route: src/app/api/tasks/route.ts
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tasks = await db.select().from(tasks)
    .where(eq(tasks.userId, session.user.id));

  return NextResponse.json(tasks);
}

// Hook: src/hooks/useTasks.ts
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  // Fetch from /api/tasks, manage state, return helpers
  return { tasks, loading, create, update, complete, deleteTask };
}
```

## Testing with Playwright

```typescript
// Use MCP playwright tools
mcp__playwright__browser_navigate({ url: 'http://localhost:3000/signup' })
mcp__playwright__browser_fill_form({ ... })
mcp__playwright__browser_click({ ... })
mcp__playwright__browser_snapshot()
```

## Current State

### Working
- [x] Registration + Login (email/password)
- [x] Protected routes (proxy.ts)
- [x] Tasks CRUD API
- [x] PostgreSQL + Drizzle schema
- [x] Dashboard layout + navigation

### In Progress
- [ ] Connect UI to real API
- [ ] Quick Capture (Cmd+K)
- [ ] Today view with tasks

### Planned
- [ ] Projects
- [ ] Focus mode (Pomodoro)
- [ ] Stats + streaks
- [ ] Mobile app

## Troubleshooting

### Port 3000 in use
```bash
lsof -ti:3000 | xargs kill -9
```

### Database connection failed
```bash
docker ps                          # Check if running
docker logs adhd-focus-db          # Check logs
docker port adhd-focus-db          # Check port (usually 5434)
```

### Proxy deprecation warning
Use `proxy.ts` instead of `middleware.ts` (Next.js 16)

## Commit Style

```
feat(tasks): add quick capture dialog
fix(auth): handle expired session
docs: update CLAUDE.md
```
