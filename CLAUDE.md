# CLAUDE.md - AI Assistant Instructions

> **READ THIS FILE FIRST** in every new session or after context compaction.
> Last updated: 2026-03-01

---

## ⚠️ ОБЯЗАТЕЛЬНО ПРОЧИТАЙ ПЕРЕД РАБОТОЙ ⚠️

**Claude, ЭТО ДЛЯ ТЕБЯ. Каждую новую сессию:**

1. **ПРОЧИТАЙ ЭТУ ТАБЛИЦУ** - здесь все домены и доступы:

| Что | URL/Команда |
|-----|-------------|
| 🌐 **PROD** | `https://beatyour8.com` |
| 🧪 **STAGING** | `https://adhdrenaline.com` |
| 🖥️ **SSH** | `ssh -i ~/.ssh/adhd-focus-deploy root@23.134.216.230` |
| 📦 **Deploy Prod** | `git push origin main` |
| 📦 **Deploy Staging** | `git push origin staging` |

2. **НЕ ГАДАЙ** - если не знаешь домен/путь/команду - ИЩИ В ЭТОМ ФАЙЛЕ
3. **НЕ SSH** для поиска инфы, которая уже здесь записана

**Если ты не изучил полностью эту доку перед началом работы - ТЫ ОБЛАЖАЛСЯ.**

---

## CRITICAL: When Fixing Bugs

**STOP. Google BEFORE writing code.**
- Search "[tech] [error]" first
- One fix at a time, test after each
- Ask before creating new files
- After 3 fails: "застрял, нужна помощь"

**When user says "погугли" / "стоп" / "хватит" - IMMEDIATELY stop and do what they say. No "one more try".**

---

## Quick Context

**ADHD Focus** - Task management app optimized for ADHD brains.

| Key | Value |
|-----|-------|
| Status | Active development - Web + iOS apps |
| Web Stack | Next.js 16 + Drizzle + NextAuth + PostgreSQL + Google Gemini |
| iOS Stack | SwiftUI + URLSession + Keychain (35+ screens) |
| Language | User: Russian, Code/Docs: English |
| Repo | https://github.com/zarudesu/adhd-focus |
| **Prod Server** | `23.134.216.230` |
| **Prod Domain** | `https://beatyour8.com` |
| **Staging Domain** | `https://adhdrenaline.com` |
| **SSH** | `ssh -i ~/.ssh/adhd-focus-deploy root@23.134.216.230` |
| **Deploy Prod** | `git push origin main` triggers GitHub Actions |
| **Deploy Staging** | `git push origin staging` triggers GitHub Actions |

## MANDATORY Workflow (Every Session!)

### 1. Start of Session

**⚠️ ПЕРВЫМ ДЕЛОМ: Прочитай таблицу доменов в начале этого файла!**

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

**После context compaction:** Обязательно перечитай CLAUDE.md - ты потеряешь контекст!

### 2. Before Implementing ANYTHING
1. **Search for existing solutions** - Use WebSearch for templates, packages, patterns
2. **Check community resources** (see section below)
3. **Use MCP tools**: `context7` for docs, `shadcn` for components, `playwright` for testing
4. **Only write from scratch if nothing exists**

### 3. During Development
- Use `TodoWrite` to track progress
- Test with real database via Playwright
- Keep code minimal

### 4. When Something Breaks (MANDATORY)
**STOP. Do NOT immediately write code.**

1. **Google first** - search "[technology] [error message]" (e.g. "nextjs standalone bcryptjs")
2. **Check existing code** - maybe solution already exists in project
3. **One change at a time** - change, test, then next change
4. **Ask user before adding files** - "хочу добавить X, ок?"
5. **3 failed attempts = STOP** - tell user "застрял, нужна помощь"

**NEVER:**
- Add multiple fixes at once
- Create new files without asking
- Guess solutions without researching
- Keep trying after 3 failures

### 5. Commits & Documentation (MANDATORY)

**Коммиты — часто и без спроса:**
- Коммить после каждого логического шага (новый компонент, фикс бага, рефакторинг)
- НЕ НАКАПЛИВАЙ изменения — максимум 15-30 минут между коммитами
- Используй conventional commits: `feat(scope):`, `fix(scope):`, `docs:`, `refactor:`
- Не жди разрешения на коммит — это обязательная часть workflow

**Документация — обновляй СРАЗУ при изменениях:**

| Что изменилось | Какой файл обновить |
|----------------|---------------------|
| Новая страница/фича | CLAUDE.md → "Current State" таблица |
| Новый API endpoint | CLAUDE.md → "Backend - API Routes" таблица |
| Изменения геймификации | `apps/web/docs/GAMIFICATION.md` |
| Изменения unlock условий | `docs/FEATURE_UNLOCKS.md` |
| Новая AI фича | `docs/AI_FEATURES.md` |
| Retention/UX изменения | `docs/RETENTION_RESEARCH.md` |
| Новые домены/URLs | CLAUDE.md → таблица доменов в начале |
| Новые env vars | CLAUDE.md → "Environment Variables" |
| Новые хуки/компоненты | CLAUDE.md → "Project Structure" |

