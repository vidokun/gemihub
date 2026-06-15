'use server';

import { getFilteredStats, getFilteredLogs } from '@/lib/supabase/operations/request-logs';
import type { RequestLog } from '@/lib/types';

export async function fetchAnalyticsData(from: Date, to: Date): Promise<{
  stats: { totalRequests: number; tokensIn: number; tokensOut: number };
  logs: RequestLog[];
}> {
  const [stats, logs] = await Promise.all([
    getFilteredStats(from, to),
    getFilteredLogs(from, to, 200),
  ]);
  return { stats, logs };
}
