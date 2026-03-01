import Link from 'next/link';
import { BeatLogo } from '@/components/brand/BeatLogo';

export function LegalPageLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#E5E7EB]">
      <header className="border-b border-white/10 px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center gap-4">
          <Link href="/">
            <BeatLogo size="sm" />
          </Link>
          <Link href="/" className="text-sm text-[#6B7280] hover:text-white transition-colors">
            &larr; Back
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="mb-8 text-2xl font-bold">{title}</h1>
        <div className="prose prose-invert prose-sm max-w-none
          prose-headings:text-[#E5E7EB] prose-p:text-[#9CA3AF] prose-li:text-[#9CA3AF]
          prose-a:text-[#D9F968] prose-strong:text-[#E5E7EB]
          prose-h2:mt-8 prose-h2:mb-4 prose-h3:mt-6 prose-h3:mb-3">
          {children}
        </div>
      </main>

      <footer className="border-t border-white/10 px-6 py-6">
        <div className="mx-auto flex max-w-3xl justify-center gap-6 text-xs text-[#6B7280]">
          <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
        </div>
      </footer>
    </div>
  );
}