**Конец сессии:**
- Обнови "Current State" + "Recent Changes" в CLAUDE.md
- Обнови `Last updated` дату в каждом изменённом доке
- Закоммить все изменения
- Note any blockers

**⚠️ Если ты узнал что-то новое (домен, путь, команду) - ЗАПИШИ СЮДА. Следующий Claude скажет тебе спасибо.**

## Critical Rules

### DO
- **Check internet first** - WebSearch for "nextjs [feature] 2026", "shadcn [component]", "drizzle [pattern]"
- **Use existing solutions** - npm packages, shadcn blocks, community templates
- **Use MCP tools** - context7, playwright, shadcn, github
- **Keep this file updated** - especially Current State section
- **Test with real data** - via Playwright MCP
- **Commit often** - после каждого логического шага (новый файл, фикс, рефакторинг). НЕ ЖДИ разрешения, коммить сам
- **Update docs with every change** - при добавлении/изменении фич обновляй соответствующие доки (см. секцию ниже)

### DON'T
- Write from scratch what already exists
- Make UI decisions without asking user
- Add unnecessary complexity
- Skip testing
- Forget to update documentation
- Accumulate uncommitted changes — коммить каждые 15-30 минут работы или после каждого завершённого шага

## Current State (UPDATE THIS!)

### Web App - Pages Connected to API

| Page | Status | Features |
|------|--------|----------|
| Today | **DONE** | Tasks list, complete/uncomplete, add task, edit on click, completed section, Just 1 Mode |
| Inbox | **DONE** | Tasks WITHOUT project, Quick Add, move to today |
| Inbox Process | **DONE** | Process All mode - one task at a time decision flow |
| Review Mode | **DONE** | Multi-source triage: global inbox + per-project review with 19+ actions |
| Quick Actions | **DONE** | Timer-based quick capture with 2-min countdown |
| Scheduled | **DONE** | Tasks grouped by date, smart dates (Today/Tomorrow/etc), edit on click |
| Projects | **DONE** | Clickable project cards, create with emoji/color, task count, progress bar |
| Project Detail | **DONE** | Task list for project, add/edit tasks, completed section, wiki pages |
| Project Wiki | **DONE** | Rich-text wiki per project (BlockNote editor), CRUD pages |
| Completed | **DONE** | All finished tasks grouped by date, uncomplete to return |
| Settings | **DONE** | Profile, preferences (pomodoro, WIP limit, theme, notifications, Just 1 Mode), logout |
| Focus Mode | **DONE** | Pomodoro timer, work/break modes, task selection, session tracking, stats, blur overlay |
| Achievements | **DONE** | List of achievements with progress, unlocked status |
| Creatures | **DONE** | Collection of creatures, spawn mechanics |
| Statistics | **DONE** | Streak, level, XP, pomodoros, focus time, weekly charts, achievements, habits |
| Checklist | **DONE** | Daily habits with drag-drop reorder, time of day sections, streaks, yesterday review |
| Hub | **DONE** | Central navigation hub |
| Landing | **DONE** | Minimalist single input, localStorage tasks, celebration modal, registration flow |

### iOS App - Native SwiftUI (35+ screens)

| Screen | Status | Features |
|--------|--------|----------|
| Login | **DONE** | Email/password, JWT token storage in Keychain |
| Signup | **DONE** | Registration with auto-login |
| Today | **DONE** | Today tasks, complete/uncomplete, add task |
| Inbox | **DONE** | Inbox tasks, quick add bar |
| Process Mode | **DONE** | One-by-one task triage |
| Scheduled | **DONE** | Scheduled tasks view |
| Projects | **DONE** | Project list + project detail |
| Completed | **DONE** | Completed tasks view |
| Checklist | **DONE** | Daily habits |
| Focus | **DONE** | Pomodoro timer with circular UI |
| Stats | **DONE** | User statistics |
| Achievements | **DONE** | Achievements list |
| Creatures | **DONE** | Creature collection + detail sheet |
| Quick Actions | **DONE** | Quick capture |
| Settings | **DONE** | User info, stats, logout |

**Key Files:**
- `apps/ios/ADHDFocus/` - Main app code (Models: 11, Services: 10, Views: 35+)
- `apps/ios/project.yml` - XcodeGen config
- `apps/ios/ADHDFocus.xcodeproj/` - Generated Xcode project
- **Base URL**: `https://beatyour8.com/api` (hardcoded in APIClient.swift)

**Build & Run:**
```bash
cd apps/ios
xcodegen generate   # Generate Xcode project from project.yml
open ADHDFocus.xcodeproj
# In Xcode: Select team, build (Cmd+B), run on simulator/device
```

### Backend - API Routes

