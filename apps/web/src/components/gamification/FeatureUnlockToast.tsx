'use client';

/**
 * Feature Unlock Toast
 * Subtle mid-session notification when a feature unlocks.
 * Calm acknowledgment — full celebration in morning review.
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureUnlockToastData {
  code: string;
  name: string;
}

interface FeatureUnlockToastProps {
  feature: FeatureUnlockToastData;
  onClose: () => void;
}

function FeatureUnlockToast({ feature, onClose }: FeatureUnlockToastProps) {
  const [isExiting, setIsExiting] = useState(false);
  const isMountedRef = useRef(true);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const handleClose = useCallback(() => {
    if (!isMountedRef.current) return;
    setIsExiting(true);
    setTimeout(() => {
      if (isMountedRef.current) {
        onCloseRef.current();
      }
    }, 200);
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    const closeTimer = setTimeout(() => handleClose(), 3000);
    return () => {
      isMountedRef.current = false;
      clearTimeout(closeTimer);
    };
  }, [handleClose]);

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-[100] max-w-sm',
        isExiting ? 'animate-slide-out-right' : 'animate-slide-in-right'
      )}
    >
      <div className="relative overflow-hidden rounded-lg border border-border bg-card shadow-lg">
        <div className="p-3 flex items-center gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {feature.name} unlocked
            </p>
          </div>
          <button
            onClick={handleClose}
            className="flex-shrink-0 p-1 rounded hover:bg-muted transition-colors"
          >
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
        <div className="h-0.5 bg-muted">
          <div
            className="h-full bg-primary/50 animate-shrink-width"
            style={{ animationDuration: '3s' }}
          />
        </div>
      </div>
    </div>
  );
}

interface FeatureUnlockToastStackProps {
  features: FeatureUnlockToastData[];
  onDismiss: (code: string) => void;
}

export function FeatureUnlockToastStack({ features, onDismiss }: FeatureUnlockToastStackProps) {
  if (features.length === 0) return null;
  const current = features[0];
  return (
    <FeatureUnlockToast
      key={current.code}
      feature={current}
      onClose={() => onDismiss(current.code)}
    />
  );
}
