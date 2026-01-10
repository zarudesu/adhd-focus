'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signInWithOAuth, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = await signIn(email, password);
    if (result.error) {
      setError(result.error.message);
    } else {
      router.push('/dashboard');
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    const result = await signInWithOAuth(provider);
    if (result.error) {
      setError(result.error.message);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="block text-center text-xl font-bold mb-8">
          ADHD Focus
        </Link>

        <h1 className="text-2xl font-bold text-center mb-8">Welcome back</h1>

        {error && (
          <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-zinc-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-zinc-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              onClick={() => handleOAuth('google')}
              className="flex items-center justify-center px-4 py-2.5 border border-zinc-300 rounded-lg hover:bg-zinc-50"
            >
              Google
            </button>
            <button
              onClick={() => handleOAuth('github')}
              className="flex items-center justify-center px-4 py-2.5 border border-zinc-300 rounded-lg hover:bg-zinc-50"
            >
              GitHub
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-zinc-600">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-medium text-zinc-900 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
