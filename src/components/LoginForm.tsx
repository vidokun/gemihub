'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export default function LoginForm() {
  const router = useRouter();
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    if (!passcode.trim()) {
      setError('Passcode is required');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passcode.trim() }),
      });

      if (res.ok) {
        router.push('/dashboard');
      } else if (res.status === 401) {
        setError('Invalid passcode');
      } else {
        setError('Something went wrong. Try again.');
      }
    } catch {
      setError('Network error. Check your connection.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div>
        <label
          htmlFor="passcode"
          className="block text-sm font-medium text-[var(--text)] mb-1.5"
        >
          Passcode
        </label>
        <input
          id="passcode"
          type="password"
          value={passcode}
          onChange={(e) => {
            setPasscode(e.target.value);
            if (error) setError('');
          }}
          placeholder="Enter your passcode"
          autoFocus
          autoComplete="current-password"
          disabled={loading}
          className="
            w-full h-11 px-3.5 rounded-lg
            bg-[var(--bg)]
            border border-[var(--border)]
            text-[var(--text)] text-sm
            placeholder:text-[var(--muted)]
            outline-none
            transition-colors duration-150 ease-out
            focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        />
      </div>

      {error && (
        <p
          className="text-sm text-red-400"
          role="alert"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="
          w-full h-11 rounded-lg
          bg-[var(--accent)]
          text-white text-sm font-semibold
          inline-flex items-center justify-center gap-2
          transition-colors duration-150 ease-out
          hover:opacity-90
          disabled:opacity-60 disabled:cursor-not-allowed
        "
      >
        {loading ? (
          <>
            <Spinner />
            <span>Authenticating</span>
          </>
        ) : (
          'Access Gateway'
        )}
      </button>
    </form>
  );
}
