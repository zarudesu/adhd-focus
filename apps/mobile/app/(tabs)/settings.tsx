import { View, Text, StyleSheet, useColorScheme, ScrollView, Pressable, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = createStyles(isDark);

  const [showOnlyOne, setShowOnlyOne] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [morningReminder, setMorningReminder] = useState(true);

  return (
    <ScrollView style={styles.container}>
      {/* Focus Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Focus Settings</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Show only one task</Text>
            <Text style={styles.settingDesc}>Hide other tasks during focus</Text>
          </View>
          <Switch
            value={showOnlyOne}
            onValueChange={setShowOnlyOne}
            trackColor={{ false: '#3e3e3e', true: '#6366f1' }}
          />
        </View>

        <Pressable style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Pomodoro duration</Text>
            <Text style={styles.settingDesc}>25 minutes</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={isDark ? '#6b7280' : '#9ca3af'} />
        </Pressable>

        <Pressable style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Daily task limit</Text>
            <Text style={styles.settingDesc}>3 tasks maximum</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={isDark ? '#6b7280' : '#9ca3af'} />
        </Pressable>
      </View>

      {/* Notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Enable notifications</Text>
            <Text style={styles.settingDesc}>Reminders and updates</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#3e3e3e', true: '#6366f1' }}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Morning planning reminder</Text>
            <Text style={styles.settingDesc}>Remind to plan your day at 9:00 AM</Text>
          </View>
          <Switch
            value={morningReminder}
            onValueChange={setMorningReminder}
            trackColor={{ false: '#3e3e3e', true: '#6366f1' }}
          />
        </View>
      </View>

      {/* Account */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>

        <Pressable style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Sign in</Text>
            <Text style={styles.settingDesc}>Sync your data across devices</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={isDark ? '#6b7280' : '#9ca3af'} />
        </Pressable>

        <Pressable style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Export data</Text>
            <Text style={styles.settingDesc}>Download your tasks as JSON</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={isDark ? '#6b7280' : '#9ca3af'} />
        </Pressable>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Version</Text>
          <Text style={styles.settingDesc}>0.0.1</Text>
        </View>
      </View>
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
    section: {
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? '#9ca3af' : '#6b7280',
      marginBottom: 12,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: isDark ? '#1a1a2e' : '#fff',
      padding: 16,
      borderRadius: 12,
      marginBottom: 8,
    },
    settingInfo: {
      flex: 1,
      marginRight: 16,
    },
    settingLabel: {
      fontSize: 16,
      fontWeight: '500',
      color: isDark ? '#fff' : '#1a1a2e',
    },
    settingDesc: {
      fontSize: 14,
      color: isDark ? '#6b7280' : '#9ca3af',
      marginTop: 2,
    },
  });
