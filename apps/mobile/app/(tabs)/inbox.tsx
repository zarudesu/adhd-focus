import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  Pressable,
  FlatList,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTasks } from '../../hooks/useTasks';
import { useUIStore } from '../../store/uiStore';
import { InboxProcessor } from '../../components';
import { ENERGY_CONFIG } from '../../lib/utils';

export default function InboxScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = createStyles(isDark);

  const [isProcessing, setIsProcessing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { inboxTasks, loading, fetch, tasks } = useTasks();
  const { openQuickCapture } = useUIStore();
  const taskCount = inboxTasks.length;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetch();
    setRefreshing(false);
  }, [fetch]);

  // Warning levels
  const getWarningLevel = () => {
    if (taskCount >= 20) return 'critical';
    if (taskCount >= 10) return 'warning';
    if (taskCount >= 5) return 'info';
    return null;
  };

  const warningLevel = getWarningLevel();

  if (loading && tasks.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (taskCount === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📥</Text>
          <Text style={styles.emptyTitle}>Inbox is empty</Text>
          <Text style={styles.emptySubtitle}>
            Dump your thoughts here, then process them during your planning session.
          </Text>
          <Pressable style={styles.addButton} onPress={openQuickCapture}>
            <Ionicons name="add" size={24} color="#fff" />
            <Text style={styles.addButtonText}>Quick capture</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {warningLevel && (
        <View style={[styles.warningBanner, warningLevel === 'critical' && styles.warningCritical, warningLevel === 'warning' && styles.warningWarn, warningLevel === 'info' && styles.warningInfo]}>
          <Ionicons
            name={warningLevel === 'critical' ? 'alert-circle' : 'information-circle'}
            size={18}
            color={warningLevel === 'critical' ? '#ef4444' : warningLevel === 'warning' ? '#f59e0b' : '#6366f1'}
          />
          <Text style={[styles.warningText, warningLevel === 'critical' && { color: '#ef4444' }, warningLevel === 'warning' && { color: '#d97706' }, warningLevel === 'info' && { color: '#6366f1' }]}>
            {warningLevel === 'critical'
              ? `${taskCount} items! Time to process.`
              : warningLevel === 'warning'
              ? `${taskCount} items piling up`
              : `${taskCount} items to process`}
          </Text>
        </View>
      )}

      <Pressable style={styles.processButton} onPress={() => setIsProcessing(true)}>
        <Ionicons name="flash" size={20} color="#fff" />
        <Text style={styles.processButtonText}>Process all ({taskCount})</Text>
        <Text style={styles.processTime}>~{Math.ceil(taskCount * 0.5)} min</Text>
      </Pressable>

      <Text style={styles.listHeader}>Or pick one:</Text>
      <FlatList
        data={inboxTasks}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />
        }
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <View style={styles.taskDot} />
            <Text style={styles.taskTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.taskMeta}>
              {item.energyRequired ? ENERGY_CONFIG[item.energyRequired]?.emoji : ''}
            </Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        visible={isProcessing}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setIsProcessing(false)}
      >
        <InboxProcessor onClose={() => { setIsProcessing(false); fetch(); }} />
      </Modal>
    </View>
  );
}

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#0f172a' : '#f5f5f5',
      padding: 16,
    },
    warningBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 12,
      marginBottom: 16,
      gap: 8,
    },
    warningInfo: {
      backgroundColor: isDark ? '#1e1b4b' : '#eef2ff',
    },
    warningWarn: {
      backgroundColor: isDark ? '#422006' : '#fef3c7',
    },
    warningCritical: {
      backgroundColor: isDark ? '#450a0a' : '#fee2e2',
    },
    warningText: {
      flex: 1,
      fontSize: 14,
      fontWeight: '500',
    },
    processButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#6366f1',
      padding: 16,
      borderRadius: 14,
      marginBottom: 20,
      gap: 8,
    },
    processButtonText: {
      color: '#fff',
      fontSize: 17,
      fontWeight: '600',
    },
    processTime: {
      color: 'rgba(255,255,255,0.7)',
      fontSize: 14,
    },
    listHeader: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? '#9ca3af' : '#6b7280',
      marginBottom: 12,
    },
    listContent: {
      paddingBottom: 100,
    },
    taskItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#1e293b' : '#ffffff',
      padding: 14,
      borderRadius: 12,
      marginBottom: 8,
    },
    taskDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: isDark ? '#4b5563' : '#d1d5db',
      marginRight: 12,
    },
    taskTitle: {
      flex: 1,
      fontSize: 15,
      color: isDark ? '#ffffff' : '#0f172a',
    },
    taskMeta: {
      fontSize: 14,
      marginLeft: 8,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    emptyEmoji: {
      fontSize: 64,
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: isDark ? '#fff' : '#0f172a',
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 16,
      color: isDark ? '#9ca3af' : '#6b7280',
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 24,
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#6366f1',
      paddingHorizontal: 24,
      paddingVertical: 14,
      borderRadius: 12,
    },
    addButtonText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 16,
      marginLeft: 8,
    },
  });
