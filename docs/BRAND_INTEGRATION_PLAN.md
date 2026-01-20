# beatyour8 Brand Integration Plan

> Интеграция Brand & Design System V1 в текущий проект
> **Status: Phase 1-4 COMPLETED** (2026-01-19)

## Ключевая философия

### Проблема ADHD мозга

Нейротипичный мозг получает дофамин от завершения задачи.
ADHD мозг — **нет**.

Классическая геймификация (звёзды, конфетти, "молодец!") не работает для ADHD.
Это погоня за дофамином, которого нет.

### Решение: Cognitive Replacement

**beatyour8 не даёт дофамин. Он возвращает чувство достаточности.**

Вместо награды → **объяснение, ПОЧЕМУ это было достаточно**.
Не "хорошо сделал", а "это было достаточно".
Не празднование, а **рефлексия**.

### Calm Review (тихий разбор)

Не награда, а возврат контроля интерпретации.

```
Структура:
1. Heading: "Today was enough."
2. Body: Объяснение (правило 80/20, ADHD контекст)
3. Footer: "You can stop now."
```

**Визуал:**
- Много whitespace
- Нейтральный фон
- Один акцент (маленькая точка)
- Спокойный текст
- Ощущение: "меня поняли"

---

## Что было vs Что стало

| Было | Стало |
|------|-------|
| Геймификация, награды | Спокойный союзник |
| Shimmer, rainbow, sparkles | Минимум стимулов |
| "Молодец!", "Отлично!" | "Это было достаточно" |
| Дофаминовые хиты | Возврат смысла |
| Фокус на завершении | Фокус на старте за 8 секунд |

---

## 1. Цветовая система ✅ DONE

### Изменения
- [x] Заменены oklch цвета на hex
- [x] Добавлены брендовые цвета (Focus Blue, Calm Mint, Soft Amber)
- [x] Обновлена тёмная тема
- [x] Добавлены --success и --warning переменные

### Новые цвета

```css
:root {
  /* Brand Colors */
  --focus-blue: #3A6FF8;      /* Primary - кнопки, активные элементы */
  --calm-mint: #3DD6A3;       /* Success - выполнено, всё ок */
  --soft-amber: #F5A524;      /* Warning - дедлайны (редко!) */

  /* Neutrals */
  --background: #F6F7F9;      /* НЕ чисто белый */
  --surface: #FFFFFF;         /* Карточки */
  --text-primary: #1F2933;    /* Основной текст */
  --text-secondary: #6B7280;  /* Вторичный текст */
  --border: #E5E7EB;          /* Границы, разделители */
}
```

---

## 2. Типографика ✅ DONE

- [x] Inter font уже был в проекте
- [x] Обновлён --font-sans на Inter

---

## 3. Иконки ✅ Already OK

- Lucide (outline) - уже соответствует бренду
- Без заливки, правильная толщина линий

---

## 4. Ачивки и награды ✅ DONE

### Изменения
- [x] Удалены ~700 строк CSS анимаций (Sci-Fi эффекты)
- [x] Упрощён `AchievementToast` - убраны shimmer, rainbow, sparkles
- [x] Упрощён `CreatureCaughtToast` - убраны gradient, floating particles
- [x] Упрощён `RewardAnimation` - простой checkmark вместо 12 эффектов

### Было → Стало
| Компонент | Было | Стало |
|-----------|------|-------|
| globals.css | 910 строк, 700+ анимаций | ~390 строк, только fade/slide |
| AchievementToast | 317 строк, framer-motion, shimmer | 127 строк, простой toast |
| CreatureCaughtToast | 369 строк, rainbow borders | 152 строки, простой toast |
| RewardAnimation | 382 строки, 12 Sci-Fi эффектов | 63 строки, простой checkmark |

---

## 5. Уровни и прогрессия ✅ DONE

### Изменения
- [x] Убраны конфетти из `LevelUpModal`
- [x] Убраны градиенты и Trophy иконка
- [x] Изменён текст: "You've built more trust with the system"
- [x] Упрощён визуал до простого checkmark

---

## 6. Компоненты - Статус

### Высокий приоритет ✅ DONE
| Компонент | Статус |
|-----------|--------|
| `globals.css` | ✅ Новые CSS variables, удалены анимации |
| `AchievementToast` | ✅ Убрали shimmer, упростили |
| `CreatureCaughtToast` | ✅ Убрали rarity-based эффекты |
| `RewardAnimation` | ✅ Радикально упростили |
| `LevelUpModal` | ✅ Убрали конфетти, сделали спокойным |

