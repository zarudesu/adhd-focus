import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { EnergyLevel } from '../../types';
import type { Duration, ProcessingAction, ProcessingState, ProcessingCardProps } from './types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;
const SWIPE_VELOCITY = 500;

const SPRING_CONFIG = {
  damping: 20,
  stiffness: 200,
};

export function ProcessingCard({ task, onAction, totalCount, currentIndex }: ProcessingCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = createStyles(isDark);

  const [duration, setDuration] = useState<Duration | null>(null);
  const [energy, setEnergy] = useState<EnergyLevel | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [firstStep, setFirstStep] = useState('');

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const cardOpacity = useSharedValue(1);

  const getState = (): ProcessingState => ({
    duration: duration || 'long', // Default to long if skipped
    energy: energy || 'medium',
    projectId,
    firstStep,
  });

  const triggerAction = async (action: ProcessingAction) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    onAction(action, getState());
  };

  const animateOut = (action: ProcessingAction, direction: 'left' | 'right' | 'up' | 'down') => {
    const animations: Record<string, { x: number; y: number }> = {
      left: { x: -SCREEN_WIDTH, y: 0 },
      right: { x: SCREEN_WIDTH, y: 0 },
      up: { x: 0, y: -600 },
      down: { x: 0, y: 600 },
    };

    const target = animations[direction];
    translateX.value = withTiming(target.x, { duration: 200 });
    translateY.value = withTiming(target.y, { duration: 200 });
    cardOpacity.value = withTiming(0, { duration: 150 }, () => {
      runOnJS(triggerAction)(action);
    });
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      const { translationX, translationY, velocityX, velocityY } = event;

      // Determine swipe direction
      const absX = Math.abs(translationX);
      const absY = Math.abs(translationY);

      if (absX > absY) {
        // Horizontal swipe
        if (translationX > SWIPE_THRESHOLD || velocityX > SWIPE_VELOCITY) {
          // Right → Today
          runOnJS(animateOut)('today', 'right');
          return;
        } else if (translationX < -SWIPE_THRESHOLD || velocityX < -SWIPE_VELOCITY) {
          // Left → Someday
          runOnJS(animateOut)('someday', 'left');
          return;
        }
      } else {
        // Vertical swipe
        if (translationY < -SWIPE_THRESHOLD || velocityY < -SWIPE_VELOCITY) {
          // Up → Schedule
          runOnJS(animateOut)('schedule', 'up');
          return;
        } else if (translationY > SWIPE_THRESHOLD || velocityY > SWIPE_VELOCITY) {
          // Down → Delete
          runOnJS(animateOut)('delete', 'down');
          return;
        }
      }

      // Snap back
      translateX.value = withSpring(0, SPRING_CONFIG);
      translateY.value = withSpring(0, SPRING_CONFIG);
    });

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      [-15, 0, 15],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
      opacity: cardOpacity.value,
    };
  });

  // Swipe hint indicators
  const rightHintStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0, 1], Extrapolation.CLAMP),
  }));

  const leftHintStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, -SWIPE_THRESHOLD], [0, 1], Extrapolation.CLAMP),
  }));

  const upHintStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [0, -SWIPE_THRESHOLD], [0, 1], Extrapolation.CLAMP),
  }));

  const downHintStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [0, SWIPE_THRESHOLD], [0, 1], Extrapolation.CLAMP),
  }));

  return (
    <View style={styles.container}>
      {/* Swipe hints */}
      <Animated.View style={[styles.hintRight, rightHintStyle]}>
        <Ionicons name="sunny" size={32} color="#22c55e" />
        <Text style={styles.hintTextRight}>Today</Text>
      </Animated.View>

      <Animated.View style={[styles.hintLeft, leftHintStyle]}>
        <Ionicons name="moon" size={32} color="#6b7280" />
        <Text style={styles.hintTextLeft}>Someday</Text>
      </Animated.View>

      <Animated.View style={[styles.hintUp, upHintStyle]}>
        <Ionicons name="calendar" size={32} color="#3b82f6" />
        <Text style={styles.hintTextUp}>Schedule</Text>
      </Animated.View>

      <Animated.View style={[styles.hintDown, downHintStyle]}>
        <Ionicons name="trash" size={32} color="#ef4444" />
        <Text style={styles.hintTextDown}>Delete</Text>
      </Animated.View>

      {/* Card */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.card, cardStyle]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.counter}>
              {currentIndex + 1} / {totalCount}
            </Text>
            <View style={styles.randomBadge}>
              <Ionicons name="shuffle" size={14} color={isDark ? '#9ca3af' : '#6b7280'} />
            </View>
          </View>

          {/* Task title */}
          <Text style={styles.title}>{task.title}</Text>

          {/* Duration picker */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>How long?</Text>
            <View style={styles.buttonRow}>
              <Pressable
                style={[styles.optionButton, duration === 'quick' && styles.optionButtonActive]}
                onPress={() => setDuration('quick')}
              >
                <Text style={styles.optionEmoji}>⚡</Text>
                <Text style={[styles.optionText, duration === 'quick' && styles.optionTextActive]}>
                  Quick
                </Text>
                <Text style={styles.optionHint}>&lt;15m</Text>
              </Pressable>

              <Pressable
                style={[styles.optionButton, duration === 'long' && styles.optionButtonActive]}
                onPress={() => setDuration('long')}
              >
                <Text style={styles.optionEmoji}>🏔</Text>
                <Text style={[styles.optionText, duration === 'long' && styles.optionTextActive]}>
                  Long
                </Text>
                <Text style={styles.optionHint}>15m+</Text>
              </Pressable>
            </View>
          </View>

          {/* Energy picker */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Energy needed?</Text>
            <View style={styles.buttonRow}>
              <Pressable
                style={[styles.energyButton, energy === 'low' && styles.energyButtonLow]}
                onPress={() => setEnergy('low')}
              >
                <Text style={styles.energyEmoji}>🔋</Text>
                <Text style={[styles.energyText, energy === 'low' && styles.energyTextActive]}>
                  Low
                </Text>
              </Pressable>

              <Pressable
                style={[styles.energyButton, energy === 'medium' && styles.energyButtonMed]}
                onPress={() => setEnergy('medium')}
              >
                <Text style={styles.energyEmoji}>⚡</Text>
                <Text style={[styles.energyText, energy === 'medium' && styles.energyTextActive]}>
                  Med
                </Text>
              </Pressable>

              <Pressable
                style={[styles.energyButton, energy === 'high' && styles.energyButtonHigh]}
                onPress={() => setEnergy('high')}
              >
                <Text style={styles.energyEmoji}>🔥</Text>
                <Text style={[styles.energyText, energy === 'high' && styles.energyTextActive]}>
                  High
                </Text>
              </Pressable>
            </View>
          </View>

          {/* First step */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>First tiny step?</Text>
            <TextInput
              style={styles.firstStepInput}
              placeholder="e.g., Open the document..."
              placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
              value={firstStep}
              onChangeText={setFirstStep}
              maxLength={100}
            />
          </View>

          {/* Swipe hints */}
          <View style={styles.swipeHints}>
            <Text style={styles.swipeHintText}>
              ← Someday • Today → • ↑ Schedule • ↓ Delete
            </Text>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
    },
    card: {
      width: SCREEN_WIDTH - 32,
      backgroundColor: isDark ? '#1a1a2e' : '#ffffff',
      borderRadius: 20,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 10,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    counter: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? '#9ca3af' : '#6b7280',
    },
    randomBadge: {
      padding: 4,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: isDark ? '#ffffff' : '#1a1a2e',
      marginBottom: 24,
      lineHeight: 30,
    },
    section: {
      marginBottom: 20,
    },
    sectionLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? '#9ca3af' : '#6b7280',
      marginBottom: 10,
    },
    buttonRow: {
      flexDirection: 'row',
      gap: 10,
    },
    optionButton: {
      flex: 1,
      backgroundColor: isDark ? '#2d2d44' : '#f5f5f5',
      borderRadius: 12,
      padding: 14,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    optionButtonActive: {
      borderColor: '#6366f1',
      backgroundColor: isDark ? '#3d3d5c' : '#eef2ff',
    },
    optionEmoji: {
      fontSize: 20,
      marginBottom: 4,
    },
    optionText: {
      fontSize: 15,
      fontWeight: '600',
      color: isDark ? '#ffffff' : '#1a1a2e',
    },
    optionTextActive: {
      color: '#6366f1',
    },
    optionHint: {
      fontSize: 12,
      color: isDark ? '#6b7280' : '#9ca3af',
      marginTop: 2,
    },
    energyButton: {
      flex: 1,
      backgroundColor: isDark ? '#2d2d44' : '#f5f5f5',
      borderRadius: 12,
      padding: 12,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    energyButtonLow: {
      borderColor: '#6b7280',
      backgroundColor: isDark ? '#374151' : '#f3f4f6',
    },
    energyButtonMed: {
      borderColor: '#f59e0b',
      backgroundColor: isDark ? '#422006' : '#fef3c7',
    },
    energyButtonHigh: {
      borderColor: '#ef4444',
      backgroundColor: isDark ? '#450a0a' : '#fee2e2',
    },
    energyEmoji: {
      fontSize: 18,
      marginBottom: 2,
    },
    energyText: {
      fontSize: 13,
      fontWeight: '600',
      color: isDark ? '#ffffff' : '#1a1a2e',
    },
    energyTextActive: {
      fontWeight: '700',
    },
    firstStepInput: {
      backgroundColor: isDark ? '#2d2d44' : '#f5f5f5',
      borderRadius: 12,
      padding: 14,
      fontSize: 15,
      color: isDark ? '#ffffff' : '#1a1a2e',
    },
    swipeHints: {
      marginTop: 8,
      alignItems: 'center',
    },
    swipeHintText: {
      fontSize: 12,
      color: isDark ? '#4b5563' : '#9ca3af',
    },
    // Hint overlays
    hintRight: {
      position: 'absolute',
      right: 40,
      top: '45%',
      alignItems: 'center',
    },
    hintLeft: {
      position: 'absolute',
      left: 40,
      top: '45%',
      alignItems: 'center',
    },
    hintUp: {
      position: 'absolute',
      top: 60,
      alignSelf: 'center',
      alignItems: 'center',
    },
    hintDown: {
      position: 'absolute',
      bottom: 60,
      alignSelf: 'center',
      alignItems: 'center',
    },
    hintTextRight: {
      color: '#22c55e',
      fontWeight: '700',
      marginTop: 4,
    },
    hintTextLeft: {
      color: '#6b7280',
      fontWeight: '700',
      marginTop: 4,
    },
    hintTextUp: {
      color: '#3b82f6',
      fontWeight: '700',
      marginTop: 4,
    },
    hintTextDown: {
      color: '#ef4444',
      fontWeight: '700',
      marginTop: 4,
    },
  });
