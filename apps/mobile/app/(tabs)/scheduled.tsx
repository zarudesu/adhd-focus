import { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, useColorScheme, SectionList,
  ActivityIndicator, RefreshControl, Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTasks } from '../../hooks/useTasks';
import { ENERGY_CONFIG, formatDisplayDate, groupBy } from '../../lib/utils';
import type { Task } from '../../types';

export default function ScheduledScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = createStyles(isDark);

  const { tasks, loading, fetch, complete, moveToToday } = useTasks();
  const [refreshing, setRefreshing] = useState(false);

  const scheduledTasks = useMemo(
    () => tasks.filter((t) => t.status === 'scheduled'),
    [tasks]
  );

  const sections = useMemo(() => {
    const grouped = groupBy(scheduledTasks, (t) => t.scheduledDate || 'No date');
    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, items]) => ({
        title: date === 'No date' ? 'No date' : formatDisplayDate(date),
        data: items,
      }));
  }, [scheduledTasks]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetch();
    setRefreshing(false);
  }, [fetch]);

  if (loading && tasks.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (scheduledTasks.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.emptyEmoji}>📅</Text>
        <Text style={styles.emptyTitle}>No scheduled tasks</Text>
        <Text style={styles.emptySubtitle}>Schedule tasks from your inbox</Text>
      </View>
    );
  }

  return (
    <SectionList
      style={styles.container}
      sections={sections}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />
      }
      renderSectionHeader={({ section }) => (
        <Text style={styles.sectionHeader}>{section.title}</Text>
      )}
      renderItem={({ item }) => (
        <View style={styles.taskCard}>
          <Pressable style={styles.checkbox} onPress={() => complete(item.id)}>
            <Ionicons name="ellipse-outline" size={22} color={isDark ? '#6b7280' : '#9ca3af'} />
          </Pressable>
          <Text style={styles.taskTitle} numberOfLines={2}>{item.title}</Text>
          <Pressable style={styles.todayButton} onPress={() => moveToToday(item.id)}>
            <Ionicons name="sunny-outline" size={16} color="#6366f1" />
          </Pressable>
        </View>
      )}
      contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
    />
  );
}

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#0f172a' : '#f5f5f5',
    },
    center: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    sectionHeader: {
      fontSize: 14,
      fontWeight: '700',
      color: isDark ? '#9ca3af' : '#6b7280',
      marginBottom: 10,
      marginTop: 20,
    },
    taskCard: {
      backgroundColor: isDark ? '#1e293b' : '#fff',
      borderRadius: 12,
      padding: 14,
      marginBottom: 8,
      flexDirection: 'row',
      alignItems: 'center',
    },
    checkbox: {
      marginRight: 12,
    },
    taskTitle: {
      fontSize: 15,
      color: isDark ? '#fff' : '#0f172a',
      flex: 1,
    },
    todayButton: {
      padding: 8,
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
