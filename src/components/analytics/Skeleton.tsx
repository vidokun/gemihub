'use client';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'card' | 'circle' | 'rect';
}

export default function Skeleton({ className = '', variant = 'rect' }: SkeletonProps) {
  const shimmer =
    'bg-gradient-to-r from-[var(--card)] via-[var(--border)] to-[var(--card)] bg-[length:200%_100%] animate-shimmer';

  if (variant === 'text') {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className={`h-4 w-3/4 rounded ${shimmer}`} />
        <div className={`h-3 w-1/2 rounded ${shimmer}`} />
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 ${className}`}>
        <div className={`h-3 w-2/5 rounded ${shimmer}`} />
        <div className={`h-7 w-3/5 rounded mt-3 ${shimmer}`} />
        <div className={`h-3 w-1/3 rounded mt-2 ${shimmer}`} />
      </div>
    );
  }

  if (variant === 'circle') {
    return (
      <div
        className={`rounded-full ${shimmer} ${className}`}
        style={{ width: className ? undefined : 40, height: className ? undefined : 40 }}
      />
    );
  }

  return <div className={`rounded ${shimmer} ${className}`} />;
}
