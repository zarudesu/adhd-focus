# ADHD Focus

Task management app designed specifically for people with ADHD. Reduces cognitive load, supports executive function, and makes productivity achievable.

**Live:** [beatyour8.com](https://beatyour8.com)

## Why Another Task Manager?

Most task managers are built for neurotypical brains. They overwhelm with features, require complex setups, and show everything at once. ADHD Focus is different:

- **Progressive Disclosure** - Start with just Inbox, unlock features as you go
- **One Task at a Time** - Hide the noise, focus on what matters now
- **Energy Matching** - Tag tasks by energy level, work with your brain not against it
- **Simple Priorities** - Must/Should/Want instead of confusing 1-5 scales
- **Quick Capture** - Instant inbox for brain dumps, process later
- **Gamification** - XP, levels, achievements, and collectible creatures

## Features

### Core Task Management
- **Inbox** - Quick capture, process later
- **Today** - Focus on today's tasks (WIP limit: 3 by default)
- **Scheduled** - Plan for the future
- **Projects** - Group related tasks

### Focus Tools
- **Pomodoro Timer** - Work/break cycles with stats
- **Quick Actions** - 2-minute timer for rapid task capture
- **Process Mode** - Triage inbox tasks one at a time

### Gamification
- **XP & Levels** - Earn XP for completing tasks
- **Achievements** - 30+ achievements (some secret!)
- **Creatures** - Collectible creatures that spawn on task completion
- **Visual Rewards** - Sci-fi animations for dopamine hits
- **Streaks** - Track consecutive days

### Progressive Unlocking
New users see only Inbox. Features unlock naturally:
- Complete a task → Completed page appears
- Assign to today → Today page appears
- Add 10 tasks → Projects unlocks
- Reach Level 5 → Creatures collection unlocks

See [docs/FEATURE_UNLOCKS.md](docs/FEATURE_UNLOCKS.md) for full details.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Database | PostgreSQL 17 |
| ORM | Drizzle |
| Auth | NextAuth v5 (Credentials) |
| UI | shadcn/ui + Tailwind CSS |
| Deployment | Docker + Caddy + GitHub Actions |

## Quick Start

### Prerequisites
- Node.js 18+
- Docker (for database)

### Development Setup

```bash
# Clone
git clone https://github.com/zarudesu/adhd-focus.git
cd adhd-focus

# Install dependencies
npm install

# Start database
cd docker && docker compose up -d db

# Configure environment
cp apps/web/.env.example apps/web/.env.local
# Edit .env.local with your settings

# Run migrations
cd apps/web && npm run db:push

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

```bash
# apps/web/.env.local
DATABASE_URL=postgres://postgres:testpassword123@localhost:5434/postgres
AUTH_SECRET=your-secret-here
AUTH_URL=http://localhost:3000
```

## Documentation

| Document | Description |
|----------|-------------|
| [CLAUDE.md](CLAUDE.md) | AI assistant context & project state |
| [docs/README.md](docs/README.md) | Documentation index |
| [docs/FEATURE_UNLOCKS.md](docs/FEATURE_UNLOCKS.md) | Progressive unlock system |
| [apps/web/docs/GAMIFICATION.md](apps/web/docs/GAMIFICATION.md) | Gamification details |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to contribute |

## Project Structure

```
adhd-focus/
├── apps/
│   └── web/                    # Next.js web app
│       ├── src/
│       │   ├── app/            # Pages + API routes
│       │   ├── components/     # React components
│       │   ├── hooks/          # Custom hooks
│       │   ├── db/             # Drizzle schema
│       │   └── lib/            # Utilities
│       └── docs/               # App-specific docs
├── docker/                     # Production deployment
├── docs/                       # Project documentation
└── CLAUDE.md                   # AI context file
```

## Deployment

### Self-Hosted (Docker)

```bash
cd docker
cp .env.example .env
# Edit .env with your configuration

docker compose up -d
```

The app will be available on your configured domain with automatic HTTPS via Caddy.

### Production

- Push to `main` triggers GitHub Actions
- Builds Docker image and deploys to server
- Automatic HTTPS with Let's Encrypt

## Design Philosophy

1. **Minimal UI** - Every element must earn its place
2. **Reduce Decisions** - Smart defaults, auto-prioritization
3. **Progressive Disclosure** - Reveal features as user is ready
4. **Instant Feedback** - Visual response to every action
5. **Forgiving UX** - Easy undo, no data loss

## Commands

```bash
# Development
npm install              # Install dependencies
npm run dev              # Start dev server

# Database
npm run db:push          # Sync schema to database
npm run db:studio        # Open Drizzle Studio

# Production
docker compose up -d     # Start production stack
docker compose logs -f   # View logs
```

## Contributing

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

## License

MIT License - feel free to use this for your own projects.

---

Built for the ADHD community
