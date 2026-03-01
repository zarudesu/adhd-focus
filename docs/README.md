# ADHD Focus Documentation

> Documentation index for the ADHD Focus project
> Last updated: 2026-03-01

## Quick Links

| Document | Description | Status |
|----------|-------------|--------|
| [../CLAUDE.md](../CLAUDE.md) | AI assistant instructions, current state, workflows | **Current** |
| [FEATURE_UNLOCKS.md](FEATURE_UNLOCKS.md) | Progressive feature unlock system | **Current** |
| [AI_FEATURES.md](AI_FEATURES.md) | AI integration (Gemini): suggest, decompose, brain-dump | **Current** |
| [RETENTION_RESEARCH.md](RETENTION_RESEARCH.md) | ADHD retention research & behavioral science | **Current** |
| [ACHIEVEMENT_TREE.md](ACHIEVEMENT_TREE.md) | Achievement list with unlock conditions & XP | **Current** |
| [BRAND_INTEGRATION_PLAN.md](BRAND_INTEGRATION_PLAN.md) | Branding, colors, typography, voice | **Current** |
| [../apps/web/docs/GAMIFICATION.md](../apps/web/docs/GAMIFICATION.md) | Gamification system (XP, achievements, creatures, quests) | **Current** |

## Current Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Database | PostgreSQL 17 |
| ORM | Drizzle |
| Auth | NextAuth v5 (JWT) |
| UI | shadcn/ui + Tailwind CSS |
| Rich Text | BlockNote 0.46 |
| AI | Google Gemini |
| Unit Tests | Vitest + happy-dom |
| E2E Tests | Playwright |
| Deployment | Docker + Caddy + GitHub Actions |
| iOS | SwiftUI (iOS 17+) |

## Project Structure

```
adhd-focus/
├── apps/
│   ├── web/                    # Next.js web app (193 files)
│   │   ├── src/
│   │   │   ├── app/            # App Router pages + API routes
│   │   │   ├── components/     # React components (77 files)
│   │   │   ├── hooks/          # Custom hooks (17 files)
│   │   │   ├── db/             # Drizzle schema + client
│   │   │   ├── lib/            # Utilities (14 files)
│   │   │   └── test/           # Test setup + mocks
│   │   └── docs/               # Web-specific docs (GAMIFICATION.md)
│   └── ios/                    # SwiftUI iOS app (55+ files, 35+ screens)
├── docker/                     # Production deployment
├── docs/                       # This directory
├── templates/                  # Claude session templates
└── CLAUDE.md                   # Main project context (START HERE)
```

## Documentation by Category

### For Development
- **[../CLAUDE.md](../CLAUDE.md)** - Start here! Project context, workflows, current state
- **[FEATURE_UNLOCKS.md](FEATURE_UNLOCKS.md)** - How features unlock progressively

### For Gamification
- **[../apps/web/docs/GAMIFICATION.md](../apps/web/docs/GAMIFICATION.md)** - Full gamification system docs
- **[FEATURE_UNLOCKS.md](FEATURE_UNLOCKS.md)** - Unlock conditions and rationale
- **[ACHIEVEMENT_TREE.md](ACHIEVEMENT_TREE.md)** - All achievements with conditions

### For AI Features
- **[AI_FEATURES.md](AI_FEATURES.md)** - Tier 1-3 AI integration roadmap

### For ADHD Research
- **[RETENTION_RESEARCH.md](RETENTION_RESEARCH.md)** - 50+ papers, behavioral frameworks

### For Deployment
- **[../CLAUDE.md](../CLAUDE.md)** - Production & Staging section has all server details

## API Routes (Current)

| Route | Method | Description |
|-------|--------|-------------|
| `/api/tasks` | GET, POST | List/create tasks |
| `/api/tasks/[id]` | PATCH, DELETE | Update/delete task |
| `/api/projects` | GET, POST | List/create projects |
| `/api/projects/[id]` | PATCH, DELETE | Update/archive project |
| `/api/projects/[id]/wiki` | GET, POST | Wiki pages per project |
| `/api/projects/[id]/wiki/[pageId]` | GET, PATCH, DELETE | Single wiki page |
| `/api/profile` | GET, PATCH | User profile/preferences |
| `/api/habits` | GET, POST | List/create habits |
| `/api/habits/[id]` | PATCH, DELETE | Update/archive habit |
| `/api/habits/[id]/check` | POST, DELETE | Check/uncheck habit |
| `/api/habits/reorder` | POST | Batch reorder habits |
| `/api/habits/review` | GET, POST | Yesterday review |
| `/api/focus/sessions` | GET, POST | Focus sessions |
| `/api/focus/sessions/[id]` | PATCH | Update session |
| `/api/features` | GET | Feature unlock status |
| `/api/features/[code]/opened` | POST | Mark feature opened |
| `/api/gamification/stats` | GET | User gamification stats |
| `/api/gamification/xp` | POST | Award XP |
| `/api/gamification/achievements/check` | POST | Check achievements |
| `/api/gamification/creatures/spawn` | POST | Spawn creature |
| `/api/gamification/rewards/log` | POST | Log visual reward |
| `/api/gamification/day-surprise` | POST | Day 3-5 surprise |
| `/api/gamification/quests` | GET, POST | Daily quests |
| `/api/stats` | GET | Historical daily stats |
| `/api/ai/suggest` | POST | AI auto-classify task |
| `/api/ai/decompose` | POST | AI break into subtasks |
| `/api/ai/brain-dump` | POST | AI parse text to tasks |
| `/api/auth/register` | POST | Registration (rate limited) |
| `/api/mobile/auth/login` | POST | JWT login for iOS |
| `/api/mobile/auth/refresh` | POST | JWT refresh |

## Environment Variables

```bash
# apps/web/.env.local
DATABASE_URL=postgres://postgres:password@localhost:5434/postgres
AUTH_SECRET=your-secret-here
AUTH_URL=http://localhost:3000
GOOGLE_GENERATIVE_AI_API_KEY=your-key  # Optional: AI features
```

## Development Commands

```bash
# Start database
cd docker && docker compose up -d db

# Start dev server
cd apps/web && npm run dev

# Database operations
npm run db:push      # Sync schema
npm run db:studio    # Visual editor

# Testing
npm run test         # Watch mode
npm run test:run     # Single run

# Add UI component
npx shadcn@latest add [component]

# iOS
cd apps/ios && xcodegen generate && open ADHDFocus.xcodeproj
```

## Archived Documentation

> These docs reference the old Supabase + Expo architecture. Kept for historical reference only.

| Document | Original Purpose |
|----------|------------------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Old Supabase architecture |
| [DEVELOPMENT.md](DEVELOPMENT.md) | Old Supabase/Expo setup |
| [API.md](API.md) | Old Supabase REST API |
| [UI_PLAN.md](UI_PLAN.md) | Original 2024 UI plans |
| [APP_STRUCTURE.md](APP_STRUCTURE.md) | Old Expo app structure |
| [WEB_DEVELOPMENT.md](WEB_DEVELOPMENT.md) | Old web setup |
| [SESSION_LOG.md](SESSION_LOG.md) | Old development log |
