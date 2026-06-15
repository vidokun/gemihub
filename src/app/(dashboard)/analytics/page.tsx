import { getFilteredStats, getFilteredLogs } from '@/lib/supabase/operations/request-logs';
import { estimateCost } from '@/lib/analytics/cost';
import type { RequestLog } from '@/lib/types';
import AnalyticsPageClient from './client';

export const dynamic = 'force-dynamic';

function computeRange(range: string): { from: Date; to: Date } {
  const now = new Date();
  const to = now;

  switch (range.toLowerCase()) {
    case 'today': {
      const from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return { from, to };
    }
    case '24h': {
      const from = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      return { from, to };
    }
    case '7d': {
      const from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { from, to };
    }
    case '60d': {
      const from = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      return { from, to };
    }
    case '30d':
    default: {
      const from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { from, to };
    }
  }
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; range?: string }>;
}) {
  const params = await searchParams;
  const tab = params.tab === 'details' ? 'details' : 'overview';
  const range = params.range ?? '30D';

  const { from, to } = computeRange(range);

  let stats: { totalRequests: number; tokensIn: number; tokensOut: number };
  let logs: RequestLog[];

  try {
    stats = await getFilteredStats(from, to);
    logs = await getFilteredLogs(from, to, 200);
  } catch {
    stats = { totalRequests: 0, tokensIn: 0, tokensOut: 0 };
    logs = [];
  }

  const estCost = estimateCost(stats.tokensIn, stats.tokensOut);

  return (
    <AnalyticsPageClient
      initialTab={tab}
      initialRange={range}
      totalRequests={stats.totalRequests}
      tokensIn={stats.tokensIn}
      tokensOut={stats.tokensOut}
      estCost={estCost}
      logs={logs}
    />
  );
}
