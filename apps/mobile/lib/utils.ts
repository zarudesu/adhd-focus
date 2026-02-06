/** Format date as YYYY-MM-DD */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/** Check if a date string is today */
export function isToday(dateStr: string): boolean {
  return dateStr === formatDate(new Date());
}

/** Check if a date string is tomorrow */
export function isTomorrow(dateStr: string): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return dateStr === formatDate(tomorrow);
}

/** Format date for display: "Today", "Tomorrow", or "Jan 5" */
export function formatDisplayDate(dateStr: string): string {
  if (isToday(dateStr)) return 'Today';
  if (isTomorrow(dateStr)) return 'Tomorrow';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Group items by a key function */
export function groupBy<T>(items: T[], keyFn: (item: T) => string): Record<string, T[]> {
  return items.reduce<Record<string, T[]>>((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
    return groups;
  }, {});
}

/** Energy level config */
export const ENERGY_CONFIG = {
  low: { label: 'Low', emoji: '🔋', color: '#22c55e' },
  medium: { label: 'Med', emoji: '⚡', color: '#eab308' },
  high: { label: 'High', emoji: '🔥', color: '#ef4444' },
} as const;

/** Priority config */
export const PRIORITY_CONFIG = {
  must: { label: 'Must', color: '#ef4444' },
  should: { label: 'Should', color: '#f59e0b' },
  want: { label: 'Want', color: '#6366f1' },
  someday: { label: 'Someday', color: '#6b7280' },
} as const;
