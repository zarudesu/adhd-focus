'use client';

/**
 * Re-Authentication Modal
 * Shown when user unlocks Projects to verify account ownership
 * Preparation for email verification in future
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Loader2, Shield, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReAuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userEmail: string;
  onVerified: () => void;
}

export function ReAuthModal({
  open,
  onOpenChange,
  userEmail,
  onVerified,
}: ReAuthModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/verify-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Verification failed');
        return;
      }

      // Success
      onVerified();
      onOpenChange(false);
      setPassword('');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />

          {/* Modal content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{
              type: 'spring',
              damping: 20,
              stiffness: 300,
            }}
            className={cn(
              'relative z-20 w-full max-w-sm rounded-xl border bg-card p-6',
              'shadow-lg'
            )}
          >
            {/* Close button */}
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-3 right-3 p-1 rounded-md hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>

            {/* Content */}
            <div className="text-center">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: 'spring',
                  damping: 12,
                  stiffness: 200,
                  delay: 0.1,
                }}
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"
              >
                <Shield className="h-8 w-8 text-primary" />
              </motion.div>

              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-xl font-semibold mb-2">
                  Verify your account
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  To unlock Projects, please confirm your password.
                  This helps keep your tasks secure.
                </p>
              </motion.div>

              {/* Form */}
              <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4 text-left"
              >
                {error && (
                  <motion.div
                    className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg flex items-center gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="reauth-email">Email</Label>
                  <Input
                    id="reauth-email"
                    type="email"
                    value={userEmail}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reauth-password">Password</Label>
                  <Input
                    id="reauth-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    autoFocus
                    disabled={isLoading}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify & Continue'
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  This is a one-time verification for your security.
                </p>
              </motion.form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
