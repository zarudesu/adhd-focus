# ADHD Focus - Application Structure

> Полная структура приложения. Читать перед любой разработкой.
> Основано на исследовании лучших ADHD-friendly приложений.

## Core Principles (ADHD-Friendly Design)

1. **Minimal Cognitive Load** - чистый интерфейс, мало элементов на экране
2. **One Thing at a Time** - фокус на одной задаче, остальные скрыты
3. **Quick Capture** - мгновенный ввод, обработка потом
4. **Energy Matching** - задачи по уровню энергии (low/medium/high)
5. **Simple Priority** - Must/Should/Want вместо 1-5
6. **WIP Limit** - максимум 3 задачи на день по умолчанию
7. **Gamification** - streaks, achievements для дофамина
8. **Visual Progress** - видимый прогресс, не абстрактные списки

---

## Pages (Все страницы)

### Public Pages
| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing | Лендинг с описанием и CTA |
| `/login` | Login | Вход в аккаунт |
| `/signup` | Signup | Регистрация |
| `/reset-password` | Reset Password | Сброс пароля |

### Dashboard Pages (Protected)
| Route | Page | Description |
|-------|------|-------------|
| `/dashboard` | Today | Задачи на сегодня (главный экран) |
| `/dashboard/inbox` | Inbox | Quick capture, необработанные задачи |
| `/dashboard/scheduled` | Scheduled | Запланированные задачи (календарь) |
| `/dashboard/projects` | Projects | Список проектов |
| `/dashboard/projects/[id]` | Project Detail | Задачи проекта |
| `/dashboard/focus` | Focus Mode | Таймер Pomodoro + текущая задача |
| `/dashboard/stats` | Statistics | Streaks, статистика, достижения |
| `/dashboard/settings` | Settings | Настройки пользователя |
| `/dashboard/settings/integrations` | Integrations | Подключение сервисов |

---

## Features (Все функции)

### Core Features
- [ ] **Quick Capture** - мгновенный ввод задачи (Ctrl+K)
- [ ] **Task CRUD** - создание, редактирование, удаление задач
- [ ] **Projects** - группировка задач по проектам
- [ ] **Today View** - задачи на сегодня с WIP лимитом
- [ ] **Inbox** - быстрый сбор идей, обработка потом
- [ ] **Scheduled View** - календарь с задачами
- [ ] **Task Status Flow** - inbox → today → in_progress → done
- [ ] **Energy Labels** - low/medium/high энергия
- [ ] **Priority System** - must/should/want/someday
- [ ] **Due Dates** - дедлайны с напоминаниями
- [ ] **Subtasks** - подзадачи (разбивка больших задач)
- [ ] **Tags/Labels** - метки для фильтрации
- [ ] **Search** - поиск по задачам
- [ ] **Drag & Drop** - перетаскивание для сортировки

### Focus Features
- [ ] **Pomodoro Timer** - 25/5 минут работа/отдых
- [ ] **Focus Mode** - одна задача на экране
- [ ] **Session Tracking** - учёт времени на задачу
- [ ] **Break Reminders** - напоминания о перерывах

### Gamification
- [ ] **Daily Streaks** - дни подряд с выполненными задачами
- [ ] **Achievements** - достижения за активность
- [ ] **Progress Bars** - визуальный прогресс
- [ ] **Weekly Stats** - статистика за неделю

### Integrations
- [ ] **Telegram Bot** - добавление задач через бота
- [ ] **Google Calendar** - синхронизация scheduled задач
- [ ] **Webhooks** - уведомления на внешние сервисы
- [ ] **REST API** - внешний доступ к задачам
- [ ] **Email to Task** - создание задач из email (future)

### Settings
- [ ] **Profile** - имя, аватар, email
- [ ] **Preferences** - WIP лимит, время pomodoro, тема
- [ ] **Notifications** - push, email, звуки
- [ ] **Integrations** - подключение сервисов
- [ ] **Data Export** - экспорт данных
- [ ] **Account** - смена пароля, удаление аккаунта

---

## Components (UI Kit)

