import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, useColorScheme, FlatList,
  ActivityIndicator, RefreshControl, Pressable,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { projectsApi } from '../../api/projects';
import { tasksApi } from '../../api';
import { ENERGY_CONFIG } from '../../lib/utils';
import type { Project } from '../../types';
import type { Task } from '../../types';

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = createStyles(isDark);

  const [project, setProject] = useState<(Project & { tasks: Task[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProject = useCallback(async () => {
    if (!id) return;
    try {
      const data = await projectsApi.get(id);
      setProject(data);
    } catch (err) {
      console.error('Failed to fetch project:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProject();
    setRefreshing(false);
  }, [fetchProject]);

  const handleComplete = async (taskId: string) => {
    await tasksApi.update(taskId, { status: 'done', completedAt: new Date().toISOString() });
    await fetchProject();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!project) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Project not found</Text>
      </View>
    );
  }

  const activeTasks = project.tasks.filter((t) => t.status !== 'done');
  const completedTasks = project.tasks.filter((t) => t.status === 'done');

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: `${project.emoji || '📁'} ${project.name}`,
        }}
      />

      <FlatList
        data={activeTasks}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />
        }
        ListHeaderComponent={
          project.description ? (
            <Text style={styles.description}>{project.description}</Text>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.taskCard}>
            <Pressable style={styles.checkbox} onPress={() => handleComplete(item.id)}>
              <Ionicons name="ellipse-outline" size={22} color={isDark ? '#6b7280' : '#9ca3af'} />
            </Pressable>
            <Text style={styles.taskTitle} numberOfLines={2}>{item.title}</Text>
            {item.energyRequired && (
              <Text style={styles.taskMeta}>
                {ENERGY_CONFIG[item.energyRequired].emoji}
              </Text>
            )}
          </View>
        )}
        ListFooterComponent={
          completedTasks.length > 0 ? (
            <View style={styles.completedSection}>
              <Text style={styles.completedHeader}>
                Completed ({completedTasks.length})
              </Text>
              {completedTasks.map((task) => (
                <View key={task.id} style={styles.taskCard}>
                  <Ionicons name="checkmark-circle" size={22} color="#6366f1" />
                  <Text style={[styles.taskTitle, styles.completedTitle]} numberOfLines={2}>
                    {task.title}
                  </Text>
                </View>
              ))}
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={[styles.center, { paddingTop: 60 }]}>
            <Text style={styles.emptyText}>No tasks in this project</Text>
          </View>
        }
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
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
      justifyContent: 'center',
      alignItems: 'center',
    },
    description: {
      fontSize: 15,
      color: isDark ? '#9ca3af' : '#6b7280',
      marginBottom: 16,
      lineHeight: 22,
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
    checkbox: {},
    taskTitle: {
      fontSize: 15,
      color: isDark ? '#fff' : '#0f172a',
      flex: 1,
    },
    completedTitle: {
      textDecorationLine: 'line-through',
      color: isDark ? '#6b7280' : '#9ca3af',
    },
    taskMeta: {
      fontSize: 14,
    },
    completedSection: {
      marginTop: 24,
    },
    completedHeader: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? '#9ca3af' : '#6b7280',
      marginBottom: 10,
    },
    emptyText: {
      fontSize: 16,
      color: isDark ? '#6b7280' : '#9ca3af',
    },
    errorText: {
      fontSize: 16,
      color: '#ef4444',
    },
  });
