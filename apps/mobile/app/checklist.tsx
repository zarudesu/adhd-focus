import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHabits } from '../hooks/useHabits';
import { formatDate } from '../lib/utils';
import type { Habit } from '../types';

const TIME_SECTIONS = [
  { key: 'morning', title: 'Morning', emoji: '🌅' },
  { key: 'afternoon', title: 'Afternoon', emoji: '☀️' },
  { key: 'evening', title: 'Evening', emoji: '🌙' },
  { key: 'anytime', title: 'Anytime', emoji: '⏰' },
] as const;

export default function ChecklistScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = createStyles(isDark);
  const today = formatDate(new Date());

  const {
    habits,
    loading,
    fetch,
    check,
    uncheck,
    morningHabits,
    afternoonHabits,
    eveningHabits,
    anytimeHabits,
  } = useHabits();
  const [refreshing, setRefreshing] = useState(false);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetch();
    setRefreshing(false);
  }, [fetch]);

  const handleToggle = async (habit: Habit) => {
    const isChecked = checkedIds.has(habit.id);
    if (isChecked) {
      setCheckedIds((prev) => {
        const next = new Set(prev);
        next.delete(habit.id);
        return next;
      });
      await uncheck(habit.id, today);
    } else {
      setCheckedIds((prev) => new Set(prev).add(habit.id));
      await check(habit.id, today);
    }
  };

  const getSectionHabits = (key: string): Habit[] => {
    switch (key) {
      case 'morning':
        return morningHabits;
      case 'afternoon':
        return afternoonHabits;
      case 'evening':
        return eveningHabits;
      default:
        return anytimeHabits;
    }
  };

  if (loading && habits.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (habits.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.emptyEmoji}>📋</Text>
        <Text style={styles.emptyTitle}>No habits yet</Text>
        <Text style={styles.emptySubtitle}>Add habits from the web app to track them here</Text>
      </View>
    );
  }

  const totalDone = checkedIds.size;
  const totalHabits = habits.length;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />
      }
    >
      {/* Progress */}
      <View style={styles.progressCard}>
        <Text style={styles.progressText}>
          {totalDone}/{totalHabits} done today
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${totalHabits > 0 ? (totalDone / totalHabits) * 100 : 0}%` },
            ]}
          />
        </View>
      </View>

      {/* Sections */}
      {TIME_SECTIONS.map((section) => {
        const sectionHabits = getSectionHabits(section.key);
        if (sectionHabits.length === 0) return null;
        return (
          <View key={section.key} style={styles.section}>
            <Text style={styles.sectionTitle}>
              {section.emoji} {section.title}
            </Text>
            {sectionHabits.map((habit) => {
              const isChecked = checkedIds.has(habit.id);
              return (
                <Pressable
                  key={habit.id}
                  style={styles.habitCard}
                  onPress={() => handleToggle(habit)}
                >
                  <Ionicons
                    name={isChecked ? 'checkmark-circle' : 'ellipse-outline'}
                    size={24}
                    color={isChecked ? '#22c55e' : isDark ? '#6b7280' : '#9ca3af'}
                  />
                  <Text style={styles.habitEmoji}>{habit.emoji || '📌'}</Text>
                  <View style={styles.habitInfo}>
                    <Text style={[styles.habitName, isChecked && styles.habitChecked]}>
                      {habit.name}
                    </Text>
                    {habit.currentStreak ? (
                      <Text style={styles.streakText}>🔥 {habit.currentStreak} day streak</Text>
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        );
      })}

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
    progressCard: {
      backgroundColor: isDark ? '#1e293b' : '#fff',
      borderRadius: 14,
      padding: 16,
      marginBottom: 20,
    },
    progressText: {
      fontSize: 15,
      fontWeight: '600',
      color: isDark ? '#fff' : '#0f172a',
      marginBottom: 10,
    },
    progressBar: {
      height: 6,
      backgroundColor: isDark ? '#374151' : '#e5e7eb',
      borderRadius: 3,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#22c55e',
      borderRadius: 3,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: isDark ? '#9ca3af' : '#6b7280',
      marginBottom: 10,
    },
    habitCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#1e293b' : '#fff',
      borderRadius: 12,
      padding: 14,
      marginBottom: 8,
      gap: 12,
    },
    habitEmoji: {
      fontSize: 20,
    },
    habitInfo: {
      flex: 1,
    },
    habitName: {
      fontSize: 16,
      fontWeight: '500',
      color: isDark ? '#fff' : '#0f172a',
    },
    habitChecked: {
      textDecorationLine: 'line-through',
      color: isDark ? '#6b7280' : '#9ca3af',
    },
    streakText: {
      fontSize: 12,
      color: isDark ? '#9ca3af' : '#6b7280',
      marginTop: 2,
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
      textAlign: 'center',
    },
  });
