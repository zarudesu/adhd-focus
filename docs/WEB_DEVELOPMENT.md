# Web Application Development Guide

> Инструкция по разработке веб-приложения ADHD Focus.
> Читать в начале каждой сессии работы над веб-частью.

## Quick Start

```bash
# 1. Запустить Docker (Supabase backend)
cd docker && docker compose up -d

# 2. Запустить веб-приложение
cd apps/web && npm run dev

# 3. Открыть http://localhost:3001
```

## Current State Analysis (January 2026)

### What Exists

| Component | Status | Location |
|-----------|--------|----------|
| Landing page | Basic | `app/page.tsx` |
| Login/Signup | Works | `app/login/`, `app/signup/` |
| Dashboard layout | Basic | `app/dashboard/layout.tsx` |
| Today page | Partial | `app/dashboard/page.tsx` |
| Inbox page | Partial | `app/dashboard/inbox/page.tsx` |
| Tasks API | Works | `api/tasks.ts` |
| Auth API | Works | `api/auth.ts` |
| useTasks hook | Works | `hooks/useTasks.ts` |
| useAuth hook | Works | `hooks/useAuth.ts` |

### Known Issues (MUST FIX)

#### 1. Task Creation Fails
**Problem**: API tries to insert `tags` and `parent_task_id` columns that don't exist in DB.

**File**: `apps/web/src/api/tasks.ts:113`
```typescript
// WRONG - these columns don't exist
tags: input.tags || [],
parent_task_id: input.parent_task_id,
```

**Fix**: Remove these fields from insert or add columns to DB.

#### 2. No Add Button on Form
**Problem**: Input field without visible submit button - users don't know to press Enter.

**File**: `apps/web/src/app/dashboard/page.tsx:47-54`

**Fix**: Add explicit submit button next to input.

#### 3. No Error Feedback
**Problem**: When task creation fails, user sees nothing - error is swallowed.

**Fix**: Add toast/alert system for errors.

#### 4. Sign Out Doesn't Work
**Problem**: Form posts to `/auth/signout` but route doesn't exist.

**File**: `apps/web/src/app/dashboard/layout.tsx:43`

**Fix**: Create Route Handler at `app/auth/signout/route.ts`.

### Missing Features (Priority Order)

1. **Quick Add with Button** - Visual submit button
2. **Error Notifications** - Toast system
3. **Sign Out Route** - Auth logout
4. **Projects CRUD** - Project management
5. **Settings Page** - User preferences
6. **Task Details Modal** - View/edit task
7. **Scheduled View** - Calendar view
8. **Focus Timer** - Pomodoro integration

## Architecture

### File Structure
```
apps/web/src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth group (login, signup)
│   ├── dashboard/         # Protected pages
│   ├── auth/              # API routes (signout, callback)
│   └── layout.tsx         # Root layout
├── api/                   # Supabase API calls (pure functions)
│   ├── tasks.ts           # Task CRUD
│   ├── auth.ts            # Auth operations
│   ├── profile.ts         # Profile operations
│   └── index.ts           # Exports
├── hooks/                 # React hooks (business logic)
│   ├── useTasks.ts        # Task state & operations
│   ├── useAuth.ts         # Auth state
│   └── index.ts           # Exports
├── components/            # Reusable UI components
│   ├── ui/                # Base components (Button, Input, etc.)
│   └── tasks/             # Task-specific components
├── lib/                   # Utilities
│   └── supabase/
│       ├── client.ts      # Browser Supabase client
│       └── server.ts      # Server Supabase client
└── middleware.ts          # Auth middleware
```

### Data Flow
```
Page → Hook → API → Supabase
        ↓
      State
```

### Code Patterns

**API Layer** (no React, pure functions):
```typescript
// api/tasks.ts
export const tasksApi = {
  async create(input: CreateTaskInput): Promise<Task> {
    const supabase = createClient();
    const { data, error } = await supabase.from('tasks').insert({...});
    if (error) throw error;
    return data;
  }
};
```

**Hook Layer** (React state + API):
```typescript
// hooks/useTasks.ts
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  const create = useCallback(async (input) => {
    const task = await tasksApi.create(input);
    setTasks(prev => [task, ...prev]);
    return task;
  }, []);

  return { tasks, loading, create };
}
```

**Page Layer** (minimal logic, just composition):
```typescript
// app/dashboard/page.tsx
export default function DashboardPage() {
  const { tasks, create } = useTasks();
  return <TaskList tasks={tasks} onCreate={create} />;
}
```

