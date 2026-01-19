'use client';

/**
 * Dashboard Error Boundary
 * Wraps dashboard content with error handling
 */

import { type ReactNode } from 'react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface DashboardErrorBoundaryProps {
  children: ReactNode;
}

function DashboardErrorFallback() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-xl">Oops! Something went wrong</CardTitle>
          <CardDescription className="mt-2">
            Don&apos;t worry - your data is safe. This is just a temporary glitch.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3">
          <Button onClick={handleRefresh} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Page
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function DashboardErrorBoundary({ children }: DashboardErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={<DashboardErrorFallback />}
      onError={(error, errorInfo) => {
        // In production, you could send this to an error tracking service
        console.error('[Dashboard Error]', error.message, errorInfo.componentStack);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
