'use client';

/**
 * Focus Timer Hook - Pomodoro timer with session tracking
 * Handles work sessions, short breaks, and long breaks
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useProfile } from './useProfile';

export type TimerMode = 'work' | 'shortBreak' | 'longBreak';
export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';

interface TimerState {
  mode: TimerMode;
  status: TimerStatus;
  timeRemaining: number; // seconds
  totalTime: number; // seconds
  pomodorosCompleted: number;
  currentSessionId: string | null;
}

interface UseFocusTimerOptions {
  taskId?: string | null;
  onPomodoroComplete?: () => void;
  onSessionComplete?: (mode: TimerMode) => void;
}

interface UseFocusTimerReturn {
  // State
  mode: TimerMode;
  status: TimerStatus;
  timeRemaining: number;
  totalTime: number;
  pomodorosCompleted: number;
  progress: number; // 0-100
  formattedTime: string;

  // Actions
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  skip: () => void;
  setMode: (mode: TimerMode) => void;

  // Settings from profile
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  pomodorosUntilLongBreak: number;
}

// Format seconds to MM:SS
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Play notification sound
function playNotificationSound() {
  try {
    // Create a simple beep using Web Audio API
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch {
    // Audio not supported
  }
}

// Request notification permission
async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;

  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

// Show browser notification
function showNotification(title: string, body: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
    });
  }
}

export function useFocusTimer(options: UseFocusTimerOptions = {}): UseFocusTimerReturn {
  const { taskId, onPomodoroComplete, onSessionComplete } = options;
  const { profile } = useProfile();

  // Get durations from profile preferences (in seconds)
  const workDuration = (profile?.preferences?.defaultPomodoroMinutes ?? 25) * 60;
  const shortBreakDuration = (profile?.preferences?.defaultBreakMinutes ?? 5) * 60;
  const longBreakDuration = (profile?.preferences?.longBreakMinutes ?? 15) * 60;
  const pomodorosUntilLongBreak = profile?.preferences?.pomodorosUntilLongBreak ?? 4;
  const enableSound = profile?.preferences?.notificationSound ?? true;

  const [state, setState] = useState<TimerState>({
    mode: 'work',
    status: 'idle',
    timeRemaining: workDuration,
    totalTime: workDuration,
    pomodorosCompleted: 0,
    currentSessionId: null,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Update time remaining when profile loads
  useEffect(() => {
    if (state.status === 'idle') {
      const duration = state.mode === 'work'
        ? workDuration
        : state.mode === 'shortBreak'
          ? shortBreakDuration
          : longBreakDuration;
      setState(prev => ({
        ...prev,
        timeRemaining: duration,
        totalTime: duration,
      }));
    }
  }, [workDuration, shortBreakDuration, longBreakDuration, state.mode, state.status]);

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Timer tick logic
  useEffect(() => {
    if (state.status === 'running') {
      intervalRef.current = setInterval(() => {
        setState(prev => {
          if (prev.timeRemaining <= 1) {
            // Timer completed
            clearInterval(intervalRef.current!);

            const isWorkSession = prev.mode === 'work';
            const newPomodorosCompleted = isWorkSession
              ? prev.pomodorosCompleted + 1
              : prev.pomodorosCompleted;

            // Determine next mode
            let nextMode: TimerMode = 'work';
            if (isWorkSession) {
              // After work, take a break
              nextMode = newPomodorosCompleted % pomodorosUntilLongBreak === 0
                ? 'longBreak'
                : 'shortBreak';
            }

            const nextDuration = nextMode === 'work'
              ? workDuration
              : nextMode === 'shortBreak'
                ? shortBreakDuration
                : longBreakDuration;

            // Play sound and show notification
            if (enableSound) {
              playNotificationSound();
            }

            const notificationTitle = isWorkSession ? 'Pomodoro Complete!' : 'Break Over!';
            const notificationBody = isWorkSession
              ? `Time for a ${nextMode === 'longBreak' ? 'long' : 'short'} break!`
              : 'Ready to focus again?';
            showNotification(notificationTitle, notificationBody);

            // Callbacks
            if (isWorkSession) {
              onPomodoroComplete?.();
            }
            onSessionComplete?.(prev.mode);

            return {
              ...prev,
              status: 'completed',
              timeRemaining: 0,
              pomodorosCompleted: newPomodorosCompleted,
            };
          }

          return {
            ...prev,
            timeRemaining: prev.timeRemaining - 1,
          };
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.status, workDuration, shortBreakDuration, longBreakDuration, pomodorosUntilLongBreak, enableSound, onPomodoroComplete, onSessionComplete]);

  // Start timer
  const start = useCallback(async () => {
    startTimeRef.current = Date.now();

    // Create focus session if this is a work session
    if (state.mode === 'work' && taskId) {
      try {
        const res = await fetch('/api/focus/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId }),
        });
        if (res.ok) {
          const session = await res.json();
          setState(prev => ({ ...prev, currentSessionId: session.id }));
        }
      } catch {
        // Continue without session tracking
      }
    }

    setState(prev => ({
      ...prev,
      status: 'running',
    }));
  }, [state.mode, taskId]);

  // Pause timer
  const pause = useCallback(() => {
    setState(prev => ({
      ...prev,
      status: 'paused',
    }));
  }, []);

  // Resume timer
  const resume = useCallback(() => {
    setState(prev => ({
      ...prev,
      status: 'running',
    }));
  }, []);

  // Reset timer
  const reset = useCallback(async () => {
    // End current session if exists
    if (state.currentSessionId) {
      try {
        await fetch(`/api/focus/sessions/${state.currentSessionId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ completed: false }),
        });
      } catch {
        // Ignore
      }
    }

    const duration = state.mode === 'work'
      ? workDuration
      : state.mode === 'shortBreak'
        ? shortBreakDuration
        : longBreakDuration;

    setState(prev => ({
      ...prev,
      status: 'idle',
      timeRemaining: duration,
      totalTime: duration,
      currentSessionId: null,
    }));
  }, [state.mode, state.currentSessionId, workDuration, shortBreakDuration, longBreakDuration]);

  // Skip to next session
  const skip = useCallback(() => {
    const isWorkSession = state.mode === 'work';
    const newPomodorosCompleted = isWorkSession && state.status !== 'idle'
      ? state.pomodorosCompleted + 1
      : state.pomodorosCompleted;

    let nextMode: TimerMode = 'work';
    if (isWorkSession) {
      nextMode = newPomodorosCompleted % pomodorosUntilLongBreak === 0
        ? 'longBreak'
        : 'shortBreak';
    }

    const nextDuration = nextMode === 'work'
      ? workDuration
      : nextMode === 'shortBreak'
        ? shortBreakDuration
        : longBreakDuration;

    setState({
      mode: nextMode,
      status: 'idle',
      timeRemaining: nextDuration,
      totalTime: nextDuration,
      pomodorosCompleted: newPomodorosCompleted,
      currentSessionId: null,
    });
  }, [state.mode, state.status, state.pomodorosCompleted, pomodorosUntilLongBreak, workDuration, shortBreakDuration, longBreakDuration]);

  // Set mode manually
  const setMode = useCallback((mode: TimerMode) => {
    const duration = mode === 'work'
      ? workDuration
      : mode === 'shortBreak'
        ? shortBreakDuration
        : longBreakDuration;

    setState(prev => ({
      ...prev,
      mode,
      status: 'idle',
      timeRemaining: duration,
      totalTime: duration,
      currentSessionId: null,
    }));
  }, [workDuration, shortBreakDuration, longBreakDuration]);

  // Calculate progress (0-100)
  const progress = state.totalTime > 0
    ? ((state.totalTime - state.timeRemaining) / state.totalTime) * 100
    : 0;

  return {
    mode: state.mode,
    status: state.status,
    timeRemaining: state.timeRemaining,
    totalTime: state.totalTime,
    pomodorosCompleted: state.pomodorosCompleted,
    progress,
    formattedTime: formatTime(state.timeRemaining),

    start,
    pause,
    resume,
    reset,
    skip,
    setMode,

    workDuration: workDuration / 60,
    shortBreakDuration: shortBreakDuration / 60,
    longBreakDuration: longBreakDuration / 60,
    pomodorosUntilLongBreak,
  };
}
