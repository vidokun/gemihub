'use client';

import { useState } from 'react';
import type { RequestLog } from '@/lib/types';

interface RequestDetailModalProps {
  log: RequestLog;
  onClose: () => void;
}

function statusBadge(statusCode: number | null) {
  if (statusCode === null) return null;

  let bg = '';
  let color = '';

  if (statusCode >= 200 && statusCode < 300) {
    bg = 'bg-emerald-500/10';
    color = 'text-emerald-400';
  } else if (statusCode === 429) {
    bg = 'bg-amber-500/10';
    color = 'text-amber-400';
  } else if (statusCode >= 400) {
    bg = 'bg-red-500/10';
    color = 'text-red-400';
  }

  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${color}`}>
      {statusCode >= 200 && statusCode < 300 ? 'success' : statusCode}
    </span>
  );
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString();
}

export default function RequestDetailModal({ log, onClose }: RequestDetailModalProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative bg-[var(--card)] border border-[var(--border)] rounded-xl max-w-lg w-full max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <h3 className="text-base font-semibold text-[var(--text)]">Request Details</h3>
          <button
            type="button"
            onClick={onClose}
            className="
              flex items-center justify-center
              w-7 h-7 rounded-lg
              text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--border)]
              transition-colors duration-150 ease-out
              absolute top-3 right-3
            "
            aria-label="Close"
          >
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
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[11px] font-medium text-[var(--muted)] uppercase tracking-wider mb-1">ID</p>
              <p className="text-sm text-[var(--text)] font-mono">#{log.id}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-[var(--muted)] uppercase tracking-wider mb-1">Timestamp</p>
              <p className="text-sm text-[var(--text)]">{formatTime(log.timestamp)}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-[var(--muted)] uppercase tracking-wider mb-1">Provider</p>
              <p className="text-sm text-[var(--text)]">Google Gemini</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-[var(--muted)] uppercase tracking-wider mb-1">Model</p>
              <p className="text-sm text-[var(--text)]">{log.model ?? '\u2014'}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-[var(--muted)] uppercase tracking-wider mb-1">Status</p>
              {statusBadge(log.status_code) ?? <p className="text-sm text-[var(--muted)]">\u2014</p>}
            </div>
            <div>
              <p className="text-[11px] font-medium text-[var(--muted)] uppercase tracking-wider mb-1">Latency</p>
              <p className="text-sm text-[var(--text)] tabular-nums">
                {log.latency_ms !== null ? (
                  <>
                    <span className="text-[var(--muted)]">TTFT</span>{' '}
                    {log.latency_ms} ms
                    {' '}
                    <span className="text-[var(--muted)]">Total</span>{' '}
                    {log.latency_ms} ms
                  </>
                ) : (
                  '\u2014'
                )}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-[var(--muted)] uppercase tracking-wider mb-1">Input Tokens</p>
              <p className="text-sm text-orange-400 tabular-nums">
                {log.prompt_tokens?.toLocaleString() ?? '\u2014'}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-[var(--muted)] uppercase tracking-wider mb-1">Output Tokens</p>
              <p className="text-sm text-emerald-400 tabular-nums">
                {log.completion_tokens?.toLocaleString() ?? '\u2014'}
              </p>
            </div>
          </div>

          <div className="border-t border-[var(--border)] pt-4">
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-2 w-full text-left text-sm font-medium text-[var(--text)] hover:text-[var(--accent)] transition-colors duration-150 ease-out"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`shrink-0 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
              1. Client Request (Input)
            </button>
            {expanded && (
              <div className="mt-3 bg-[var(--bg)] rounded-lg p-4 font-mono text-sm text-[var(--muted)] overflow-x-auto">
                <pre>{`{
  "messages": [
    { "role": "user", "content": "..." }
  ],
  "model": "${log.model ?? 'gemini-2.5-flash'}"
}`}</pre>
                <p className="text-[11px] text-[var(--muted)] mt-3 font-sans">
                  Request payloads are not stored. This is a placeholder.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
