import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg)] px-6">
      <div className="flex flex-col items-center text-center max-w-sm w-full">
        <div className="mb-8" aria-hidden="true">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="56"
            height="56"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-[var(--text)]">
          GemiHub
        </h1>
        <p className="mt-1 text-sm font-mono text-[var(--muted)]">v0.1.0</p>

        <p className="mt-6 text-sm leading-relaxed text-[var(--muted)]">
          OpenAI-compatible API gateway for Google Gemini.
          Load balancing, key management, and usage analytics in one dashboard.
        </p>

        <div className="mt-10 flex flex-col gap-3 w-full">
          <Link
            href="/login"
            className="inline-flex items-center justify-center h-11 w-full rounded-xl bg-[var(--accent)] text-white text-sm font-semibold transition-colors hover:bg-[var(--accent)]/85"
          >
            Login to Dashboard
          </Link>

          <a
            href="https://dokundigital.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center h-11 w-full rounded-xl border border-[var(--border)] text-[var(--muted)] text-sm font-medium transition-colors hover:border-[var(--accent)] hover:text-[var(--text)]"
          >
            Buy Source Code
          </a>
        </div>
      </div>

      <p className="mt-16 text-xs text-[var(--muted)]">
        Built with Next.js & Supabase
      </p>
    </div>
  );
}
