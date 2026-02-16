'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="glass-card p-5 space-y-3">
      <Skeleton className="h-3 w-24 bg-white/[0.06]" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-4 bg-white/[0.06]" style={{ width: `${80 - i * 15}%` }} />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="glass-card p-5 space-y-2">
      <Skeleton className="h-3 w-32 bg-white/[0.06] mb-4" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="h-3 flex-1 bg-white/[0.06]" />
          <Skeleton className="h-3 w-16 bg-white/[0.06]" />
          <Skeleton className="h-3 w-12 bg-white/[0.06]" />
        </div>
      ))}
    </div>
  );
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
