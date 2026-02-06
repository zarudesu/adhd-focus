import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useUIStore } from '../../store/uiStore';
import { useTaskStore } from '../../store/taskStore';
import { tasksApi } from '../../api';

const SPRING_CONFIG = {
  damping: 20,
  stiffness: 200,
};

export function QuickCaptureModal() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { isQuickCaptureOpen, closeQuickCapture } = useUIStore();
  const { addTask, getInboxTasks } = useTaskStore();

  const [title, setTitle] = useState('');
  const inputRef = useRef<TextInput>(null);

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(100);

  const inboxCount = getInboxTasks().length;

  useEffect(() => {
    if (isQuickCaptureOpen) {
      opacity.value = withTiming(1, { duration: 200 });
      translateY.value = withSpring(0, SPRING_CONFIG);
      // Focus input after animation
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      opacity.value = withTiming(0, { duration: 150 });
      translateY.value = withTiming(100, { duration: 150 });
      setTitle('');
      Keyboard.dismiss();
    }
  }, [isQuickCaptureOpen]);

  const handleAdd = async (keepOpen = false) => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    // Haptic feedback
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics not available
    }

    try {
      const task = await tasksApi.create({ title: trimmedTitle });
      addTask(task);
    } catch {
      // Silently fail — will sync on next fetch
    }
    setTitle('');

    if (!keepOpen) {
      closeQuickCapture();
    } else {
      inputRef.current?.focus();
    }
  };

  const handleSubmit = () => {
    handleAdd(false);
  };

  const handleBackdropPress = () => {
    if (title.trim()) {
      // Save before closing if there's text
      handleAdd(false);
    } else {
      closeQuickCapture();
    }
  };

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const styles = createStyles(isDark);

  if (!isQuickCaptureOpen) return null;

  return (
    <View style={styles.container}>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable style={styles.backdropPressable} onPress={handleBackdropPress} />
      </Animated.View>

      {/* Modal */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <Animated.View style={[styles.modal, modalStyle]}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={closeQuickCapture} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={isDark ? '#9ca3af' : '#6b7280'} />
            </Pressable>
            <Text style={styles.headerTitle}>Quick Add</Text>
            <View style={styles.closeButton} />
          </View>

          {/* Input */}
          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="What's on your mind?"
              placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
              value={title}
              onChangeText={setTitle}
              onSubmitEditing={handleSubmit}
              returnKeyType="done"
              autoCapitalize="sentences"
              autoCorrect
              multiline={false}
              maxLength={200}
            />
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Text style={styles.hint}>
              <Ionicons name="information-circle-outline" size={14} /> Just capture, process later
            </Text>
            <Pressable
              style={[styles.addButton, !title.trim() && styles.addButtonDisabled]}
              onPress={() => handleAdd(false)}
              disabled={!title.trim()}
            >
              <Text style={styles.addButtonText}>Add to Inbox</Text>
              {inboxCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{inboxCount}</Text>
                </View>
              )}
            </Pressable>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 999,
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    backdropPressable: {
      flex: 1,
    },
    keyboardView: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    modal: {
      backgroundColor: isDark ? '#1a1a2e' : '#ffffff',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingBottom: Platform.OS === 'ios' ? 40 : 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 10,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
    },
    closeButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: '600',
      color: isDark ? '#ffffff' : '#1a1a2e',
    },
    inputContainer: {
      paddingHorizontal: 20,
      paddingVertical: 12,
    },
    input: {
      fontSize: 18,
      color: isDark ? '#ffffff' : '#1a1a2e',
      backgroundColor: isDark ? '#2d2d44' : '#f5f5f5',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      minHeight: 52,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 8,
    },
    hint: {
      fontSize: 13,
      color: isDark ? '#6b7280' : '#9ca3af',
      flex: 1,
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#6366f1',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 10,
    },
    addButtonDisabled: {
      backgroundColor: isDark ? '#3d3d5c' : '#d1d5db',
    },
    addButtonText: {
      color: '#ffffff',
      fontSize: 15,
      fontWeight: '600',
    },
    badge: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: 10,
      paddingHorizontal: 6,
      paddingVertical: 2,
      marginLeft: 8,
    },
    badgeText: {
      color: '#ffffff',
      fontSize: 12,
      fontWeight: '600',
    },
  });
