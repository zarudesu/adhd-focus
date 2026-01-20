'use client';

/**
 * Level Up Modal
 * beatyour8 Brand: Calm acknowledgment
 *
 * Philosophy: Levels = trust, not status
 * Higher level = less UI, more freedom, calmer interface
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface LevelUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newLevel: number;
  unlockedFeatures?: string[];
}

// Feature names for display
const FEATURE_NAMES: Record<string, string> = {
  today: 'Today View',
  priority: 'Task Priority',
  energy: 'Energy Levels',
  projects: 'Projects',
  scheduled: 'Scheduled Tasks',
  description: 'Task Descriptions',
  quick_actions: 'Quick Actions',
  tags: 'Tags',
  focus_mode: 'Focus Mode',
  stats: 'Statistics',
  themes: 'Themes',
  settings: 'Settings',
  notifications: 'Notifications',
  advanced_stats: 'Advanced Statistics',
};

export function LevelUpModal({
  open,
  onOpenChange,
  newLevel,
  unlockedFeatures = [],
}: LevelUpModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader className="text-center">
          {/* Simple icon - no gradient, no animation */}
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
            <Check className="h-6 w-6 text-success" />
          </div>

          <DialogTitle className="text-lg font-medium">
            Level {newLevel}
          </DialogTitle>

          <DialogDescription className="text-sm text-muted-foreground">
            You&apos;ve built more trust with the system.
          </DialogDescription>
        </DialogHeader>

        {unlockedFeatures.length > 0 && (
          <div className="mt-3 rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground mb-2">
              Now available:
            </p>
            <ul className="space-y-1">
              {unlockedFeatures.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <span className="w-1 h-1 rounded-full bg-success" />
                  {FEATURE_NAMES[feature] || feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4 flex justify-center">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            size="sm"
          >
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
