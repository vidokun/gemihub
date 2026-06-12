'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getAllowedModels,
  setAllowedModels,
  getDefaultModel,
  setDefaultModel,
  testModelConnection,
} from '@/lib/supabase/operations/settings';

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

function XIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
    >
      <polygon points="7,2 22,12 7,22" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export default function SettingsPage() {
  const [allowed, setAllowed] = useState<string[]>([]);
  const [defaultModel, setDefaultModelState] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newModel, setNewModel] = useState('');
  const [testingState, setTestingState] = useState<
    Record<string, 'idle' | 'loading' | 'success' | 'error'>
  >({});
  const [testResults, setTestResults] = useState<Record<string, string>>({});

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

  const handleAddModel = () => {
    const trimmed = newModel.trim();
    if (!trimmed) return;
    if (allowed.includes(trimmed)) {
      setError('Model already added');
      return;
    }
    setAllowed((prev) => [...prev, trimmed].sort());
    setNewModel('');
    setError('');
  };

  const handleRemoveModel = (model: string) => {
    setAllowed((prev) => prev.filter((m) => m !== model));
    if (defaultModel === model) {
      setDefaultModelState('');
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

  const handleTestModel = async (model: string) => {
    setTestingState((prev) => ({ ...prev, [model]: 'loading' }));
    setError('');
    try {
      const result = await testModelConnection(model);
      if (result.success) {
        setTestResults((prev) => ({ ...prev, [model]: result.response! }));
        setTestingState((prev) => ({ ...prev, [model]: 'success' }));
      } else {
        setTestResults((prev) => ({ ...prev, [model]: result.error! }));
        setTestingState((prev) => ({ ...prev, [model]: 'error' }));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Test failed';
      setTestResults((prev) => ({ ...prev, [model]: message }));
      setTestingState((prev) => ({ ...prev, [model]: 'error' }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[var(--text)] tracking-tight">
            Model Settings
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Manage which Gemini models are available through the gateway.
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
        <h2 className="text-base font-semibold text-[var(--text)] mb-4">
          Allowed Models
        </h2>

        <div className="flex items-center gap-2 mb-4">
          <input
            type="text"
            value={newModel}
            onChange={(e) => {
              setNewModel(e.target.value);
              if (error) setError('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddModel();
            }}
            placeholder="e.g. gemini-2.5-flash"
            className="
              flex-1 h-10 px-3.5 rounded-lg
              bg-[var(--bg)]
              border border-[var(--border)]
              text-[var(--text)] text-sm
              placeholder:text-[var(--muted)]
              outline-none
              transition-colors duration-150 ease-out
              focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30
            "
          />
          <button
            type="button"
            onClick={handleAddModel}
            className="
              inline-flex items-center gap-1.5
              h-10 px-4 rounded-lg
              bg-[var(--accent)]
              text-white text-sm font-semibold
              transition-colors duration-150 ease-out
              hover:opacity-90
              shrink-0
            "
          >
            <PlusIcon />
            Add
          </button>
        </div>

        {allowed.length === 0 ? (
          <p className="text-sm text-[var(--muted)] py-4 text-center">
            No models configured. Add models manually above.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {allowed.map((model) => {
              const state = testingState[model] ?? 'idle';
              const borderClass =
                state === 'loading'
                  ? 'border-[var(--muted)]/40'
                  : 'border-[var(--accent)]/20';
              return (
                <span
                  key={model}
                  className={`
                    inline-flex items-center gap-1.5
                    px-3 py-1.5 rounded-lg
                    bg-[var(--accent)]/10
                    border ${borderClass}
                    text-sm text-[var(--text)] font-medium
                    transition-colors duration-150 ease-out
                  `}
                >
                  {model}
                  <button
                    type="button"
                    onClick={() => handleTestModel(model)}
                    disabled={state === 'loading'}
                    className="
                      inline-flex items-center justify-center
                      w-5 h-5 rounded-full
                      text-[var(--muted)]
                      hover:text-[var(--accent)] hover:bg-[var(--accent)]/10
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-colors duration-150 ease-out
                    "
                    aria-label={`Test ${model}`}
                  >
                    {state === 'loading' ? (
                      <svg
                        className="animate-spin h-3 w-3"
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
                      <PlayIcon />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveModel(model)}
                    className="
                      p-0.5 rounded
                      text-[var(--muted)]
                      hover:text-red-400 hover:bg-red-500/10
                      transition-colors duration-150 ease-out
                    "
                    aria-label={`Remove ${model}`}
                  >
                    <XIcon />
                  </button>
                </span>
              );
            })}
          </div>
        )}

        {Object.keys(testResults).length > 0 && (
          <div className="mt-4 space-y-2">
            {Object.entries(testResults).map(([model, text]) => {
              const state = testingState[model] ?? 'idle';
              if (state === 'loading') return null;
              const isSuccess = state === 'success';
              return (
                <div
                  key={model}
                  className={`
                    rounded-lg p-3
                    ${isSuccess
                      ? 'bg-emerald-500/10 border border-emerald-500/20'
                      : 'bg-red-500/10 border border-red-500/20'
                    }
                  `}
                >
                  <p className="text-sm font-semibold text-[var(--text)] mb-1">
                    {isSuccess ? model : `${model} — Error`}
                  </p>
                  <p className="text-sm text-[var(--text)]">{text}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 mb-6">
        <h2 className="text-base font-semibold text-[var(--text)] mb-4">
          Default Model
        </h2>

        {allowed.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">
            Add at least one model above to set a default.
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
            <option value="">Select a default model</option>
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
