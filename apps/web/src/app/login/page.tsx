'use client';

import { Suspense, useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
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
import { Timer, Loader2, AlertCircle } from 'lucide-react';

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const urlError = searchParams.get('error');

  const [state, formAction, isPending] = useActionState<AuthState | undefined, FormData>(
    authenticate,
    undefined
  );

  const errorMessage = state?.error || (urlError === 'CredentialsSignin' ? 'Invalid credentials' : urlError);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <Timer className="h-6 w-6" />
        <span className="text-xl font-bold">ADHD Focus</span>
      </Link>

      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>

        <CardContent>
          {errorMessage && (
            <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {errorMessage}
            </div>
          )}

          <form action={formAction} className="space-y-4">
            <input type="hidden" name="redirectTo" value={callbackUrl} />

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="email@example.com"
                required
                autoComplete="email"
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/reset-password"
                  className="text-sm text-muted-foreground hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                minLength={8}
                disabled={isPending}
              />
            </div>

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
          </form>

          <div className="my-6 flex items-center">
            <Separator className="flex-1" />
            <span className="px-3 text-sm text-muted-foreground">
              Or continue with
            </span>
            <Separator className="flex-1" />
          </div>

          <form action="/api/auth/signin/google" method="POST">
            <input type="hidden" name="callbackUrl" value={callbackUrl} />
            <Button variant="outline" className="w-full" type="submit">
              Continue with Google
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
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
