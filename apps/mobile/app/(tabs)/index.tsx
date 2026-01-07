import { View, Text, StyleSheet, Pressable, useColorScheme, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { STATUS_LABELS, ENERGY_LABELS } from '@adhd-focus/shared';

export default function TodayScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const styles = createStyles(isDark);

  // Placeholder tasks - will come from store
  const todayTasks = [
    { id: '1', title: 'Review project proposal', energy_required: 'high' as const, estimated_minutes: 30 },
    { id: '2', title: 'Reply to emails', energy_required: 'low' as const, estimated_minutes: 15 },
    { id: '3', title: 'Prepare presentation', energy_required: 'medium' as const, estimated_minutes: 45 },
  ];

  const currentTask = todayTasks[0];

  return (
    <ScrollView style={styles.container}>
      {/* Streak Banner */}
      <View style={styles.streakBanner}>
        <Text style={styles.streakEmoji}>🔥</Text>
        <Text style={styles.streakText}>3 day streak!</Text>
      </View>

      {/* Focus Card - Main task */}
      <Pressable
        style={styles.focusCard}
        onPress={() => router.push('/focus')}
      >
        <View style={styles.focusHeader}>
          <Text style={styles.focusLabel}>Focus on this:</Text>
          <View style={[styles.energyBadge, { backgroundColor: ENERGY_LABELS[currentTask.energy_required].color + '20' }]}>
            <Text>{ENERGY_LABELS[currentTask.energy_required].emoji}</Text>
          </View>
        </View>
        <Text style={styles.focusTitle}>{currentTask.title}</Text>
        <View style={styles.focusFooter}>
          <Text style={styles.focusTime}>~{currentTask.estimated_minutes}m</Text>
          <View style={styles.startButton}>
            <Ionicons name="play" size={16} color="#fff" />
            <Text style={styles.startButtonText}>Start Focus</Text>
          </View>
        </View>
      </Pressable>

      {/* Other tasks */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {STATUS_LABELS.today.emoji} Also today ({todayTasks.length - 1} more)
        </Text>
        {todayTasks.slice(1).map((task) => (
          <View key={task.id} style={styles.taskCard}>
            <View style={styles.taskContent}>
              <Pressable style={styles.checkbox}>
                <Ionicons name="ellipse-outline" size={22} color={isDark ? '#6b7280' : '#9ca3af'} />
              </Pressable>
              <Text style={styles.taskTitle}>{task.title}</Text>
            </View>
            <Text style={styles.taskMeta}>
              {ENERGY_LABELS[task.energy_required].emoji} {task.estimated_minutes}m
            </Text>
          </View>
        ))}
      </View>

      {/* Quick Add */}
      <Pressable style={styles.addButton}>
        <Ionicons name="add" size={24} color="#6366f1" />
        <Text style={styles.addButtonText}>Add task for today</Text>
      </Pressable>
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
    streakBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? '#2d2d44' : '#fff',
      padding: 12,
      borderRadius: 12,
      marginBottom: 16,
    },
    streakEmoji: {
      fontSize: 20,
      marginRight: 8,
    },
    streakText: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? '#fff' : '#1a1a2e',
    },
    focusCard: {
      backgroundColor: isDark ? '#1a1a2e' : '#fff',
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
      borderWidth: 2,
      borderColor: '#6366f1',
    },
    focusHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    focusLabel: {
      fontSize: 14,
      color: '#6366f1',
      fontWeight: '500',
    },
    energyBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    focusTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: isDark ? '#fff' : '#1a1a2e',
      marginBottom: 16,
    },
    focusFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    focusTime: {
      fontSize: 14,
      color: isDark ? '#9ca3af' : '#6b7280',
    },
    startButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#6366f1',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 10,
    },
    startButtonText: {
      color: '#fff',
      fontWeight: '600',
      marginLeft: 6,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? '#9ca3af' : '#6b7280',
      marginBottom: 12,
    },
    taskCard: {
      backgroundColor: isDark ? '#1a1a2e' : '#fff',
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    taskContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    checkbox: {
      marginRight: 12,
    },
    taskTitle: {
      fontSize: 16,
      color: isDark ? '#fff' : '#1a1a2e',
      flex: 1,
    },
    taskMeta: {
      fontSize: 12,
      color: isDark ? '#6b7280' : '#9ca3af',
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: isDark ? '#2d2d44' : '#e5e5e5',
      borderStyle: 'dashed',
    },
    addButtonText: {
      marginLeft: 8,
      fontSize: 16,
      color: '#6366f1',
      fontWeight: '500',
    },
  });
