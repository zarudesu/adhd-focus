import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, useColorScheme, FlatList,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { api } from '../lib/api-client';

interface CreatureItem {
  id: string;
  code: string;
  name: string;
  emoji: string;
  description: string;
  rarity: string;
  isCaught: boolean;
  count: number;
  firstCaughtAt: string | null;
}

interface CreaturesData {
  creatures: CreatureItem[];
  stats: { total: number; caught: number; totalCreaturesCaught: number };
}

const RARITY_COLORS: Record<string, string> = {
  common: '#9ca3af',
  uncommon: '#22c55e',
  rare: '#3b82f6',
  legendary: '#eab308',
  mythic: '#a855f7',
  secret: '#ec4899',
};

export default function CreaturesScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = createStyles(isDark);

  const [data, setData] = useState<CreaturesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const result = await api.get<CreaturesData>('/gamification/creatures');
      setData(result);
    } catch (err) {
      console.error('Failed to fetch creatures:', err);
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

  const creatures = data?.creatures || [];

  return (
    <FlatList
      style={styles.container}
      data={creatures}
      keyExtractor={(item) => item.id}
      numColumns={2}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />
      }
      ListHeaderComponent={
        <View style={styles.headerCard}>
          <Text style={styles.headerEmoji}>🐾</Text>
          <Text style={styles.headerText}>
            {data?.stats.caught || 0} / {data?.stats.total || 0} discovered
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={[styles.creatureCard, !item.isCaught && styles.cardLocked]}>
          <Text style={styles.creatureEmoji}>{item.isCaught ? item.emoji : '❓'}</Text>
          <Text style={styles.creatureName} numberOfLines={1}>
            {item.isCaught ? item.name : '???'}
          </Text>
          <View
            style={[
              styles.rarityBadge,
              { backgroundColor: (RARITY_COLORS[item.rarity] || '#6b7280') + '20' },
            ]}
          >
            <Text
              style={[styles.rarityText, { color: RARITY_COLORS[item.rarity] || '#6b7280' }]}
            >
              {item.rarity}
            </Text>
          </View>
          {item.count > 1 && <Text style={styles.countText}>x{item.count}</Text>}
        </View>
      )}
      columnWrapperStyle={{ gap: 10 }}
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
    creatureCard: {
      flex: 1,
      backgroundColor: isDark ? '#1e293b' : '#fff',
      borderRadius: 14,
      padding: 16,
      alignItems: 'center',
      marginBottom: 10,
    },
    cardLocked: { opacity: 0.4 },
    creatureEmoji: { fontSize: 36, marginBottom: 8 },
    creatureName: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? '#fff' : '#0f172a',
      marginBottom: 6,
    },
    rarityBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    rarityText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
    countText: { fontSize: 12, color: isDark ? '#9ca3af' : '#6b7280', marginTop: 4 },
  });
