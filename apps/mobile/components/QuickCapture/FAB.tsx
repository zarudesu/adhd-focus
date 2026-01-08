import { Pressable, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useUIStore } from '../../store/uiStore';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SPRING_CONFIG = {
  damping: 15,
  stiffness: 150,
};

export function QuickCaptureFAB() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { isQuickCaptureOpen, toggleQuickCapture } = useUIStore();

  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const handlePressIn = () => {
    scale.value = withSpring(0.9, SPRING_CONFIG);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, SPRING_CONFIG);
  };

  const handlePress = () => {
    rotation.value = withTiming(isQuickCaptureOpen ? 0 : 45, { duration: 200 });
    toggleQuickCapture();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const styles = createStyles(isDark);

  return (
    <AnimatedPressable
      style={[styles.fab, animatedStyle]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityLabel="Quick add task"
      accessibilityRole="button"
    >
      <Ionicons name="add" size={28} color="#fff" />
    </AnimatedPressable>
  );
}

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    fab: {
      position: 'absolute',
      bottom: 100, // Above tab bar
      right: 20,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: '#6366f1',
      justifyContent: 'center',
      alignItems: 'center',
      // Shadow
      shadowColor: '#6366f1',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
      zIndex: 1000,
    },
  });
