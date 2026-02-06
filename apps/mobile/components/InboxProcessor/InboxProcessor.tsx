import { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  Pressable,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTaskStore } from '../../store/taskStore';
import { ProcessingCard } from './ProcessingCard';
import type { ProcessingAction, ProcessingState } from './types';

interface InboxProcessorProps {
  onClose: () => void;
}

// Shuffle array (Fisher-Yates)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function InboxProcessor({ onClose }: InboxProcessorProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = createStyles(isDark);

  const { getInboxTasks, updateTask, removeTask } = useTaskStore();
  const inboxTasks = getInboxTasks();

  // Shuffle tasks once on mount
  const [shuffledTasks, setShuffledTasks] = useState(() => shuffleArray(inboxTasks));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);

  const currentTask = shuffledTasks[currentIndex];
  const remainingCount = shuffledTasks.length - currentIndex;

  const handleAction = async (action: ProcessingAction, state: ProcessingState) => {
    if (!currentTask) return;

    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    const estimatedMinutes = state.duration === 'quick' ? 10 : 30;

    switch (action) {
      case 'today':
        updateTask(currentTask.id, {
          status: 'today',
          energyRequired: state.energy || 'medium',
          estimatedMinutes: estimatedMinutes,
          description: state.firstStep ? `First step: ${state.firstStep}` : currentTask.description,
          scheduledDate: new Date().toISOString().split('T')[0],
        });
        break;

      case 'someday':
        updateTask(currentTask.id, {
          status: 'scheduled',
          priority: 'someday',
          energyRequired: state.energy || 'medium',
          estimatedMinutes: estimatedMinutes,
          description: state.firstStep ? `First step: ${state.firstStep}` : currentTask.description,
        });
        break;

      case 'schedule':
        // For now, just mark as scheduled. TODO: open date picker
        updateTask(currentTask.id, {
          status: 'scheduled',
          energyRequired: state.energy || 'medium',
          estimatedMinutes: estimatedMinutes,
          description: state.firstStep ? `First step: ${state.firstStep}` : currentTask.description,
        });
        break;

      case 'delete':
        removeTask(currentTask.id);
        break;
    }

    setProcessedCount((c) => c + 1);

    // Move to next task or close if done
    if (currentIndex < shuffledTasks.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      // All done!
      onClose();
    }
  };

  // Handle empty inbox
  if (shuffledTasks.length === 0 || !currentTask) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={isDark ? '#ffffff' : '#1a1a2e'} />
          </Pressable>
          <Text style={styles.headerTitle}>Process Inbox</Text>
          <View style={styles.closeButton} />
        </View>

        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🎉</Text>
          <Text style={styles.emptyTitle}>Inbox Zero!</Text>
          <Text style={styles.emptySubtitle}>
            {processedCount > 0
              ? `You processed ${processedCount} task${processedCount > 1 ? 's' : ''}!`
              : 'Nothing to process'}
          </Text>
          <Pressable style={styles.doneButton} onPress={onClose}>
            <Text style={styles.doneButtonText}>Done</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={isDark ? '#ffffff' : '#1a1a2e'} />
        </Pressable>
        <Text style={styles.headerTitle}>Process Inbox</Text>
        <View style={styles.progressBadge}>
          <Text style={styles.progressText}>{remainingCount} left</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            { width: `${(currentIndex / shuffledTasks.length) * 100}%` },
          ]}
        />
      </View>

      {/* Card */}
      <ProcessingCard
        task={currentTask}
        onAction={handleAction}
        totalCount={shuffledTasks.length}
        currentIndex={currentIndex}
      />
    </SafeAreaView>
  );
}

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#16213e' : '#f5f5f5',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    closeButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: '600',
      color: isDark ? '#ffffff' : '#1a1a2e',
    },
    progressBadge: {
      backgroundColor: isDark ? '#2d2d44' : '#e5e7eb',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    progressText: {
      fontSize: 13,
      fontWeight: '600',
      color: isDark ? '#9ca3af' : '#6b7280',
    },
    progressBarContainer: {
      height: 4,
      backgroundColor: isDark ? '#2d2d44' : '#e5e7eb',
      marginHorizontal: 16,
      borderRadius: 2,
      overflow: 'hidden',
    },
    progressBar: {
      height: '100%',
      backgroundColor: '#6366f1',
      borderRadius: 2,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    emptyEmoji: {
      fontSize: 64,
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: isDark ? '#ffffff' : '#1a1a2e',
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 16,
      color: isDark ? '#9ca3af' : '#6b7280',
      textAlign: 'center',
      marginBottom: 24,
    },
    doneButton: {
      backgroundColor: '#6366f1',
      paddingHorizontal: 32,
      paddingVertical: 14,
      borderRadius: 12,
    },
    doneButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
    },
  });
