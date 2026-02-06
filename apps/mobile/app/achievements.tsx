import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, useColorScheme, FlatList,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { api } from '../lib/api-client';

interface AchievementItem {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  xpReward: number;
  isUnlocked: boolean;
  unlockedAt: string | null;
  progress: { current: number; target: number } | null;
}

interface AchievementsData {
  achievements: AchievementItem[];
  stats: { total: number; unlocked: number };
}

export default function AchievementsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = createStyles(isDark);

  const [data, setData] = useState<AchievementsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const result = await api.get<AchievementsData>('/gamification/achievements');
      setData(result);
    } catch (err) {
      console.error('Failed to fetch achievements:', err);
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
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  const achievements = data?.achievements || [];
  const unlocked = achievements.filter((a) => a.isUnlocked);
  const locked = achievements.filter((a) => !a.isUnlocked);

  return (
    <FlatList
      style={styles.container}
      data={[...unlocked, ...locked]}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />
      }
      ListHeaderComponent={
        <View style={styles.headerCard}>
          <Text style={styles.headerEmoji}>🏆</Text>
          <Text style={styles.headerText}>
            {data?.stats.unlocked || 0} / {data?.stats.total || 0} unlocked
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={[styles.card, !item.isUnlocked && styles.cardLocked]}>
          <Text style={styles.icon}>{item.icon}</Text>
          <View style={styles.info}>
            <Text style={[styles.name, !item.isUnlocked && styles.nameLocked]}>
              {item.name}
            </Text>
            <Text style={styles.description}>{item.description}</Text>
            {item.progress && !item.isUnlocked && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.min(
                          (item.progress.current / item.progress.target) * 100,
                          100
                        )}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {item.progress.current}/{item.progress.target}
                </Text>
              </View>
            )}
          </View>
          {item.isUnlocked && <Text style={styles.xpBadge}>+{item.xpReward} XP</Text>}
        </View>
      )}
      contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
    />
  );
}

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: isDark ? '#0f172a' : '#f5f5f5' },
    center: { justifyContent: 'center', alignItems: 'center' },
    headerCard: {
      backgroundColor: '#6366f1',
      borderRadius: 16,
      padding: 24,
      alignItems: 'center',
      marginBottom: 20,
    },
    headerEmoji: { fontSize: 40, marginBottom: 8 },
    headerText: { fontSize: 18, fontWeight: '700', color: '#fff' },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#1e293b' : '#fff',
      borderRadius: 12,
      padding: 14,
      marginBottom: 8,
    },
    cardLocked: { opacity: 0.5 },
    icon: { fontSize: 28, marginRight: 14 },
    info: { flex: 1 },
    name: { fontSize: 16, fontWeight: '600', color: isDark ? '#fff' : '#0f172a' },
    nameLocked: { color: isDark ? '#6b7280' : '#9ca3af' },
    description: {
      fontSize: 13,
      color: isDark ? '#9ca3af' : '#6b7280',
      marginTop: 2,
    },
    progressContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8 },
    progressBar: {
      flex: 1,
      height: 4,
      backgroundColor: isDark ? '#374151' : '#e5e7eb',
      borderRadius: 2,
      overflow: 'hidden',
    },
    progressFill: { height: '100%', backgroundColor: '#6366f1', borderRadius: 2 },
    progressText: { fontSize: 11, color: isDark ? '#6b7280' : '#9ca3af' },
    xpBadge: {
      backgroundColor: '#6366f120',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      fontSize: 12,
      fontWeight: '600',
      color: '#6366f1',
    },
  });
