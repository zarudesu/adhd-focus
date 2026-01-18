# Architecture

> **ARCHIVED**: This document describes the OLD Supabase + Expo architecture.
> The project now uses Next.js + Drizzle + PostgreSQL.
> See [CLAUDE.md](../CLAUDE.md) for current architecture.

This document describes the system architecture of ADHD Focus.

## Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Clients                                    │
├─────────────────┬─────────────────┬─────────────────┬───────────────┤
│   Mobile App    │    Web App      │  Telegram Bot   │ External API  │
│    (Expo)       │   (Expo Web)    │                 │   Clients     │
└────────┬────────┴────────┬────────┴────────┬────────┴───────┬───────┘
         │                 │                 │                │
         └─────────────────┴────────┬────────┴────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Supabase                                     │
├─────────────────┬─────────────────┬─────────────────┬───────────────┤
│   PostgREST     │    GoTrue       │    Realtime     │    Edge       │
│   (REST API)    │    (Auth)       │   (WebSocket)   │   Functions   │
└────────┬────────┴────────┬────────┴────────┬────────┴───────┬───────┘
         │                 │                 │                │
         └─────────────────┴────────┬────────┴────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        PostgreSQL                                    │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│   │ profiles │  │  tasks   │  │ sessions │  │  stats   │           │
│   └──────────┘  └──────────┘  └──────────┘  └──────────┘           │
└─────────────────────────────────────────────────────────────────────┘
```

## Layers

### 1. Client Layer

#### Mobile/Web App (Expo)

```
apps/mobile/
├── app/              # Screens (Expo Router)
│   ├── (tabs)/       # Main tab navigation
│   │   ├── index.tsx      # Today view
│   │   ├── inbox.tsx      # Inbox
│   │   ├── timer.tsx      # Pomodoro
│   │   └── profile.tsx    # Settings
│   ├── task/[id].tsx      # Task detail
│   └── _layout.tsx        # Root layout
│
├── components/       # UI Components
│   ├── TaskCard.tsx
│   ├── PomodoroTimer.tsx
│   └── ...
│
├── hooks/            # Business Logic
│   ├── useTasks.ts        # Task operations
│   ├── useAuth.ts         # Authentication
│   └── useFocusSession.ts # Timer logic
│
├── api/              # Supabase Calls
│   ├── tasks.ts
│   ├── auth.ts
│   └── focusSessions.ts
│
├── store/            # Local UI State
│   └── uiStore.ts         # Theme, sidebar, etc.
│
└── lib/              # Utilities
    └── supabase.ts        # Client init
```

#### Data Flow in App

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Screen     │────▶│    Hook      │────▶│    API       │
│ (app/*.tsx)  │     │ (hooks/*.ts) │     │ (api/*.ts)   │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                    │
       │                    │                    │
       ▼                    ▼                    ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Component   │◀────│   State      │◀────│   Supabase   │
│              │     │   Update     │     │   Response   │
└──────────────┘     └──────────────┘     └──────────────┘
```

### 2. Backend Layer (Supabase)

#### PostgREST (REST API)

Auto-generated REST API from PostgreSQL schema.

```
GET    /rest/v1/tasks              # List tasks
GET    /rest/v1/tasks?id=eq.xxx    # Get one task
POST   /rest/v1/tasks              # Create task
PATCH  /rest/v1/tasks?id=eq.xxx    # Update task
DELETE /rest/v1/tasks?id=eq.xxx    # Delete task
```

Features:
- Automatic CRUD endpoints
- Filtering: `?status=eq.today&priority=eq.must`
- Ordering: `?order=created_at.desc`
- Pagination: `?limit=10&offset=0`
- Row Level Security enforced

#### GoTrue (Authentication)

```
POST /auth/v1/signup       # Register
POST /auth/v1/token        # Login
POST /auth/v1/logout       # Logout
GET  /auth/v1/user         # Current user
POST /auth/v1/magiclink    # Magic link login
```

Supported auth methods:
- Email/Password
- Magic Link (passwordless)
- OAuth (Google, GitHub, etc.)

#### Realtime

WebSocket subscriptions for live updates:

```typescript
supabase
  .channel('tasks')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'tasks',
    filter: `user_id=eq.${userId}`,
  }, (payload) => {
    // Handle change
  })
  .subscribe();
```

Use cases:
- Sync between devices
- Live collaboration (future)

#### Edge Functions (Deno)

Custom server-side logic:

```
/functions/v1/telegram-webhook     # Telegram bot
/functions/v1/google-calendar-sync # Calendar integration
```

### 3. Database Layer

#### Schema Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         auth.users                           │
│  (Supabase managed - email, password, metadata)              │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ 1:1
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                          profiles                            │
│  id, display_name, timezone, settings, telegram_id, etc.    │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ 1:N
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
┌───────────────────┐ ┌───────────────┐ ┌───────────────┐
│      tasks        │ │focus_sessions │ │  daily_stats  │
│                   │ │               │ │               │
│ title, status,    │ │ started_at,   │ │ date, tasks,  │
│ priority, energy, │ │ ended_at,     │ │ pomodoros,    │
│ scheduled_date,   │ │ pomodoros,    │ │ streak        │
│ estimated_mins    │ │ task_id       │ │               │
└───────────────────┘ └───────────────┘ └───────────────┘
         │
         │ N:N
         ▼
