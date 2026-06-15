'use client';

import { useState, useCallback, useTransition } from 'react';
import type { RequestLog } from '@/lib/types';
import AnalyticsHeader from '@/components/analytics/AnalyticsHeader';
import TimeFilterBar from '@/components/analytics/TimeFilterBar';
import MetricCards from '@/components/analytics/MetricCards';
import OverviewTab from '@/components/analytics/OverviewTab';
import DetailsTab from '@/components/analytics/DetailsTab';
import { fetchAnalyticsData } from './actions';

interface AnalyticsPageClientProps {
  initialTab: 'overview' | 'details';
  initialRange: string;
  initialStats: { totalRequests: number; tokensIn: number; tokensOut: number };
  initialLogs: RequestLog[];
}

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

export default function AnalyticsPageClient({
  initialTab,
  initialRange,
  initialStats,
  initialLogs,
}: AnalyticsPageClientProps) {
  const [tab, setTab] = useState<'overview' | 'details'>(initialTab);
  const [range, setRange] = useState(initialRange);
  const [stats, setStats] = useState(initialStats);
  const [logs, setLogs] = useState(initialLogs);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadData = useCallback(async (newRange: string) => {
    setLoading(true);
    setError(null);
    try {
      const { from, to } = computeRange(newRange);
      const data = await fetchAnalyticsData(from, to);
      setStats(data.stats);
      setLogs(data.logs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRangeChange = useCallback(
    (newRange: string) => {
      setRange(newRange);
      loadData(newRange);
    },
    [loadData],
  );

  const handleTabChange = useCallback((newTab: 'overview' | 'details') => {
    setTab(newTab);
  }, []);

  const handleRefresh = useCallback(() => {
    startTransition(() => {
      loadData(range);
    });
  }, [loadData, range]);

  return (
    <div className="space-y-6">
      <AnalyticsHeader onRefresh={handleRefresh} refreshing={isPending} />

      <TimeFilterBar
        activeTab={tab}
        activeRange={range}
        onTabChange={handleTabChange}
        onRangeChange={handleRangeChange}
      />

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="transition-opacity duration-300">
        <MetricCards
          totalRequests={stats.totalRequests}
          tokensIn={stats.tokensIn}
          tokensOut={stats.tokensOut}
          loading={loading}
        />
      </div>

      <div className="transition-opacity duration-300">
        {tab === 'overview' ? (
          <OverviewTab logs={logs} loading={loading} />
        ) : (
          <DetailsTab logs={logs} loading={loading} />
        )}
      </div>
    </div>
  );
}