| Route | Status |
|-------|--------|
| **Tasks** | |
| GET/POST /api/tasks | **DONE** (+ mobile JWT auth) |
| PATCH/DELETE /api/tasks/[id] | **DONE** (+ mobile JWT auth) |
| **Auth** | |
| Auth (register/login) | **DONE** (+ bot protection) |
| POST /api/mobile/auth/login | **DONE** (JWT for iOS) |
| POST /api/mobile/auth/refresh | **DONE** (token refresh) |
| POST /api/auth/verify-credentials | **DONE** (re-auth for Projects) |
| **Projects** | |
| GET/POST /api/projects | **DONE** |
| PATCH/DELETE /api/projects/[id] | **DONE** |
| GET/POST /api/projects/[id]/wiki | **DONE** (wiki pages CRUD) |
| GET/PATCH/DELETE /api/projects/[id]/wiki/[pageId] | **DONE** |
| **Profile** | |
| GET/PATCH /api/profile | **DONE** |
| **Focus** | |
| GET/POST /api/focus/sessions | **DONE** |
| PATCH /api/focus/sessions/[id] | **DONE** |
| **Gamification** | |
| GET /api/gamification/stats | **DONE** |
| POST /api/gamification/xp | **DONE** |
| GET /api/gamification/achievements | **DONE** |
| POST /api/gamification/achievements/check | **DONE** |
| GET /api/gamification/creatures | **DONE** |
| POST /api/gamification/creatures/spawn | **DONE** |
| POST /api/gamification/rewards/log | **DONE** |
| POST /api/gamification/day-surprise | **DONE** |
| GET/POST /api/gamification/quests | **DONE** (daily quests) |
| **Features** | |
| GET /api/features | **DONE** (list with unlock status) |
| POST /api/features/[code]/opened | **DONE** (mark opened, return tutorial) |
| **Stats & Habits** | |
| GET /api/stats | **DONE** |
| GET/POST /api/habits | **DONE** |
| PATCH/DELETE /api/habits/[id] | **DONE** |
| POST /api/habits/[id]/check | **DONE** |
| POST /api/habits/reorder | **DONE** |
| GET/POST /api/habits/review | **DONE** |
| **AI (Google Gemini)** | |
| POST /api/ai/suggest | **DONE** (auto-classify: priority, energy, time estimate) |
| POST /api/ai/decompose | **DONE** (break task into subtasks) |
| POST /api/ai/brain-dump | **DONE** (parse unstructured text → tasks) |

### Key Files Changed Recently
- `src/components/review/ReviewMode.tsx` - Multi-source review mode (525 lines)
- `src/components/review/SchedulePopover.tsx` - Smart date picker for review
- `src/components/wiki/WikiEditor.tsx` - BlockNote rich-text editor
- `src/components/focus/CalmReview.tsx` - End-of-day calm review
- `src/lib/ai.ts` - Google Gemini integration
- `src/lib/feature-tutorials.ts` - 20+ feature tutorials
- `src/hooks/useQuests.ts` - Daily quests tracking
- `src/hooks/useMorningReview.ts` - Morning review flow
- `src/hooks/useProjectWiki.ts` - Wiki pages CRUD
- `src/hooks/useFeaturePageTutorial.ts` - Tutorial state per page

### Known Issues

**Open:**
- [ ] NextAuth beta in production
- [ ] Phase 5 incomplete: FeatureGate not applied in all UI (progressive unlock)
- [ ] React 18/19 conflict in monorepo (root hoists React 18, apps/web has React 19) — affects vitest only, mock shadcn/lucide via `src/test/ui-mocks.tsx`
- [ ] Test coverage low (5 test files total)
- [ ] iOS app hardcoded to production URL (no staging switch)

**All Previously Fixed (2026-01-20 review):** Rate limiting, PII logging, useMemo, N+1 queries, setState in render, Math.random, ref access, HTML entities, type duplication, accessibility labels — all resolved.

**ESLint Status:** 0 errors, ~50 warnings (unused variables only)

## Tech Stack

| Layer | Technology | Docs |
|-------|------------|------|
| Framework | Next.js 16.1 | Use `context7` MCP |
| Database | PostgreSQL 17 | Docker on port 5434 |
| ORM | Drizzle | `npm run db:push` |
| Auth | NextAuth v5 | JWT + Credentials |
| UI | shadcn/ui + Tailwind | Use `shadcn` MCP |
| Rich Text | BlockNote 0.46 | Wiki pages in projects |
| AI | Google Gemini (`@google/generative-ai`) | Task suggest/decompose/brain-dump |
| Unit Testing | Vitest + happy-dom + Testing Library | `npm run test` in apps/web |
| E2E Testing | Playwright | Use `playwright` MCP |

## Project Structure

