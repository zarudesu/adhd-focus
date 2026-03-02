# ADHD Focus - Gamification System

> **Документация для разработки геймификации**
> Последнее обновление: 2026-03-02

## Концепция

### Главная идея: Progressive Feature Unlocking

ADHD мозг легко overwhelm'ится от обилия опций. Поэтому:
- Новый пользователь видит **только Inbox**
- Каждая функция **разблокируется** через уровни/достижения
- Это создаёт **ощущение прогресса** и **tutorial одновременно**

### Психология (из ресерча)

| Триггер | Механизм | Реализация |
|---------|----------|------------|
| Loss Aversion | Боязнь потерять прогресс | Streaks, "Streak at risk" |
| Variable Rewards | Непредсказуемость > предсказуемость | Случайные эффекты, существа |
| Commitment Bias | Продолжать начатое | Уровни, коллекции |
| Goal Gradient | Мотивация растёт к цели | Progress bars, "почти открыл" |

---

## Архитектура

### Database Schema

```
users
├── xp: integer                    # Общий XP
├── level: integer                 # Текущий уровень
├── currentStreak: integer         # Текущий streak
├── longestStreak: integer         # Рекорд streak
├── totalTasksCompleted: integer   # Всего задач
├── totalCreatures: integer        # Существ в коллекции
├── rarestRewardSeen: text         # Самый редкий эффект
└── lastActiveDate: date           # Для streak расчёта

features
├── code: text UNIQUE              # "today", "priority"
├── name: text                     # Человеческое название
├── description: text
├── unlockLevel: integer           # Уровень для разблокировки
├── unlockTaskCount: integer       # ИЛИ количество задач
├── unlockAchievementCode: text    # ИЛИ достижение
├── icon: text                     # Lucide icon name
└── sortOrder: integer

user_features
├── userId → users.id
├── featureCode: text
└── unlockedAt: timestamp

achievements
├── code: text UNIQUE
├── name: text
├── hiddenName: text DEFAULT '???'
├── description: text
├── hiddenDescription: text
├── icon: text                     # Emoji
├── category: text                 # progress/streak/mastery/hidden/secret
├── visibility: enum               # visible/hidden/invisible/ultra_secret
├── xpReward: integer
├── unlocksFeature: text           # Опционально открывает фичу
├── unlocksCreature: text          # Опционально даёт существо
├── conditionType: text            # task_count/streak_days/level/time/special
└── conditionValue: jsonb          # Условия

user_achievements
├── userId → users.id
├── achievementId → achievements.id
└── unlockedAt: timestamp

creatures
├── code: text UNIQUE
├── name: text
├── emoji: text
├── description: text
├── rarity: enum                   # common/uncommon/rare/legendary/mythic/secret
├── spawnConditions: jsonb
├── spawnChance: integer           # Из 1000
├── evolvesFrom: text
├── evolvesTo: text
├── evolutionCondition: jsonb
└── xpMultiplier: integer          # 100 = 1x

user_creatures
├── userId → users.id
├── creatureId → creatures.id
├── count: integer                 # Сколько поймано
└── firstCaughtAt: timestamp

reward_logs
├── userId → users.id
├── rewardType: text               # "sparkle", "unicorn"
├── rarity: enum
├── triggeredBy: text              # "task_complete"
└── seenAt: timestamp
```

---

## Порядок разблокировки

> **Актуальная документация**: См. [docs/FEATURE_UNLOCKS.md](../../../docs/FEATURE_UNLOCKS.md)

| Feature | Unlock Trigger |
|---------|---------------|
| Inbox | Always available |
| Today | 1 task assigned to today |
| Scheduled | 1 task scheduled for **future** date |
| Completed | 1 task completed |
| Daily Checklist | 3 tasks completed |
| Achievements | 5 tasks added |
| Focus Mode | 7 tasks completed |
| Projects | 10 tasks added |
| Quick Actions | 15 tasks completed |
| Review | 15 tasks completed |
| Creatures | Level 8 |
| Statistics | 7-day streak |

---

## XP Система

### Формула уровня (Soft Exponential)

```typescript
xpForNextLevel(level) = floor(100 × level^0.7)

Level 1 → 2:   100 XP   (~7 задач)
Level 2 → 3:   162 XP   (~18 задач cumulative)
Level 3 → 4:   219 XP   (~33 задач)
Level 5 → 6:   322 XP   (~74 задач)
Level 10→11:   501 XP   (~240 задач)
```

> Заменена линейная формула (100 XP/уровень) на мягкую экспоненту для предотвращения спама уровней.

