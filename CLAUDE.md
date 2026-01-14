# CLAUDE.md - AI Assistant Instructions

> **READ THIS FILE FIRST** in every new session or after context compaction.
> Last updated: 2026-01-14

## Quick Context

**ADHD Focus** - Task management app optimized for ADHD brains.

| Key | Value |
|-----|-------|
| Status | Active development - Web UI connected to API |
| Stack | Next.js 16 + Drizzle + NextAuth + PostgreSQL |
| Language | User: Russian, Code/Docs: English |
| Repo | https://github.com/zarudesu/adhd-focus |
| **Prod Server** | `23.134.216.230` |
| **Prod Domain** | `https://beatyour8.com` |
| **SSH** | `ssh -i ~/.ssh/adhd-focus-deploy root@23.134.216.230` |
| **Deploy** | `git push` triggers GitHub Actions |

## MANDATORY Workflow (Every Session!)

### 1. Start of Session
```bash
# Check current state
git status && git log --oneline -5

# What's running?
docker ps
lsof -i :3000

# Start if needed
cd docker && docker compose up -d db
cd apps/web && npm run dev
```

### 2. Before Implementing ANYTHING
1. **Search for existing solutions** - Use WebSearch for templates, packages, patterns
2. **Check community resources** (see section below)
3. **Use MCP tools**: `context7` for docs, `shadcn` for components, `playwright` for testing
4. **Only write from scratch if nothing exists**

### 3. During Development
- Use `TodoWrite` to track progress
- Test with real database via Playwright
- Keep code minimal

### 4. End of Session
- **Update this file** if anything changed
- **Update "Current State" section** below
- Commit with conventional commits
- Note any blockers

## Critical Rules

### DO
- **Check internet first** - WebSearch for "nextjs [feature] 2026", "shadcn [component]", "drizzle [pattern]"
- **Use existing solutions** - npm packages, shadcn blocks, community templates
- **Use MCP tools** - context7, playwright, shadcn, github
- **Keep this file updated** - especially Current State section
- **Test with real data** - via Playwright MCP

### DON'T
- Write from scratch what already exists
- Make UI decisions without asking user
- Add unnecessary complexity
- Skip testing
- Forget to update documentation

## Current State (UPDATE THIS!)

### Web App - Pages Connected to API

| Page | Status | Features |
|------|--------|----------|
| Today | **DONE** | Tasks list, complete/uncomplete, add task, move to inbox |
| Inbox | **DONE** | Tasks list, Process All (swipe UI), Quick Add, move to today |
| Scheduled | **DONE** | Tasks grouped by date, smart dates (Today/Tomorrow/etc) |
| Projects | **DONE** | Project cards, create with emoji/color, task count, progress bar |
| Settings | **DONE** | Profile, preferences (pomodoro, WIP limit, theme, notifications), logout |
| Focus Mode | TODO | Pomodoro timer |
| Statistics | TODO | Streak tracking |

### Backend - API Routes

| Route | Status |
|-------|--------|
| GET/POST /api/tasks | **DONE** |
| PATCH/DELETE /api/tasks/[id] | **DONE** |
| Auth (register/login) | **DONE** |
| GET/POST /api/projects | **DONE** |
| PATCH/DELETE /api/projects/[id] | **DONE** |
| GET/PATCH /api/profile | **DONE** |
| Focus sessions | TODO |

### Key Files Changed Recently
- `src/app/api/profile/route.ts` - Profile API (GET, PATCH)
- `src/hooks/useProfile.ts` - Profile hook with preferences
- `src/app/(dashboard)/dashboard/settings/page.tsx` - Settings UI connected to API

### Known Issues
- None currently

## Tech Stack

| Layer | Technology | Docs |
|-------|------------|------|
| Framework | Next.js 16.1 | Use `context7` MCP |
| Database | PostgreSQL 17 | Docker on port 5434 |
| ORM | Drizzle | `npm run db:push` |
| Auth | NextAuth v5 | JWT + Credentials |
| UI | shadcn/ui + Tailwind | Use `shadcn` MCP |
| Testing | Playwright | Use `playwright` MCP |

