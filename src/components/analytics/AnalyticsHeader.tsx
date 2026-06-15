'use client';

interface AnalyticsHeaderProps {
  onRefresh: () => void;
  refreshing?: boolean;
}

export default function AnalyticsHeader({ onRefresh, refreshing = false }: AnalyticsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold text-[var(--text)]">
          Usage &amp; Analytics
        </h2>
        <p className="text-xs text-[var(--muted)] mt-1">
          Monitor your API usage, token consumption, and request logs
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          aria-label="Refresh data"
          className="
            flex items-center justify-center
            w-8 h-8 rounded-lg
            text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--border)]
            transition-colors duration-150 ease-out
            disabled:opacity-50
          "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={refreshing ? 'animate-spin' : ''}
          >
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
        </button>

        <button
          type="button"
          className="
            flex items-center gap-1.5
            text-pink-400 bg-pink-500/10
            rounded-lg px-3 py-1.5
            text-xs font-medium
            transition-colors duration-150 ease-out
            hover:bg-pink-500/20
          "
          aria-label="Donate"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="none"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          Donate
        </button>

        <button
          type="button"
          className="
            flex items-center justify-center
            w-8 h-8 rounded-lg
            text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--border)]
            transition-colors duration-150 ease-out
          "
          aria-label="Toggle theme"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        </button>

        <button
          type="button"
          className="
            flex items-center justify-center
            w-8 h-8 rounded-lg
            text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--border)]
            transition-colors duration-150 ease-out
          "
          aria-label="Language"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 8l6 6" />
            <path d="M4 14l6-6 2-3" />
            <path d="M2 5h12" />
            <path d="M7 2h1" />
            <path d="M22 22l-5-10-5 10" />
            <path d="M14 18h6" />
          </svg>
        </button>

        <button
          type="button"
          className="
            flex items-center justify-center
            w-8 h-8 rounded-lg
            text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--border)]
            transition-colors duration-150 ease-out
          "
          aria-label="Grid menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
