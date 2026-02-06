import { View, Text, StyleSheet, useColorScheme, ScrollView, Pressable, Switch, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth-context';
import { api } from '../../lib/api-client';

interface User {
  id: string;
  name: string;
  email: string;
  preferences?: {
    pomodoroMinutes?: number;
    dailyTaskLimit?: number;
    notificationsEnabled?: boolean;
  };
}

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = createStyles(isDark);
  const { user: authUser, signOut } = useAuth();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [preferences, setPreferences] = useState({
    pomodoroMinutes: 25,
    dailyTaskLimit: 3,
    notificationsEnabled: true,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await api.get<User>('/profile');
      setUser(data);
      if (data.preferences) {
        setPreferences({
          pomodoroMinutes: data.preferences.pomodoroMinutes || 25,
          dailyTaskLimit: data.preferences.dailyTaskLimit || 3,
          notificationsEnabled: data.preferences.notificationsEnabled !== false,
        });
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (key: keyof typeof preferences, value: any) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    setUpdating(true);

    try {
      await api.post('/profile', { preferences: updated });
    } catch (err) {
      console.error('Failed to update preferences:', err);
      // Revert on error
      setPreferences(preferences);
      Alert.alert('Error', 'Failed to update preferences');
    } finally {
      setUpdating(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <View style={styles.settingRow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {(user?.name || authUser?.email || '?')[0].toUpperCase()}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || authUser?.name || 'User'}</Text>
            <Text style={styles.profileEmail}>{user?.email || authUser?.email || ''}</Text>
          </View>
        </View>
      </View>

      {/* Focus Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Focus Settings</Text>

        <Pressable style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Pomodoro duration</Text>
            <Text style={styles.settingDesc}>{preferences.pomodoroMinutes} minutes</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={isDark ? '#6b7280' : '#9ca3af'} />
        </Pressable>

        <Pressable style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Daily task limit</Text>
            <Text style={styles.settingDesc}>{preferences.dailyTaskLimit} tasks maximum</Text>
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
            value={preferences.notificationsEnabled}
            onValueChange={(value) => updatePreferences('notificationsEnabled', value)}
            trackColor={{ false: '#3e3e3e', true: '#6366f1' }}
            disabled={updating}
          />
        </View>
      </View>

      {/* Account */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>

        <Pressable style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.signOutText}>Sign Out</Text>
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
      backgroundColor: isDark ? '#0f172a' : '#f5f5f5',
      padding: 16,
    },
    section: {
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 13,
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
      backgroundColor: isDark ? '#1e293b' : '#fff',
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
      color: isDark ? '#fff' : '#0f172a',
    },
    settingDesc: {
      fontSize: 14,
      color: isDark ? '#6b7280' : '#9ca3af',
      marginTop: 2,
    },
    avatarCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: '#6366f1',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 14,
    },
    avatarText: {
      color: '#fff',
      fontSize: 20,
      fontWeight: '700',
    },
    profileInfo: {
      flex: 1,
    },
    profileName: {
      fontSize: 17,
      fontWeight: '600',
      color: isDark ? '#fff' : '#0f172a',
    },
    profileEmail: {
      fontSize: 14,
      color: isDark ? '#9ca3af' : '#6b7280',
      marginTop: 2,
    },
    signOutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#1e293b' : '#fff',
      padding: 16,
      borderRadius: 12,
      gap: 10,
    },
    signOutText: {
      color: '#ef4444',
      fontSize: 16,
      fontWeight: '500',
    },
  });