### XP за действия

```typescript
const XP_CONFIG = {
  taskComplete: 10,           // Базовый XP за задачу
  quickTaskBonus: 5,          // Бонус за quick task (<5 мин)
  priorityMultiplier: {
    must: 2.0,                // Обновлено
    should: 1.0,
    want: 0.8,
    someday: 0.5,
  },
  energyBonus: {
    low: 2,                   // Обновлено
    medium: 0,
    high: 3,
  },
  streakMultiplier: 0.1,      // +10% за каждый день streak
  maxStreakMultiplier: 2.0,   // Макс 200%
  deadlineBonus: 5,           // За выполнение до дедлайна
};
```

### XP Вариация (ADHD Retention)

Каждый XP награда имеет случайную вариацию для variable ratio reinforcement:

```typescript
// ±20% random variation
variation = 0.8 + Math.random() * 0.4

// 10% chance of 2x bonus
if (Math.random() < 0.1) multiplier *= 2

// calculateTaskXp returns { xp: number, wasBonus: boolean }
```

Это предотвращает habituation к наградам (см. docs/RETENTION_RESEARCH.md).

---

## Визуальные награды

**НЕ конфетти!** Случайные эффекты с разной редкостью:

| Rarity | Шанс | Эффекты |
|--------|------|---------|
| Common | 60% | sparkle, wave, star, glow |
| Uncommon | 25% | glitch, rainbow, music, fire, crystal |
| Rare | 12% | portal, creature, fireworks, warp, stars |
| Legendary | 2.9% | unicorn, volcano, invert, rocket, aurora |
| Mythic | 0.1% | takeover, golden, eye |

---

## Достижения

### Уровни видимости

1. **visible** - видно в списке с прогрессом
2. **hidden** - показано как "???" пока не открыто
3. **invisible** - НЕ показывается вообще пока не открыто
4. **ultra_secret** - никогда не показывается другим

### Категории

- **progress** - за количество задач
- **streak** - за дни подряд
- **mastery** - за уровни
- **hidden** - секретные условия (показаны как ???)
- **secret** - невидимые до открытия
- **ultra_secret** - приватные

---

## Существа (Creatures)

### Spawn механика

1. При завершении задачи — шанс spawn зависит от размера коллекции:
   - 0-3 существ: 20%
   - 4-8: 12%
   - 9-15: 8%
   - 16+: 5%
2. Проверяются условия существ (время, streak, уровень)
3. Из подходящих выбирается по весам (spawnChance)
4. Cooldown: 2 задачи после успешного spawn — не проверять

> Заменён фиксированный 30% шанс на адаптивный по размеру коллекции.

### Редкости

| Rarity | spawnChance (примерно) |
|--------|------------------------|
| Common | 150-200 |
| Uncommon | 70-100 |
| Rare | 30-50 |
| Legendary | 10-20 |
| Mythic | 3-5 |
| Secret | 10 (но особые условия) |

---

## Velocity Detection & Anti-Spam

### Velocity Modes (useVelocity.ts)

Клиентский скользящий window трекает timestamps завершённых задач:

| Mode | Условие | Поведение |
|------|---------|-----------|
| **burst** | 3+ задач за 5 мин ИЛИ 5+ за 15 мин | Подавление уведомлений, накопление в аккумулятор |
| **steady** | Есть активность, но не burst | Нормальные награды |
| **idle** | 60 сек без новых завершений | Flush аккумулятора → сводка |

### Burst Accumulator (GamificationProvider.tsx)

При burst режиме:
- XP начисляется полностью
- Achievement check **пропускается** (deferred)
- Creature spawn **пропускается** (deferred)
- Уведомления **накапливаются**

При переходе burst → idle:
1. Запускается deferred achievement check + creature spawn
2. Показывается ОДНА сводка: "8 задач! +127 XP"
3. Если было несколько level-up — только последний: "Level 4!"

### Notification Budget (notification-budget.ts)

Контроль частоты НЕЗАВИСИМО от velocity mode:

| Тип | Лимит за сессию | Overflow |
|-----|-----------------|----------|
| Achievements | 2 | → localStorage (3 дня) |
| Creatures | 1 | → localStorage (3 дня) |
| Session start drip | 1 deferred | Из прошлой сессии |

### Achievement Throttle (server-side)

Server-side in-memory Map: `userId → lastCheckTimestamp`.
Если < 30 сек с последней проверки → return `{ throttled: true }`.

---

## API Endpoints

