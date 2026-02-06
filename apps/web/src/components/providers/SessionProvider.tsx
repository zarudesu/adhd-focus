'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- React 18/19 type mismatch between next-auth and app
  return <NextAuthSessionProvider>{children as any}</NextAuthSessionProvider>;
}
