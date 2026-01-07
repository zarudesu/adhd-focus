import { View, Text, StyleSheet, useColorScheme, ScrollView } from 'react-native';

export default function StatsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = createStyles(isDark);

  // Placeholder stats
  const stats = {
    currentStreak: 3,
    longestStreak: 14,
    tasksThisWeek: 12,
    pomodorosThisWeek: 8,
    focusMinutes: 200,
  };

  return (
    <ScrollView style={styles.container}>
      {/* Streak Card */}
      <View style={styles.streakCard}>
        <Text style={styles.streakEmoji}>🔥</Text>
        <Text style={styles.streakNumber}>{stats.currentStreak}</Text>
        <Text style={styles.streakLabel}>day streak</Text>
        <Text style={styles.bestStreak}>Best: {stats.longestStreak} days</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>✅</Text>
          <Text style={styles.statNumber}>{stats.tasksThisWeek}</Text>
          <Text style={styles.statLabel}>Tasks this week</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>🍅</Text>
          <Text style={styles.statNumber}>{stats.pomodorosThisWeek}</Text>
          <Text style={styles.statLabel}>Pomodoros</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>⏱️</Text>
          <Text style={styles.statNumber}>{stats.focusMinutes}m</Text>
          <Text style={styles.statLabel}>Focus time</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>🏆</Text>
          <Text style={styles.statNumber}>3</Text>
          <Text style={styles.statLabel}>Achievements</Text>
        </View>
      </View>

      {/* Achievements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Achievements</Text>
        <View style={styles.achievement}>
          <Text style={styles.achievementEmoji}>🎯</Text>
          <View style={styles.achievementContent}>
            <Text style={styles.achievementTitle}>First Step</Text>
            <Text style={styles.achievementDesc}>Completed your first task</Text>
          </View>
        </View>
        <View style={styles.achievement}>
          <Text style={styles.achievementEmoji}>🚀</Text>
          <View style={styles.achievementContent}>
            <Text style={styles.achievementTitle}>Getting Started</Text>
            <Text style={styles.achievementDesc}>3-day streak achieved!</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#16213e' : '#f5f5f5',
      padding: 16,
    },
    streakCard: {
      backgroundColor: '#6366f1',
      borderRadius: 20,
      padding: 24,
      alignItems: 'center',
      marginBottom: 20,
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
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    statCard: {
      width: '48%',
      backgroundColor: isDark ? '#1a1a2e' : '#fff',
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
      color: isDark ? '#fff' : '#1a1a2e',
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
      fontSize: 18,
      fontWeight: '700',
      color: isDark ? '#fff' : '#1a1a2e',
      marginBottom: 16,
    },
    achievement: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#1a1a2e' : '#fff',
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
      color: isDark ? '#fff' : '#1a1a2e',
    },
    achievementDesc: {
      fontSize: 14,
      color: isDark ? '#9ca3af' : '#6b7280',
      marginTop: 2,
    },
  });
