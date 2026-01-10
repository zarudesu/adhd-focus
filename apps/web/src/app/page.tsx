import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Timer, Zap, Inbox, Target } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-2">
          <Timer className="h-6 w-6" />
          <span className="text-xl font-bold">ADHD Focus</span>
        </div>
        <nav className="flex gap-2">
          <Button variant="ghost" asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Sign up</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Task management for ADHD minds
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Simple. Focused. No overwhelm. Get things done with a system
            designed for how your brain actually works.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/signup">Get started free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">I already have an account</Link>
            </Button>
          </div>
        </div>

        <div className="mt-20 grid gap-8 sm:grid-cols-3 max-w-4xl">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <Target className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="text-lg font-medium mb-2">1 thing at a time</div>
            <p className="text-muted-foreground text-sm">
              Focus on what matters now. No endless lists.
            </p>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <Zap className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="text-lg font-medium mb-2">Energy matching</div>
            <p className="text-muted-foreground text-sm">
              Tasks tagged by energy level. Low, medium, or high.
            </p>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <Inbox className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="text-lg font-medium mb-2">Instant capture</div>
            <p className="text-muted-foreground text-sm">
              Quick add. Process later. Never lose an idea.
            </p>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-muted-foreground">
        Built for ADHD, by someone who gets it.
      </footer>
    </div>
  );
}
