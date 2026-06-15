import { Shimmer } from '@/components/Skeleton';

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Shimmer className="h-6 w-24" />
          <Shimmer className="h-3.5 w-64" />
        </div>
        <Shimmer className="h-8 w-[4.75rem] rounded-lg" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {['purple', 'amber', 'blue', 'emerald', 'emerald'].map((_, i) => (
          <div
            key={i}
            className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden"
          >
            <Shimmer className="h-[3px] w-full rounded-none" />
            <div className="px-5 py-5 space-y-2.5">
              <Shimmer className="h-3 w-20" />
              <Shimmer className="h-8 w-28" />
            </div>
          </div>
        ))}
      </div>

      <section className="space-y-3">
        <div className="space-y-1">
          <Shimmer className="h-5 w-32" />
          <Shimmer className="h-3.5 w-28" />
        </div>

        <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--bg)]">
                {['Time', 'API Key', 'Model', 'Status', 'Tokens In', 'Tokens Out', 'Latency', 'Error'].map((h) => (
                  <th key={h} className="px-4 py-3">
                    <Shimmer className="h-3 w-16" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-t border-[var(--border)]">
                  <td className="px-4 py-3"><Shimmer className="h-4 w-32" /></td>
                  <td className="px-4 py-3"><Shimmer className="h-4 w-12" /></td>
                  <td className="px-4 py-3"><Shimmer className="h-4 w-28" /></td>
                  <td className="px-4 py-3"><Shimmer className="h-6 w-16 rounded-full" /></td>
                  <td className="px-4 py-3"><Shimmer className="h-4 w-12" /></td>
                  <td className="px-4 py-3"><Shimmer className="h-4 w-12" /></td>
                  <td className="px-4 py-3"><Shimmer className="h-4 w-16" /></td>
                  <td className="px-4 py-3"><Shimmer className="h-4 w-20" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
