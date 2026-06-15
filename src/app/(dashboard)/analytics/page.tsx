import { getFilteredStats, getFilteredLogs } from '@/lib/supabase/operations/request-logs';
import type { RequestLog } from '@/lib/types';
import AnalyticsPageClient from './client';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const now = new Date();
  const from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  let stats: { totalRequests: number; tokensIn: number; tokensOut: number };
  let logs: RequestLog[];

  try {
    stats = await getFilteredStats(from, now);
    logs = await getFilteredLogs(from, now, 200);
  } catch {
    stats = { totalRequests: 0, tokensIn: 0, tokensOut: 0 };
    logs = [];
  }

  return (
    <AnalyticsPageClient
      initialTab="overview"
      initialRange="30D"
      initialStats={stats}
      initialLogs={logs}
    />
  );
}
