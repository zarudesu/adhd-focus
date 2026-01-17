'use client';

/**
 * FeatureGate - Component that gates UI behind feature unlocks
 *
 * Usage:
 * <FeatureGate feature="priority">
 *   <PrioritySelector />
 * </FeatureGate>
 *
 * Options:
 * - feature: The feature code to check
 * - fallback: What to render if locked (default: nothing)
 * - showLocked: Show a "locked" indicator instead of hiding
 * - onUnlockClick: Callback when user clicks locked state
 */

import { type ReactNode } from 'react';
import { useFeatures } from '@/hooks/useFeatures';
import { type FeatureCode } from '@/db/schema';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureGateProps {
  feature: FeatureCode;
  children: ReactNode;
  fallback?: ReactNode;
  showLocked?: boolean;
  lockedMessage?: string;
  className?: string;
  onUnlockClick?: () => void;
}

export function FeatureGate({
  feature,
  children,
  fallback = null,
  showLocked = false,
  lockedMessage,
  className,
  onUnlockClick,
}: FeatureGateProps) {
  const { isUnlocked, loading, features } = useFeatures();

  // While loading, show nothing to prevent flash
  if (loading) {
    return null;
  }

  // If unlocked, render children
  if (isUnlocked(feature)) {
    return <>{children}</>;
  }

  // If locked and showLocked is true, show locked indicator
  if (showLocked) {
    const featureInfo = features.find((f) => f.code === feature);
    const message = lockedMessage || `Unlock at Level ${featureInfo?.unlockLevel || '?'}`;

    return (
      <div
        className={cn(
          'relative flex items-center justify-center rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 p-4 cursor-pointer hover:bg-muted/30 transition-colors',
          className
        )}
        onClick={onUnlockClick}
        title={message}
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Lock className="h-5 w-5" />
          <span className="text-xs text-center">{message}</span>
        </div>
      </div>
    );
  }

  // Otherwise render fallback (default: nothing)
  return <>{fallback}</>;
}

// Inline version for smaller UI elements
interface FeatureGateInlineProps {
  feature: FeatureCode;
  children: ReactNode;
  fallback?: ReactNode;
}

export function FeatureGateInline({
  feature,
  children,
  fallback = null,
}: FeatureGateInlineProps) {
  const { isUnlocked, loading } = useFeatures();

  if (loading) return null;
  if (isUnlocked(feature)) return <>{children}</>;
  return <>{fallback}</>;
}

// Hook version for more complex logic
export function useIsFeatureUnlocked(feature: FeatureCode): {
  isUnlocked: boolean;
  loading: boolean;
  unlockLevel?: number;
} {
  const { isUnlocked, loading, features } = useFeatures();
  const featureInfo = features.find((f) => f.code === feature);

  return {
    isUnlocked: isUnlocked(feature),
    loading,
    unlockLevel: featureInfo?.unlockLevel,
  };
}
