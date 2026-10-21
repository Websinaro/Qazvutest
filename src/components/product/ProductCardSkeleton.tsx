import React from 'react';

/**
 * Mirrors the real ProductCard layout so the page doesn't jump when data
 * replaces the skeleton.
 */
export function ProductCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <div
      style={{ animationDelay: `${Math.min(index, 11) * 60}ms` }}
      className="animate-skeleton-in h-full flex flex-col"
    >
      <div className="relative aspect-[4/5] w-full rounded-md shimmer-bg" />
      <div className="pt-3 flex-1 flex flex-col gap-2">
        <div className="h-2.5 w-1/4 rounded-sm shimmer-bg" />
        <div className="h-3.5 w-full rounded-sm shimmer-bg" />
        <div className="h-3.5 w-2/3 rounded-sm shimmer-bg" />
        <div className="mt-auto pt-3 flex items-center justify-between">
          <div className="h-5 w-20 rounded-sm shimmer-bg" />
          <div className="h-8 w-16 rounded-md shimmer-bg" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({
  count = 8,
  className = 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-9 sm:gap-x-6',
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} index={i} />
      ))}
    </div>
  );
}
