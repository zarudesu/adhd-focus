'use client';

/**
 * Route protection for locked features
 * Redirects to inbox if feature is not unlocked
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFeatures } from '@/hooks/useFeatures';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  /** The nav feature code to check (e.g., 'nav_projects', 'nav_creatures') */
  featureCode: string;
  /** Page content to render if feature is unlocked */
  children: React.ReactNode;
}

export function ProtectedRoute({ featureCode, children }: ProtectedRouteProps) {
  const router = useRouter();
  const { navFeatures, loading } = useFeatures();

  const feature = navFeatures.find(f => f.code === featureCode);
  const isUnlocked = feature?.isUnlocked ?? false;

  useEffect(() => {
    // Wait for loading to complete before redirecting
    if (!loading && !isUnlocked) {
      router.replace('/dashboard/inbox');
    }
  }, [loading, isUnlocked, router]);

  // Show loading state while checking features
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Don't render content if locked (redirect will happen in useEffect)
  if (!isUnlocked) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
