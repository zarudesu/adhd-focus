# ADHD Focus

Task management app designed specifically for people with ADHD. Reduces cognitive load, supports executive function, and makes productivity achievable.

## Why Another Task Manager?

Most task managers are built for neurotypical brains. They overwhelm with features, require complex setups, and show everything at once. ADHD Focus is different:

- **One Task at a Time** - Hide the noise, focus on what matters now
- **Energy Matching** - Tag tasks by energy level, work with your brain not against it
- **Simple Priorities** - Must/Should/Want instead of confusing 1-5 scales
- **Quick Capture** - Instant inbox for brain dumps, process later
- **Streaks & Rewards** - Dopamine hits for completing tasks

## Features

### Core
- Task management with ADHD-specific fields (energy, simple priority)
- Pomodoro timer with automatic breaks
- Daily task limits (WIP limit - max 3 by default)
- Streak tracking for motivation

### Integrations
- **Telegram bot** - Quick capture from anywhere
- **Google Calendar** - Sync scheduled tasks
- **REST API** - Build your own integrations
- **Webhooks** - Automate with external services

### Deployment
- Cloud (Supabase hosted)
- Self-hosted (Docker Compose)
- Open source (MIT)

## Quick Start

### Prerequisites
- Node.js 18+
- pnpm (`npm install -g pnpm`)
- Supabase account (or Docker for self-hosted)

### Installation

```bash
# Clone
git clone https://github.com/zarudesu/adhd-focus.git
cd adhd-focus

# Install dependencies
pnpm install

# Configure environment
cp apps/mobile/.env.example apps/mobile/.env
# Edit .env with your Supabase credentials

# Run mobile app
cd apps/mobile
npx expo start
```

### Database Setup

1. Create Supabase project at [supabase.com](https://supabase.com)
2. Run migrations in SQL Editor:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_integrations.sql`
3. Copy project URL and anon key to `.env`

### Self-Hosted Deployment

```bash
cd docker
cp .env.example .env
# Edit .env with your configuration

docker compose up -d
```

Access points:
- Studio (Admin): http://localhost:3000
- API: http://localhost:8000/rest/v1
- Auth: http://localhost:8000/auth/v1

## Documentation

| Document | Description |
|----------|-------------|
| [CLAUDE.md](CLAUDE.md) | AI assistant context & project rules |
| [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) | Development setup & workflow |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design & data flow |
| [docs/API.md](docs/API.md) | REST API, Telegram bot, Calendar sync |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to contribute |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Mobile/Web | Expo (React Native) |
| Backend | Supabase (PostgreSQL, Auth, Realtime) |
| Edge Functions | Deno |
| Monorepo | Turborepo |
| Language | TypeScript |
| State | Zustand (local UI only) |

## Project Structure

```
adhd-focus/
├── apps/
│   ├── mobile/              # Expo app (iOS, Android, Web)
│   │   ├── api/             # Supabase API layer
│   │   ├── hooks/           # Business logic hooks
│   │   ├── components/      # UI components
│   │   ├── app/             # Screens (Expo Router)
│   │   ├── store/           # Local UI state (Zustand)
│   │   └── lib/             # Utilities
│   └── web/                 # Web dashboard (planned)
├── packages/
│   ├── shared/              # Shared types, constants, utils
│   └── ui/                  # Shared UI components
├── supabase/
│   ├── migrations/          # Database schema (SQL)
│   └── functions/           # Edge Functions (Deno)
│       ├── telegram-webhook/
│       └── google-calendar-sync/
├── docker/                  # Self-hosted deployment
│   ├── docker-compose.yml
│   └── .env.example
├── docs/                    # Documentation
├── CLAUDE.md               # AI assistant instructions
└── CONTRIBUTING.md         # Contribution guide
```

## Design Philosophy

1. **Minimal UI** - Every element must earn its place
2. **Reduce Decisions** - Smart defaults, auto-prioritization
3. **One Thing at a Time** - Progressive disclosure
4. **Instant Feedback** - Visual response to every action
5. **Forgiving UX** - Easy undo, no data loss
6. **Works Offline** - Sync when connected

## Commands

```bash
# Development
pnpm install              # Install all dependencies
pnpm dev                  # Run all apps
pnpm build                # Build all packages

# Mobile app
cd apps/mobile
npx expo start            # Start Expo dev server
npx expo start --ios      # iOS simulator
npx expo start --android  # Android emulator
npx expo start --web      # Web browser

# Supabase
supabase start            # Local Supabase
supabase db push          # Apply migrations
supabase functions serve  # Local Edge Functions

# Docker (self-hosted)
cd docker
docker compose up -d      # Start services
docker compose logs -f    # View logs
docker compose down       # Stop services
```

## Contributing

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

## License

MIT License - feel free to use this for your own projects.

## Links

- [GitHub Repository](https://github.com/zarudesu/adhd-focus)
- [Issues & Feature Requests](https://github.com/zarudesu/adhd-focus/issues)

---

Built for the ADHD community
