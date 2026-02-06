import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, useColorScheme, FlatList,
  ActivityIndicator, RefreshControl, Pressable,
} from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProjects } from '../../hooks/useProjects';
import type { Project } from '../../types';

export default function ProjectsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = createStyles(isDark);
  const router = useRouter();

  const { projects, loading, fetch } = useProjects();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetch();
    setRefreshing(false);
  }, [fetch]);

  if (loading && projects.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  const renderProject = ({ item }: { item: Project }) => {
    const total = (item.taskCount || 0);
    const completed = (item.completedCount || 0);
    const progress = total > 0 ? completed / total : 0;

    return (
      <Pressable
        style={styles.projectCard}
        onPress={() => router.push(`/projects/${item.id}` as Href)}
      >
        <View style={styles.projectHeader}>
          <Text style={styles.projectEmoji}>{item.emoji || '📁'}</Text>
          <View style={styles.projectInfo}>
            <Text style={styles.projectName}>{item.name}</Text>
            <Text style={styles.projectCount}>{total} tasks, {completed} done</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={isDark ? '#6b7280' : '#9ca3af'} />
        </View>
        {total > 0 && (
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: item.color || '#6366f1' }]} />
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={projects.filter((p) => !p.archived)}
        keyExtractor={(item) => item.id}
        renderItem={renderProject}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyEmoji}>📂</Text>
            <Text style={styles.emptyTitle}>No projects yet</Text>
            <Text style={styles.emptySubtitle}>Create a project to organize your tasks</Text>
          </View>
        }
      />
    </View>
  );
}

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#0f172a' : '#f5f5f5',
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 100,
    },
    listContent: {
      padding: 16,
      paddingBottom: 100,
    },
    projectCard: {
      backgroundColor: isDark ? '#1e293b' : '#fff',
      borderRadius: 14,
      padding: 16,
      marginBottom: 10,
    },
    projectHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    projectEmoji: {
      fontSize: 28,
      marginRight: 14,
    },
    projectInfo: {
      flex: 1,
    },
    projectName: {
      fontSize: 17,
      fontWeight: '600',
      color: isDark ? '#fff' : '#0f172a',
    },
    projectCount: {
      fontSize: 13,
      color: isDark ? '#9ca3af' : '#6b7280',
      marginTop: 2,
    },
    progressBar: {
      height: 4,
      backgroundColor: isDark ? '#374151' : '#e5e7eb',
      borderRadius: 2,
      marginTop: 12,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 2,
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
