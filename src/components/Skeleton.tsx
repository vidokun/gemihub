import type { CSSProperties } from 'react';

interface SkeletonProps {
  className?: string;
  style?: CSSProperties;
}

const shimmer =
  'bg-gradient-to-r from-[var(--card)] via-[var(--border)] to-[var(--card)] bg-[length:200%_100%] animate-shimmer';

export function Shimmer({ className = '', style }: SkeletonProps) {
  return <div className={`rounded ${shimmer} ${className}`} style={style} />;
}

export function SkeletonText({ lines = 2, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`rounded ${shimmer}`}
          style={{
            height: i === 0 ? 16 : 12,
            width: i === 0 ? '75%' : i === lines - 1 ? '33%' : '50%',
          }}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 ${className}`}>
      {children ?? (
        <>
          <div className={`h-3 w-2/5 rounded ${shimmer}`} />
          <div className={`h-7 w-3/5 rounded mt-3 ${shimmer}`} />
          <div className={`h-3 w-1/3 rounded mt-2 ${shimmer}`} />
        </>
      )}
    </div>
  );
}

export function SkeletonCircle({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <div
      className={`rounded-full ${shimmer} ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

export function SkeletonRow({ columns, className = '' }: { columns: number; className?: string }) {
  return (
    <div className={`flex items-center gap-4 px-4 py-3 border-b border-[var(--border)] last:border-b-0 ${className}`}>
      {Array.from({ length: columns }).map((_, i) => (
        <div
          key={i}
          className={`rounded ${shimmer}`}
          style={{
            height: 16,
            width: i === 0 ? 96 : i === columns - 1 ? 48 : 64,
          }}
        />
      ))}
    </div>
  );
}
