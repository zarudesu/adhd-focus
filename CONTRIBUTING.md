# Contributing to ADHD Focus

Thank you for your interest in contributing! This guide will help you get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Commit Messages](#commit-messages)
- [Pull Requests](#pull-requests)
- [Issue Guidelines](#issue-guidelines)

## Code of Conduct

Be kind, respectful, and inclusive. Remember that this app is built for people with ADHD - many contributors may have ADHD themselves. Be patient and understanding.

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- Git
- Supabase CLI (`npm install -g supabase`)

### Setup

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/adhd-focus.git
cd adhd-focus

# Install dependencies
pnpm install

# Start local Supabase
supabase start

# Configure environment
cp apps/mobile/.env.example apps/mobile/.env
# Use local Supabase credentials from `supabase status`

# Run the app
cd apps/mobile
npx expo start
```

### Project Structure

```
apps/mobile/
├── api/           # Supabase API calls (pure functions)
├── hooks/         # Business logic (React hooks)
├── components/    # UI components
├── app/           # Screens (Expo Router)
├── store/         # Local UI state only
└── lib/           # Utilities

packages/shared/   # Shared types, constants, utils
supabase/
├── migrations/    # Database schema
└── functions/     # Edge Functions
```

## Development Workflow

### Branches

- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation

### Workflow

1. Create branch from `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature
   ```

2. Make changes following [Code Style](#code-style)

3. Test locally:
   ```bash
   pnpm typecheck    # Type checking
   pnpm lint         # Linting
   pnpm test         # Tests
   ```

4. Commit with [conventional commits](#commit-messages)

5. Push and create PR to `develop`

## Code Style

### TypeScript

- Strict mode enabled
- Explicit return types for functions
- No `any` - use `unknown` if type is truly unknown
- Prefer interfaces over types for objects

```typescript
// Good
interface Task {
  id: string;
  title: string;
  status: TaskStatus;
}

function getTask(id: string): Promise<Task | null> {
  // ...
}

// Bad
type Task = {
  id: any;
  title: string;
}

const getTask = async (id) => {
  // ...
}
```

### React / React Native

- Functional components only
- Custom hooks for logic (`useXxx`)
- Props interface named `XxxProps`
- No inline styles - use StyleSheet

```typescript
// Good
interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
}

export function TaskCard({ task, onComplete }: TaskCardProps) {
  return (
    <View style={styles.container}>
      {/* ... */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
```

### File Organization

```typescript
// 1. Imports (external, then internal)
import { useState } from 'react';
import { View, Text } from 'react-native';

import { Task } from '@adhd-focus/shared';
import { useTasks } from '../hooks';

// 2. Types/Interfaces
interface Props {
  // ...
}

// 3. Component
export function MyComponent({ ... }: Props) {
  // ...
}

// 4. Styles
const styles = StyleSheet.create({
  // ...
});
```

### API Layer Rules

- Pure functions, no side effects
- Return typed responses
- Handle errors consistently
- Don't use hooks in API layer

```typescript
// api/tasks.ts - Good
export const tasksApi = {
  async list(filters: TaskFilters): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .match(filters);

    if (error) throw error;
    return data;
  },
};
```

### Hooks Rules

- Encapsulate business logic
- Return loading/error states
- Implement optimistic updates
- Can use API layer

```typescript
// hooks/useTasks.ts - Good
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await tasksApi.list({});
      setTasks(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  return { tasks, loading, error, fetch };
}
```

## Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting (no code change)
- `refactor` - Code restructuring
- `test` - Adding tests
- `chore` - Build, deps, config

### Examples

```bash
feat(tasks): add energy field to task creation
fix(auth): handle expired session gracefully
docs: update API documentation
refactor(hooks): extract common loading logic
```

### Scope

- `tasks` - Task-related
- `auth` - Authentication
- `timer` - Pomodoro timer
- `api` - API layer
- `ui` - UI components
- `db` - Database/migrations

## Pull Requests

### Before Creating PR

- [ ] Code follows style guide
- [ ] Types are correct (`pnpm typecheck`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Tests pass (`pnpm test`)
- [ ] Commits follow conventional format
- [ ] Documentation updated if needed

### PR Template

```markdown
## Description
Brief description of changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation

## Testing
How did you test this?

## Screenshots
If UI changes, add screenshots.

## Checklist
- [ ] I have tested this locally
- [ ] I have updated documentation
- [ ] My code follows the style guide
```

### Review Process

1. At least 1 approval required
2. All checks must pass
3. No merge conflicts
4. Squash merge to `develop`

## Issue Guidelines

### Bug Reports

Include:
- Clear title
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment (OS, device, version)
- Screenshots if applicable

### Feature Requests

Include:
- Clear title
- Problem you're trying to solve
- Proposed solution
- Why this helps ADHD users
- Alternatives considered

### Labels

- `bug` - Something broken
- `feature` - New functionality
- `enhancement` - Improve existing
- `docs` - Documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `adhd-ux` - ADHD UX consideration

## ADHD-Specific Guidelines

When contributing, keep ADHD users in mind:

### Do
- Reduce cognitive load
- Use progressive disclosure
- Provide instant feedback
- Make actions reversible
- Keep interfaces minimal
- Support one-task focus

### Don't
- Add unnecessary options
- Require complex setup
- Show everything at once
- Use notification spam
- Make "busy" interfaces
- Assume users will remember

## Questions?

- Open an issue with `question` label
- Check existing issues/discussions

Thank you for contributing!
