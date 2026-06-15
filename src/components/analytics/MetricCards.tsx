'use client';

interface MetricCardsProps {
  totalRequests: number;
  tokensIn: number;
  tokensOut: number;
  estCost: number;
}

export default function MetricCards({
  totalRequests,
  tokensIn,
  tokensOut,
  estCost,
}: MetricCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
          Total Input Tokens
        </p>
        <p className="text-2xl font-bold text-orange-400 tabular-nums">
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

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
        <p className="text-xs font-medium tracking-wider text-[var(--muted)] uppercase mb-2">
          Est. Cost
        </p>
        <p className="text-2xl font-bold text-amber-400 tabular-nums">
          ~${estCost.toFixed(2)}
        </p>
        <p className="text-[11px] text-[var(--muted)] mt-1">
          Estimated, not actual billing
        </p>
      </div>
    </div>
  );
}
