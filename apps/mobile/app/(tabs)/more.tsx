import { View, Text, StyleSheet, useColorScheme, ScrollView, Pressable } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  route: string;
  color: string;
}

const MENU_ITEMS: MenuItem[] = [
  { icon: 'timer', title: 'Focus Mode', subtitle: 'Pomodoro timer', route: '/focus', color: '#6366f1' },
  { icon: 'checkbox', title: 'Checklist', subtitle: 'Daily habits', route: '/checklist', color: '#22c55e' },
  { icon: 'checkmark-done', title: 'Completed', subtitle: 'All finished tasks', route: '/completed', color: '#10b981' },
  { icon: 'trophy', title: 'Achievements', subtitle: 'Unlocked badges', route: '/achievements', color: '#eab308' },
  { icon: 'paw', title: 'Creatures', subtitle: 'Your collection', route: '/creatures', color: '#a855f7' },
  { icon: 'stats-chart', title: 'Statistics', subtitle: 'Streak, level, XP', route: '/(tabs)/stats', color: '#3b82f6' },
  { icon: 'settings', title: 'Settings', subtitle: 'Profile and preferences', route: '/(tabs)/settings', color: '#6b7280' },
];

export default function MoreScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = createStyles(isDark);
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      {MENU_ITEMS.map((item) => (
        <Pressable
          key={item.route}
          style={styles.menuItem}
          onPress={() => router.push(item.route as Href)}
        >
          <View style={[styles.iconCircle, { backgroundColor: item.color + '20' }]}>
            <Ionicons name={item.icon} size={22} color={item.color} />
          </View>
          <View style={styles.menuText}>
            <Text style={styles.menuTitle}>{item.title}</Text>
            <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={isDark ? '#6b7280' : '#9ca3af'} />
        </Pressable>
      ))}
    </ScrollView>
  );
}

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#0f172a' : '#f5f5f5',
      padding: 16,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#1e293b' : '#fff',
      borderRadius: 14,
      padding: 16,
      marginBottom: 10,
    },
    iconCircle: {
      width: 44,
      height: 44,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 14,
    },
    menuText: {
      flex: 1,
    },
    menuTitle: {
      fontSize: 17,
      fontWeight: '600',
      color: isDark ? '#fff' : '#0f172a',
    },
    menuSubtitle: {
      fontSize: 13,
      color: isDark ? '#9ca3af' : '#6b7280',
      marginTop: 2,
    },
  });
