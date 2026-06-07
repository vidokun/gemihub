'use client';

import { useState } from 'react';
import type { ApiKey } from '@/lib/types';

interface KeyTableProps {
  keys: ApiKey[];
  usageCounts: Record<number, number>;
  loadingIds: Set<number>;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

function EyeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function maskKey(key: string): string {
  if (key.length <= 8) return '••••••••';
  const start = key.slice(0, 4);
  const end = key.slice(-4);
  return `${start}${'•'.repeat(Math.min(key.length - 8, 16))}${end}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function SpinnerIcon() {
  return (
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
  );
}

function KeyRow({
  apiKey,
  revealed,
  isLoading,
  usageCount,
  onToggleReveal,
  onToggle,
  onDelete,
}: {
  apiKey: ApiKey;
  revealed: boolean;
  isLoading: boolean;
  usageCount: number;
  onToggleReveal: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <tr className="border-t border-[var(--border)]">
      <td className="px-4 py-3 text-sm text-[var(--text)] font-medium">
        {apiKey.name}
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <code className="text-sm text-[var(--muted)] font-mono select-all">
            {revealed ? apiKey.key_string : maskKey(apiKey.key_string)}
          </code>
          <button
            type="button"
            onClick={onToggleReveal}
            className="
              shrink-0 p-1 rounded
              text-[var(--muted)]
              hover:text-[var(--text)] hover:bg-[var(--border)]
              transition-colors duration-150 ease-out
            "
            aria-label={revealed ? 'Hide key' : 'Show key'}
          >
            {revealed ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
      </td>

      <td className="px-4 py-3">
        <span
          className={`
            inline-flex items-center gap-1.5
            px-2.5 py-0.5 rounded-full
            text-xs font-medium
            ${
              apiKey.is_active
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }
          `}
        >
          <span
            className={`
              w-1.5 h-1.5 rounded-full shrink-0
              ${apiKey.is_active ? 'bg-emerald-400' : 'bg-red-400'}
            `}
          />
          {apiKey.is_active ? 'Active' : 'Inactive'}
        </span>
      </td>

      <td className="px-4 py-3 text-sm text-[var(--muted)] tabular-nums">
        {usageCount}
      </td>

      <td className="px-4 py-3 text-sm text-[var(--muted)] tabular-nums">
        {apiKey.error_count}
      </td>

      <td className="px-4 py-3 text-sm text-[var(--muted)]">
        {formatDate(apiKey.created_at)}
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onToggle}
            disabled={isLoading}
            className="
              inline-flex items-center gap-1.5
              px-2.5 py-1.5 rounded-lg
              text-xs font-medium
              text-[var(--text)]
              border border-[var(--border)]
              hover:bg-[var(--border)]
              transition-colors duration-150 ease-out
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {isLoading ? (
              <SpinnerIcon />
            ) : null}
            {apiKey.is_active ? 'Disable' : 'Enable'}
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={isLoading}
            className="
              p-1.5 rounded-lg
              text-[var(--muted)]
              hover:text-red-400 hover:bg-red-500/10
              transition-colors duration-150 ease-out
              disabled:opacity-50 disabled:cursor-not-allowed
            "
            aria-label="Delete key"
          >
            {isLoading ? <SpinnerIcon /> : <TrashIcon />}
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function KeyTable({ keys, usageCounts, loadingIds, onToggle, onDelete }: KeyTableProps) {
  const [revealedKeys, setRevealedKeys] = useState<Set<number>>(new Set());

  const toggleReveal = (id: number) => {
    setRevealedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (keys.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <p className="text-sm text-[var(--muted)]">No API keys found.</p>
        <p className="text-xs text-[var(--muted)] mt-1 opacity-60">
          Add your first Gemini API key to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
      <table className="w-full">
        <thead>
          <tr className="bg-[var(--bg)]">
            <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
              Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
              Key String
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
              Uses
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
              Errors
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
              Created
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {keys.map((apiKey) => (
            <KeyRow
              key={apiKey.id}
              apiKey={apiKey}
              revealed={revealedKeys.has(apiKey.id)}
              isLoading={loadingIds.has(apiKey.id)}
              usageCount={usageCounts[apiKey.id] ?? 0}
              onToggleReveal={() => toggleReveal(apiKey.id)}
              onToggle={() => onToggle(apiKey.id)}
              onDelete={() => onDelete(apiKey.id)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