## Project Structure

```
apps/web/src/
├── app/
│   ├── (dashboard)/dashboard/    # Protected pages
│   │   ├── page.tsx              # Today (connected)
│   │   ├── inbox/page.tsx        # Inbox (connected)
│   │   ├── scheduled/page.tsx    # Scheduled (connected)
│   │   ├── projects/page.tsx     # Projects (TODO)
│   │   ├── focus/page.tsx        # Focus Mode (TODO)
│   │   └── stats/page.tsx        # Statistics (TODO)
│   ├── api/tasks/                # Tasks API
│   └── (public)/                 # Public pages
├── components/
│   ├── tasks/                    # TaskCard, TaskList, AddTaskDialog
│   ├── inbox/                    # InboxProcessor
│   └── ui/                       # shadcn components
├── hooks/
│   └── useTasks.ts               # Main tasks hook
├── db/
│   ├── index.ts                  # Drizzle client
│   └── schema.ts                 # Database schema
└── proxy.ts                      # Route protection
```

## Community Resources (CHECK THESE FIRST!)

### Starter Templates
- [Vercel NextAuth + Drizzle](https://github.com/vercel/nextjs-postgres-auth-starter)
- [Shadcn Dashboard Starter](https://github.com/Kiranism/next-shadcn-dashboard-starter)
- [Shadcn Admin](https://github.com/satnaing/shadcn-admin)

### UI Components
- [shadcn/ui](https://ui.shadcn.com) - Base components
- [shadcn/ui blocks](https://ui.shadcn.com/blocks) - Ready sections
- [Magic UI](https://magicui.design) - Animations

### Feature Patterns
- [dnd-kit](https://dndkit.com) - Drag and drop for Kanban
- [cmdk](https://cmdk.paco.me) - Command palette
- [sonner](https://sonner.emilkowal.ski) - Toasts

## Development Commands

```bash
# Start everything
cd docker && docker compose up -d db
cd apps/web && npm run dev

# Database
npm run db:push     # Sync schema
npm run db:studio   # Visual editor

# Add component
npx shadcn@latest add [component]
```

## Environment Variables

```bash
# apps/web/.env.local
DATABASE_URL=postgres://postgres:testpassword123@localhost:5434/postgres
AUTH_SECRET=your-secret-here
AUTH_URL=http://localhost:3000
```

## API Pattern (Reference)

```typescript
// Hook usage
const { tasks, todayTasks, inboxTasks, scheduledTasks,
        complete, uncomplete, deleteTask, moveToToday, create } = useTasks();

// Filter helper already in hook:
// todayTasks - status: today/in_progress + done with today's date
// inboxTasks - status: inbox
// scheduledTasks - status: scheduled
```

## ADHD UX Principles

1. **Minimal cognitive load** - One thing at a time
2. **Instant feedback** - Respond immediately
3. **Reduce decisions** - Smart defaults
4. **Forgiveness** - Easy undo

### Features
- Energy levels: low/medium/high
- Priority: must/should/want/someday
- WIP limit: 3 tasks/day
- Quick capture: instant inbox

## Troubleshooting

```bash
# Port 3000 in use
lsof -ti:3000 | xargs kill -9

# Check database
docker ps
docker logs adhd-focus-db

# Playwright browser stuck (ALWAYS run before new test session!)
rm -rf ~/Library/Caches/ms-playwright/mcp-chrome-*
pkill -9 -f "Google Chrome for Testing"
```

## Playwright Testing Rules

**IMPORTANT**: Before starting a new Playwright test:
1. Kill existing browser: `pkill -9 -f "Google Chrome for Testing"`
2. Use `browser_snapshot` to check current state before clicking
3. Reuse existing tab - don't call `browser_navigate` if already on correct page
4. Use `browser_click` with element refs from snapshot

## Commit Style

```
feat(tasks): add feature
fix(auth): fix bug
docs: update CLAUDE.md
```
