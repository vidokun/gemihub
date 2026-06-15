'use client';

import LoginForm from '@/components/LoginForm';

function GemIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="36"
      height="36"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

export default function LoginPage() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[var(--bg)] px-4">
      <div
        className="
          w-full max-w-sm
          bg-[var(--card)]
          border border-[var(--border)]
          rounded-xl
          px-5 py-8 sm:px-8 sm:py-10 mx-0 sm:mx-auto
        "
      >
        <div className="flex flex-col items-center mb-8">
          <span className="text-[var(--accent)] mb-3" aria-hidden="true">
            <GemIcon />
          </span>
          <h1 className="text-xl font-bold text-[var(--text)] tracking-tight">
            GemiHub
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            API Gateway
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
