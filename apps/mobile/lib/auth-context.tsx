import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { api, APIError } from './api-client';
import type { AuthResponse, User } from '../types';

interface AuthContextValue {
  user: AuthResponse['user'] | null;
  profile: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponse['user'] | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const init = async () => {
      try {
        const token = await api.loadToken();
        if (token) {
          // Validate token by fetching profile
          const data = await api.get<User>('/profile');
          setProfile(data);
          setUser({
            id: data.id,
            email: data.email,
            name: data.name,
            level: data.level ?? 1,
            xp: data.xp ?? 0,
            currentStreak: data.currentStreak ?? 0,
            longestStreak: data.longestStreak ?? 0,
            totalTasksCompleted: data.totalTasksCompleted ?? 0,
            pomodoroWorkMinutes: data.preferences?.defaultPomodoroMinutes ?? 25,
            pomodoroShortBreak: data.preferences?.defaultBreakMinutes ?? 5,
            pomodoroLongBreak: data.preferences?.longBreakMinutes ?? 15,
            wipLimit: data.preferences?.maxDailyTasks ?? 3,
          });
        }
      } catch {
        // Token expired or invalid
        await api.clearToken();
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const data = await api.post<AuthResponse>('/mobile/auth/login', {
        email,
        password,
      });
      await api.saveToken(data.token);
      setUser(data.user);
      // Fetch full profile
      const profileData = await api.get<User>('/profile');
      setProfile(profileData);
      return { error: null };
    } catch (err) {
      const message = err instanceof APIError ? err.message : 'Login failed';
      return { error: message };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, name?: string) => {
    try {
      const data = await api.post<AuthResponse>('/mobile/auth/register', {
        email,
        password,
        name,
      });
      await api.saveToken(data.token);
      setUser(data.user);
      const profileData = await api.get<User>('/profile');
      setProfile(profileData);
      return { error: null };
    } catch (err) {
      const message = err instanceof APIError ? err.message : 'Registration failed';
      return { error: message };
    }
  }, []);

  const signOut = useCallback(async () => {
    await api.clearToken();
    setUser(null);
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const data = await api.get<User>('/profile');
      setProfile(data);
    } catch {
      // Ignore
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAuthenticated: !!user,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