```
apps/web/src/ (193 files)
├── app/
│   ├── page.tsx                  # Landing page (minimalist input)
│   ├── sync/page.tsx             # Sync localStorage tasks after registration
│   ├── (dashboard)/dashboard/    # Protected pages
│   │   ├── page.tsx              # Today
│   │   ├── inbox/
│   │   │   ├── page.tsx          # Inbox
│   │   │   └── process/page.tsx  # Process All mode
│   │   ├── review/page.tsx       # Global review/triage mode
│   │   ├── quick-actions/page.tsx # Quick Actions (2-min timer)
│   │   ├── scheduled/page.tsx    # Scheduled
│   │   ├── projects/
│   │   │   ├── page.tsx          # Projects list
│   │   │   └── [id]/page.tsx     # Project detail (+ wiki)
│   │   ├── completed/page.tsx    # Completed tasks
│   │   ├── checklist/page.tsx    # Daily habits
│   │   ├── focus/page.tsx        # Focus Mode (Pomodoro)
│   │   ├── hub/page.tsx          # Central hub
│   │   ├── achievements/page.tsx # Achievements list
│   │   ├── creatures/page.tsx    # Creatures collection
│   │   ├── stats/page.tsx        # Statistics
│   │   └── settings/
│   │       ├── page.tsx          # Settings
│   │       └── integrations/     # Integrations
│   ├── api/
│   │   ├── auth/                 # NextAuth + register
│   │   ├── mobile/auth/          # JWT login + refresh for iOS
│   │   ├── tasks/                # Tasks CRUD
│   │   ├── projects/             # Projects CRUD + wiki pages
│   │   ├── habits/               # Habits CRUD + check + reorder + review
│   │   ├── profile/              # Profile GET/PATCH
│   │   ├── features/             # Feature unlock status + opened tracking
│   │   ├── focus/sessions/       # Focus sessions
│   │   ├── gamification/         # Stats, XP, achievements, creatures, rewards, quests
│   │   ├── ai/                   # Gemini: suggest, decompose, brain-dump
│   │   └── stats/                # User statistics
│   └── (public)/                 # Login, signup, etc.
├── components/
│   ├── tasks/                    # TaskCard, TaskList, AddTaskDialog, MorningReviewModal
│   ├── inbox/                    # InboxProcessor
│   ├── review/                   # ReviewMode (525 lines), SchedulePopover
│   ├── wiki/                     # WikiEditor, WikiPageList, wiki-editor.css
│   ├── focus/                    # Timer UI, CalmReview
│   ├── habits/                   # AddHabitDialog, SortableHabitItem, YesterdayReviewModal
│   ├── landing/                  # UnlockModal
│   ├── layout/                   # AppSidebar, DashboardErrorBoundary, PageHeader
│   ├── gamification/             # FeatureGate, ProtectedRoute, GamificationProvider, tutorials
│   ├── brand/                    # BeatLogo
│   ├── providers/                # SessionProvider, ThemeProvider
│   └── ui/                       # 24 shadcn components
├── hooks/
│   ├── useTasks.ts               # Tasks CRUD + filters (optimistic updates)
│   ├── useProjects.ts            # Projects CRUD
│   ├── useProjectWiki.ts         # Wiki pages CRUD per project
│   ├── useHabits.ts              # Habits CRUD + check/reorder
│   ├── useYesterdayReview.ts     # Habits review modal
│   ├── useMorningReview.ts       # 3-step morning review (stale→tasks→habits)
│   ├── useProfile.ts             # User preferences
│   ├── useFocusTimer.ts          # Pomodoro timer state machine
│   ├── useFeatures.ts            # Feature unlocks + shimmer
│   ├── useFeaturePageTutorial.ts # Tutorial state per feature page
│   ├── useGamification.ts        # XP/levels/rewards + calculateTaskXp
│   ├── useQuests.ts              # Daily quests tracking
│   ├── useWelcomeBack.ts         # Returning user detection (3+ days)
│   ├── useAuth.ts                # Auth state
│   └── use-mobile.ts             # Mobile viewport detection
├── db/
│   ├── index.ts                  # Drizzle client
│   ├── schema.ts                 # Database schema (26+ tables)
│   ├── seed-gamification.ts      # Seed features/achievements/creatures
│   └── generate-achievements.ts  # Auto-generated achievements
├── lib/
│   ├── auth.ts                   # NextAuth config (JWT, 30-day sessions)
│   ├── mobile-auth.ts            # JWT verification for mobile
│   ├── ai.ts                     # Google Gemini client + rate limiting
│   ├── gamification.ts           # Client-side XP/level calculations
│   ├── gamification-server.ts    # Server-side XP awards
│   ├── feature-tutorials.ts      # 20+ tutorial messages per feature
│   ├── streak.ts                 # Streak calculation logic
│   ├── rate-limit.ts             # Token bucket rate limiting
│   ├── logger.ts                 # PII-sanitizing logger
│   ├── pending-tasks.ts          # localStorage helpers
│   ├── pending-progress.ts       # localStorage for morning review state
│   └── utils.ts                  # Utilities (cn)
└── test/
    ├── setup.ts                  # Vitest globals setup
    └── ui-mocks.tsx              # Mock shadcn/lucide for React 18/19 compat

apps/ios/ADHDFocus/ (55+ files)
├── ADHDFocusApp.swift            # App entry point
├── ContentView.swift             # Main tab view + auth routing
├── Models/ (11 files)
│   ├── Task.swift                # TaskItem, TaskStatus, enums
│   ├── User.swift                # User, AuthResponse, LoginInput
│   ├── Project.swift             # Project model
│   ├── Achievement.swift         # Achievement model
│   ├── Creature.swift            # Creature model
│   ├── Feature.swift             # Feature unlock model
│   ├── FocusSession.swift        # Focus session model
│   ├── Habit.swift               # Habit model
│   └── UserStats.swift           # User stats model
├── Services/ (10 files)
│   ├── APIClient.swift           # HTTP client + Keychain (baseURL: beatyour8.com/api)
│   ├── AuthManager.swift         # Auth state management
│   ├── TaskStore.swift           # Tasks state + CRUD
│   ├── ProjectStore.swift        # Projects state
│   ├── FeatureStore.swift        # Feature unlock state
│   ├── FocusStore.swift          # Focus session state
│   ├── HabitStore.swift          # Habits state
│   ├── AchievementStore.swift    # Achievements state
│   ├── CreatureStore.swift       # Creatures state
│   └── StatsStore.swift          # Stats state
└── Views/ (35+ screens)
    ├── Auth/ (Login, Signup)
    ├── Today/TodayView.swift
    ├── Inbox/ (InboxView, ProcessModeView)
    ├── Projects/ (ProjectsView, ProjectDetailView, AddProjectSheet)
    ├── Scheduled/ScheduledView.swift
    ├── Completed/CompletedView.swift
    ├── Checklist/ (ChecklistView, AddHabitSheet)
    ├── Focus/ (FocusView, TimerCircle, TaskSelectorSheet)
    ├── Stats/StatsView.swift
    ├── Achievements/AchievementsView.swift
    ├── Creatures/ (CreaturesView, CreatureDetailSheet)
    ├── QuickActions/QuickActionsView.swift
    ├── Gamification/FeatureUnlockModal.swift
    └── Components/ (TaskRow, AddTaskSheet)
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

# Testing (in apps/web/)
npm run test        # Watch mode
npm run test:run    # Single run
npm run test:coverage  # With coverage

# Add component
npx shadcn@latest add [component]

# iOS
cd apps/ios && xcodegen generate && open ADHDFocus.xcodeproj
```

