import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Completed',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
