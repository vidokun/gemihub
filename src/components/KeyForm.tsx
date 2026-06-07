'use client';

import { useState, useEffect, useRef } from 'react';

interface KeyFormProps {
  onClose: () => void;
  onSubmit: (name: string, keyString: string) => Promise<void>;
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

export default function KeyForm({ onClose, onSubmit }: KeyFormProps) {
  const [name, setName] = useState('');
  const [keyString, setKeyString] = useState('');
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

    const trimmedName = name.trim();
    const trimmedKey = keyString.trim();

    if (!trimmedName) {
      setError('Name is required');
      return;
    }
    if (!trimmedKey) {
      setError('API key string is required');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(trimmedName, trimmedKey);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create API key');
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Add API Key"
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
            Add API Key
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
              htmlFor="key-name"
              className="block text-sm font-medium text-[var(--text)] mb-1.5"
            >
              Name
            </label>
            <input
              ref={nameRef}
              id="key-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Personal Project Key"
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

          <div>
            <label
              htmlFor="key-string"
              className="block text-sm font-medium text-[var(--text)] mb-1.5"
            >
              Key String
            </label>
            <textarea
              id="key-string"
              value={keyString}
              onChange={(e) => {
                setKeyString(e.target.value);
                if (error) setError('');
              }}
              placeholder="Paste your Gemini API key"
              rows={3}
              disabled={loading}
              className="
                w-full px-3.5 py-2.5 rounded-lg
                bg-[var(--bg)]
                border border-[var(--border)]
                text-[var(--text)] text-sm font-mono
                placeholder:text-[var(--muted)]
                outline-none
                transition-colors duration-150 ease-out
                focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30
                disabled:opacity-50 disabled:cursor-not-allowed
                resize-none
              "
            />
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
                <span>Adding</span>
              </>
            ) : (
              'Add Key'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