```
GET  /api/gamification/stats               # Все данные пользователя
POST /api/gamification/xp                  # Начислить XP
POST /api/gamification/achievements/check  # Проверить достижения
POST /api/gamification/creatures/spawn     # Попробовать spawn существо
POST /api/gamification/rewards/log         # Залогировать эффект
POST /api/gamification/day-surprise        # Day 3-5 surprise achievements
GET/POST /api/gamification/quests          # Daily quests (auto-generated)
GET  /api/features                         # List features with unlock status
POST /api/features/[code]/opened           # Mark feature opened (returns tutorial)
```

---

## Компоненты

### FeatureGate

```tsx
// Скрывает UI пока фича не разблокирована
<FeatureGate feature="priority">
  <PrioritySelector />
</FeatureGate>

// Показывает locked placeholder
<FeatureGate feature="priority" showLocked>
  <PrioritySelector />
</FeatureGate>
```

### Хуки

```tsx
// Проверка фич
const { isUnlocked, getNextUnlock, navFeatures, isNewlyUnlocked } = useFeatures();

// Геймификация
const {
  state,           // XP, level, creatures, achievements
  levelProgress,   // { currentLevel, xpInLevel, xpNeeded, progress }
  awardXp,         // Начислить XP
  checkAchievements,
  spawnCreature,
} = useGamification();

// Daily quests
const { quests, refreshQuests } = useQuests();

// Feature tutorials
const { tutorial, dismissTutorial } = useFeaturePageTutorial('inbox');

// Welcome back (returning users 3+ days)
const { showWelcomeBack, dismiss } = useWelcomeBack();

// Morning review (stale tasks → habits)
const { showReview, step, next } = useMorningReview();
```

---

## Файлы

```
src/
├── db/
│   ├── schema.ts                    # Gamification tables (26+ total)
│   ├── seed-gamification.ts         # Seed data
│   └── generate-achievements.ts     # Achievement generator (1000+)
├── hooks/
│   ├── useFeatures.ts               # Feature unlocking + shimmer
│   ├── useFeaturePageTutorial.ts    # Tutorial state per feature page
│   ├── useGamification.ts           # XP, achievements, creatures, calculateTaskXp
│   ├── useVelocity.ts               # Burst/steady/idle velocity detection
│   ├── useQuests.ts                 # Daily quests tracking
│   ├── useWelcomeBack.ts            # Returning user detection (3+ days)
│   ├── useMorningReview.ts          # Morning review flow
│   ├── useHabits.ts                 # Daily checklist habits
│   └── useTasks.ts                  # Task completion with XP + velocity integration
├── lib/
│   ├── gamification.ts              # Client-side XP/level (soft exponential curve)
│   ├── gamification-server.ts       # Server-side XP awards
│   ├── notification-budget.ts       # Session + cross-session notification throttling
│   └── feature-tutorials.ts         # 20+ tutorial messages per feature
├── components/gamification/
│   ├── FeatureGate.tsx              # Feature gating component
│   ├── ProtectedRoute.tsx           # Page-level feature protection
│   ├── LevelProgress.tsx            # Level progress bar (sidebar)
│   ├── LevelUpModal.tsx             # Level up celebration modal
│   ├── RewardAnimation.tsx          # Sci-Fi visual reward effects
│   ├── AchievementToast.tsx         # Achievement unlock toast with shimmer
│   ├── CreatureCaughtToast.tsx      # Creature caught toast with rarity effects
│   ├── GamificationProvider.tsx     # Context for gamification events
│   ├── WelcomeBackFlow.tsx          # Returning user welcome modal
│   └── ReAuthModal.tsx              # Re-auth for Projects unlock
├── components/review/
│   ├── ReviewMode.tsx               # Multi-source triage (525 lines)
│   └── SchedulePopover.tsx          # Smart date picker for review
├── components/focus/
│   └── CalmReview.tsx               # End-of-day calm review
├── app/(dashboard)/dashboard/
│   ├── achievements/page.tsx        # Achievements list UI
│   ├── creatures/page.tsx           # Creature collection UI
│   ├── checklist/page.tsx           # Daily habits checklist
│   ├── review/page.tsx              # Global triage/review mode
│   └── stats/page.tsx               # Statistics + heatmap
└── app/api/gamification/
    ├── stats/route.ts
    ├── xp/route.ts
    ├── achievements/
    │   ├── route.ts                 # GET achievements
    │   └── check/route.ts           # POST check achievements
    ├── creatures/
    │   ├── route.ts                 # GET creatures
    │   └── spawn/route.ts           # POST spawn creature
    ├── rewards/log/route.ts
    ├── day-surprise/route.ts        # Day 3-5 surprise achievements
    └── quests/route.ts              # Daily quests (auto-generated)
```

