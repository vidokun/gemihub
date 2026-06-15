import { Shimmer } from '@/components/Skeleton';

export default function KeysLoading() {
  return (
    <div className="max-w-5xl animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1.5">
          <Shimmer className="h-7 w-24" />
          <Shimmer className="h-3.5 w-72" />
        </div>
        <Shimmer className="h-10 w-28 rounded-lg" />
      </div>

      <div className="mb-4">
        <Shimmer className="h-10 w-72 rounded-lg" />
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
        <table className="w-full">
          <thead>
            <tr className="bg-[var(--bg)]">
              {['Name', 'Key', 'Status', 'Error Count', 'Uses', 'Created', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3">
                  <Shimmer className="h-3 w-16" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-t border-[var(--border)]">
                <td className="px-4 py-3"><Shimmer className="h-4 w-28" /></td>
                <td className="px-4 py-3"><Shimmer className="h-4 w-36" /></td>
                <td className="px-4 py-3"><Shimmer className="h-6 w-20 rounded-full" /></td>
                <td className="px-4 py-3"><Shimmer className="h-4 w-10" /></td>
                <td className="px-4 py-3"><Shimmer className="h-4 w-12" /></td>
                <td className="px-4 py-3"><Shimmer className="h-4 w-20" /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Shimmer className="h-8 w-[4.5rem] rounded-lg" />
                    <Shimmer className="h-8 w-8 rounded-lg" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <Shimmer className="h-3.5 w-28" />
        <div className="flex items-center gap-1">
          <Shimmer className="h-8 w-8 rounded-lg" />
          <Shimmer className="h-5 w-12" />
          <Shimmer className="h-8 w-8 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
