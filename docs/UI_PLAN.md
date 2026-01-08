# UI/UX Plan — ADHD Focus

> Основано на исследованиях КПТ для СДВГ 2024-2025 и UX принципах для нейроотличных пользователей.

## Ключевые принципы

1. **Одна задача на экран** — минимум cognitive load
2. **Мгновенный feedback** — dopamine rewards
3. **Micro-steps** — преодоление task initiation paralysis
4. **Quick capture** — brain dump без friction
5. **Лимит опций** — Hick's Law, меньше paralysis
6. **Progressive disclosure** — сложность по запросу

---

## Priority 1: Inbox System

### 1.1 Quick Capture (глобальная функция)

**Доступ с любого экрана:**
- FAB (Floating Action Button) в правом нижнем углу
- Или gesture (swipe down from top?)
- Keyboard shortcut на web

**UI:**
```
┌─────────────────────────────────────┐
│  ✕                    Quick Add     │
├─────────────────────────────────────┤
│                                     │
│  What's on your mind?               │
│  ┌─────────────────────────────┐   │
│  │ Call doctor about prescr... │   │
│  └─────────────────────────────┘   │
│                                     │
│  [ Add to Inbox ]                   │
│                                     │
│  💡 Just capture, process later    │
└─────────────────────────────────────┘
```

**Поведение:**
- Только одно поле — title
- Enter = добавить и закрыть
- Shift+Enter = добавить и новая задача
- Добавляется в Inbox со статусом `inbox`
- Дефолты: energy=medium, priority=want
- Никаких других полей!

---

### 1.2 Inbox Processing Mode ("Разгрести инбокс")

**Вход:** Кнопка на Inbox tab или badge с количеством

**Концепция:** Tinder-like swipe cards, одна задача = один экран

#### Ключевые решения:

| Решение | Выбор | Почему |
|---------|-------|--------|
| **Порядок задач** | Random | Убирает decision paralysis |
| **Swipe gestures** | Да | Быстрее, меньше тапов |
| **Skip задачу** | Настройка | По умолчанию нельзя (force decision) |
| **При skip estimate** | → Long | Безопасный дефолт |
| **Проект на лету** | Да | Меньше friction |

#### Time Estimate — только 2 варианта:

```
┌─────────────────────────────────────┐
│  ⏱ Quick or Long?                   │
│                                     │
│  [ ⚡ Quick (<15 min) ]             │
│                                     │
│  [ 🏔 Long (15+ min) ]              │
│                                     │
└─────────────────────────────────────┘
```

**Логика:**
- Quick = можно сделать между делами
- Long = нужен focus block
- При skip → автоматически Long

#### Compact Card (один экран):

```
┌─────────────────────────────────────┐
│  ← Inbox              3 left 🎲     │
├─────────────────────────────────────┤
│                                     │
│         📝 Call doctor about        │
│            prescription refill      │
│                                     │
├─────────────────────────────────────┤
│  ⏱  [ ⚡ Quick ]    [ 🏔 Long ]     │
├─────────────────────────────────────┤
│  💪  [ 🔋 Low ] [ ⚡ Med ] [ 🔥 High ]│
├─────────────────────────────────────┤
│  📁  [ Work ▼ ]         [ + New ]   │
├─────────────────────────────────────┤
│  🎯 First step: [________________]  │
└─────────────────────────────────────┘

      ← swipe left: 🌙 Someday
      → swipe right: 🌟 Today
      ↑ swipe up: 📆 Schedule
      ↓ swipe down: 🗑 Delete
```

#### Быстрые действия (swipe gestures):

| Gesture | Action |
|---------|--------|
| Swipe right | → Today |
| Swipe left | → Someday |
| Swipe up | → Schedule (открыть календарь) |
| Swipe down | → Delete |
| Tap | → Expand for details |

---

### 1.3 Inbox Tab (список)

**Когда не в processing mode:**

```
┌─────────────────────────────────────┐
│  📥 Inbox                      12   │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │  🧹 Process all (12)        │   │  ← Big CTA
│  └─────────────────────────────┘   │
│                                     │
│  Or pick one:                       │
│                                     │
│  ○ Call doctor about prescription   │
│  ○ Buy groceries                    │
│  ○ Reply to mom's email             │
│  ○ Research vacation options        │
│  ...                                │
│                                     │
│  ⚠️ 12 items - time to process!    │
│     Takes ~5 min                    │
│                                     │
└─────────────────────────────────────┘
```

**Warning thresholds:**
- 5+ items: subtle reminder
- 10+ items: yellow warning
- 20+ items: red alert "Inbox overwhelm!"

---

## Priority 2: Today Screen

### 2.1 Daily Progress

```
┌─────────────────────────────────────┐
│  🔥 3 days                          │
│  ████████░░░░ 2/3 tasks             │
│  ~45 min focused today              │
└─────────────────────────────────────┘
```

