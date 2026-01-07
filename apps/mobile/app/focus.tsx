import { View, Text, StyleSheet, useColorScheme, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useRef } from 'react';
import { DEFAULT_POMODORO_MINUTES, DEFAULT_SHORT_BREAK_MINUTES } from '@adhd-focus/shared';

type TimerState = 'focus' | 'break' | 'paused';

export default function FocusScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = createStyles(isDark);

  const [timerState, setTimerState] = useState<TimerState>('paused');
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_POMODORO_MINUTES * 60);
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSeconds = timerState === 'break'
    ? DEFAULT_SHORT_BREAK_MINUTES * 60
    : DEFAULT_POMODORO_MINUTES * 60;

  const progress = (totalSeconds - secondsLeft) / totalSeconds;

  useEffect(() => {
    if (timerState === 'focus' || timerState === 'break') {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            // Timer finished
            if (timerState === 'focus') {
              setPomodorosCompleted((p) => p + 1);
              setTimerState('break');
              return DEFAULT_SHORT_BREAK_MINUTES * 60;
            } else {
              setTimerState('paused');
              return DEFAULT_POMODORO_MINUTES * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerState]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (timerState === 'paused') {
      setTimerState('focus');
    } else {
      setTimerState('paused');
    }
  };

  const handleReset = () => {
    setTimerState('paused');
    setSecondsLeft(DEFAULT_POMODORO_MINUTES * 60);
  };

  const handleComplete = () => {
    // Mark task as complete and go back
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Pressable style={styles.closeButton} onPress={() => router.back()}>
        <Ionicons name="close" size={28} color={isDark ? '#fff' : '#1a1a2e'} />
      </Pressable>

      {/* Task Title */}
      <View style={styles.taskSection}>
        <Text style={styles.focusLabel}>
          {timerState === 'break' ? '☕ Break time' : '🎯 Focusing on'}
        </Text>
        <Text style={styles.taskTitle}>Review project proposal</Text>
      </View>

      {/* Timer */}
      <View style={styles.timerSection}>
        <View style={styles.timerCircle}>
          {/* Progress Ring would go here - simplified for now */}
          <View style={[styles.progressRing, { opacity: progress }]} />
          <Text style={styles.timerText}>{formatTime(secondsLeft)}</Text>
          <Text style={styles.timerLabel}>
            {timerState === 'break' ? 'Break' : timerState === 'paused' ? 'Paused' : 'Focus'}
          </Text>
        </View>
      </View>

      {/* Pomodoro count */}
      <View style={styles.pomodoroSection}>
        <Text style={styles.pomodoroText}>🍅 {pomodorosCompleted} pomodoros</Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <Pressable style={styles.secondaryButton} onPress={handleReset}>
          <Ionicons name="refresh" size={24} color="#6366f1" />
        </Pressable>

        <Pressable style={styles.mainButton} onPress={handlePlayPause}>
          <Ionicons
            name={timerState === 'paused' ? 'play' : 'pause'}
            size={32}
            color="#fff"
          />
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={handleComplete}>
          <Ionicons name="checkmark" size={24} color="#10b981" />
        </Pressable>
      </View>

      {/* Tips */}
      <View style={styles.tipSection}>
        <Text style={styles.tipText}>
          💡 Tip: Put your phone face down to minimize distractions
        </Text>
      </View>
    </View>
  );
}

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#0f0f23' : '#1a1a2e',
      padding: 24,
    },
    closeButton: {
      position: 'absolute',
      top: 60,
      right: 24,
      padding: 8,
      zIndex: 10,
    },
    taskSection: {
      alignItems: 'center',
      marginTop: 100,
    },
    focusLabel: {
      fontSize: 16,
      color: '#9ca3af',
      marginBottom: 8,
    },
    taskTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: '#fff',
      textAlign: 'center',
    },
    timerSection: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    timerCircle: {
      width: 280,
      height: 280,
      borderRadius: 140,
      borderWidth: 8,
      borderColor: '#6366f1',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    progressRing: {
      position: 'absolute',
      width: 280,
      height: 280,
      borderRadius: 140,
      backgroundColor: '#6366f1',
    },
    timerText: {
      fontSize: 72,
      fontWeight: '200',
      color: '#fff',
      fontVariant: ['tabular-nums'],
    },
    timerLabel: {
      fontSize: 18,
      color: '#9ca3af',
      marginTop: 8,
    },
    pomodoroSection: {
      alignItems: 'center',
      marginBottom: 40,
    },
    pomodoroText: {
      fontSize: 18,
      color: '#9ca3af',
    },
    controls: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 24,
      marginBottom: 40,
    },
    mainButton: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: '#6366f1',
      justifyContent: 'center',
      alignItems: 'center',
    },
    secondaryButton: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: isDark ? '#1a1a2e' : '#2d2d44',
      justifyContent: 'center',
      alignItems: 'center',
    },
    tipSection: {
      alignItems: 'center',
      paddingBottom: 40,
    },
    tipText: {
      fontSize: 14,
      color: '#6b7280',
      textAlign: 'center',
    },
  });