### Base Components (`components/ui/`)
```
Button          - кнопка (variants: primary, secondary, ghost, danger)
Input           - текстовый инпут
Textarea        - многострочный инпут
Select          - выпадающий список
Checkbox        - чекбокс
RadioGroup      - радио-кнопки
Switch          - переключатель
Badge           - метка/тег
Avatar          - аватар пользователя
Spinner         - индикатор загрузки
Skeleton        - скелетон загрузки
Toast           - уведомление
Modal           - модальное окно
Dialog          - диалог подтверждения
Dropdown        - выпадающее меню
Tooltip         - подсказка
Tabs            - табы
Card            - карточка
EmptyState      - пустое состояние
ErrorState      - состояние ошибки
```

### Layout Components (`components/layout/`)
```
Sidebar         - боковая навигация
Header          - шапка (для mobile)
PageHeader      - заголовок страницы с actions
Container       - контейнер контента
```

### Feature Components (`components/`)
```
tasks/
  TaskCard        - карточка задачи в списке
  TaskForm        - форма создания/редактирования
  TaskDetails     - детали задачи (modal)
  TaskList        - список задач
  TaskItem        - элемент списка (компактный)
  QuickCapture    - быстрый ввод (Ctrl+K)
  EnergyBadge     - метка энергии
  PriorityBadge   - метка приоритета
  StatusBadge     - статус задачи

projects/
  ProjectCard     - карточка проекта
  ProjectForm     - форма создания/редактирования
  ProjectList     - список проектов
  ProjectSelect   - выбор проекта (dropdown)
  ColorPicker     - выбор цвета проекта
  EmojiPicker     - выбор emoji проекта

focus/
  PomodoroTimer   - таймер pomodoro
  FocusTask       - текущая задача в focus mode
  BreakScreen     - экран перерыва
  SessionStats    - статистика сессии

stats/
  StreakCard      - карточка streak
  WeeklyChart     - график за неделю
  AchievementCard - достижение
  ProgressRing    - кольцо прогресса

calendar/
  CalendarView    - календарь месяц/неделя
  DayColumn       - колонка дня
  EventCard       - событие в календаре

settings/
  SettingsSection - секция настроек
  IntegrationCard - карточка интеграции
  ThemeToggle     - переключатель темы
```

---

## Data Layer

### API (`api/`)
```
tasks.ts        - CRUD задач, фильтры, поиск
projects.ts     - CRUD проектов
profile.ts      - профиль, настройки
auth.ts         - аутентификация
sessions.ts     - focus sessions (pomodoro)
stats.ts        - статистика, streaks
integrations.ts - управление интеграциями
```

### Hooks (`hooks/`)
```
useTasks        - задачи + фильтрация + real-time
useProjects     - проекты
useAuth         - аутентификация
useProfile      - профиль + настройки
useFocusSession - pomodoro таймер
useStats        - статистика + streaks
useSearch       - поиск
useKeyboard     - горячие клавиши
useToast        - уведомления
```

### Store (`store/`) - только UI state
```
uiStore         - sidebar open, modals, theme
focusStore      - timer state, current session
searchStore     - search query, filters
```

---

## Database Schema (Existing)

### Tables
- `profiles` - пользователи
- `projects` - проекты
- `tasks` - задачи
- `focus_sessions` - pomodoro сессии
- `daily_stats` - дневная статистика
- `achievements` - достижения (future)
- `api_keys` - ключи API
- `webhooks` - вебхуки

### Key Relationships
```
profiles 1:N projects
profiles 1:N tasks
projects 1:N tasks
tasks 1:N focus_sessions
profiles 1:N daily_stats
```

---

## File Structure (Target)

