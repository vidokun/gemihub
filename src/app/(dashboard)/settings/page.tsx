'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getAllowedModels,
  setAllowedModels,
  getDefaultModel,
  setDefaultModel,
  fetchGeminiModels,
} from '@/lib/supabase/operations/settings';

const KNOWN_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-2.0-flash-lite',
  'gemini-2.5-flash-lite',
];

function Spinner() {
  return (
    <svg
      className="animate-spin h-5 w-5 text-[var(--accent)]"
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

function DownloadIcon() {
  return (
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
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function SaveIcon() {
  return (
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
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

export default function SettingsPage() {
  const [allowed, setAllowed] = useState<string[]>([]);
  const [defaultModel, setDefaultModelState] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadSettings = useCallback(async () => {
    try {
      const [models, defaultM] = await Promise.all([
        getAllowedModels(),
        getDefaultModel(),
      ]);
      setAllowed(models);
      setDefaultModelState(defaultM);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const availableModels = Array.from(
    new Set([...KNOWN_MODELS, ...allowed].sort())
  );

  const handleToggle = (model: string) => {
    setAllowed((prev) =>
      prev.includes(model) ? prev.filter((m) => m !== model) : [...prev, model]
    );
  };

  const handleSelectAll = () => {
    const all = availableModels.filter((m) => !allowed.includes(m));
    if (all.length === 0) {
      setAllowed([]);
    } else {
      setAllowed((prev) => [...new Set([...prev, ...all])]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await setAllowedModels(allowed);
      await setDefaultModel(defaultModel);
      setSuccess('Settings saved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleLoadFromGemini = async () => {
    setFetching(true);
    setError('');
    try {
      const geminiModels = await fetchGeminiModels();
      const merged = Array.from(new Set([...KNOWN_MODELS, ...geminiModels].sort()));
      setAllowed((prev) =>
        prev.filter((m) => merged.includes(m))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch Gemini models');
    } finally {
      setFetching(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }

  const allChecked = availableModels.every((m) => allowed.includes(m));

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[var(--text)] tracking-tight">
            Model Settings
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Choose which Gemini models are available through the gateway.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <p className="text-sm text-emerald-400">{success}</p>
        </div>
      )}

      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-[var(--text)]">
            Allowed Models
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className="
                text-xs font-medium
                text-[var(--muted)] hover:text-[var(--text)]
                transition-colors duration-150
              "
            >
              {allChecked ? 'Deselect All' : 'Select All'}
            </button>
            <button
              type="button"
              onClick={handleLoadFromGemini}
              disabled={fetching}
              className="
                inline-flex items-center gap-1.5
                h-8 px-3 rounded-lg
                text-xs font-medium
                border border-[var(--border)]
                text-[var(--muted)] hover:text-[var(--text)]
                hover:bg-[var(--border)]
                transition-colors duration-150 ease-out
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {fetching ? (
                <svg
                  className="animate-spin h-3.5 w-3.5"
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
              ) : (
                <DownloadIcon />
              )}
              Load from Gemini
            </button>
          </div>
        </div>

        <div className="space-y-1">
          {availableModels.length === 0 && (
            <p className="text-sm text-[var(--muted)] py-4 text-center">
              No models configured. Click &ldquo;Load from Gemini&rdquo; or add models manually.
            </p>
          )}

          {availableModels.map((model) => (
            <label
              key={model}
              className={`
                flex items-center gap-3
                px-3 py-2.5 rounded-lg
                cursor-pointer
                transition-colors duration-100 ease-out
                hover:bg-[var(--border)]/50
                ${allowed.includes(model) ? 'bg-[var(--accent)]/5' : ''}
              `}
            >
              <input
                type="checkbox"
                checked={allowed.includes(model)}
                onChange={() => handleToggle(model)}
                className="
                  h-4 w-4 rounded
                  border-[var(--border)]
                  bg-[var(--bg)]
                  text-[var(--accent)]
                  accent-[var(--accent)]
                  cursor-pointer
                "
              />
              <span className="text-sm text-[var(--text)] font-medium">
                {model}
              </span>
              {allowed.includes(model) && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
              )}
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 mb-6">
        <h2 className="text-base font-semibold text-[var(--text)] mb-4">
          Default Model
        </h2>

        {allowed.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">
            Enable at least one model above to set a default.
          </p>
        ) : (
          <select
            value={defaultModel}
            onChange={(e) => setDefaultModelState(e.target.value)}
            className="
              w-full max-w-xs h-10 px-3.5 rounded-lg
              bg-[var(--bg)]
              border border-[var(--border)]
              text-[var(--text)] text-sm
              outline-none
              transition-colors duration-150 ease-out
              focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30
              appearance-none
              bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2371717a%22%20stroke-width%3D%222%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22/%3E%3C/svg%3E')]
              bg-no-repeat bg-[right_0.75rem_center] bg-[length:1rem]
              pr-10
            "
          >
            {allowed.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        )}
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="
          inline-flex items-center gap-2
          h-10 px-5 rounded-lg
          bg-[var(--accent)]
          text-white text-sm font-semibold
          transition-colors duration-150 ease-out
          hover:opacity-90
          disabled:opacity-60 disabled:cursor-not-allowed
        "
      >
        {saving ? (
          <>
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
            Saving
          </>
        ) : (
          <>
            <SaveIcon />
            Save Settings
          </>
        )}
      </button>
    </div>
  );
}
