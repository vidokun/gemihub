'use client';

import type { RequestLog } from '@/lib/types';
import NetworkGraph from './NetworkGraph';

interface OverviewTabProps {
  logs: RequestLog[];
}

function relativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = Math.floor((now - then) / 1000);

  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function OverviewTab({ logs }: OverviewTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <p className="text-xs font-medium tracking-wider text-[var(--muted)] uppercase mb-3">
          Network Topology
        </p>
        <NetworkGraph />
      </div>

      <div>
        <p className="text-xs font-medium tracking-wider text-[var(--muted)] uppercase mb-3">
          Recent Requests
        </p>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <p className="text-sm text-[var(--muted)]">No requests in this period.</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {logs.slice(0, 10).map((log) => (
                <div key={log.id} className="px-4 py-3">
                  <p className="text-sm font-medium text-[var(--text)] truncate">
                    {log.model ?? 'Unknown model'}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="inline-flex items-center gap-1 text-xs">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-red-400"
                      >
                        <line x1="12" y1="19" x2="12" y2="5" />
                        <polyline points="5 12 12 5 19 12" />
                      </svg>
                      <span className="text-red-400 tabular-nums">
                        {log.prompt_tokens?.toLocaleString() ?? '0'}
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-emerald-400"
                      >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <polyline points="19 12 12 19 5 12" />
                      </svg>
                      <span className="text-emerald-400 tabular-nums">
                        {log.completion_tokens?.toLocaleString() ?? '0'}
                      </span>
                    </span>
                  </div>
                  <p className="text-xs text-[var(--muted)] mt-1 tabular-nums">
                    {relativeTime(log.timestamp)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
