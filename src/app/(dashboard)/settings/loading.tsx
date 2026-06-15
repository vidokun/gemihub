import { Shimmer } from '@/components/Skeleton';

export default function SettingsLoading() {
  return (
    <div className="max-w-3xl animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1.5">
          <Shimmer className="h-7 w-36" />
          <Shimmer className="h-3.5 w-80" />
        </div>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 mb-6">
        <Shimmer className="h-5 w-32 mb-4" />

        <div className="flex items-center gap-2 mb-4">
          <Shimmer className="flex-1 h-10 rounded-lg" />
          <Shimmer className="h-10 w-20 rounded-lg" />
        </div>

        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Shimmer
              key={i}
              className="h-[2.25rem] rounded-lg"
              style={{ width: `${110 + i * 30}px` }}
            />
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 mb-6">
        <Shimmer className="h-5 w-32 mb-4" />
        <Shimmer className="h-10 w-72 rounded-lg" />
      </div>

      <Shimmer className="h-10 w-36 rounded-lg" />
    </div>
  );
}
