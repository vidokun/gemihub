'use client';

import { useState } from 'react';
import type { RequestLog } from '@/lib/types';
import RequestDetailModal from './RequestDetailModal';

interface DetailsTabProps {
  logs: RequestLog[];
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString();
}

function statusBadge(statusCode: number | null) {
  if (statusCode === null) return null;

  let bg = '';
  let text = '';
  let label = String(statusCode);

  if (statusCode >= 200 && statusCode < 300) {
    bg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    text = 'text-emerald-400';
  } else if (statusCode === 429) {
    bg = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    text = 'text-amber-400';
  } else if (statusCode >= 400) {
    bg = 'bg-red-500/10 text-red-400 border-red-500/20';
    text = 'text-red-400';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${text.replace('text-', 'bg-')}`} />
      {label}
    </span>
  );
}

export default function DetailsTab({ logs }: DetailsTabProps) {
  const [selectedLog, setSelectedLog] = useState<RequestLog | null>(null);
  const [filterModel, setFilterModel] = useState('');
  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');

  const filtered = logs.filter((log) => {
    if (filterModel && log.model !== filterModel) return false;
    if (filterStart && log.timestamp < filterStart) return false;
    if (filterEnd && log.timestamp > filterEnd + 'T23:59:59.999Z') return false;
    return true;
  });

  const uniqueModels = [...new Set(logs.map((l) => l.model).filter(Boolean))] as string[];

  function clearFilters() {
    setFilterModel('');
    setFilterStart('');
    setFilterEnd('');
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label htmlFor="filter-provider" className="text-xs text-[var(--muted)]">
            Provider
          </label>
          <select
            id="filter-provider"
            className="
              bg-[var(--bg)] border border-[var(--border)] rounded-lg
              px-3 py-1.5 text-sm text-[var(--text)]
              focus:outline-none focus:ring-1 focus:ring-[var(--accent)]
            "
            disabled
            value="google-gemini"
          >
            <option value="google-gemini">Google Gemini</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="filter-model" className="text-xs text-[var(--muted)]">
            Model
          </label>
          <select
            id="filter-model"
            value={filterModel}
            onChange={(e) => setFilterModel(e.target.value)}
            className="
              bg-[var(--bg)] border border-[var(--border)] rounded-lg
              px-3 py-1.5 text-sm text-[var(--text)]
              focus:outline-none focus:ring-1 focus:ring-[var(--accent)]
            "
          >
            <option value="">All models</option>
            {uniqueModels.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="filter-start" className="text-xs text-[var(--muted)]">
            Start Date
          </label>
          <input
            id="filter-start"
            type="date"
            value={filterStart}
            onChange={(e) => setFilterStart(e.target.value)}
            className="
              bg-[var(--bg)] border border-[var(--border)] rounded-lg
              px-3 py-1.5 text-sm text-[var(--text)]
              focus:outline-none focus:ring-1 focus:ring-[var(--accent)]
              [color-scheme:dark]
            "
          />
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="filter-end" className="text-xs text-[var(--muted)]">
            End Date
          </label>
          <input
            id="filter-end"
            type="date"
            value={filterEnd}
            onChange={(e) => setFilterEnd(e.target.value)}
            className="
              bg-[var(--bg)] border border-[var(--border)] rounded-lg
              px-3 py-1.5 text-sm text-[var(--text)]
              focus:outline-none focus:ring-1 focus:ring-[var(--accent)]
              [color-scheme:dark]
            "
          />
        </div>

        <button
          type="button"
          onClick={clearFilters}
          className="
            text-xs text-[var(--muted)] hover:text-[var(--text)]
            px-3 py-1.5 rounded-lg
            border border-[var(--border)] hover:bg-[var(--border)]
            transition-colors duration-150 ease-out
          "
        >
          Clear Filters
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <p className="text-sm text-[var(--muted)]">No requests match your filters.</p>
          <p className="text-xs text-[var(--muted)] mt-1 opacity-60">
            Try adjusting your date range or model filter.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--bg)]">
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                  Model
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                  Input Tokens
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                  Output Tokens
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                  Latency
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filtered.map((log) => (
                <tr key={log.id}>
                  <td className="px-4 py-3 text-sm text-[var(--text)] whitespace-nowrap tabular-nums">
                    {formatTime(log.timestamp)}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text)] font-medium">
                    {log.model ?? '\u2014'}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--muted)]">
                    Google Gemini
                  </td>
                  <td className="px-4 py-3 text-sm text-orange-400 tabular-nums">
                    {log.prompt_tokens?.toLocaleString() ?? '\u2014'}
                  </td>
                  <td className="px-4 py-3 text-sm text-emerald-400 tabular-nums">
                    {log.completion_tokens?.toLocaleString() ?? '\u2014'}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--muted)] tabular-nums">
                    {log.latency_ms !== null ? (
                      <span className="text-xs">
                        <span className="text-[var(--muted)]">TTFT</span>{' '}
                        {log.latency_ms}ms{' '}
                        <span className="text-[var(--muted)]">Total</span>{' '}
                        {log.latency_ms}ms
                      </span>
                    ) : (
                      '\u2014'
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {statusBadge(log.status_code)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setSelectedLog(log)}
                      className="
                        text-xs text-[var(--accent)] hover:text-white
                        px-2.5 py-1 rounded-lg
                        hover:bg-[var(--accent)]/20
                        transition-colors duration-150 ease-out
                      "
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedLog && (
        <RequestDetailModal
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </div>
  );
}
