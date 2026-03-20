import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'circular' | 'text';
}

export function Skeleton({
  className,
  variant = 'default',
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-muted',
        variant === 'circular' && 'rounded-full',
        variant === 'text' && 'h-4 rounded',
        variant === 'default' && 'rounded-[var(--radius-md)]',
        className
      )}
      {...props}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-[var(--radius-lg)] border bg-card p-4 space-y-4">
      <Skeleton className="h-40 w-full" />
      <div className="space-y-2">
        <Skeleton variant="text" className="w-3/4" />
        <Skeleton variant="text" className="w-1/2" />
      </div>
      <Skeleton variant="text" className="w-1/4" />
    </div>
  );
}

export function SkeletonProduct() {
  return (
    <div className="rounded-[var(--radius-lg)] border bg-card p-4 space-y-3">
      <Skeleton className="aspect-square w-full" />
      <Skeleton variant="text" className="w-full" />
      <Skeleton variant="text" className="w-2/3" />
      <div className="flex items-center justify-between pt-2">
        <Skeleton variant="text" className="w-20" />
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-4 border-b pb-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="text" className="flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-2">
          {Array.from({ length: 4 }).map((_, j) => (
            <Skeleton key={j} variant="text" className="flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
