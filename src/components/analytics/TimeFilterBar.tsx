'use client';

interface TimeFilterBarProps {
  activeTab: 'overview' | 'details';
  activeRange: string;
  onTabChange: (tab: 'overview' | 'details') => void;
  onRangeChange: (range: string) => void;
}

const RANGES = ['Today', '24h', '7D', '30D', '60D'];

export default function TimeFilterBar({
  activeTab,
  activeRange,
  onTabChange,
  onRangeChange,
}: TimeFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex rounded-lg border border-[var(--border)] overflow-hidden">
        <button
          type="button"
          onClick={() => onTabChange('overview')}
          className={`
            px-4 py-1.5 text-sm font-medium
            transition-colors duration-150 ease-out
            ${
              activeTab === 'overview'
                ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
                : 'text-[var(--muted)] hover:text-[var(--text)]'
            }
          `}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => onTabChange('details')}
          className={`
            px-4 py-1.5 text-sm font-medium
            border-l border-[var(--border)]
            transition-colors duration-150 ease-out
            ${
              activeTab === 'details'
                ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
                : 'text-[var(--muted)] hover:text-[var(--text)]'
            }
          `}
        >
          Details
        </button>
      </div>

      <div className="flex rounded-lg border border-[var(--border)] overflow-hidden">
        {RANGES.map((range, i) => (
          <button
            key={range}
            type="button"
            onClick={() => onRangeChange(range)}
            className={`
              px-3 py-1.5 text-xs font-medium
              transition-colors duration-150 ease-out
              ${i > 0 ? 'border-l border-[var(--border)]' : ''}
              ${
                activeRange === range
                  ? 'bg-[var(--accent)] text-white'
                  : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--border)]'
              }
            `}
          >
            {range}
          </button>
        ))}
      </div>
    </div>
  );
}
