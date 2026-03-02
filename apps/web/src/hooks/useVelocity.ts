'use client';

import { useCallback, useRef, useState } from 'react';

export type VelocityMode = 'burst' | 'steady' | 'idle';

interface VelocityState {
  mode: VelocityMode;
  tasksInWindow: number;
}

const BURST_SHORT_WINDOW = 5 * 60 * 1000; // 5 minutes
const BURST_SHORT_THRESHOLD = 3; // 3+ tasks in 5 min = burst
const BURST_LONG_WINDOW = 15 * 60 * 1000; // 15 minutes
const BURST_LONG_THRESHOLD = 5; // 5+ tasks in 15 min = burst
const IDLE_TIMEOUT = 60 * 1000; // 60 seconds without activity → flush deferred
const WINDOW_MAX = 60 * 60 * 1000; // Keep timestamps for 60 min max

export function useVelocity() {
  const timestampsRef = useRef<number[]>([]);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [state, setState] = useState<VelocityState>({ mode: 'idle', tasksInWindow: 0 });
  const onIdleCallbackRef = useRef<(() => void) | null>(null);
  const prevModeRef = useRef<VelocityMode>('idle');

  const classify = useCallback((): VelocityMode => {
    const now = Date.now();
    const ts = timestampsRef.current;

    // Clean old entries
    timestampsRef.current = ts.filter((t) => now - t < WINDOW_MAX);

    const inShort = timestampsRef.current.filter((t) => now - t < BURST_SHORT_WINDOW).length;
    const inLong = timestampsRef.current.filter((t) => now - t < BURST_LONG_WINDOW).length;

    if (inShort >= BURST_SHORT_THRESHOLD || inLong >= BURST_LONG_THRESHOLD) {
      return 'burst';
    }

    if (timestampsRef.current.length > 0) {
      return 'steady';
    }

    return 'idle';
  }, []);

  const recordCompletion = useCallback(() => {
    const now = Date.now();
    timestampsRef.current.push(now);

    const mode = classify();
    const tasksInWindow = timestampsRef.current.filter(
      (t) => now - t < BURST_LONG_WINDOW
    ).length;

    // Detect burst → steady/idle transition
    const prevMode = prevModeRef.current;
    prevModeRef.current = mode;

    if (prevMode === 'burst' && mode !== 'burst' && onIdleCallbackRef.current) {
      onIdleCallbackRef.current();
    }

    setState({ mode, tasksInWindow });

    // Reset idle timer — fires onIdle callback after IDLE_TIMEOUT of inactivity
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      const newMode = classify();
      const wasBurst = prevModeRef.current === 'burst';
      prevModeRef.current = newMode;
      setState((prev) => ({ ...prev, mode: newMode }));

      if (wasBurst && onIdleCallbackRef.current) {
        onIdleCallbackRef.current();
      }
    }, IDLE_TIMEOUT);

    return mode;
  }, [classify]);

  const setOnIdleCallback = useCallback((cb: () => void) => {
    onIdleCallbackRef.current = cb;
  }, []);

  const isBurst = state.mode === 'burst';

  return {
    ...state,
    isBurst,
    recordCompletion,
    setOnIdleCallback,
  };
}
