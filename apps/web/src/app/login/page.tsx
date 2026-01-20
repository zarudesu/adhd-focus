'use client';

import { Suspense, useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { authenticate, type AuthState } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, AlertCircle } from 'lucide-react';
import { BeatLogo } from '@/components/brand/BeatLogo';

// Animation variants for staggered children
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 30 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 20,
      delay: 0.1,
    },
  },
};

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard/hub';
  const urlError = searchParams.get('error');

  const [state, formAction, isPending] = useActionState<AuthState | undefined, FormData>(
    authenticate,
    undefined
  );

  const errorMessage = state?.error || (urlError === 'CredentialsSignin' ? 'Invalid credentials' : urlError);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12 overflow-hidden">
      {/* Animated logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <Link href="/" className="flex items-center gap-3 mb-8">
          <BeatLogo size="sm" />
          <span className="text-xl font-bold">beatyour8</span>
        </Link>
      </motion.div>

      {/* Animated card */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="show"
        className="w-full max-w-sm"
      >
        <Card className="overflow-hidden">
          <CardHeader className="text-center">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              <motion.div variants={itemVariants}>
                <CardTitle className="text-2xl">Welcome back</CardTitle>
              </motion.div>
              <motion.div variants={itemVariants}>
                <CardDescription className="mt-2">Sign in to your account</CardDescription>
              </motion.div>
            </motion.div>
          </CardHeader>

          <CardContent>
            {errorMessage && (
              <motion.div
                className="mb-4 p-3 text-sm text-destructive bg-destructive/10 rounded-lg flex items-center gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: [0, -5, 5, -5, 5, 0] }}
                transition={{ x: { duration: 0.4 } }}
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {errorMessage}
              </motion.div>
            )}

            <motion.form
              action={formAction}
              className="space-y-4"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              <input type="hidden" name="redirectTo" value={callbackUrl} />

              <motion.div className="space-y-2" variants={itemVariants}>
                <Label htmlFor="email">Email</Label>
                <motion.div
                  whileFocus={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="email@example.com"
                    required
                    autoComplete="email"
                    disabled={isPending}
                    className="transition-shadow focus:shadow-lg focus:shadow-primary/10"
                  />
                </motion.div>
              </motion.div>

              <motion.div className="space-y-2" variants={itemVariants}>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/reset-password"
                    className="text-sm text-muted-foreground hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <motion.div
                  whileFocus={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    minLength={8}
                    disabled={isPending}
                    className="transition-shadow focus:shadow-lg focus:shadow-primary/10"
                  />
                </motion.div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign in'
                    )}
                  </Button>
                </motion.div>
              </motion.div>
            </motion.form>

            <motion.div
              className="my-6 flex items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Separator className="flex-1" />
              <span className="px-3 text-sm text-muted-foreground">
                Or continue with
              </span>
              <Separator className="flex-1" />
            </motion.div>

            <motion.form
              action="/api/auth/signin/google"
              method="POST"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <input type="hidden" name="callbackUrl" value={callbackUrl} />
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button variant="outline" className="w-full" type="submit">
                  Continue with Google
                </Button>
              </motion.div>
            </motion.form>
          </CardContent>

          <CardFooter className="justify-center">
            <motion.p
              className="text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-medium hover:underline">
                Sign up
              </Link>
            </motion.p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
