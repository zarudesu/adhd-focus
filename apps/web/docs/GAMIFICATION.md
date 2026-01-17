# ADHD Focus - Gamification System

> **Документация для разработки геймификации**
> Последнее обновление: 2026-01-17

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

| Level | Feature | Task Count Alt |
|-------|---------|----------------|
| 0 | Inbox | - |
| 2 | Today | 3 tasks |
| 3 | Priority | 5 tasks |
| 4 | Energy | 10 tasks |
| 5 | Projects | 15 tasks |
| 6 | Scheduled | - |
| 7 | Descriptions | 20 tasks |
| 8 | Quick Actions | - |
| 9 | Tags | - |
| 10 | Focus Mode | - |
| 12 | Statistics | - |
| 15 | Themes | - |
| 18 | Settings | - |
| 20 | Notifications | - |
| 25 | Advanced Stats | - |

---

## XP Система

### Формула уровня

```typescript
XP_to_level = floor(100 × (level ^ 1.5))

Level 1 → 2:   100 XP
Level 2 → 3:   283 XP
Level 5 → 6:  1118 XP
Level 10→11:  3162 XP
```

### XP за действия

```typescript
const XP_CONFIG = {
  taskComplete: 10,           // Базовый XP за задачу
  quickTaskBonus: 5,          // Бонус за quick task (<5 мин)
  priorityMultiplier: {
    must: 1.5,
    should: 1.0,
    want: 0.8,
    someday: 0.5,
  },
  energyBonus: {
    low: 0,
    medium: 2,
    high: 5,
  },
  streakMultiplier: 0.1,      // +10% за каждый день streak
  maxStreakMultiplier: 2.0,   // Макс 200%
  deadlineBonus: 5,           // За выполнение до дедлайна
};
```

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

1. При завершении задачи - 30% шанс попытки spawn
2. Проверяются условия существ (время, streak, уровень)
3. Из подходящих выбирается по весам (spawnChance)

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

## API Endpoints

```
GET  /api/gamification/stats          # Все данные пользователя
POST /api/gamification/xp             # Начислить XP
POST /api/gamification/achievements/check  # Проверить достижения
POST /api/gamification/creatures/spawn     # Попробовать spawn существо
POST /api/gamification/rewards/log         # Залогировать эффект
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
const { isUnlocked, getNextUnlock } = useFeatures();

// Геймификация
const {
  state,           // XP, level, creatures, achievements
  levelProgress,   // { currentLevel, xpInLevel, xpNeeded, progress }
  awardXp,         // Начислить XP
  checkAchievements,
  spawnCreature,
} = useGamification();
```

---

## Файлы

```
src/
├── db/
│   ├── schema.ts                    # Gamification tables
│   └── seed-gamification.ts         # Seed data
├── hooks/
│   ├── useFeatures.ts               # Feature unlocking
│   ├── useGamification.ts           # XP, achievements, creatures
│   └── useTasks.ts                  # Task completion with XP integration
├── components/gamification/
│   ├── FeatureGate.tsx              # Feature gating component
│   ├── LevelProgress.tsx            # Level progress bar (sidebar)
│   ├── LevelUpModal.tsx             # Level up celebration modal
│   ├── RewardAnimation.tsx          # Sci-Fi visual reward effects (Phase 2)
│   └── GamificationProvider.tsx     # Context for gamification events
└── app/api/gamification/
    ├── stats/route.ts
    ├── xp/route.ts
    ├── achievements/check/route.ts
    ├── creatures/spawn/route.ts
    └── rewards/log/route.ts
```

---

## Roadmap

### Phase 0: Skeleton ✅
- [x] DB schema
- [x] FeatureGate component
- [x] useFeatures hook
- [x] useGamification hook
- [x] API endpoints
- [x] Seed data

### Phase 1: Basic Progression ✅
- [x] XP за задачи (интеграция в useTasks)
- [x] Level progress bar в sidebar
- [x] Level up modal
- [x] GamificationProvider для событий

### Phase 2: Visual Rewards ✅
- [x] Reward animation system (RewardAnimation component)
- [x] 12 Sci-Fi/High-Tech анимаций (Sparkle, Glitch, Portal, Warp, DataStream, HexGrid, Circuit, EnergyWave, Hologram, Plasma, Quantum, Takeover)
- [x] Rarity roll при завершении задачи
- [x] Интеграция в GamificationProvider
- [x] CSS анимации в globals.css (700+ lines)

### Phase 3: Achievements
- [ ] Achievement check при событиях
- [ ] Achievement unlock toast
- [ ] Achievements page UI

### Phase 4: Creatures
- [ ] Creature spawn при задачах
- [ ] Creature collection UI
- [ ] "Caught!" animation

### Phase 5: Feature Gates
- [ ] Интегрировать FeatureGate во все UI
- [ ] Feature unlock modal
- [ ] Progressive sidebar

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