## Environment Variables

```bash
# apps/web/.env.local (local development)
DATABASE_URL=postgres://postgres:testpassword123@localhost:5434/postgres
AUTH_SECRET=your-secret-here
AUTH_URL=http://localhost:3000
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-key  # Optional: enables AI features (suggest/decompose/brain-dump)
```

## Production & Staging Environments

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Server: 23.134.216.230                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐     ┌──────────────────────────────────┐  │
│  │   Caddy     │────▶│  beatyour8.com (Production)      │  │
│  │  (ports     │     │  ├─ adhd-focus-web:3000          │  │
│  │  80/443)    │     │  └─ adhd-focus-db:5432           │  │
│  │             │     └──────────────────────────────────┘  │
│  │             │                                            │
│  │             │     ┌──────────────────────────────────┐  │
│  │             │────▶│  adhdrenaline.com (Staging)      │  │
│  │             │     │  ├─ adhd-focus-web-staging:3000  │  │
│  └─────────────┘     │  └─ adhd-focus-db-staging:5433   │  │
│                      └──────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Domains & Branches

| Environment | Domain | Git Branch | Image Tag |
|-------------|--------|------------|-----------|
| **Production** | beatyour8.com | `main` | `:latest` |
| **Staging** | adhdrenaline.com | `staging` | `:staging` |

### Deployment Workflow

```bash
# Deploy to PRODUCTION (beatyour8.com)
git checkout main
git push origin main
# → GitHub Actions builds :latest image
# → Deploys to adhd-focus-web container

# Deploy to STAGING (adhdrenaline.com)
git checkout staging
git merge main  # or cherry-pick specific commits
git push origin staging
# → GitHub Actions builds :staging image
# → Deploys to adhd-focus-web-staging container
```

### Server File Structure

```
/opt/adhd-focus/
├── .env                      # Production secrets
├── .env.staging              # Staging secrets (separate DB password!)
├── docker-compose.yml        # Production services
├── docker-compose.staging.yml # Staging services
├── Caddyfile                 # Multi-domain routing
└── migrations/               # DB migrations
```

### Key Server Commands

```bash
# SSH to server
ssh -i ~/.ssh/adhd-focus-deploy root@23.134.216.230

# Check all containers
docker ps

# View logs
docker logs adhd-focus-web          # Production web
docker logs adhd-focus-web-staging  # Staging web
docker logs adhd-focus-caddy        # Reverse proxy

# Restart services
cd /opt/adhd-focus
docker compose restart web                                    # Prod web
docker compose -f docker-compose.staging.yml restart web-staging  # Staging web
docker compose restart caddy                                  # Caddy (both domains)

# Manual deploy (without GitHub Actions)
docker pull ghcr.io/zarudesu/adhd-focus-web:latest
docker compose up -d --no-deps web

# Database access
docker exec -it adhd-focus-db psql -U postgres -d adhd_focus           # Prod
docker exec -it adhd-focus-db-staging psql -U postgres -d adhd_focus_staging  # Staging
```

### Databases

| Environment | Container | Port | Database Name |
|-------------|-----------|------|---------------|
| Production | adhd-focus-db | 5432 | adhd_focus |
| Staging | adhd-focus-db-staging | 5433 | adhd_focus_staging |