## Database Schema (Relevant Tables)

### tasks
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK to profiles |
| project_id | uuid | FK to projects (nullable) |
| title | text | Required |
| description | text | Optional |
| status | text | inbox/today/scheduled/in_progress/done/archived |
| energy_required | text | low/medium/high |
| priority | text | must/should/want/someday |
| position | integer | Sort order |
| scheduled_date | date | Optional |
| due_date | date | Optional |
| estimated_minutes | integer | Optional |
| actual_minutes | integer | Default 0 |
| pomodoros_completed | integer | Default 0 |
| completed_at | timestamptz | Optional |
| created_at | timestamptz | Auto |
| updated_at | timestamptz | Auto |

**Note**: NO `tags` or `parent_task_id` columns exist currently!

### profiles
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, same as auth.users.id |
| email | text | From auth |
| display_name | text | Optional |
| avatar_url | text | Optional |
| default_wip_limit | integer | Default 3 |
| work_duration_minutes | integer | Default 25 |
| break_duration_minutes | integer | Default 5 |

### projects
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK to profiles |
| name | text | Required |
| color | text | Hex color |
| icon | text | Optional |
| is_archived | boolean | Default false |

## Development Workflow

### Adding New Feature

1. **Types first** - Check/add types in `packages/shared/src/types/`
2. **API layer** - Add to `apps/web/src/api/`
3. **Hook** - Add to `apps/web/src/hooks/`
4. **Component** - Add to `apps/web/src/components/`
5. **Page** - Use in `apps/web/src/app/`
6. **Test** - Verify in browser

### Adding New Page

```bash
# Example: Adding settings page
mkdir -p apps/web/src/app/dashboard/settings
touch apps/web/src/app/dashboard/settings/page.tsx
```

```typescript
// app/dashboard/settings/page.tsx
'use client';

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Settings</h1>
      {/* Content */}
    </div>
  );
}
```

### Adding New API

```typescript
// api/projects.ts
import { createClient } from '@/lib/supabase/client';
import type { Project } from '@adhd-focus/shared';

export const projectsApi = {
  async list(): Promise<Project[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('is_archived', false)
      .order('name');
    if (error) throw error;
    return data;
  },

  async create(input: { name: string; color?: string }): Promise<Project> {
    const supabase = createClient();
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: user.user.id,
        name: input.name,
        color: input.color || '#6B7280',
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

// Don't forget to export from api/index.ts
```

## Styling

- **Framework**: Tailwind CSS
- **Colors**: Zinc palette (neutral gray)
- **Spacing**: Standard Tailwind scale
- **Components**: Build from scratch or use shadcn/ui

### Design Tokens (Current)
```css
/* Primary actions */
.bg-zinc-900 .text-white

/* Secondary */
.bg-white .border-zinc-200

/* Muted text */
.text-zinc-500

/* Error */
.text-red-600

/* Focus ring */
.focus:ring-2 .focus:ring-zinc-900
```

## Testing Checklist

Before committing, verify:

- [ ] Page loads without errors
- [ ] Auth works (login/logout)
- [ ] CRUD operations work
- [ ] No console errors
- [ ] Mobile responsive (check 375px width)

## Common Issues

### "Not authenticated" error
- Check if user is logged in
- Verify cookies are being set
- Check middleware.ts configuration

### Supabase connection fails
- Verify Docker is running: `docker ps`
- Check .env.local has correct URL/KEY
- Verify Kong is accessible: `curl http://localhost:8000/rest/v1/`

### TypeScript errors
- Run: `npm run typecheck` in apps/web
- Check shared types are up to date

## Next Steps (Roadmap)

### Phase 1: Fix Critical Issues
1. Fix task creation (remove invalid columns)
2. Add submit button to forms
3. Add error notifications (toast)
4. Fix sign out

### Phase 2: Core Features
1. Projects CRUD
2. Task details/edit modal
3. Settings page
4. Scheduled tasks view

### Phase 3: Polish
1. Better loading states
2. Animations
3. Keyboard shortcuts
4. Dark mode

## Session Start Checklist

When starting a new session:

1. Read this file
2. Check git status: `git status`
3. Start Docker if needed: `cd docker && docker compose up -d`
4. Start dev server: `cd apps/web && npm run dev`
5. Check browser console for errors
6. Continue from where you left off (check todo list if exists)