┌───────────────────┐
│     projects      │
│  (optional)       │
└───────────────────┘
```

#### Key Tables

**tasks**
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  title TEXT NOT NULL,
  description TEXT,
  status task_status DEFAULT 'inbox',      -- inbox, today, in_progress, done
  priority task_priority DEFAULT 'want',   -- must, should, want, someday
  energy_required energy_level DEFAULT 'medium',  -- low, medium, high
  scheduled_date DATE,
  estimated_minutes INTEGER,
  actual_minutes INTEGER,
  pomodoros_completed INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**focus_sessions**
```sql
CREATE TABLE focus_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  task_id UUID REFERENCES tasks,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  pomodoros INTEGER DEFAULT 0,
  breaks_taken INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false
);
```

#### Row Level Security

All tables have RLS enabled:

```sql
-- Users can only access their own data
CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tasks"
  ON tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE
  USING (auth.uid() = user_id);
```

## Integrations

### Telegram Bot

```
┌───────────┐     ┌─────────────────┐     ┌──────────────┐
│  User     │────▶│ Telegram API    │────▶│ Edge Function│
│  Message  │     │ (webhook)       │     │ (webhook)    │
└───────────┘     └─────────────────┘     └──────────────┘
                                                 │
                                                 ▼
                                          ┌──────────────┐
                                          │  Supabase    │
                                          │  (insert)    │
                                          └──────────────┘
```

Flow:
1. User sends message to bot
2. Telegram calls webhook
3. Edge Function parses message
4. Creates task in database
5. Sends confirmation

### Google Calendar

```
┌───────────┐     ┌─────────────────┐     ┌──────────────┐
│  Task     │────▶│ Edge Function   │────▶│ Google API   │
│  Scheduled│     │ (calendar-sync) │     │ (event)      │
└───────────┘     └─────────────────┘     └──────────────┘
```

Flow:
1. Task gets scheduled_date
2. App calls sync function
3. Function creates/updates calendar event
4. Event ID stored in task

### Webhooks (Outgoing)

```
┌───────────┐     ┌─────────────────┐     ┌──────────────┐
│  Task     │────▶│ Database        │────▶│ External     │
│  Change   │     │ Trigger         │     │ Service      │
└───────────┘     └─────────────────┘     └──────────────┘
```

Events:
- `task.created`
- `task.updated`
- `task.completed`
- `task.deleted`
- `session.started`
- `session.completed`

## Deployment

### Cloud (Supabase Hosted)

```
┌─────────────────────────────────────────┐
│              Supabase Cloud              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │ API     │ │ Auth    │ │ Realtime│   │
│  └─────────┘ └─────────┘ └─────────┘   │
│  ┌─────────────────────────────────┐   │
│  │          PostgreSQL              │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│           App Distribution               │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │App Store│ │Play Stor│ │ Web CDN │   │
│  └─────────┘ └─────────┘ └─────────┘   │
└─────────────────────────────────────────┘
```

### Self-Hosted (Docker)

```
┌─────────────────────────────────────────┐
│              Docker Host                 │
│                                          │
│  ┌──────────────────────────────────┐   │
│  │            Kong                   │   │
│  │         (API Gateway)             │   │
│  └──────────────────────────────────┘   │
│       │        │         │        │     │
│       ▼        ▼         ▼        ▼     │
│  ┌────────┐┌────────┐┌────────┐┌────────┐
│  │PostgRES││GoTrue  ││Realtime││Edge Fn ││
│  └────────┘└────────┘└────────┘└────────┘
│       │        │         │        │     │
│       └────────┴────┬────┴────────┘     │
│                     ▼                    │
│  ┌──────────────────────────────────┐   │
│  │          PostgreSQL               │   │
│  └──────────────────────────────────┘   │
│  ┌──────────────────────────────────┐   │
│  │            Storage                │   │
│  │          (Volumes)                │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

## Security

### Authentication Flow

```
┌────────┐  1. Login   ┌────────┐  2. Verify  ┌────────┐
│ Client │────────────▶│ GoTrue │────────────▶│  DB    │
└────────┘             └────────┘             └────────┘
    │                       │
    │  4. Use Token         │ 3. JWT Token
    ▼                       ▼
┌────────┐  5. Validate┌────────┐
│ REST   │◀────────────│ Client │
│ API    │             │        │
└────────┘             └────────┘
```

### Data Protection

1. **Transport**: HTTPS/WSS only
2. **Auth**: JWT tokens (short-lived)
3. **Database**: RLS policies per user
4. **API Keys**: Hashed, scoped, revocable
5. **Secrets**: Environment variables only

## Performance

### Optimization Strategies

1. **Caching**: React Query / custom hook caching
2. **Pagination**: Limit + offset for lists
3. **Indexes**: On frequently queried fields
4. **Optimistic Updates**: Instant UI feedback
5. **Selective Realtime**: Only where needed

### Database Indexes

```sql
CREATE INDEX idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX idx_tasks_user_date ON tasks(user_id, scheduled_date);
CREATE INDEX idx_sessions_user_date ON focus_sessions(user_id, started_at);
```

## Future Considerations

### Offline-First (Planned)

```
┌────────┐     ┌────────┐     ┌────────┐
│ SQLite │◀───▶│PowerSync│◀───▶│Supabase│
│ Local  │     │ Sync   │     │ Cloud  │
└────────┘     └────────┘     └────────┘
```

### Multi-User/Teams (Future)

- Shared projects
- Task assignment
- Team statistics
