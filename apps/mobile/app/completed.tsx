import { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, useColorScheme, SectionList,
  ActivityIndicator, RefreshControl, Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTasks } from '../hooks/useTasks';
import { formatDisplayDate, groupBy } from '../lib/utils';

export default function CompletedScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = createStyles(isDark);

  const { tasks, loading, fetch, update } = useTasks();
  const [refreshing, setRefreshing] = useState(false);

  const completedTasks = useMemo(
    () => tasks.filter((t) => t.status === 'done').sort((a, b) =>
      (b.completedAt || '').localeCompare(a.completedAt || '')
    ),
    [tasks]
  );

  const sections = useMemo(() => {
    const grouped = groupBy(completedTasks, (t) =>
      t.completedAt ? t.completedAt.split('T')[0] : 'Unknown'
    );
    return Object.entries(grouped)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, items]) => ({
        title: formatDisplayDate(date),
        data: items,
      }));
  }, [completedTasks]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetch();
    setRefreshing(false);
  }, [fetch]);

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

  if (completedTasks.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.emptyEmoji}>✅</Text>
        <Text style={styles.emptyTitle}>No completed tasks yet</Text>
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
          <Pressable onPress={() => handleUncomplete(item.id)}>
            <Ionicons name="checkmark-circle" size={22} color="#6366f1" />
          </Pressable>
          <Text style={[styles.taskTitle, styles.completed]} numberOfLines={2}>{item.title}</Text>
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
      gap: 12,
    },
    taskTitle: {
      fontSize: 15,
      color: isDark ? '#fff' : '#0f172a',
      flex: 1,
    },
    completed: {
      textDecorationLine: 'line-through',
      color: isDark ? '#6b7280' : '#9ca3af',
    },
    emptyEmoji: {
      fontSize: 48,
      marginBottom: 12,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: isDark ? '#fff' : '#0f172a',
    },
  });
