'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { RequestLog } from '@/lib/types';
import AnalyticsHeader from '@/components/analytics/AnalyticsHeader';
import TimeFilterBar from '@/components/analytics/TimeFilterBar';
import MetricCards from '@/components/analytics/MetricCards';
import OverviewTab from '@/components/analytics/OverviewTab';
import DetailsTab from '@/components/analytics/DetailsTab';

interface AnalyticsPageClientProps {
  initialTab: 'overview' | 'details';
  initialRange: string;
  totalRequests: number;
  tokensIn: number;
  tokensOut: number;
  estCost: number;
  logs: RequestLog[];
}

export default function AnalyticsPageClient({
  initialTab,
  initialRange,
  totalRequests,
  tokensIn,
  tokensOut,
  estCost,
  logs,
}: AnalyticsPageClientProps) {
  const router = useRouter();
  const [tab, setTab] = useState<'overview' | 'details'>(initialTab);
  const [range, setRange] = useState(initialRange);

  const handleTabChange = useCallback(
    (newTab: 'overview' | 'details') => {
      setTab(newTab);
      const params = new URLSearchParams();
      params.set('tab', newTab);
      params.set('range', range);
      router.replace(`/analytics?${params.toString()}`, { scroll: false });
    },
    [range, router],
  );

  const handleRangeChange = useCallback(
    (newRange: string) => {
      setRange(newRange);
      const params = new URLSearchParams();
      if (tab !== 'overview') params.set('tab', tab);
      params.set('range', newRange);
      router.replace(`/analytics?${params.toString()}`, { scroll: false });
    },
    [tab, router],
  );

  return (
    <div className="space-y-6">
      <AnalyticsHeader />

      <TimeFilterBar
        activeTab={tab}
        activeRange={range}
        onTabChange={handleTabChange}
        onRangeChange={handleRangeChange}
      />

      <MetricCards
        totalRequests={totalRequests}
        tokensIn={tokensIn}
        tokensOut={tokensOut}
        estCost={estCost}
      />

      {tab === 'overview' ? (
        <OverviewTab logs={logs} />
      ) : (
        <DetailsTab logs={logs} />
      )}
    </div>
  );
}