### 2.2 Focus Card (главная задача)

```
┌─────────────────────────────────────┐
│  FOCUS ON THIS                      │
│                                     │
│  📧 Reply to emails                 │
│  ⚡ medium • ~15 min                │
│                                     │
│  🎯 First step: Open Gmail          │
│                                     │
│  [ ▶ Start ]           [ ✓ Done ]  │
└─────────────────────────────────────┘
```

### 2.3 Other Tasks (скрыты по умолчанию)

```
        ↓ 2 more tasks (tap to see)
```

При тапе:
```
┌─────────────────────────────────────┐
│  Also today:                        │
│                                     │
│  ○ Write proposal     🔥 30m        │
│  ○ Call dentist       🔋 5m         │
│                                     │
│  [Reorder]  [+ Add]  [Hide]         │
└─────────────────────────────────────┘
```

---

## Priority 3: Task Completion Celebration

```
┌─────────────────────────────────────┐
│                                     │
│            ✨ Done!                 │
│                                     │
│     ████████████░░ 2/3              │
│                                     │
│   "Reply to emails" completed       │
│   Actual: 12 min (estimated: 15)    │
│                                     │
│   🎯 Nice estimation!               │
│                                     │
│  [ See next task ]                  │
│                                     │
└─────────────────────────────────────┘

+ Haptic feedback
+ Optional: confetti animation
+ Optional: sound
```

---

## Priority 4: Focus Mode

```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│         📧 Reply to emails          │
│                                     │
│         🎯 Open Gmail               │
│                                     │
│              18:42                  │
│         ●●●○ pomodoro 3/4           │
│                                     │
│                                     │
│      [ Pause ]      [ ✓ Done ]      │
│                                     │
│         [ 😤 Stuck? ]               │
└─────────────────────────────────────┘

"Stuck?" opens:
- Break it down smaller
- Take a 2-min break
- Switch to easier task
- Body double (future)
```

---

## Priority 5: Time Estimation Learning

After task completion, if estimated_minutes was set:

```
┌─────────────────────────────────────┐
│  📊 Time Check                      │
│                                     │
│  Estimated: 15 min                  │
│  Actual:    23 min                  │
│                                     │
│  You tend to underestimate by ~50%  │
│  Tip: multiply your guess by 1.5   │
│                                     │
│  [ Got it ]                         │
└─────────────────────────────────────┘
```

---

## Priority 6: Settings & Customization

### Sensory Settings
- Reduce motion (animations)
- Quiet mode (no sounds)
- Haptic feedback on/off
- Dark/Light/System theme

### ADHD-specific
- Max tasks per day (default: 3)
- Pomodoro duration
- Break duration
- High energy hours
- Show/hide celebrations

---

## Implementation Order

| Phase | Features | Why First |
|-------|----------|-----------|
| **1** | Quick Capture FAB | Core loop: capture thoughts |
| **1** | Inbox Processing Mode | Core loop: process thoughts |
| **2** | Today screen with progress | Daily motivation |
| **2** | Task completion celebration | Dopamine rewards |
| **3** | Focus Mode improvements | Deep work support |
| **3** | Time estimation feedback | Learn patterns |
| **4** | Settings & customization | Polish |

---

## UI Components Needed

### New Components
- `QuickCaptureModal` — global quick add
- `InboxProcessor` — card-by-card processing
- `ProgressBar` — daily progress visualization
- `CelebrationModal` — task completion feedback
- `TimeEstimationFeedback` — learning component
- `EnergyPicker` — 3-button energy selector
- `DurationPicker` — 4-button time estimate
- `MicroStepInput` — first step field

### Modified Components
- `TodayScreen` — add progress, hide other tasks
- `FocusScreen` — add micro-step, stuck button
- `InboxScreen` — add process all CTA

---

## Decisions Made

| Question | Decision |
|----------|----------|
| Swipe vs tap? | **Swipe** — faster, less taps |
| Processing order? | **Random** — removes decision paralysis |
| Skip in processing? | **Settings toggle** — default OFF (force decision) |
| Projects on the fly? | **Yes** — less friction |
| Time estimate required? | **No** — skip → defaults to Long |
| How many time buckets? | **2** — Quick (<15m) / Long (15m+) |

---

## Research References

- [CADDI Study 2025](https://www.frontiersin.org/journals/psychiatry/articles/10.3389/fpsyt.2025.1564506/full) — behavioral activation
- [ADDA - ADHD Paralysis](https://add.org/adhd-paralysis/) — task initiation strategies
- [Neurodiversity UX 2025](https://medium.com/design-bootcamp/designing-for-neurodiversity-inclusive-ux-strategies-for-2025-51fbd30f1275) — design principles
- [Dopamine Reward Pathway](https://www.nature.com/articles/mp201097) — motivation neuroscience
