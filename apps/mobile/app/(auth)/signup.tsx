import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { useAuth } from '../../lib/auth-context';

export default function SignupScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = createStyles(isDark);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isValid = email.trim() && password.length >= 6;

  const handleSignup = async () => {
    if (!isValid) return;
    setError(null);
    setLoading(true);
    try {
      const result = await signUp(
        email.trim().toLowerCase(),
        password,
        name.trim() || undefined
      );
      if (result.error) {
        setError(result.error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Start managing your tasks with less stress</Text>

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Name (optional)"
            placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoComplete="name"
            textContentType="name"
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
          />

          <TextInput
            style={styles.input}
            placeholder="Password (6+ characters)"
            placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
            onSubmitEditing={handleSignup}
          />

          <Pressable
            style={[styles.button, (!isValid || loading) && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={!isValid || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Pressable onPress={() => router.replace('/(auth)/login' as Href)}>
            <Text style={styles.linkText}>Sign In</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#0f172a' : '#ffffff',
    },
    inner: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 32,
    },
    title: {
      fontSize: 30,
      fontWeight: '800',
      color: isDark ? '#fff' : '#0f172a',
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: isDark ? '#9ca3af' : '#6b7280',
      textAlign: 'center',
      marginBottom: 40,
    },
    errorBanner: {
      backgroundColor: isDark ? '#450a0a' : '#fee2e2',
      padding: 12,
      borderRadius: 10,
      marginBottom: 16,
    },
    errorText: {
      color: '#ef4444',
      fontSize: 14,
      textAlign: 'center',
    },
    form: {
      gap: 14,
    },
    input: {
      backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: isDark ? '#fff' : '#0f172a',
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#e2e8f0',
    },
    button: {
      backgroundColor: '#6366f1',
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 4,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    buttonText: {
      color: '#fff',
      fontSize: 17,
      fontWeight: '600',
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 32,
      gap: 6,
    },
    footerText: {
      color: isDark ? '#9ca3af' : '#6b7280',
      fontSize: 15,
    },
    linkText: {
      color: '#6366f1',
      fontSize: 15,
      fontWeight: '600',
    },
  });
