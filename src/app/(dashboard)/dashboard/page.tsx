import { getRequestStats, getRecentLogs } from '@/lib/supabase/operations/request-logs';
import type { DashboardStats } from '@/lib/types';
import StatsCard from '@/components/StatsCard';
import RefreshButton from '@/components/RefreshButton';
import RequestLogTable from '@/components/RequestLogTable';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const stats: DashboardStats = await getRequestStats();
  const recentLogs = await getRecentLogs(20);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--text)]">
            Overview
          </h2>
          <p className="text-xs text-[var(--muted)] mt-1">
            Key metrics across all API traffic
          </p>
        </div>
        <RefreshButton />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard
          label="Active Keys"
          value={stats.activeKeys}
          color="purple"
        />
        <StatsCard
          label="Rate Limited"
          value={stats.rateLimitedKeys}
          color="amber"
        />
        <StatsCard
          label="Total Requests"
          value={stats.totalRequests}
          color="blue"
        />
        <StatsCard
          label="Tokens In"
          value={stats.tokensIn}
          color="emerald"
        />
        <StatsCard
          label="Tokens Out"
          value={stats.tokensOut}
          color="emerald"
        />
      </div>

      <section className="space-y-3">
        <div>
          <h3 className="text-base font-semibold text-[var(--text)]">Recent Requests</h3>
          <p className="text-xs text-[var(--muted)] mt-1">Last 20 API calls</p>
        </div>
        <RequestLogTable logs={recentLogs} />
      </section>
    </div>
  );
}
