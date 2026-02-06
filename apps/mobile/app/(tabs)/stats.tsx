import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, useColorScheme, ScrollView,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { api } from '../../lib/api-client';

interface GamificationStats {
  level: number;
  xp: number;
  xpForNext: number;
  currentStreak: number;
  longestStreak: number;
  totalTasksCompleted: number;
  totalPomodoros: number;
  totalFocusMinutes: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  unlockedAt?: string;
}

export default function StatsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = createStyles(isDark);

  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [statsData, achievementsData] = await Promise.all([
        api.get<GamificationStats>('/gamification/stats'),
        api.get<Achievement[]>('/gamification/achievements'),
      ]);
      setStats(statsData);
      setAchievements(achievementsData.slice(0, 5));
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
    xpForNext: 100,
    currentStreak: 0,
    longestStreak: 0,
    totalTasksCompleted: 0,
    totalPomodoros: 0,
    totalFocusMinutes: 0,
  };

  const xpPercent = Math.min((s.xp / s.xpForNext) * 100, 100);

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
        <Text style={styles.xpText}>{s.xp} / {s.xpForNext} XP</Text>
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
          <Text style={styles.statNumber}>{s.totalPomodoros}</Text>
          <Text style={styles.statLabel}>Pomodoros</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>⏱️</Text>
          <Text style={styles.statNumber}>{s.totalFocusMinutes}m</Text>
          <Text style={styles.statLabel}>Focus time</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>🏆</Text>
          <Text style={styles.statNumber}>{s.level}</Text>
          <Text style={styles.statLabel}>Level</Text>
        </View>
      </View>

      {/* Achievements */}
      {achievements.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Achievements</Text>
          {achievements.map((achievement) => (
            <View key={achievement.id} style={styles.achievement}>
              <Text style={styles.achievementEmoji}>{achievement.emoji}</Text>
              <View style={styles.achievementContent}>
                <Text style={styles.achievementTitle}>{achievement.name}</Text>
                <Text style={styles.achievementDesc}>{achievement.description}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
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
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: isDark ? '#9ca3af' : '#6b7280',
      marginBottom: 12,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    achievement: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#1e293b' : '#fff',
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
    },
    achievementEmoji: {
      fontSize: 32,
      marginRight: 16,
    },
    achievementContent: {
      flex: 1,
    },
    achievementTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? '#fff' : '#0f172a',
    },
    achievementDesc: {
      fontSize: 14,
      color: isDark ? '#9ca3af' : '#6b7280',
      marginTop: 2,
    },
  });
