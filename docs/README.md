# ADHD Focus Documentation

> Documentation index for the ADHD Focus project

## Quick Links

| Document | Description | Status |
|----------|-------------|--------|
| [../CLAUDE.md](../CLAUDE.md) | AI assistant instructions, current state, workflows | **Current** |
| [FEATURE_UNLOCKS.md](FEATURE_UNLOCKS.md) | Progressive feature unlock system | **Current** |
| [../apps/web/docs/GAMIFICATION.md](../apps/web/docs/GAMIFICATION.md) | Gamification system (XP, achievements, creatures) | **Current** |

## Current Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Database | PostgreSQL 17 |
| ORM | Drizzle |
| Auth | NextAuth v5 |
| UI | shadcn/ui + Tailwind CSS |
| Deployment | Docker + Caddy + GitHub Actions |

## Project Structure

```
adhd-focus/
├── apps/
│   ├── web/                    # Next.js web app (main)
│   │   ├── src/
│   │   │   ├── app/            # App Router pages + API routes
│   │   │   ├── components/     # React components
│   │   │   ├── hooks/          # Custom hooks
│   │   │   ├── db/             # Drizzle schema + client
│   │   │   └── lib/            # Utilities
│   │   └── docs/               # Web-specific docs
│   └── mobile/                 # Expo app (paused)
├── docker/                     # Production deployment
├── docs/                       # This directory
└── CLAUDE.md                   # Main project context
```

## Documentation by Category

### For Development

- **[../CLAUDE.md](../CLAUDE.md)** - Start here! Project context, workflows, current state
- **[FEATURE_UNLOCKS.md](FEATURE_UNLOCKS.md)** - How features unlock progressively

### For Gamification

- **[../apps/web/docs/GAMIFICATION.md](../apps/web/docs/GAMIFICATION.md)** - Full gamification system docs
- **[FEATURE_UNLOCKS.md](FEATURE_UNLOCKS.md)** - Unlock conditions and rationale

### For Deployment

- **[../docker/README.md](../docker/README.md)** - Docker deployment guide

## Archived Documentation

> These docs reference the old Supabase + Expo architecture. Kept for reference.

| Document | Original Purpose | Status |
|----------|------------------|--------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Supabase architecture | **Archived** |
| [DEVELOPMENT.md](DEVELOPMENT.md) | Supabase/Expo setup | **Archived** |
| [API.md](API.md) | Supabase REST API | **Archived** |
| [UI_PLAN.md](UI_PLAN.md) | Original UI plans | **Archived** |
| [APP_STRUCTURE.md](APP_STRUCTURE.md) | Expo app structure | **Archived** |
| [WEB_DEVELOPMENT.md](WEB_DEVELOPMENT.md) | Old web setup | **Archived** |
| [SESSION_LOG.md](SESSION_LOG.md) | Development log | **Archived** |

## Key Concepts

### Progressive Feature Unlocking

New users see only Inbox. Features unlock as they use the app:

1. **Inbox** - Always available (entry point)
2. **Today** - After assigning 1 task to today
3. **Scheduled** - After scheduling 1 task for future
4. **Completed** - After completing 1 task
5. **Projects** - After adding 10 tasks
6. ... and more

See [FEATURE_UNLOCKS.md](FEATURE_UNLOCKS.md) for full details.

### Gamification

- **XP System** - Earn XP for completing tasks
- **Levels** - Progress through levels (affects unlocks)
- **Achievements** - Hidden and visible achievements
- **Creatures** - Collectible creatures that spawn on task completion
- **Visual Rewards** - Sci-fi animations on task completion

See [GAMIFICATION.md](../apps/web/docs/GAMIFICATION.md) for full details.

## API Routes (Current)

| Route | Method | Description |
|-------|--------|-------------|
| `/api/tasks` | GET, POST | List/create tasks |
| `/api/tasks/[id]` | GET, PATCH, DELETE | Single task ops |
| `/api/projects` | GET, POST | List/create projects |
| `/api/projects/[id]` | GET, PATCH, DELETE | Single project ops |
| `/api/profile` | GET, PATCH | User profile |
| `/api/focus/sessions` | GET, POST | Focus sessions |
| `/api/focus/sessions/[id]` | PATCH | Update session |
| `/api/gamification/stats` | GET | User gamification stats |
| `/api/gamification/xp` | POST | Award XP |
| `/api/gamification/achievements/check` | POST | Check achievements |
| `/api/gamification/creatures/spawn` | POST | Spawn creature |
| `/api/stats` | GET | Historical daily stats |

## Environment Variables

```bash
# apps/web/.env.local
DATABASE_URL=postgres://postgres:password@localhost:5434/postgres
AUTH_SECRET=your-secret-here
AUTH_URL=http://localhost:3000
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

# Add UI component
npx shadcn@latest add [component]
```

## Contributing

See [../CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines.