**IMPORTANT**: Databases are completely separate. Staging data won't affect production.

### Adding New Server Files

When you need to update server configs (Caddyfile, docker-compose, etc.):

```bash
# Copy file to server
scp -i ~/.ssh/adhd-focus-deploy docker/Caddyfile root@23.134.216.230:/opt/adhd-focus/

# Then restart affected service
ssh -i ~/.ssh/adhd-focus-deploy root@23.134.216.230 "cd /opt/adhd-focus && docker compose restart caddy"
```

### GitHub Actions Secrets Required

For both `production` and `staging` environments in GitHub:
- `SERVER_HOST` = `23.134.216.230`
- `SERVER_USER` = `root`
- `SSH_PRIVATE_KEY` = contents of `~/.ssh/adhd-focus-deploy`

### Initial Staging Setup (One-Time)

This was already done, but for reference:

```bash
# 1. Point DNS: adhdrenaline.com → 23.134.216.230

# 2. Copy files to server
scp -i ~/.ssh/adhd-focus-deploy docker/docker-compose.staging.yml root@23.134.216.230:/opt/adhd-focus/
scp -i ~/.ssh/adhd-focus-deploy docker/Caddyfile root@23.134.216.230:/opt/adhd-focus/

# 3. Create staging secrets on server
ssh root@23.134.216.230
cd /opt/adhd-focus
cat > .env.staging << 'EOF'
DOMAIN=adhdrenaline.com
SITE_URL=https://adhdrenaline.com
POSTGRES_PASSWORD=$(openssl rand -base64 24)
AUTH_SECRET=$(openssl rand -base64 32)
POSTGRES_DB=adhd_focus_staging
POSTGRES_PORT=5433
WEB_VERSION=latest
EOF

# 4. Start staging
docker compose -f docker-compose.staging.yml --env-file .env.staging up -d
docker compose restart caddy
```

## API Pattern (Reference)

```typescript
// Hook usage
const { tasks, todayTasks, inboxTasks, scheduledTasks, overdueTasks,
        complete, uncomplete, deleteTask, moveToToday, create,
        archive, scheduleTask, snoozeTask } = useTasks();

// Filter helpers (memoized):
// todayTasks - status: today/in_progress + done with today's date
// inboxTasks - status: inbox
// scheduledTasks - status: scheduled
// overdueTasks - past due date, not completed

// Task completion flow (with gamification chain):
const result = await complete(id);
// Returns: { task, xpAwarded, wasBonus, levelUp, newLevel, newAchievements[], creature }

// XP calculation: base 10 + priority mult + energy bonus + streak mult + ±20% variation + 10% 2x bonus
```

## Database Schema (Key Tables)

**26+ tables** in `src/db/schema.ts`. Key ones:

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `user` | Users + preferences + gamification stats | xp, level, streak, tasksAdded/Completed/Scheduled |
| `task` | Tasks with ADHD metadata | status, energyRequired, priority, estimatedMinutes, parentTaskId |
| `project` | Task containers | name, color, emoji, archived |
| `feature` | Progressive unlock definitions | unlockLevel, unlockTasksAdded, unlockTasksCompleted, etc. |
| `user_feature` | User's unlocked features | featureCode, unlockedAt, firstOpenedAt (null = shimmer) |
| `achievement` | Achievement definitions (JSONB conditions) | conditionType, conditionValue, visibility |
| `creature` | Collectibles with spawn mechanics | rarity, spawnConditions (JSONB), spawnChance |
| `daily_quest` | Auto-generated daily quests | questType, target, progress, xpReward |
| `habit` | Daily habits | frequency, timeOfDay, currentStreak |
| `habit_check` | Daily completion records | date, skipped, reflection, xpAwarded |
| `focus_session` | Pomodoro sessions | durationMinutes, pomodoros, completed |
| `daily_stat` | Denormalized daily snapshots | tasksCompleted, focusMinutes, xpEarned |
| `project_wiki_page` | Rich-text wiki per project | content (JSONB, BlockNote format) |

## Testing

**Framework:** Vitest + happy-dom + @testing-library/react

**Test files (5):**
- `components/tasks/AddTaskDialog.test.tsx`
- `components/tasks/MorningReviewModal.test.tsx`
- `hooks/useGamification.test.ts`
- `lib/gamification.test.ts`
- `lib/rate-limit.test.ts`

**Known issue:** React 18/19 conflict (see MEMORY.md). Mock shadcn/lucide via `src/test/ui-mocks.tsx`.

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

## Gamification System

**Documentation**:
- **[docs/FEATURE_UNLOCKS.md](docs/FEATURE_UNLOCKS.md)** - Unlock conditions & rationale
- **[apps/web/docs/GAMIFICATION.md](apps/web/docs/GAMIFICATION.md)** - XP, achievements, creatures
- **[docs/RETENTION_RESEARCH.md](docs/RETENTION_RESEARCH.md)** - ADHD retention research & behavioral science

### Core Concept: Progressive Feature Unlocking

