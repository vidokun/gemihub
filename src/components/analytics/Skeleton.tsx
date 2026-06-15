import { Shimmer, SkeletonText, SkeletonCard, SkeletonCircle } from '@/components/Skeleton';

interface LegacySkeletonProps {
  className?: string;
  variant?: 'text' | 'card' | 'circle' | 'rect';
}

export default function LegacySkeleton({ className = '', variant = 'rect' }: LegacySkeletonProps) {
  if (variant === 'text') return <SkeletonText lines={2} className={className} />;
  if (variant === 'card') return <SkeletonCard className={className} />;
  if (variant === 'circle') return <SkeletonCircle className={className} />;
  return <Shimmer className={className} />;
}

export { Shimmer, SkeletonText, SkeletonCard, SkeletonCircle };