### Средний приоритет (TODO)
| Компонент | Статус |
|-----------|--------|
| `LevelProgress` | ⏳ Упростить визуал |
| Priority badges | ⏳ Убрать яркие цвета |
| Energy badges | ⏳ Упростить до одного цвета |
| Project cards | ⏳ Убрать цветные progress bars |

### Низкий приоритет (TODO)
| Компонент | Статус |
|-----------|--------|
| Settings | ⏳ Добавить "reduce animations" toggle |

---

## 7. Тексты и тон

### Изменено
- [x] "Achievement Unlocked!" → "Unlocked"
- [x] "Level up!" → "Level N"
- [x] "Congratulations!" → "You've built more trust with the system"

### TODO
- [ ] "Streak at risk!" → убрать
- [ ] Добавить "Начал" вместо "Выполнил"
- [ ] Нейтральные формулировки везде

---

## 8. План реализации

### Phase 1: Цвета ✅ DONE
1. ✅ Обновить CSS variables в globals.css
2. ✅ Заменить oklch на hex
3. ✅ Применить новую палитру

### Phase 2: Упрощение анимаций ✅ DONE
1. ✅ Удалить reward animation CSS (~700 строк)
2. ✅ Упростить AchievementToast
3. ✅ Упростить CreatureCaughtToast
4. ✅ Упростить LevelUpModal
5. ✅ Упростить RewardAnimation

### Phase 3: Типографика ✅ DONE
1. ✅ Inter font уже есть
2. ✅ Обновить font-family

### Phase 4: Calm Review System ✅ DONE
1. ✅ Создан `CalmReview` компонент - рефлексия вместо награды
2. ✅ Удалена система reward из GamificationProvider
3. ✅ Удалена система reward из useTasks hook
4. ✅ Убраны все `reward: result.reward` из страниц
5. ✅ Добавлен `showCalmReview` в контекст для использования в нужных моментах
6. ✅ Checklist: при завершении всех привычек показывается Calm Review

### Phase 5: Финальная проверка (TODO)
1. [ ] Проверить все страницы
2. [ ] Убедиться в единообразии
3. [ ] Тест на мобильных
4. [ ] Интегрировать Calm Review в Focus Mode (после сессии)
5. [ ] Интегрировать Calm Review в конец дня

---

## Компоненты Calm Review

### CalmReview.tsx
Компонент рефлексии. Показывает сообщения, которые возвращают смысл, а не дофамин.

**Триггеры:**
- `task_complete` - завершение задачи (используется редко)
- `day_end` - конец дня
- `session_end` - конец focus сессии
- `habit_done` - все привычки выполнены

**Примеры сообщений:**
```
"This was enough."
"You did a part. For a brain with ADHD, this matters more than finishing everything."
"You can stop now."
```

### GamificationProvider
- `showCalmReview(trigger, context?)` - показать Calm Review
- `handleTaskComplete(event)` - обрабатывает события (без reward)

**Важно:** Reward удалён! Используйте `review` в event:
```typescript
handleTaskComplete({
  review: { trigger: 'habit_done' },
  xpAwarded: 10,
});
```

---

## Метрика успеха

> Помогает ли это начать действие в течение 8 секунд?

Каждый элемент должен пройти этот тест.

---

## Changelog

### 2026-01-19 (Phase 4: Calm Review)
- Создан `CalmReview` компонент - рефлексия вместо награды
- Обновлена философия: "beatyour8 не даёт дофамин. Он возвращает чувство достаточности."
- Удалена система reward из:
  - `GamificationProvider` - теперь использует `review` вместо `reward`
  - `useTasks` hook - убран `rollRewardEffect`
  - Все страницы dashboard - убрано `reward: result.reward`
- Добавлен `showCalmReview(trigger, context?)` в GamificationContext
- Checklist: при завершении всех привычек показывается Calm Review
- Сообщения рефлексии для 4 триггеров: task_complete, day_end, session_end, habit_done
- Build успешно проходит

### 2026-01-19 (Phase 1-3)
- Заменены все oklch цвета на hex брендовые цвета
- Удалены ~700 строк Sci-Fi CSS анимаций
- Упрощены 4 компонента геймификации
- Убраны framer-motion зависимости из toast компонентов
- Build успешно проходит