ADHD brain overwhelms from too many options. Solution:
- New user sees **only Inbox**
- Features **unlock** through user actions (not levels!)
- Creates **progress feeling** + **tutorial effect**
- Hidden until unlocked = surprise delight

### Key Components

| Component | Purpose |
|-----------|---------|
| `FeatureGate` | Hides UI until feature unlocked |
| `useFeatures` | Check if feature unlocked, get next unlock |
| `useGamification` | XP/level, award XP, check achievements |

### Feature Unlock Order (Current)

| Feature | Unlock Trigger |
|---------|---------------|
| Inbox | Always available |
| Today | 1 task assigned to today |
| Scheduled | 1 task scheduled for **future** date |
| Completed | 1 task completed |
| Checklist | 3 tasks completed |
| Achievements | 3 tasks added |
| Focus Mode | 5 tasks completed |
| Projects | 10 tasks added |
| Quick Actions | 10 tasks completed |
| Creatures | Level 5 |
| Statistics | 7-day streak |

See **[docs/FEATURE_UNLOCKS.md](docs/FEATURE_UNLOCKS.md)** for full details and rationale.

### XP Formula
```typescript
XP_to_level = floor(100 × (level ^ 1.5))
// L1→2: 100 XP, L2→3: 283 XP, L5→6: 1118 XP
```

### Additional Systems

#### Daily Quests
- Auto-generated based on user level (12 quest templates)
- L1+: Complete 1 task, Add 2 tasks
- L2+: Complete 3, Check all habits
- L3+: Complete 5, Do 1 pomodoro
- L5+: Do 3 pomodoros, Focus sessions
- Hook: `useQuests.ts`, API: `/api/gamification/quests`

#### Feature Tutorials
- 20+ context-aware tutorials shown on first feature open
- ADHD-friendly: max 3 bullet points per tutorial
- Library: `lib/feature-tutorials.ts`
- Hook: `useFeaturePageTutorial.ts`

#### Morning Review
- 3-step flow: stale tasks (14+ days) → active tasks → habits
- Hook: `useMorningReview.ts`
- Component: `MorningReviewModal.tsx`

### Files Structure
```
src/
├── hooks/
│   ├── useFeatures.ts            # Feature unlock checking + shimmer
│   ├── useFeaturePageTutorial.ts # Tutorial state per page
│   ├── useGamification.ts        # XP, levels, rewards, calculateTaskXp
│   ├── useQuests.ts              # Daily quests
│   ├── useWelcomeBack.ts         # Returning user detection (3+ days away)
│   └── useMorningReview.ts       # Morning review flow
├── components/gamification/
│   ├── FeatureGate.tsx           # Gates UI behind features
│   ├── GamificationProvider.tsx  # Visual reward effects
│   └── WelcomeBackFlow.tsx       # Returning user welcome modal
├── components/review/
│   ├── ReviewMode.tsx            # Multi-source triage (525 lines)
│   └── SchedulePopover.tsx       # Smart date picker
├── app/api/gamification/
│   ├── stats/route.ts            # GET user stats
│   ├── xp/route.ts              # POST award XP
│   ├── achievements/check/       # POST check achievements
│   ├── creatures/spawn/          # POST spawn creature
│   ├── rewards/log/              # POST log visual effect
│   ├── day-surprise/             # POST day 3-5 surprise achievement
│   └── quests/route.ts           # GET/POST daily quests
├── lib/
│   ├── gamification.ts           # Client-side XP/level calculations
│   ├── gamification-server.ts    # Server-side XP awards
│   └── feature-tutorials.ts     # Tutorial content (225 lines)
└── db/
    ├── schema.ts                 # Gamification tables (26+ total)
    ├── seed-gamification.ts      # Seed features/achievements/creatures
    └── generate-achievements.ts  # Auto-generated achievements
```

### Usage Example
```tsx
// Gate feature behind unlock
<FeatureGate feature="priority">
  <PrioritySelector />
</FeatureGate>

// Check in code
const { isUnlocked } = useFeatures();
if (isUnlocked('projects')) { /* show projects */ }

// Award XP
const { awardXp, checkAchievements } = useGamification();
await awardXp(15, 'task_complete');
await checkAchievements();
```

### Roadmap
- **Phase 0**: ✅ DB schema, hooks, components, API, seed
- **Phase 1**: ✅ XP integration in useTasks, level bar in sidebar
- **Phase 2**: ✅ Visual rewards - GamificationProvider with effects
- **Phase 3**: ✅ Achievements UI - /dashboard/achievements page
- **Phase 4**: ✅ Creatures collection - /dashboard/creatures page
- **Phase 5**: TODO - FeatureGate in all UI (progressive unlock)
- **Phase 6**: ✅ ADHD Retention features (welcome back, task amnesty, XP variation, Just 1 Mode)
- **Phase 7**: ✅ AI features (Gemini: suggest, decompose, brain-dump)
- **Phase 8**: ✅ Review Mode (multi-source triage)
- **Phase 9**: ✅ Daily Quests + Feature Tutorials + Morning Review
- **Phase 10**: ✅ Project Wiki (BlockNote rich-text)

