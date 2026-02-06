/**
 * Focus Session Hook - Pomodoro timer logic
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { focusSessionsApi } from '../api';
import type { FocusSession } from '../types';

const DEFAULT_POMODORO_MINUTES = 25;
const DEFAULT_SHORT_BREAK_MINUTES = 5;
const DEFAULT_LONG_BREAK_MINUTES = 15;
const POMODOROS_UNTIL_LONG_BREAK = 4;

type TimerPhase = 'idle' | 'focus' | 'short_break' | 'long_break';

interface UseFocusSessionOptions {
  pomodoroMinutes?: number;
  shortBreakMinutes?: number;
  longBreakMinutes?: number;
  pomodorosUntilLongBreak?: number;
  onPomodoroComplete?: () => void;
  onSessionComplete?: (session: FocusSession) => void;
}

interface UseFocusSessionReturn {
  phase: TimerPhase;
  secondsLeft: number;
  totalSeconds: number;
  progress: number;
  isRunning: boolean;
  currentSession: FocusSession | null;
  pomodorosCompleted: number;
  totalMinutes: number;
  start: (taskId?: string) => Promise<void>;
  pause: () => void;
  resume: () => void;
  skip: () => void;
  stop: () => Promise<void>;
  reset: () => void;
}

export function useFocusSession(options: UseFocusSessionOptions = {}): UseFocusSessionReturn {
  const {
    pomodoroMinutes = DEFAULT_POMODORO_MINUTES,
    shortBreakMinutes = DEFAULT_SHORT_BREAK_MINUTES,
    longBreakMinutes = DEFAULT_LONG_BREAK_MINUTES,
    pomodorosUntilLongBreak = POMODOROS_UNTIL_LONG_BREAK,
    onPomodoroComplete,
    onSessionComplete,
  } = options;

  const [phase, setPhase] = useState<TimerPhase>('idle');
  const [secondsLeft, setSecondsLeft] = useState(pomodoroMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null);
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0);
  const [breaksTaken, setBreaksTaken] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getTotalSeconds = useCallback((p: TimerPhase) => {
    switch (p) {
      case 'focus': return pomodoroMinutes * 60;
      case 'short_break': return shortBreakMinutes * 60;
      case 'long_break': return longBreakMinutes * 60;
      default: return pomodoroMinutes * 60;
    }
  }, [pomodoroMinutes, shortBreakMinutes, longBreakMinutes]);

  const totalSeconds = getTotalSeconds(phase);
  const progress = phase === 'idle' ? 0 : (totalSeconds - secondsLeft) / totalSeconds;

  useEffect(() => {
    if (isRunning && secondsLeft > 0) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  useEffect(() => {
    if (secondsLeft === 0 && phase !== 'idle') {
      if (phase === 'focus') {
        const newCount = pomodorosCompleted + 1;
        setPomodorosCompleted(newCount);
        onPomodoroComplete?.();
        const isLongBreak = newCount % pomodorosUntilLongBreak === 0;
        const nextPhase = isLongBreak ? 'long_break' : 'short_break';
        setPhase(nextPhase);
        setSecondsLeft(getTotalSeconds(nextPhase));
        setBreaksTaken((prev) => prev + 1);
      } else {
        setPhase('focus');
        setSecondsLeft(pomodoroMinutes * 60);
      }
    }
  }, [secondsLeft, phase, pomodorosCompleted, pomodorosUntilLongBreak, pomodoroMinutes, getTotalSeconds, onPomodoroComplete]);

  const totalMinutes = Math.round(
    pomodorosCompleted * pomodoroMinutes +
    (phase === 'focus' ? (getTotalSeconds('focus') - secondsLeft) / 60 : 0)
  );

  const start = useCallback(async (taskId?: string) => {
    try {
      const session = await focusSessionsApi.create({ taskId });
      setCurrentSession(session);
    } catch (err) {
      console.error('Failed to start focus session:', err);
    }
    setPhase('focus');
    setSecondsLeft(pomodoroMinutes * 60);
    setPomodorosCompleted(0);
    setBreaksTaken(0);
    setIsRunning(true);
  }, [pomodoroMinutes]);

  const pause = useCallback(() => setIsRunning(false), []);
  const resume = useCallback(() => setIsRunning(true), []);

  const skip = useCallback(() => {
    if (phase === 'focus') {
      const isLongBreak = (pomodorosCompleted + 1) % pomodorosUntilLongBreak === 0;
      const nextPhase = isLongBreak ? 'long_break' : 'short_break';
      setPhase(nextPhase);
      setSecondsLeft(getTotalSeconds(nextPhase));
    } else if (phase !== 'idle') {
      setPhase('focus');
      setSecondsLeft(pomodoroMinutes * 60);
    }
  }, [phase, pomodorosCompleted, pomodorosUntilLongBreak, pomodoroMinutes, getTotalSeconds]);

  const stop = useCallback(async () => {
    setIsRunning(false);
    if (currentSession) {
      try {
        const endedSession = await focusSessionsApi.end(currentSession.id, {
          durationMinutes: totalMinutes,
          pomodoros: pomodorosCompleted,
          breaksTaken,
          completed: true,
          endedAt: new Date().toISOString(),
        });
        onSessionComplete?.(endedSession);
      } catch (err) {
        console.error('Failed to end focus session:', err);
      }
    }
    setPhase('idle');
    setSecondsLeft(pomodoroMinutes * 60);
    setCurrentSession(null);
  }, [currentSession, totalMinutes, pomodorosCompleted, breaksTaken, pomodoroMinutes, onSessionComplete]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setPhase('idle');
    setSecondsLeft(pomodoroMinutes * 60);
    setPomodorosCompleted(0);
    setBreaksTaken(0);
    setCurrentSession(null);
  }, [pomodoroMinutes]);

  return {
    phase,
    secondsLeft,
    totalSeconds,
    progress,
    isRunning,
    currentSession,
    pomodorosCompleted,
    totalMinutes,
    start,
    pause,
    resume,
    skip,
    stop,
    reset,
  };
}
