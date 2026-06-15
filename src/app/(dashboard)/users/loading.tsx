export default function UsersLoading() {
  const shimmer =
    'bg-gradient-to-r from-[var(--card)] via-[var(--border)] to-[var(--card)] bg-[length:200%_100%] animate-shimmer rounded';

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className={`h-7 w-24 ${shimmer}`} />
          <div className={`h-4 w-48 mt-2 ${shimmer}`} />
        </div>
        <div className={`h-10 w-28 rounded-lg ${shimmer}`} />
      </div>

      <div className="rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="bg-[var(--bg)] px-4 py-3 flex items-center gap-4">
          <div className={`h-3 w-16 ${shimmer}`} />
          <div className={`h-3 w-12 ${shimmer}`} />
          <div className={`h-3 w-10 ${shimmer}`} />
          <div className={`h-3 w-14 ${shimmer}`} />
          <div className={`h-3 w-14 ${shimmer}`} />
        </div>

        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-4 py-3 border-t border-[var(--border)]"
          >
            <div className={`h-4 w-28 ${shimmer}`} />
            <div className={`h-4 w-40 ${shimmer}`} />
            <div className={`h-5 w-16 rounded-full ${shimmer}`} />
            <div className={`h-4 w-24 ${shimmer}`} />
            <div className={`h-4 w-8 ${shimmer}`} />
          </div>
        ))}
      </div>
    </div>
  );
}
