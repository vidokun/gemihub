'use client';

import { useState } from 'react';
import NavSidebar from '@/components/NavSidebar';

function HamburgerButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="lg:hidden p-1.5 -ml-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--border)] transition-colors"
      aria-label="Open sidebar"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="4" y1="6" x2="20" y2="6" />
        <line x1="4" y1="12" x2="20" y2="12" />
        <line x1="4" y1="18" x2="20" y2="18" />
      </svg>
    </button>
  );
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[var(--bg)] text-[var(--text)] overflow-hidden">
      <NavSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 min-w-0">
        <header className="flex items-center gap-3 h-14 shrink-0 px-4 sm:px-6 border-b border-[var(--border)] bg-[var(--bg)]">
          <HamburgerButton onClick={() => setSidebarOpen(true)} />
          <h1 className="text-sm font-semibold tracking-wider text-[var(--muted)] uppercase">
            GemiHub
          </h1>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