---

## Roadmap

### Phase 0: Skeleton ✅
- [x] DB schema, FeatureGate, useFeatures, useGamification, API, seed data

### Phase 1: Basic Progression ✅
- [x] XP за задачи, level bar в sidebar, level up modal, GamificationProvider

### Phase 2: Visual Rewards ✅
- [x] 12 Sci-Fi анимаций, rarity roll, CSS анимации (700+ lines)

### Phase 3: Achievements ✅
- [x] Achievement check, unlock toast (max 2 per action), page UI, shimmer

### Phase 4: Creatures ✅
- [x] Spawn при задачах, collection UI, rarity-based тосты

### Phase 5: Feature Gates ✅
- [x] ProtectedRoute, FeatureGate, unlock celebration modal, progressive sidebar

### Phase 6: ADHD Retention ✅
- [x] Welcome Back Flow (3+ дней отсутствия → тёплый modal)
- [x] Task Amnesty (archive кнопка, stale tasks 14+ дней)
- [x] XP Variation (±20% + 10% шанс 2x bonus)
- [x] Just 1 Mode (один таск на Today, toggle в Settings)
- [x] Day 3-5 Surprise (скрытые "Still Here" + "Comeback" ачивки)

### Phase 7: AI Features ✅
- [x] Smart Auto-Fill (POST /api/ai/suggest) — Gemini классифицирует priority/energy/time
- [x] Task Decomposition (POST /api/ai/decompose) — разбивка на подзадачи
- [x] Brain Dump (POST /api/ai/brain-dump) — парсинг текста в задачи

### Phase 8: Review Mode ✅
- [x] Global triage — обработка всех inbox задач (19+ действий)
- [x] Project triage — обработка задач конкретного проекта
- [x] Smart scheduling (SchedulePopover с smart dates)

### Phase 9: Daily Quests + Tutorials ✅
- [x] Daily Quests — 12 шаблонов, auto-generated по уровню
- [x] Feature Tutorials — 20+ контекстных туториалов при первом открытии
- [x] Morning Review — 3-step flow (stale→tasks→habits)

### Phase 10: Project Wiki ✅
- [x] Rich-text wiki pages (BlockNote editor)
- [x] CRUD per project (/api/projects/[id]/wiki)

### Phase 11: Adaptive Scoring ✅
- [x] Soft exponential XP curve (`floor(100 * level^0.7)`)
- [x] Velocity detection (burst/steady/idle modes)
- [x] Burst accumulator — suppress notifications during rapid input
- [x] Notification budget — 2 achievements + 1 creature per session, overflow deferred
- [x] Creature spawn rebalance — collection-size based rates (20% → 5%)
- [x] Achievement throttle — 30s server-side cooldown
- [x] Updated feature unlock thresholds

### Phase 12: TODO
- [ ] FeatureGate coverage — применить ко ВСЕМ UI элементам
- [ ] Craft system (shards/fragments)
- [ ] Tier 2 AI (Morning Day Plan, "Stuck?" Helper, Evening Reflection)
- [ ] Pause Mode (freeze streak без штрафа)
- [ ] "Make It Tiny" button
- [ ] Avoidance Detector

---

## Интеграция в существующий код

### При завершении задачи (useTasks.ts)

```typescript
const complete = useCallback(async (id: string) => {
  const task = tasks.find(t => t.id === id);

  // 1. Завершить задачу
  await update(id, { status: 'done', completedAt: new Date().toISOString() });

  // 2. Начислить XP
  const xp = calculateTaskXp(task, currentStreak);
  await awardXp(xp, 'task_complete');

  // 3. Попробовать spawn существо
  await spawnCreature({ onTaskComplete: true, isQuickTask: task.estimatedMinutes <= 5 });

  // 4. Показать визуальную награду
  const reward = rollRewardEffect();
  playRewardAnimation(reward);
  await logReward(reward.rarity, reward.effect, 'task_complete');

  // 5. Проверить достижения
  await checkAchievements();
}, []);
```

---

## Тестирование

```bash
# Запуск seed
cd apps/web
DATABASE_URL="..." npx tsx src/db/seed-gamification.ts

# Проверка API
curl http://localhost:3000/api/gamification/stats

# Начислить XP
curl -X POST http://localhost:3000/api/gamification/xp \
  -H "Content-Type: application/json" \
  -d '{"amount": 50, "reason": "test"}'
```
