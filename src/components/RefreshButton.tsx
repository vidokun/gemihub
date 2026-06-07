'use client';

import { useRouter } from 'next/navigation';

export default function RefreshButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.refresh()}
      className="
        inline-flex items-center gap-1.5
        h-8 px-3.5 rounded-lg
        text-xs font-medium
        border border-[var(--border)]
        text-[var(--muted)]
        transition-colors duration-150 ease-out
        hover:text-[var(--text)] hover:border-[var(--accent)]
        active:scale-[0.97]
      "
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
        <path d="M16 16h5v5" />
      </svg>
      <span>Refresh</span>
    </button>
  );
}
