interface StatsCardProps {
  label: string;
  value: number;
  color: 'purple' | 'amber' | 'blue' | 'emerald';
}

const accentMap: Record<StatsCardProps['color'], string> = {
  purple: '#8b5cf6',
  amber: '#f59e0b',
  blue: '#3b82f6',
  emerald: '#10b981',
};

const bgTintMap: Record<StatsCardProps['color'], string> = {
  purple: 'rgba(139, 92, 246, 0.06)',
  amber: 'rgba(245, 158, 11, 0.06)',
  blue: 'rgba(59, 130, 246, 0.06)',
  emerald: 'rgba(16, 185, 129, 0.06)',
};

export default function StatsCard({ label, value, color }: StatsCardProps) {
  const accentColor = accentMap[color];
  const bgTint = bgTintMap[color];

  return (
    <div
      className="
        rounded-xl
        border border-[var(--border)]
        overflow-hidden
        transition-colors duration-150 ease-out
      "
      style={{ backgroundColor: bgTint }}
    >
      <div
        className="h-[3px] w-full"
        style={{ backgroundColor: accentColor }}
      />

      <div className="px-5 py-5">
        <p className="text-xs font-medium tracking-wide text-[var(--muted)] uppercase mb-2">
          {label}
        </p>
        <p
          className="text-[2rem] leading-none font-bold tabular-nums tracking-tight"
          style={{ color: accentColor }}
        >
          {value.toLocaleString()}
        </p>
      </div>
    </div>
  );
}
