# CLAUDE.md - ADHD Focus Task Manager

## Project Overview

ADHD Focus is a task management app designed specifically for people with ADHD. It reduces cognitive load, supports executive function, and makes productivity achievable.

**Important:** UI design decisions should be discussed with the user. Don't make "топорный" (crude) UI - always research best practices and ask before implementing.

## Tech Stack

- **Monorepo**: Turborepo
- **Mobile/Web**: Expo (React Native) - iOS, Android, Web from single codebase
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **State**: Zustand (local UI state only)
- **Language**: TypeScript everywhere

## Architecture

### Clean Architecture Layers

```
apps/mobile/
├── api/                 # Low-level Supabase API calls
│   ├── tasks.ts         # Task CRUD operations
│   ├── auth.ts          # Authentication
│   ├── profile.ts       # User profile & preferences
│   └── focusSessions.ts # Pomodoro tracking
├── hooks/               # Business logic & state
│   ├── useTasks.ts      # Task operations with caching
│   ├── useAuth.ts       # Auth state management
│   └── useFocusSession.ts # Pomodoro timer logic
├── store/               # Local UI state only (Zustand)
├── app/                 # Screens (Expo Router)
├── components/          # Reusable UI components
└── lib/                 # Utilities (supabase client, etc.)
```

### Data Flow

```
UI Component → Hook → API → Supabase
     ↑                        ↓
     └────── State ←─────────┘
```

- **API layer**: Pure Supabase calls, no business logic
- **Hooks**: Business logic, caching, optimistic updates
- **Store**: Only for local UI state (not synced data)

## Supabase Best Practices

Based on research: [Leanware](https://www.leanware.co/insights/supabase-best-practices), [Supabase Docs](https://supabase.com/docs/guides/getting-started/architecture)

### Security
- RLS (Row-Level Security) enabled on all tables
- Never expose `service_role` key in client code
- Use separate Supabase projects for dev/staging/prod

### Performance
- Batch, cache, and debounce API calls
- Use realtime subscriptions selectively (only where needed)
- Index frequently queried fields
- Implement optimistic updates in hooks

### Migrations
- Keep schema migrations in git (`supabase/migrations/`)
- Test migrations on staging before production
- Never commit production credentials

## ADHD UX Design Principles

Based on research: [UX Collective](https://uxdesign.cc/software-accessibility-for-users-with-attention-deficit-disorder-adhd-f32226e6037c), [Din Studio](https://din-studio.com/ui-ux-for-adhd-designing-interfaces-that-actually-help-students/)

### Reduce Cognitive Overload
- **Minimal visual clutter** - every element must earn its place
- **Progressive disclosure** - show only what's needed now
- **Chunk content** - short text, headers, whitespace
- **Hide complexity** - use collapsible sections, accordions

### Navigation & Layout
- Clear, logical pathways
- Avoid unnecessary clicks
- Strategic whitespace for "breathing room"
- Simplified forms with minimal required fields

### Sensory Considerations
- Dark/light mode toggle (many ADHD users are light-sensitive)
- No auto-playing videos/sounds
- Limit animations - if used, make them subtle and purposeful
- High contrast options

### Task Initiation Help
- Reduce friction to start tasks
- Auto-prioritization to reduce decision fatigue
- Show one task at a time (hide others)
- Break large tasks into smaller steps automatically

### Motivation & Accountability
- Visual progress tracking
- Streak maintenance (dopamine reward)
- Satisfying completion animations
- Achievement system

### What NOT to do
- Don't add too many options/settings
- Don't require complex setup
- Don't use notification spam
- Don't make UI "busy" or cluttered
- Don't assume users will remember things

## Key ADHD Features

1. **One Task Focus** - Show only current task, hide distractions
2. **Energy Matching** - Tag tasks by energy (low/medium/high), match to current state
3. **Must/Should/Want** - Simple 3-tier priority (not 1-5 numbers)
4. **WIP Limit** - Max 3 tasks per day by default
5. **Pomodoro Timer** - Built-in focus sessions with breaks
6. **Streaks** - Dopamine rewards for daily completion
7. **Quick Capture** - Instant inbox for brain dumps

## Database Schema

### Core Tables
- `profiles` - User data & preferences (extends auth.users)
- `tasks` - Tasks with ADHD-specific fields
- `focus_sessions` - Pomodoro/focus tracking
- `projects` - Optional task grouping
- `daily_stats` - For streak calculation

### Task Fields (ADHD-specific)
- `energy_required`: low | medium | high
- `priority`: must | should | want | someday
- `estimated_minutes`: Time estimate practice
- `actual_minutes`: Track real time (learn patterns)
- `pomodoros_completed`: Focus session count
- `streak_contribution`: Counts toward daily streak

## Development Commands

```bash
# Install dependencies (from root)
npm install

# Run mobile app
cd apps/mobile && npx expo start

# Run all apps in dev mode
npm run dev
```

## Environment Variables

### Mobile App (`apps/mobile/.env`)
```
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=xxx
```

## Coding Guidelines

### General
- TypeScript strict mode
- Prefer hooks over class components
- Use optimistic updates for better UX
- Handle offline gracefully

### API Layer
- Keep API functions pure (no side effects)
- Return typed responses
- Handle errors consistently
- Support pagination where needed

### Hooks
- Encapsulate business logic
- Implement caching strategies
- Support optimistic updates
- Expose loading/error states

### UI Components
- **Ask user before implementing major UI changes**
- Research best practices before designing
- Keep components small and focused
- Use semantic prop names
- Support dark/light themes

## Next Steps

1. [ ] Set up Supabase project (user needs to create)
2. [ ] Run migrations (`supabase/migrations/001_initial_schema.sql`)
3. [ ] Add `.env` with Supabase credentials
4. [ ] Test auth flow
5. [ ] Design UI with user input (don't assume)
6. [ ] Implement task CRUD with real API
7. [ ] Build quick capture feature
8. [ ] Add streak tracking

## Resources

- [Supabase Best Practices](https://www.leanware.co/insights/supabase-best-practices)
- [ADHD UX Design](https://uxdesign.cc/software-accessibility-for-users-with-attention-deficit-disorder-adhd-f32226e6037c)
- [Expo Folder Structure](https://expo.dev/blog/expo-app-folder-structure-best-practices)
- [React Native Clean Architecture](https://github.com/carlossalasamper/react-native-clean-architecture)
