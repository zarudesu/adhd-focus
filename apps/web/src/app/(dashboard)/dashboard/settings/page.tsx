'use client';

import { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useProfile } from "@/hooks/useProfile";
import Link from "next/link";
import {
  ChevronRight,
  Bell,
  Palette,
  Timer,
  Zap,
  Loader2,
  LogOut,
  Save,
  Moon,
  Sun,
  Monitor,
  Home,
} from "lucide-react";
import { useFeatures } from "@/hooks/useFeatures";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "next-themes";

// Landing page options with their nav feature codes
const LANDING_PAGE_OPTIONS = [
  { value: 'inbox', label: 'Inbox', featureCode: 'nav_inbox' },
  { value: 'today', label: 'Today', featureCode: 'nav_today' },
  { value: 'scheduled', label: 'Scheduled', featureCode: 'nav_scheduled' },
  { value: 'projects', label: 'Projects', featureCode: 'nav_projects' },
  { value: 'completed', label: 'Completed', featureCode: 'nav_completed' },
] as const;

export default function SettingsPage() {
  const { profile, loading, error, saving, update, updatePreference } = useProfile();
  const { navFeatures, loading: featuresLoading } = useFeatures();
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState<string>('');

  // Initialize name when profile loads
  useEffect(() => {
    if (profile?.name) {
      setName(profile.name);
    }
  }, [profile?.name]);

  const handleSaveName = async () => {
    if (!name.trim()) return;
    await update({ name: name.trim() });
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  if (loading) {
    return (
      <>
        <PageHeader title="Settings" description="Customize your experience" />
        <main className="flex-1 p-4">
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader title="Settings" description="Customize your experience" />
        <main className="flex-1 p-4">
          <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
            {error.message}
          </div>
        </main>
      </>
    );
  }

  const prefs = profile?.preferences;

  return (
    <>
      <PageHeader
        title="Settings"
        description="Customize your experience"
        actions={
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        }
      />
      <main className="flex-1 p-4">
        <div className="max-w-2xl space-y-6">
          {/* Profile */}
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <div className="flex gap-2">
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <Button
                    onClick={handleSaveName}
                    disabled={saving || name === profile?.name}
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  className="bg-muted"
                />
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Customize how the app works for you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Pomodoro Duration */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Timer className="h-4 w-4" />
                    Pomodoro Duration
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Focus session length in minutes
                  </p>
                </div>
                <Input
                  type="number"
                  className="w-20"
                  min={1}
                  max={120}
                  value={prefs?.defaultPomodoroMinutes || 25}
                  onChange={(e) =>
                    updatePreference('defaultPomodoroMinutes', parseInt(e.target.value) || 25)
                  }
                />
              </div>

              <Separator />

              {/* Daily WIP Limit */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Daily WIP Limit
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Maximum tasks per day (ADHD friendly!)
                  </p>
                </div>
                <Input
                  type="number"
                  className="w-20"
                  min={1}
                  max={20}
                  value={prefs?.maxDailyTasks || 3}
                  onChange={(e) =>
                    updatePreference('maxDailyTasks', parseInt(e.target.value) || 3)
                  }
                />
              </div>

              <Separator />

              {/* Theme */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Theme
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred appearance
                  </p>
                </div>
                <Select
                  value={theme || 'dark'}
                  onValueChange={(value: string) => setTheme(value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        Light
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        Dark
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        System
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Notifications */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Break reminders and alerts
                  </p>
                </div>
                <Switch
                  checked={prefs?.enableNotifications ?? true}
                  onCheckedChange={(checked) =>
                    updatePreference('enableNotifications', checked)
                  }
                />
              </div>

              <Separator />

              {/* Reduce Animations */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Reduce Animations</Label>
                  <p className="text-sm text-muted-foreground">
                    Calmer, minimal motion
                  </p>
                </div>
                <Switch
                  checked={prefs?.reduceAnimations ?? false}
                  onCheckedChange={(checked) =>
                    updatePreference('reduceAnimations', checked)
                  }
                />
              </div>

              <Separator />

              {/* Default Landing Page */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Default Page
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Where to go after login
                  </p>
                </div>
                <Select
                  value={prefs?.defaultLandingPage || 'inbox'}
                  onValueChange={(value: 'inbox' | 'today' | 'scheduled' | 'projects' | 'completed') =>
                    updatePreference('defaultLandingPage', value)
                  }
                  disabled={featuresLoading}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANDING_PAGE_OPTIONS.map((option) => {
                      const feature = navFeatures.find(f => f.code === option.featureCode);
                      const isUnlocked = feature?.isUnlocked ?? (option.value === 'inbox');

                      if (!isUnlocked) return null;

                      return (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Integrations Link */}
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>Connect external services</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/settings/integrations">
                <Button variant="outline" className="w-full justify-between">
                  Manage Integrations
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
              <CardDescription>Your productivity overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{profile?.currentStreak || 0}</p>
                  <p className="text-sm text-muted-foreground">Current Streak</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{profile?.longestStreak || 0}</p>
                  <p className="text-sm text-muted-foreground">Longest Streak</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{profile?.totalTasksCompleted || 0}</p>
                  <p className="text-sm text-muted-foreground">Tasks Completed</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{profile?.totalPomodoros || 0}</p>
                  <p className="text-sm text-muted-foreground">Pomodoros</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Export Data</p>
                  <p className="text-sm text-muted-foreground">
                    Download all your data
                  </p>
                </div>
                <Button variant="outline">Export</Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Delete Account</p>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and data
                  </p>
                </div>
                <Button variant="destructive">Delete</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
