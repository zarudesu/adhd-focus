# CLAUDE.md - ADHD Focus Task Manager

## Project Overview

ADHD Focus is a task management app designed specifically for people with ADHD. It reduces cognitive load, supports executive function, and makes productivity achievable.

## Tech Stack

- **Monorepo**: Turborepo
- **Mobile/Web**: Expo (React Native) - iOS, Android, Web from single codebase
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **State**: Zustand
- **Language**: TypeScript everywhere

## Project Structure

```
adhd-focus/
├── apps/
│   ├── mobile/          # Expo app (iOS, Android, Web)
│   └── web/             # Next.js web app (future)
├── packages/
│   ├── shared/          # Shared types, constants, utils
│   └── ui/              # Shared UI components (future)
└── supabase/            # Database migrations
```

## Key ADHD-Friendly Features

1. **One Task Focus** - Show only the current task, hide distractions
2. **Energy Matching** - Tag tasks by energy required (low/medium/high)
3. **Must/Should/Want** - Simple prioritization system
4. **WIP Limit** - Max 3 tasks per day by default
5. **Pomodoro Timer** - Built-in focus sessions
6. **Streaks & Gamification** - Dopamine rewards for completion
7. **Quick Capture** - Inbox for brain dumps, process later

## Development Commands

```bash
# Install dependencies (from root)
npm install

# Run mobile app
npm run mobile
# or
cd apps/mobile && npx expo start

# Run all apps in dev mode
npm run dev

# Build all packages
npm run build
```

## Environment Variables

### Mobile App (`apps/mobile/.env`)
```
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=xxx
```

## Database Schema

### Core Tables
- `users` - User profiles and preferences
- `tasks` - Tasks with ADHD-specific fields
- `focus_sessions` - Pomodoro/focus tracking
- `projects` - Task grouping (optional)

### Task Fields (ADHD-specific)
- `energy_required`: low | medium | high
- `priority`: must | should | want | someday
- `estimated_minutes`: Time estimate practice
- `actual_minutes`: Track real time (learning)
- `pomodoros_completed`: Focus session count

## Coding Guidelines

1. **Keep UI minimal** - Every element must earn its place
2. **Reduce decisions** - Smart defaults, auto-prioritization
3. **Instant feedback** - Visual response to every action
4. **Forgiving UX** - Easy undo, no data loss
5. **Offline-first** - App works without connection

## Design Principles

- Dark mode by default (easier on eyes)
- Large tap targets
- Clear visual hierarchy
- Satisfying animations on completion
- No notification spam - only essential alerts

## Next Steps

1. [ ] Set up Supabase project
2. [ ] Create database migrations
3. [ ] Implement auth flow
4. [ ] Connect store to Supabase
5. [ ] Add task CRUD operations
6. [ ] Build quick capture feature
7. [ ] Implement daily planning view