```
apps/web/src/
├── app/                          # Next.js App Router
│   ├── (public)/                 # Public pages
│   │   ├── page.tsx              # Landing
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── reset-password/page.tsx
│   ├── (dashboard)/              # Protected pages
│   │   ├── layout.tsx            # Dashboard layout with sidebar
│   │   ├── dashboard/
│   │   │   ├── page.tsx          # Today
│   │   │   ├── inbox/page.tsx
│   │   │   ├── scheduled/page.tsx
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx      # Projects list
│   │   │   │   └── [id]/page.tsx # Project detail
│   │   │   ├── focus/page.tsx
│   │   │   ├── stats/page.tsx
│   │   │   └── settings/
│   │   │       ├── page.tsx      # Settings
│   │   │       └── integrations/page.tsx
│   ├── auth/                     # Auth routes
│   │   ├── callback/route.ts
│   │   └── signout/route.ts
│   └── layout.tsx                # Root layout
├── components/
│   ├── ui/                       # Base UI kit
│   ├── layout/                   # Layout components
│   ├── tasks/                    # Task components
│   ├── projects/                 # Project components
│   ├── focus/                    # Focus/timer components
│   ├── stats/                    # Stats components
│   ├── calendar/                 # Calendar components
│   └── settings/                 # Settings components
├── api/                          # Supabase API layer
├── hooks/                        # React hooks
├── store/                        # Zustand stores
├── lib/                          # Utilities
│   ├── supabase/
│   ├── utils/
│   └── constants/
├── styles/                       # Global styles
└── types/                        # Local types (if needed)
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + K` | Quick capture (глобально) |
| `Ctrl/Cmd + N` | New task |
| `Ctrl/Cmd + Enter` | Save & close |
| `Escape` | Close modal/cancel |
| `1-4` | Set priority (must/should/want/someday) |
| `E` | Edit selected task |
| `D` | Mark as done |
| `T` | Move to today |
| `I` | Move to inbox |
| `Space` | Start/pause timer (focus mode) |

---

## API Endpoints (External REST)

### Tasks
```
GET    /api/v1/tasks              - List tasks
POST   /api/v1/tasks              - Create task
GET    /api/v1/tasks/:id          - Get task
PATCH  /api/v1/tasks/:id          - Update task
DELETE /api/v1/tasks/:id          - Delete task
```

### Projects
```
GET    /api/v1/projects           - List projects
POST   /api/v1/projects           - Create project
GET    /api/v1/projects/:id       - Get project
PATCH  /api/v1/projects/:id       - Update project
DELETE /api/v1/projects/:id       - Delete project
```

### Integrations
```
POST   /api/v1/telegram/webhook   - Telegram bot webhook
POST   /api/v1/webhooks/:id/test  - Test webhook
```

---

## Development Phases

### Phase 1: Foundation
1. UI Kit (все base components)
2. Layout (Sidebar, PageHeader)
3. Skeleton всех страниц
4. Роутинг и навигация

### Phase 2: Core Tasks
1. TaskCard, TaskList, TaskForm
2. Today view (полный функционал)
3. Inbox view
4. Quick Capture (Ctrl+K)

### Phase 3: Projects
1. ProjectCard, ProjectList, ProjectForm
2. Projects page
3. Project detail page
4. Привязка задач к проектам

### Phase 4: Calendar & Scheduling
1. CalendarView
2. Scheduled page
3. Drag & drop на календаре

### Phase 5: Focus Mode
1. PomodoroTimer
2. Focus page
3. Session tracking
4. Break reminders

### Phase 6: Stats & Gamification
1. Streaks
2. Statistics page
3. Achievements
4. Weekly charts

### Phase 7: Settings & Integrations
1. Settings page
2. Profile management
3. Telegram integration UI
4. Google Calendar integration UI
5. Webhooks management

### Phase 8: Polish
1. Keyboard shortcuts
2. Search
3. Dark mode
4. Animations
5. Mobile responsive
6. PWA

---

## Sources & References

Research based on:
- [Zapier: 5 to-do list apps that actually work with ADHD](https://zapier.com/blog/adhd-to-do-list/)
- [Zapier: 7 best to do list apps](https://zapier.com/blog/best-todo-list-apps/)
- [Lunatask: ADHD Planner](https://lunatask.app/adhd)
- [NotePlan: Best ADHD-Friendly Todo Apps](https://noteplan.co/blog/best-adhd-friendly-todo-apps)
- [ClickUp: ADHD Productivity Tools](https://clickup.com/blog/adhd-productivity-tools/)
- [Todoist](https://www.todoist.com/)
- [TickTick](https://ticktick.com/)
