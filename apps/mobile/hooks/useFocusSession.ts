/**
 * Focus Session Hook - Pomodoro timer logic
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { focusSessionsApi, profileApi } from '../api';
import type { FocusSession } from '@adhd-focus/shared';
import { DEFAULT_POMODORO_MINUTES, DEFAULT_SHORT_BREAK_MINUTES, DEFAULT_LONG_BREAK_MINUTES, POMODOROS_UNTIL_LONG_BREAK } from '@adhd-focus/shared';

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
  // Timer state
  phase: TimerPhase;
  secondsLeft: number;
  totalSeconds: number;
  progress: number; // 0-1
  isRunning: boolean;

  // Session state
  currentSession: FocusSession | null;
  pomodorosCompleted: number;
  totalMinutes: number;

  // Actions
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
  const startTimeRef = useRef<Date | null>(null);

  // Calculate total seconds for current phase
  const getTotalSeconds = useCallback((p: TimerPhase) => {
    switch (p) {
      case 'focus':
        return pomodoroMinutes * 60;
      case 'short_break':
        return shortBreakMinutes * 60;
      case 'long_break':
        return longBreakMinutes * 60;
      default:
        return pomodoroMinutes * 60;
    }
  }, [pomodoroMinutes, shortBreakMinutes, longBreakMinutes]);

  const totalSeconds = getTotalSeconds(phase);
  const progress = phase === 'idle' ? 0 : (totalSeconds - secondsLeft) / totalSeconds;

  // Timer tick
  useEffect(() => {
    if (isRunning && secondsLeft > 0) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  // Handle timer completion
  useEffect(() => {
    if (secondsLeft === 0 && phase !== 'idle') {
      if (phase === 'focus') {
        // Pomodoro completed
        const newPomodoroCount = pomodorosCompleted + 1;
        setPomodorosCompleted(newPomodoroCount);
        onPomodoroComplete?.();

        // Determine break type
        const isLongBreak = newPomodoroCount % pomodorosUntilLongBreak === 0;
        const nextPhase = isLongBreak ? 'long_break' : 'short_break';
        setPhase(nextPhase);
        setSecondsLeft(getTotalSeconds(nextPhase));
        setBreaksTaken((prev) => prev + 1);
      } else {
        // Break completed, start next focus
        setPhase('focus');
        setSecondsLeft(pomodoroMinutes * 60);
      }
    }
  }, [secondsLeft, phase, pomodorosCompleted, pomodorosUntilLongBreak, pomodoroMinutes, getTotalSeconds, onPomodoroComplete]);

  // Calculate total focused minutes
  const totalMinutes = Math.round(
    pomodorosCompleted * pomodoroMinutes +
    (phase === 'focus' ? (getTotalSeconds('focus') - secondsLeft) / 60 : 0)
  );

  // Start session
  const start = useCallback(async (taskId?: string) => {
    try {
      const session = await focusSessionsApi.start({ task_id: taskId });
      setCurrentSession(session);
      startTimeRef.current = new Date();
      setPhase('focus');
      setSecondsLeft(pomodoroMinutes * 60);
      setPomodorosCompleted(0);
      setBreaksTaken(0);
      setIsRunning(true);
    } catch (err) {
      console.error('Failed to start focus session:', err);
      // Start locally anyway for offline support
      setPhase('focus');
      setSecondsLeft(pomodoroMinutes * 60);
      setIsRunning(true);
    }
  }, [pomodoroMinutes]);

  // Pause
  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  // Resume
  const resume = useCallback(() => {
    setIsRunning(true);
  }, []);

  // Skip current phase
  const skip = useCallback(() => {
    if (phase === 'focus') {
      // Skip to break
      const isLongBreak = (pomodorosCompleted + 1) % pomodorosUntilLongBreak === 0;
      const nextPhase = isLongBreak ? 'long_break' : 'short_break';
      setPhase(nextPhase);
      setSecondsLeft(getTotalSeconds(nextPhase));
    } else if (phase !== 'idle') {
      // Skip break, back to focus
      setPhase('focus');
      setSecondsLeft(pomodoroMinutes * 60);
    }
  }, [phase, pomodorosCompleted, pomodorosUntilLongBreak, pomodoroMinutes, getTotalSeconds]);

  // Stop session completely
  const stop = useCallback(async () => {
    setIsRunning(false);

    if (currentSession) {
      try {
        const endedSession = await focusSessionsApi.end(currentSession.id, {
          duration_minutes: totalMinutes,
          pomodoros: pomodorosCompleted,
          breaks_taken: breaksTaken,
          completed: true,
        });

        // Update profile stats
        await profileApi.incrementStats({
          pomodoros: pomodorosCompleted,
          focus_minutes: totalMinutes,
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

  // Reset without saving
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
