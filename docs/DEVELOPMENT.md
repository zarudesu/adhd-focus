# Development Guide

Complete guide for developing ADHD Focus.

## Table of Contents

- [Environment Setup](#environment-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Working with Supabase](#working-with-supabase)
- [Mobile Development](#mobile-development)
- [Edge Functions](#edge-functions)
- [Testing](#testing)
- [Debugging](#debugging)
- [Common Tasks](#common-tasks)

## Environment Setup

### Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| pnpm | 8+ | `npm install -g pnpm` |
| Supabase CLI | Latest | `npm install -g supabase` |
| Expo CLI | Latest | `npm install -g expo-cli` |
| Git | Latest | [git-scm.com](https://git-scm.com) |

### Optional Tools

| Tool | Purpose |
|------|---------|
| Docker | Self-hosted development |
| iOS Simulator | Xcode (macOS only) |
| Android Studio | Android emulator |
| VS Code | Recommended editor |

### Initial Setup

```bash
# 1. Clone repository
git clone https://github.com/zarudesu/adhd-focus.git
cd adhd-focus

# 2. Install dependencies
pnpm install

# 3. Start local Supabase
supabase start

# This outputs credentials like:
# API URL: http://localhost:54321
# anon key: eyJhbGci...
# service_role key: eyJhbGci...

# 4. Configure environment
cp apps/mobile/.env.example apps/mobile/.env
```

Edit `apps/mobile/.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=http://localhost:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
```

### VS Code Extensions

Recommended extensions (`.vscode/extensions.json`):

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "expo.vscode-expo-tools"
  ]
}
```

## Project Structure

```
adhd-focus/
├── apps/
│   └── mobile/                 # Expo app
│       ├── api/                # Supabase API layer
│       │   ├── tasks.ts        # Task CRUD
│       │   ├── auth.ts         # Authentication
│       │   ├── profile.ts      # User profile
│       │   └── focusSessions.ts# Pomodoro tracking
│       ├── hooks/              # Business logic
│       │   ├── useTasks.ts     # Task operations
│       │   ├── useAuth.ts      # Auth state
│       │   └── useFocusSession.ts # Timer
│       ├── components/         # UI components
│       ├── app/                # Screens (Expo Router)
│       ├── store/              # Local UI state
│       ├── lib/                # Utilities
│       └── assets/             # Images, fonts
│
├── packages/
│   ├── shared/                 # Shared code
│   │   └── src/
│   │       ├── types/          # TypeScript types
│   │       ├── constants/      # App constants
│   │       └── utils/          # Helper functions
│   └── ui/                     # Shared components
│
├── supabase/
│   ├── migrations/             # SQL migrations
│   │   ├── 001_initial_schema.sql
│   │   └── 002_integrations.sql
│   └── functions/              # Edge Functions
│       ├── telegram-webhook/
│       └── google-calendar-sync/
│
├── docker/                     # Self-hosted
├── docs/                       # Documentation
├── CLAUDE.md                   # AI assistant context
└── CONTRIBUTING.md             # Contribution guide
```

### Layer Responsibilities

| Layer | Location | Responsibility |
|-------|----------|----------------|
| API | `apps/mobile/api/` | Pure Supabase calls, no logic |
| Hooks | `apps/mobile/hooks/` | Business logic, state, caching |
| Components | `apps/mobile/components/` | UI rendering |
| Screens | `apps/mobile/app/` | Page composition |
| Store | `apps/mobile/store/` | Local UI state only |
| Shared | `packages/shared/` | Types, constants, utils |

## Development Workflow

### Daily Workflow

```bash
# 1. Start Supabase (if not running)
supabase status || supabase start

# 2. Start mobile app
cd apps/mobile
npx expo start

# 3. Open on device/simulator
# Press 'i' for iOS, 'a' for Android, 'w' for web
```

### Creating New Features

1. **Types** (if needed):
   ```bash
   # packages/shared/src/types/
   ```

2. **API Layer**:
   ```bash
   # apps/mobile/api/
   # Pure Supabase calls
   ```

3. **Hook**:
   ```bash
   # apps/mobile/hooks/
   # Business logic + state
   ```

4. **Components**:
   ```bash
   # apps/mobile/components/
   # UI components
   ```

5. **Screen**:
   ```bash
   # apps/mobile/app/
   # Compose components
   ```

### Code Generation

```bash
# Generate Supabase types
supabase gen types typescript --local > packages/shared/src/types/database.ts

# After schema changes
supabase db push
supabase gen types typescript --local > packages/shared/src/types/database.ts
```

## Working with Supabase

### Local Development

```bash
# Start local Supabase
supabase start

# Stop
supabase stop

# Reset database (careful!)
supabase db reset

# View status
supabase status

# View logs
supabase logs
```

### Migrations

```bash
# Create new migration
supabase migration new my_migration_name

# Apply migrations
supabase db push

# Diff (see pending changes)
supabase db diff
```

#### Migration Example

```sql
-- supabase/migrations/003_add_labels.sql

-- Add labels table
CREATE TABLE labels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#808080',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE labels ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage own labels"
  ON labels FOR ALL
  USING (auth.uid() = user_id);

-- Index
CREATE INDEX idx_labels_user ON labels(user_id);
```

### Edge Functions

```bash
# Serve locally
supabase functions serve telegram-webhook

# Deploy
supabase functions deploy telegram-webhook

# View logs
supabase functions logs telegram-webhook
```

### Database Access

```bash
# Connect to local database
psql postgresql://postgres:postgres@localhost:54322/postgres

# Or use Supabase Studio
open http://localhost:54323
```

## Mobile Development

### Expo Commands

```bash
cd apps/mobile

# Start dev server
npx expo start

# Clear cache
npx expo start -c

# Specific platform
npx expo start --ios
npx expo start --android
npx expo start --web

# Build for production
npx expo build:ios
npx expo build:android

# EAS Build (recommended)
eas build --platform ios
eas build --platform android
```

### Expo Router (File-based routing)

```
app/
├── _layout.tsx          # Root layout
├── index.tsx            # / (redirects)
├── (tabs)/              # Tab group
│   ├── _layout.tsx      # Tab bar config
│   ├── index.tsx        # /tabs (Today)
│   ├── inbox.tsx        # /tabs/inbox
│   ├── timer.tsx        # /tabs/timer
│   └── profile.tsx      # /tabs/profile
├── task/
│   └── [id].tsx         # /task/:id
└── auth/
    ├── login.tsx        # /auth/login
    └── signup.tsx       # /auth/signup
```

### Adding a New Screen

1. Create file in `app/`:
   ```typescript
   // app/settings.tsx
   import { View, Text } from 'react-native';

   export default function SettingsScreen() {
     return (
       <View>
         <Text>Settings</Text>
       </View>
     );
   }
   ```

2. Navigate to it:
   ```typescript
   import { router } from 'expo-router';
   router.push('/settings');
   ```

### Adding a New Component

```typescript
// components/TaskCard.tsx
import { View, Text, StyleSheet } from 'react-native';
import type { Task } from '@adhd-focus/shared';

interface TaskCardProps {
  task: Task;
  onPress?: () => void;
}

export function TaskCard({ task, onPress }: TaskCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{task.title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
});
```

## Edge Functions

### Structure

```
supabase/functions/
├── telegram-webhook/
│   └── index.ts
├── google-calendar-sync/
│   └── index.ts
└── _shared/              # Shared code
    └── supabase.ts
```

### Creating New Function

```bash
supabase functions new my-function
```

```typescript
// supabase/functions/my-function/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Your logic here

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
```

### Testing Functions Locally

```bash
# Terminal 1: Serve function
supabase functions serve my-function --env-file .env.local

# Terminal 2: Test
curl -X POST http://localhost:54321/functions/v1/my-function \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

## Testing

### Type Checking

```bash
pnpm typecheck
```

### Linting

```bash
pnpm lint
pnpm lint:fix
```

### Unit Tests (Coming Soon)

```bash
pnpm test
pnpm test:watch
pnpm test:coverage
```

## Debugging

### React Native Debugger

1. Start app with `npx expo start`
2. Press `j` to open debugger
3. Or use React DevTools

### Supabase Debugging

```typescript
// Enable logging
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key, {
  db: {
    schema: 'public',
  },
  global: {
    headers: { 'x-debug': 'true' },
  },
});
```

### Network Requests

```bash
# View Supabase logs
supabase logs --follow

# View specific service
supabase logs --service postgrest
supabase logs --service auth
```

### Common Issues

| Issue | Solution |
|-------|----------|
| "Unable to resolve module" | `npx expo start -c` |
| Auth not working | Check `.env` credentials |
| RLS blocking | Check policies in Studio |
| Types out of sync | `supabase gen types typescript --local` |

## Common Tasks

### Add New Database Table

1. Create migration:
   ```bash
   supabase migration new add_table_name
   ```

2. Write SQL:
   ```sql
   CREATE TABLE table_name (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     user_id UUID NOT NULL REFERENCES auth.users(id),
     -- columns
     created_at TIMESTAMPTZ DEFAULT NOW()
   );

   ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

   CREATE POLICY "Users can manage own data"
     ON table_name FOR ALL
     USING (auth.uid() = user_id);
   ```

3. Apply:
   ```bash
   supabase db push
   ```

4. Generate types:
   ```bash
   supabase gen types typescript --local > packages/shared/src/types/database.ts
   ```

### Add New API Endpoint

1. Create in `api/`:
   ```typescript
   // api/labels.ts
   export const labelsApi = {
     async list() { ... },
     async create(input) { ... },
   };
   ```

2. Export from index:
   ```typescript
   // api/index.ts
   export * from './labels';
   ```

### Add New Hook

1. Create in `hooks/`:
   ```typescript
   // hooks/useLabels.ts
   export function useLabels() {
     const [labels, setLabels] = useState([]);
     // ...
     return { labels, create, update, delete };
   }
   ```

2. Export from index:
   ```typescript
   // hooks/index.ts
   export { useLabels } from './useLabels';
   ```

### Deploy to Production

```bash
# 1. Push migrations to production
supabase db push --db-url YOUR_PRODUCTION_DB_URL

# 2. Deploy Edge Functions
supabase functions deploy --project-ref YOUR_PROJECT_REF

# 3. Build app
eas build --platform all --profile production

# 4. Submit to stores
eas submit --platform ios
eas submit --platform android
```

## Environment Variables

### Development

```env
# apps/mobile/.env
EXPO_PUBLIC_SUPABASE_URL=http://localhost:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=local-anon-key
```

### Production

```env
# apps/mobile/.env.production
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=production-anon-key
```

### Edge Functions

Set via Supabase dashboard or CLI:

```bash
supabase secrets set TELEGRAM_BOT_TOKEN=xxx
supabase secrets set GOOGLE_CLIENT_ID=xxx
```
