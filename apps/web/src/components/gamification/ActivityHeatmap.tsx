'use client';

/**
 * Activity Heatmap — GitHub-style contribution calendar.
 * Fetches 365 days of daily_stat data and renders an SVG grid.
 */

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DayStat {
  date: string;
  tasksCompleted: number;
  pomodorosCompleted: number;
  focusMinutes: number;
}

const CELL_SIZE = 11;
const CELL_GAP = 2;
const CELL_STEP = CELL_SIZE + CELL_GAP;
const WEEKS = 52;
const DAYS = 7;
const LABEL_WIDTH = 28;
const HEADER_HEIGHT = 16;

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

// 5-level color scale (empty + 4 levels)
const COLORS = [
  'var(--heatmap-empty, hsl(var(--muted)))',
  'hsl(var(--primary) / 0.2)',
  'hsl(var(--primary) / 0.4)',
  'hsl(var(--primary) / 0.7)',
  'hsl(var(--primary) / 1)',
];

function getLevel(value: number, max: number): number {
  if (value === 0) return 0;
  if (max <= 0) return 1;
  const ratio = value / max;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

export function ActivityHeatmap() {
  const [stats, setStats] = useState<DayStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/stats?days=365');
        if (res.ok) {
          const data = await res.json();
          setStats(data.dailyStats || []);
        }
      } catch {
        // Ignore
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const { grid, monthMarkers, maxValue, totalActive } = useMemo(() => {
    // Build a map of date → stat
    const statMap = new Map<string, DayStat>();
    for (const s of stats) {
      statMap.set(s.date, s);
    }

    // Build grid: 52 weeks starting from today going back
    const today = new Date();
    const todayDay = today.getDay(); // 0=Sun
    // End of grid is this Saturday (or today if Saturday)
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + (6 - todayDay));

    // Start of grid is 51 weeks before the start of this week
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - (WEEKS * 7) + 1);

    const cells: { date: string; value: number; week: number; day: number }[] = [];
    const months: { label: string; week: number }[] = [];
    let lastMonth = -1;
    let mx = 0;
    let active = 0;

    const cursor = new Date(startDate);
    for (let w = 0; w < WEEKS; w++) {
      for (let d = 0; d < DAYS; d++) {
        const dateStr = cursor.toISOString().split('T')[0];
        const stat = statMap.get(dateStr);
        const value = stat
          ? (stat.tasksCompleted || 0) + (stat.pomodorosCompleted || 0)
          : 0;

        if (value > mx) mx = value;
        if (value > 0) active++;

        // Track month transitions
        const month = cursor.getMonth();
        if (month !== lastMonth) {
          months.push({ label: MONTH_LABELS[month], week: w });
          lastMonth = month;
        }

        cells.push({ date: dateStr, value, week: w, day: d });
        cursor.setDate(cursor.getDate() + 1);
      }
    }

    return { grid: cells, monthMarkers: months, maxValue: mx, totalActive: active };
  }, [stats]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[120px] animate-pulse bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  const svgWidth = LABEL_WIDTH + WEEKS * CELL_STEP;
  const svgHeight = HEADER_HEIGHT + DAYS * CELL_STEP;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base">Activity</CardTitle>
        <span className="text-xs text-muted-foreground">
          {totalActive} active {totalActive === 1 ? 'day' : 'days'} in the last year
        </span>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <svg
            width={svgWidth}
            height={svgHeight}
            className="block"
            role="img"
            aria-label="Activity heatmap showing daily contributions over the past year"
          >
            {/* Month labels */}
            {monthMarkers.map((m, i) => (
              <text
                key={i}
                x={LABEL_WIDTH + m.week * CELL_STEP}
                y={10}
                className="fill-muted-foreground"
                fontSize="9"
              >
                {m.label}
              </text>
            ))}

            {/* Day labels */}
            {DAY_LABELS.map((label, i) =>
              label ? (
                <text
                  key={i}
                  x={0}
                  y={HEADER_HEIGHT + i * CELL_STEP + CELL_SIZE - 1}
                  className="fill-muted-foreground"
                  fontSize="9"
                >
                  {label}
                </text>
              ) : null
            )}

            {/* Cells */}
            {grid.map((cell) => {
              const level = getLevel(cell.value, maxValue);
              return (
                <rect
                  key={cell.date}
                  x={LABEL_WIDTH + cell.week * CELL_STEP}
                  y={HEADER_HEIGHT + cell.day * CELL_STEP}
                  width={CELL_SIZE}
                  height={CELL_SIZE}
                  rx={2}
                  fill={COLORS[level]}
                  className="transition-colors"
                >
                  <title>
                    {cell.date}: {cell.value} {cell.value === 1 ? 'activity' : 'activities'}
                  </title>
                </rect>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-1 mt-2">
          <span className="text-[10px] text-muted-foreground mr-1">Less</span>
          {COLORS.map((color, i) => (
            <div
              key={i}
              className="rounded-sm"
              style={{ width: 10, height: 10, backgroundColor: color }}
            />
          ))}
          <span className="text-[10px] text-muted-foreground ml-1">More</span>
        </div>
      </CardContent>
    </Card>
  );
}
