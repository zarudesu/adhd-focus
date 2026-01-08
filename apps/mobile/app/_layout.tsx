import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme, View, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QuickCaptureFAB, QuickCaptureModal } from '../components';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: isDark ? '#1a1a2e' : '#ffffff',
          },
          headerTintColor: isDark ? '#ffffff' : '#1a1a2e',
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: isDark ? '#16213e' : '#f5f5f5',
          },
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="focus"
          options={{
            title: 'Focus Mode',
            presentation: 'fullScreenModal',
          }}
        />
      </Stack>

      {/* Global Quick Capture */}
      <QuickCaptureFAB />
      <QuickCaptureModal />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