## AI Features (Google Gemini)

Uses `@google/generative-ai` package. Requires `GOOGLE_GENERATIVE_AI_API_KEY` env var.

| Endpoint | Purpose | Input | Output |
|----------|---------|-------|--------|
| POST /api/ai/suggest | Auto-classify task | `{ title, description? }` | `{ priority, energy, estimatedMinutes }` |
| POST /api/ai/decompose | Break into subtasks | `{ title, description? }` | `{ subtasks: [{title, estimatedMinutes}] }` |
| POST /api/ai/brain-dump | Parse free text | `{ text }` | `{ tasks: [{title, priority, energy}] }` |

**Key files:** `lib/ai.ts` (client + rate limiting), `app/api/ai/` (3 routes)
**Check if enabled:** `isAIEnabled()` helper in `lib/ai.ts`

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

## Recent Changes (2026-03-01)

### Multi-source Review Mode ✅
- **Global triage**: Process all inbox tasks with 19+ actions (move, schedule, decompose, archive, etc.)
- **Project triage**: Review tasks for specific project
- **Key files**: `components/review/ReviewMode.tsx` (525 lines), `SchedulePopover.tsx`

### Focus Mode Enhancements ✅
- **Full blur overlay**: Step-by-step flow with process blur
- **Calm Review**: End-of-day review component (`components/focus/CalmReview.tsx`)

### AI Features (Gemini) ✅
- **Auto-classify**: POST /api/ai/suggest → priority, energy, time estimate
- **Decompose**: POST /api/ai/decompose → subtasks
- **Brain Dump**: POST /api/ai/brain-dump → parse free text into tasks
- **Key files**: `lib/ai.ts`, `app/api/ai/` (3 routes)

### Daily Quests ✅
- Auto-generated based on user level, 12 quest templates
- Hook: `useQuests.ts`, API: `/api/gamification/quests`

### Project Wiki ✅
- Rich-text wiki pages per project using BlockNote editor
- API: `/api/projects/[id]/wiki`, hook: `useProjectWiki.ts`
- Components: `WikiEditor.tsx`, `WikiPageList.tsx`

### Feature Tutorials ✅
- 20+ context-aware tutorials, shown on first feature open
- Library: `lib/feature-tutorials.ts` (225 lines)
- Hook: `useFeaturePageTutorial.ts`

### Morning Review ✅
- 3-step flow: stale tasks (14+ days) → active tasks → habits
- Hook: `useMorningReview.ts`, Component: `MorningReviewModal.tsx`

### UX Fixes ✅
- Prevented modal stacking, batch achievements, tutorial timing
- Lint fixes: tutorial return after hooks, ref mutation warnings
- Wiki dark theme polish

### Previous (2026-02-05)
- **ADHD Retention (Phase 6)**: Welcome Back Flow, Task Amnesty, XP Variation (±20% + 10% 2x), Just 1 Mode, Day 3-5 Surprise
- **Key files**: `useWelcomeBack.ts`, `WelcomeBackFlow.tsx`, `MorningReviewModal.tsx`, `calculateTaskXp`

### Previous (2026-01-22)
- **Staging**: adhdrenaline.com (staging branch), separate DB
- **Security**: Bot protection (honeypot + timing), Re-auth modal for Projects
- **iOS App**: 35+ screens, JWT auth, Keychain, all major features

### Previous (2026-01-20)
- **ESLint**: 0 errors (was 24), strict mode compliance
- **Focus Mode**: Pomodoro timer complete
- **Gamification Phase 0**: Progressive unlock, XP, achievements, creatures


---

## Context OS — Session State Management

### Rules

1. Write state to disk, not conversation. After completing meaningful work, write a summary to docs/summaries/ using templates from templates/claude-templates.md. Include: decisions with rationale, exact numbers, file paths, open items.
2. Before compaction or session end, write to disk: every number, every decision with rationale, every open question, every file path, exact next action.
3. When switching work types (research → writing → review), write a handoff to docs/summaries/handoff-[date]-[topic].md and suggest a new session.
4. Do not silently resolve open questions. Mark them OPEN or ASSUMED.
5. Do not bulk-read documents. Process one at a time: read, summarize to disk, release from context before reading next.
6. Sub-agent returns must be structured, not free-form prose. Use output contracts from templates/claude-templates.md.

### Where Things Live (Context OS)

- templates/claude-templates.md — summary, handoff, decision, analysis, task, output contract templates (read on demand)
- docs/summaries/ — active session state (latest handoff + decision records + source summaries)
- docs/context/ — reusable domain knowledge, loaded only when relevant to the current task
- docs/archive/ — processed raw files. Do not read unless explicitly told.
- output/deliverables/ — final outputs

### Error Recovery

If context degrades or auto-compact fires unexpectedly: write current state to docs/summaries/recovery-[date].md, tell the user what may have been lost, suggest a fresh session.

### Before Delivering Output

Verify: exact numbers preserved, open questions marked OPEN, output matches what was requested (not assumed), claims backed by specific data, summary written to disk for this session's work.
