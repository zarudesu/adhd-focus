import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="text-lg font-bold">
                ADHD Focus
              </Link>
              <nav className="flex gap-4">
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
                >
                  Today
                </Link>
                <Link
                  href="/dashboard/inbox"
                  className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
                >
                  Inbox
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-zinc-500">{user.email}</span>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="text-sm text-zinc-600 hover:text-zinc-900"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
