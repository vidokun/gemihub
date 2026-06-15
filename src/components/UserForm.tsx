'use client';

import { useState, useEffect, useRef } from 'react';

interface UserFormProps {
  onClose: () => void;
  onSubmit: (email: string, displayName: string, password: string, role: 'admin' | 'user') => Promise<void>;
}

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

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

function emailValid(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function UserForm({ onClose, onSubmit }: UserFormProps) {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    const trimmedName = displayName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError('Display name is required');
      return;
    }
    if (!trimmedEmail) {
      setError('Email is required');
      return;
    }
    if (!emailValid(trimmedEmail)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(trimmedEmail, trimmedName, password, role);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Add User"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="
          relative w-full max-w-md mx-4
          bg-[var(--card)]
          border border-[var(--border)]
          rounded-xl
          shadow-xl
        "
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <h2 className="text-base font-semibold text-[var(--text)]">
            Add User
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="
              p-1.5 rounded-lg
              text-[var(--muted)]
              hover:text-[var(--text)] hover:bg-[var(--border)]
              transition-colors duration-150 ease-out
              disabled:opacity-50 disabled:cursor-not-allowed
            "
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label
              htmlFor="user-name"
              className="block text-sm font-medium text-[var(--text)] mb-1.5"
            >
              Display Name
            </label>
            <input
              ref={nameRef}
              id="user-name"
              type="text"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. John Doe"
              disabled={loading}
              autoComplete="name"
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

          <div>
            <label
              htmlFor="user-email"
              className="block text-sm font-medium text-[var(--text)] mb-1.5"
            >
              Email
            </label>
            <input
              id="user-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              placeholder="you@example.com"
              disabled={loading}
              autoComplete="email"
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

          <div>
            <label
              htmlFor="user-password"
              className="block text-sm font-medium text-[var(--text)] mb-1.5"
            >
              Password
            </label>
            <input
              id="user-password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              placeholder="Min. 6 characters"
              disabled={loading}
              autoComplete="new-password"
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

          <div>
            <label
              htmlFor="user-role"
              className="block text-sm font-medium text-[var(--text)] mb-1.5"
            >
              Role
            </label>
            <select
              id="user-role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'admin' | 'user')}
              disabled={loading}
              className="
                w-full h-11 px-3.5 rounded-lg
                bg-[var(--bg)]
                border border-[var(--border)]
                text-[var(--text)] text-sm
                outline-none
                appearance-none
                transition-colors duration-150 ease-out
                focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {error && (
            <p className="text-sm text-red-400" role="alert">
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
                <span>Creating</span>
              </>
            ) : (
              'Create User'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
