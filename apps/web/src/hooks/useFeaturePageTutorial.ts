'use client';

/**
 * Feature Page Tutorial Hook
 * Call on feature page mount to check if tutorial should show
 *
 * Usage:
 * const { showTutorial, tutorial, dismiss } = useFeaturePageTutorial('nav_today');
 *
 * if (showTutorial) {
 *   return <FeatureTutorial featureCode="nav_today" tutorial={tutorial} onComplete={dismiss} />;
 * }
 */

import { useState, useEffect, useCallback } from 'react';
import { type TutorialContent } from '@/lib/feature-tutorials';

interface UseFeaturePageTutorialReturn {
  showTutorial: boolean;
  tutorial: TutorialContent | null;
  dismiss: () => void;
  loading: boolean;
}

export function useFeaturePageTutorial(featureCode: string): UseFeaturePageTutorialReturn {
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorial, setTutorial] = useState<TutorialContent | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if this is first open on mount
  useEffect(() => {
    let mounted = true;

    async function checkFirstOpen() {
      try {
        const res = await fetch(`/api/features/${featureCode}/opened`, {
          method: 'POST',
        });

        if (!res.ok) {
          setLoading(false);
          return;
        }

        const data = await res.json();

        if (mounted) {
          if (data.isFirstOpen && data.tutorial) {
            setShowTutorial(true);
            setTutorial(data.tutorial);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('Error checking feature first open:', err);
        if (mounted) {
          setLoading(false);
        }
      }
    }

    checkFirstOpen();

    return () => {
      mounted = false;
    };
  }, [featureCode]);

  const dismiss = useCallback(() => {
    setShowTutorial(false);
  }, []);

  return {
    showTutorial,
    tutorial,
    dismiss,
    loading,
  };
}
