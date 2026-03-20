import { SkeletonStats, SkeletonCard, SkeletonHistory } from '@/components/ui/Skeleton';

export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header skeleton */}
      <div className="space-y-2 pl-12 lg:pl-0">
        <div className="h-8 w-56 rounded-lg bg-surface-200/50 animate-shimmer bg-gradient-to-r from-surface-200/50 via-surface-300/30 to-surface-200/50 bg-[length:200%_100%]" />
        <div className="h-4 w-40 rounded-lg bg-surface-200/50 animate-shimmer bg-gradient-to-r from-surface-200/50 via-surface-300/30 to-surface-200/50 bg-[length:200%_100%]" />
      </div>

      {/* Stats */}
      <SkeletonStats />

      {/* Tool cards */}
      <div>
        <div className="h-6 w-32 rounded mb-4 bg-surface-200/50 animate-shimmer bg-gradient-to-r from-surface-200/50 via-surface-300/30 to-surface-200/50 bg-[length:200%_100%]" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>

      {/* History */}
      <div>
        <div className="h-6 w-36 rounded mb-4 bg-surface-200/50 animate-shimmer bg-gradient-to-r from-surface-200/50 via-surface-300/30 to-surface-200/50 bg-[length:200%_100%]" />
        <SkeletonHistory />
      </div>
    </div>
  );
}
