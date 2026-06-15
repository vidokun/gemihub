export default function AnalyticsLoading() {
  const shimmer =
    'bg-gradient-to-r from-[var(--card)] via-[var(--border)] to-[var(--card)] bg-[length:200%_100%] animate-shimmer rounded';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <div className={`h-6 w-44 ${shimmer}`} />
          <div className={`h-3.5 w-80 ${shimmer}`} />
        </div>
        <div className="flex items-center gap-2">
          <div className={`h-8 w-8 rounded-lg ${shimmer}`} />
          <div className={`h-8 w-8 rounded-lg ${shimmer}`} />
          <div className={`h-8 w-8 rounded-lg ${shimmer}`} />
          <div className={`h-8 w-8 rounded-lg ${shimmer}`} />
          <div className={`h-8 w-8 rounded-lg ${shimmer}`} />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          <div className={`h-9 w-24 rounded-lg ${shimmer}`} />
          <div className={`h-9 w-24 rounded-lg ${shimmer}`} />
        </div>
        <div className="flex gap-0.5">
          <div className={`h-9 w-16 rounded-l-lg ${shimmer}`} />
          <div className={`h-9 w-12 ${shimmer}`} />
          <div className={`h-9 w-12 ${shimmer}`} />
          <div className={`h-9 w-14 ${shimmer}`} />
          <div className={`h-9 w-14 rounded-r-lg ${shimmer}`} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 space-y-3">
            <div className={`h-3 w-1/2 ${shimmer}`} />
            <div className={`h-8 w-2/3 ${shimmer}`} />
            <div className={`h-3 w-1/3 ${shimmer}`} />
          </div>
        ))}
      </div>

      <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-6">
        <div className="flex items-center justify-end mb-4 gap-4">
          <div className="flex items-center gap-1.5">
            <div className={`h-2.5 w-2.5 rounded-full ${shimmer}`} />
            <div className={`h-3 w-20 ${shimmer}`} />
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`h-2.5 w-2.5 rounded-full ${shimmer}`} />
            <div className={`h-3 w-20 ${shimmer}`} />
          </div>
        </div>
        <div className={`h-72 ${shimmer}`} style={{ borderRadius: 8 }} />
      </div>

      <div className="space-y-3">
        <div className={`h-4 w-32 ${shimmer}`} />
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 px-4 py-3 border-b border-[var(--border)] last:border-b-0"
            >
              <div className={`h-4 w-24 ${shimmer}`} />
              <div className={`h-4 w-16 ${shimmer}`} />
              <div className={`h-4 w-16 ${shimmer}`} />
              <div className="ml-auto">
                <div className={`h-3 w-12 ${shimmer}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
