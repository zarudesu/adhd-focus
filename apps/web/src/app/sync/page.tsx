'use client';

/**
 * Sync Page
 * Syncs pending tasks from localStorage to API after registration
 * Then redirects to dashboard
 */

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, Check } from 'lucide-react';
import { getPendingTasks, clearPendingTasks, hasPendingTasks } from '@/lib/pending-tasks';

export default function SyncPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'syncing' | 'done' | 'error'>('syncing');
  const [syncedCount, setSyncedCount] = useState(0);
  const syncStarted = useRef(false);

  useEffect(() => {
    // Prevent double invocation in React strict mode
    if (syncStarted.current) return;
    syncStarted.current = true;

    async function syncTasks() {
      // No pending tasks? Just redirect
      if (!hasPendingTasks()) {
        router.replace('/dashboard/hub');
        return;
      }

      // Get and immediately clear to prevent duplicates
      const tasks = getPendingTasks();
      clearPendingTasks();

      let successCount = 0;

      try {
        // Sync each task
        for (const task of tasks) {
          const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: task.title,
              status: 'inbox',
            }),
          });

          if (response.ok) {
            successCount++;
            setSyncedCount(successCount);
          }
        }

        setStatus('done');

        // Short delay to show success, then redirect
        setTimeout(() => {
          router.replace('/dashboard/hub');
        }, 1500);
      } catch {
        setStatus('error');
        // Still redirect on error
        setTimeout(() => {
          router.replace('/dashboard/hub');
        }, 2000);
      }
    }

    syncTasks();
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {status === 'syncing' && (
          <>
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <h1 className="mt-4 text-xl font-semibold">Syncing your thoughts...</h1>
            <p className="mt-2 text-muted-foreground">
              {syncedCount > 0 ? `${syncedCount} task${syncedCount !== 1 ? 's' : ''} saved` : 'Please wait'}
            </p>
          </>
        )}

        {status === 'done' && (
          <>
            <div className="mx-auto h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
              <Check className="h-6 w-6 text-success" />
            </div>
            <h1 className="mt-4 text-xl font-medium">Done.</h1>
            <p className="mt-2 text-muted-foreground">
              {syncedCount} thought{syncedCount !== 1 ? 's' : ''} saved
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <h1 className="mt-4 text-xl font-semibold">Something went wrong</h1>
            <p className="mt-2 text-muted-foreground">
              Don&apos;t worry, redirecting to your inbox...
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
