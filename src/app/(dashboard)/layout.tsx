import type { Metadata } from 'next';
import NavSidebar from '@/components/NavSidebar';

export const metadata: Metadata = {
  title: 'GemiHub',
  description: 'AI API Gateway & Load Balancer',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[var(--bg)] text-[var(--text)] overflow-hidden">
      <NavSidebar />

      <div className="flex flex-col flex-1 min-w-0">
        <header className="flex items-center h-14 shrink-0 px-6 border-b border-[var(--border)] bg-[var(--bg)]">
          <h1 className="text-sm font-semibold tracking-wider text-[var(--muted)] uppercase">
            GemiHub
          </h1>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
