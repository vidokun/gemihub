'use client';

import Skeleton from './Skeleton';

interface MetricCardsProps {
  totalRequests: number;
  tokensIn: number;
  tokensOut: number;
  loading?: boolean;
}

export default function MetricCards({
  totalRequests,
  tokensIn,
  tokensOut,
  loading = false,
}: MetricCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-4">
        <Skeleton variant="card" />
        <Skeleton variant="card" />
        <Skeleton variant="card" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-4">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
        <p className="text-xs font-medium tracking-wider text-[var(--muted)] uppercase mb-2">
          Total Requests
        </p>
        <p className="text-2xl font-bold text-[var(--text)] tabular-nums">
          {totalRequests.toLocaleString()}
        </p>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
        <p className="text-xs font-medium tracking-wider text-[var(--muted)] uppercase mb-2">
          Input Tokens
        </p>
        <p className="text-2xl font-bold text-amber-400 tabular-nums">
          {tokensIn.toLocaleString()}
        </p>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
        <p className="text-xs font-medium tracking-wider text-[var(--muted)] uppercase mb-2">
          Output Tokens
        </p>
        <p className="text-2xl font-bold text-emerald-400 tabular-nums">
          {tokensOut.toLocaleString()}
        </p>
      </div>
    </div>
  );
}
