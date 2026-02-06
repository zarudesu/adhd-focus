import { View, Text, StyleSheet, useColorScheme, Pressable, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';
import { useTasks } from '../hooks/useTasks';
import { useFocusSession } from '../hooks/useFocusSession';
import type { Task } from '../types';

export default function FocusScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = createStyles(isDark);

  const { todayTasks } = useTasks();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const {
    phase, secondsLeft, totalSeconds, progress, isRunning,
    pomodorosCompleted, totalMinutes,
    start, pause, resume, skip, stop, reset,
  } = useFocusSession({
    onPomodoroComplete: async () => {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
    },
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = async (task?: Task) => {
    setSelectedTask(task || null);
    await start(task?.id);
  };

  const handlePlayPause = () => {
    if (isRunning) {
      pause();
    } else if (phase === 'idle') {
      handleStart(selectedTask || undefined);
    } else {
      resume();
    }
  };

  const handleStop = async () => {
    await stop();
    setSelectedTask(null);
  };

  const handleClose = async () => {
    if (phase !== 'idle') {
      await stop();
    }
    router.back();
  };

  // Task selector (before starting)
  if (phase === 'idle' && !selectedTask) {
    return (
      <View style={styles.container}>
        <Pressable style={styles.closeButton} onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="#fff" />
        </Pressable>

        <View style={styles.selectorSection}>
          <Text style={styles.selectorTitle}>What will you focus on?</Text>

          {todayTasks.filter(t => t.status !== 'done').length > 0 ? (
            <FlatList
              data={todayTasks.filter(t => t.status !== 'done')}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.taskOption}
                  onPress={() => handleStart(item)}
                >
                  <Text style={styles.taskOptionTitle} numberOfLines={2}>{item.title}</Text>
                  {item.estimatedMinutes && (
                    <Text style={styles.taskOptionMeta}>~{item.estimatedMinutes}m</Text>
                  )}
                </Pressable>
              )}
              contentContainerStyle={{ paddingHorizontal: 24 }}
            />
          ) : (
            <View style={{ alignItems: 'center', paddingTop: 40 }}>
              <Text style={styles.noTasksText}>No tasks for today</Text>
            </View>
          )}

          <Pressable style={styles.freeSessionButton} onPress={() => handleStart()}>
            <Ionicons name="timer-outline" size={20} color="#6366f1" />
            <Text style={styles.freeSessionText}>Free focus session</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <Pressable style={styles.closeButton} onPress={handleClose}>
        <Ionicons name="close" size={28} color="#fff" />
      </Pressable>

      {/* Task Title */}
      <View style={styles.taskSection}>
        <Text style={styles.focusLabel}>
          {phase === 'short_break' || phase === 'long_break' ? 'Break time' : 'Focusing on'}
        </Text>
        <Text style={styles.taskTitle}>
          {selectedTask?.title || 'Free session'}
        </Text>
      </View>

      {/* Timer */}
      <View style={styles.timerSection}>
        <View style={styles.timerCircle}>
          <Text style={styles.timerText}>{formatTime(secondsLeft)}</Text>
          <Text style={styles.timerLabel}>
            {phase === 'short_break' ? 'Short Break' :
             phase === 'long_break' ? 'Long Break' :
             !isRunning && phase !== 'idle' ? 'Paused' : 'Focus'}
          </Text>
        </View>
      </View>

      {/* Pomodoro count */}
      <View style={styles.pomodoroSection}>
        <Text style={styles.pomodoroText}>
          {'🍅'.repeat(Math.min(pomodorosCompleted, 8))} {pomodorosCompleted} pomodoro{pomodorosCompleted !== 1 ? 's' : ''}
        </Text>
        {totalMinutes > 0 && (
          <Text style={styles.minutesText}>{totalMinutes} min focused</Text>
        )}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <Pressable style={styles.secondaryButton} onPress={reset} accessibilityLabel="Reset timer">
          <Ionicons name="refresh" size={24} color="#6366f1" />
        </Pressable>

        <Pressable style={styles.mainButton} onPress={handlePlayPause}>
          <Ionicons
            name={isRunning ? 'pause' : 'play'}
            size={32}
            color="#fff"
          />
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={skip} accessibilityLabel="Skip to next">
          <Ionicons name="play-skip-forward" size={24} color="#6366f1" />
        </Pressable>
      </View>

      {/* Stop button */}
      <Pressable style={styles.stopButton} onPress={handleStop}>
        <Ionicons name="stop" size={18} color="#ef4444" />
        <Text style={styles.stopText}>End session</Text>
      </Pressable>
    </View>
  );
}

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#0f0f23',
      padding: 24,
    },
    closeButton: {
      position: 'absolute',
      top: 60,
      right: 24,
      padding: 8,
      zIndex: 10,
    },
    // Task selector
    selectorSection: {
      flex: 1,
      paddingTop: 120,
    },
    selectorTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: '#fff',
      textAlign: 'center',
      marginBottom: 32,
    },
    taskOption: {
      backgroundColor: '#1e293b',
      borderRadius: 14,
      padding: 18,
      marginBottom: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    taskOptionTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: '#fff',
      flex: 1,
    },
    taskOptionMeta: {
      fontSize: 14,
      color: '#9ca3af',
      marginLeft: 12,
    },
    noTasksText: {
      fontSize: 16,
      color: '#6b7280',
    },
    freeSessionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      marginTop: 20,
      marginHorizontal: 24,
      borderWidth: 2,
      borderColor: '#6366f1',
      borderRadius: 14,
      gap: 8,
    },
    freeSessionText: {
      color: '#6366f1',
      fontSize: 16,
      fontWeight: '600',
    },
    // Timer
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
      marginBottom: 32,
    },
    pomodoroText: {
      fontSize: 18,
      color: '#9ca3af',
    },
    minutesText: {
      fontSize: 14,
      color: '#6b7280',
      marginTop: 4,
    },
    controls: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 24,
      marginBottom: 20,
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
      backgroundColor: '#1e293b',
      justifyContent: 'center',
      alignItems: 'center',
    },
    stopButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      marginBottom: 40,
      gap: 6,
    },
    stopText: {
      color: '#ef4444',
      fontSize: 15,
      fontWeight: '500',
    },
  });
