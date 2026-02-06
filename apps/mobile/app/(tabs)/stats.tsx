import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, useColorScheme, ScrollView,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { api } from '../../lib/api-client';

interface GamificationStats {
  level: number;
  xp: number;
  currentStreak: number;
  longestStreak: number;
  totalTasksCompleted: number;
  totalCreatures: number;
  progress: {
    level: number;
    totalTasksCompleted: number;
    tasksAdded: number;
    focusSessionsCompleted: number;
  };
}

export default function StatsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = createStyles(isDark);

  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const statsData = await api.get<GamificationStats>('/gamification/stats');
      setStats(statsData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  const s = stats || {
    level: 1,
    xp: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalTasksCompleted: 0,
    totalCreatures: 0,
    progress: { level: 1, totalTasksCompleted: 0, tasksAdded: 0, focusSessionsCompleted: 0 },
  };

  const xpForNext = Math.floor(100 * Math.pow(s.level, 1.5));
  const xpPercent = xpForNext > 0 ? Math.min((s.xp / xpForNext) * 100, 100) : 0;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />
      }
    >
      {/* Streak Card */}
      <View style={styles.streakCard}>
        <Text style={styles.streakEmoji}>🔥</Text>
        <Text style={styles.streakNumber}>{s.currentStreak}</Text>
        <Text style={styles.streakLabel}>day streak</Text>
        <Text style={styles.bestStreak}>Best: {s.longestStreak} days</Text>
      </View>

      {/* Level Card */}
      <View style={styles.levelCard}>
        <Text style={styles.levelText}>Level {s.level}</Text>
        <View style={styles.xpBar}>
          <View style={[styles.xpFill, { width: `${xpPercent}%` }]} />
        </View>
        <Text style={styles.xpText}>{s.xp} / {xpForNext} XP</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>✅</Text>
          <Text style={styles.statNumber}>{s.totalTasksCompleted}</Text>
          <Text style={styles.statLabel}>Tasks done</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>🍅</Text>
          <Text style={styles.statNumber}>{s.progress.focusSessionsCompleted}</Text>
          <Text style={styles.statLabel}>Pomodoros</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>📝</Text>
          <Text style={styles.statNumber}>{s.progress.tasksAdded}</Text>
          <Text style={styles.statLabel}>Tasks added</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>🏆</Text>
          <Text style={styles.statNumber}>{s.level}</Text>
          <Text style={styles.statLabel}>Level</Text>
        </View>
      </View>

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
    streakCard: {
      backgroundColor: '#6366f1',
      borderRadius: 20,
      padding: 24,
      alignItems: 'center',
      marginBottom: 16,
    },
    streakEmoji: {
      fontSize: 48,
      marginBottom: 8,
    },
    streakNumber: {
      fontSize: 64,
      fontWeight: '800',
      color: '#fff',
    },
    streakLabel: {
      fontSize: 18,
      color: '#e0e7ff',
      marginBottom: 8,
    },
    bestStreak: {
      fontSize: 14,
      color: '#c7d2fe',
    },
    levelCard: {
      backgroundColor: isDark ? '#1e293b' : '#fff',
      borderRadius: 16,
      padding: 20,
      alignItems: 'center',
      marginBottom: 16,
    },
    levelText: {
      fontSize: 18,
      fontWeight: '700',
      color: isDark ? '#fff' : '#0f172a',
      marginBottom: 12,
    },
    xpBar: {
      width: '100%',
      height: 8,
      backgroundColor: isDark ? '#374151' : '#e5e7eb',
      borderRadius: 4,
      overflow: 'hidden',
      marginBottom: 8,
    },
    xpFill: {
      height: '100%',
      backgroundColor: '#6366f1',
      borderRadius: 4,
    },
    xpText: {
      fontSize: 13,
      color: isDark ? '#9ca3af' : '#6b7280',
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    statCard: {
      width: '48%',
      backgroundColor: isDark ? '#1e293b' : '#fff',
      borderRadius: 16,
      padding: 20,
      alignItems: 'center',
      marginBottom: 12,
    },
    statEmoji: {
      fontSize: 28,
      marginBottom: 8,
    },
    statNumber: {
      fontSize: 28,
      fontWeight: '700',
      color: isDark ? '#fff' : '#0f172a',
    },
    statLabel: {
      fontSize: 12,
      color: isDark ? '#9ca3af' : '#6b7280',
      marginTop: 4,
    },
  });
