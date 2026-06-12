'use client';

import type { RequestLog } from '@/lib/types';

interface RequestLogTableProps {
  logs: RequestLog[];
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString('id-ID');
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

function tokenDisplay(value: number | null): string {
  if (value === null || value === 0) return '\u2014';
  return value.toLocaleString();
}

function truncateError(message: string): string {
  if (message.length <= 60) return message;
  return message.slice(0, 57) + '...';
}

export default function RequestLogTable({ logs }: RequestLogTableProps) {
  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <p className="text-sm text-[var(--muted)]">No requests logged yet.</p>
        <p className="text-xs text-[var(--muted)] mt-1 opacity-60">
          API requests will appear here as they come in.
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
              Time
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
              API Key
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
              Model
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
              Tokens In
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
              Tokens Out
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
              Latency
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
              Error
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {logs.map((log) => (
            <tr key={log.id} className="border-t border-[var(--border)]">
              <td className="px-4 py-3 text-sm text-[var(--text)] whitespace-nowrap tabular-nums">
                {formatTime(log.timestamp)}
              </td>

              <td className="px-4 py-3 text-sm text-[var(--muted)] tabular-nums">
                {log.api_key_id !== null ? `#${log.api_key_id}` : '\u2014'}
              </td>

              <td className="px-4 py-3 text-sm text-[var(--text)] font-medium">
                {log.model ?? '\u2014'}
              </td>

              <td className="px-4 py-3">
                {statusBadge(log.status_code)}
              </td>

              <td className="px-4 py-3 text-sm text-[var(--muted)] tabular-nums">
                {tokenDisplay(log.prompt_tokens)}
              </td>

              <td className="px-4 py-3 text-sm text-[var(--muted)] tabular-nums">
                {tokenDisplay(log.completion_tokens)}
              </td>

              <td className="px-4 py-3 text-sm text-[var(--muted)] tabular-nums">
                {log.latency_ms !== null ? `${log.latency_ms} ms` : '\u2014'}
              </td>

              <td className="px-4 py-3 text-sm text-[var(--muted)] max-w-[240px]">
                {log.error_message ? (
                  <span
                    title={log.error_message}
                    className="text-red-400"
                  >
                    {truncateError(log.error_message)}
                  </span>
                ) : (
                  '\u2014'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
