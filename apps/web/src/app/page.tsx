import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <div className="text-xl font-bold">ADHD Focus</div>
        <nav className="flex gap-4">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800"
          >
            Sign up
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
            Task management for ADHD minds
          </h1>
          <p className="mt-6 text-lg text-zinc-600">
            Simple. Focused. No overwhelm. Get things done with a system
            designed for how your brain actually works.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-6 py-3 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800"
            >
              Get started free
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3 text-sm font-medium text-zinc-900 border border-zinc-300 rounded-lg hover:bg-zinc-50"
            >
              I already have an account
            </Link>
          </div>
        </div>

        <div className="mt-20 grid gap-8 sm:grid-cols-3 max-w-4xl">
          <div className="text-center">
            <div className="text-2xl mb-2">1 thing at a time</div>
            <p className="text-zinc-600 text-sm">
              Focus on what matters now. No endless lists.
            </p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">Energy matching</div>
            <p className="text-zinc-600 text-sm">
              Tasks tagged by energy level. Low, medium, or high.
            </p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">Instant capture</div>
            <p className="text-zinc-600 text-sm">
              Quick add. Process later. Never lose an idea.
            </p>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-zinc-500">
        Built for ADHD, by someone who gets it.
      </footer>
    </div>
  );
}
