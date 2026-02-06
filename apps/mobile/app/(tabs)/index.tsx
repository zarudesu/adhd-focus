import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, Pressable, useColorScheme, ScrollView,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTasks } from '../../hooks/useTasks';
import { ENERGY_CONFIG, formatDate } from '../../lib/utils';

export default function TodayScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = createStyles(isDark);

  const { tasks, todayTasks, loading, error, fetch, complete, update } = useTasks();
  const [refreshing, setRefreshing] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetch();
    setRefreshing(false);
  }, [fetch]);

  // Split active and completed
  const today = formatDate(new Date());
  const activeTasks = todayTasks.filter((t) => t.status !== 'done');
  const completedTasks = tasks.filter(
    (t) => t.status === 'done' && t.completedAt?.startsWith(today)
  );
  const currentTask = activeTasks.find((t) => t.status === 'in_progress') || activeTasks[0];

  const handleComplete = async (id: string) => {
    await complete(id);
  };

  const handleUncomplete = async (id: string) => {
    await update(id, { status: 'today', completedAt: null });
  };

  if (loading && tasks.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />
      }
    >
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error.message}</Text>
        </View>
      )}

      {/* Focus Card */}
      {currentTask && (
        <Pressable style={styles.focusCard} onPress={() => router.push('/focus')}>
          <View style={styles.focusHeader}>
            <Text style={styles.focusLabel}>Focus on this:</Text>
            {currentTask.energyRequired && (
              <View style={[styles.energyBadge, { backgroundColor: ENERGY_CONFIG[currentTask.energyRequired].color + '20' }]}>
                <Text>{ENERGY_CONFIG[currentTask.energyRequired].emoji}</Text>
              </View>
            )}
          </View>
          <Text style={styles.focusTitle}>{currentTask.title}</Text>
          <View style={styles.focusFooter}>
            {currentTask.estimatedMinutes && (
              <Text style={styles.focusTime}>~{currentTask.estimatedMinutes}m</Text>
            )}
            <View style={styles.startButton}>
              <Ionicons name="play" size={16} color="#fff" />
              <Text style={styles.startButtonText}>Start Focus</Text>
            </View>
          </View>
        </Pressable>
      )}

      {/* Active Tasks */}
      {activeTasks.length > (currentTask ? 1 : 0) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Also today ({activeTasks.length - (currentTask ? 1 : 0)} more)
          </Text>
          {activeTasks.filter((t) => t.id !== currentTask?.id).map((task) => (
            <View key={task.id} style={styles.taskCard}>
              <Pressable style={styles.checkbox} onPress={() => handleComplete(task.id)}>
                <Ionicons name="ellipse-outline" size={22} color={isDark ? '#6b7280' : '#9ca3af'} />
              </Pressable>
              <Text style={styles.taskTitle} numberOfLines={2}>{task.title}</Text>
              <Text style={styles.taskMeta}>
                {task.energyRequired ? ENERGY_CONFIG[task.energyRequired].emoji : ''} {task.estimatedMinutes ? `${task.estimatedMinutes}m` : ''}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Empty state */}
      {activeTasks.length === 0 && !loading && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>☀️</Text>
          <Text style={styles.emptyTitle}>No tasks for today</Text>
          <Text style={styles.emptySubtitle}>Move tasks from inbox or add new ones</Text>
        </View>
      )}

      {/* Completed section */}
      {completedTasks.length > 0 && (
        <View style={styles.section}>
          <Pressable
            style={styles.completedHeader}
            onPress={() => setShowCompleted(!showCompleted)}
          >
            <Text style={styles.sectionTitle}>
              Completed ({completedTasks.length})
            </Text>
            <Ionicons
              name={showCompleted ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={isDark ? '#6b7280' : '#9ca3af'}
            />
          </Pressable>
          {showCompleted && completedTasks.map((task) => (
            <View key={task.id} style={styles.taskCard}>
              <Pressable style={styles.checkbox} onPress={() => handleUncomplete(task.id)}>
                <Ionicons name="checkmark-circle" size={22} color="#6366f1" />
              </Pressable>
              <Text style={[styles.taskTitle, styles.completedTitle]} numberOfLines={2}>
                {task.title}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Spacer for bottom */}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#0f172a' : '#f5f5f5',
      padding: 16,
    },
    center: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorBanner: {
      backgroundColor: isDark ? '#450a0a' : '#fee2e2',
      padding: 12,
      borderRadius: 10,
      marginBottom: 16,
    },
    errorText: {
      color: '#ef4444',
      fontSize: 14,
      textAlign: 'center',
    },
    focusCard: {
      backgroundColor: isDark ? '#1e293b' : '#fff',
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
      borderWidth: 2,
      borderColor: '#6366f1',
    },
    focusHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    focusLabel: {
      fontSize: 14,
      color: '#6366f1',
      fontWeight: '500',
    },
    energyBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    focusTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: isDark ? '#fff' : '#0f172a',
      marginBottom: 16,
    },
    focusFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    focusTime: {
      fontSize: 14,
      color: isDark ? '#9ca3af' : '#6b7280',
    },
    startButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#6366f1',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 10,
    },
    startButtonText: {
      color: '#fff',
      fontWeight: '600',
      marginLeft: 6,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? '#9ca3af' : '#6b7280',
      marginBottom: 12,
    },
    completedHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    taskCard: {
      backgroundColor: isDark ? '#1e293b' : '#fff',
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
      flexDirection: 'row',
      alignItems: 'center',
    },
    checkbox: {
      marginRight: 12,
    },
    taskTitle: {
      fontSize: 16,
      color: isDark ? '#fff' : '#0f172a',
      flex: 1,
    },
    completedTitle: {
      textDecorationLine: 'line-through',
      color: isDark ? '#6b7280' : '#9ca3af',
    },
    taskMeta: {
      fontSize: 12,
      color: isDark ? '#6b7280' : '#9ca3af',
      marginLeft: 8,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 60,
    },
    emptyEmoji: {
      fontSize: 48,
      marginBottom: 12,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: isDark ? '#fff' : '#0f172a',
      marginBottom: 4,
    },
    emptySubtitle: {
      fontSize: 15,
      color: isDark ? '#9ca3af' : '#6b7280',
    },
  });
