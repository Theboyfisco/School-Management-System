import { TableSkeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="h-10 w-48 bg-surface-200 dark:bg-surface-800 rounded-xl" />
          <div className="h-4 w-64 bg-surface-200 dark:bg-surface-800 rounded-lg" />
        </div>
        <div className="h-11 w-36 bg-surface-200 dark:bg-surface-800 rounded-xl" />
      </div>

      {/* Stats Summary Skeleton */}
      <div className="card p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 items-center gap-6 sm:gap-8">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-12 h-12 bg-surface-200 dark:bg-surface-800 rounded-xl" />
              <div className="space-y-2">
                <div className="h-3 w-20 bg-surface-200 dark:bg-surface-800 rounded-full" />
                <div className="h-6 w-12 bg-surface-200 dark:bg-surface-800 rounded-lg" />
              </div>
            </div>
          ))}
          <div className="h-16 bg-surface-200 dark:bg-surface-800/50 rounded-xl sm:col-span-2 lg:col-span-2" />
        </div>
      </div>

      {/* Filters Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="h-10 w-full md:w-80 bg-surface-200 dark:bg-surface-800 rounded-xl" />
        <div className="flex gap-2">
          <div className="w-10 h-10 bg-surface-200 dark:bg-surface-800 rounded-xl" />
          <div className="w-10 h-10 bg-surface-200 dark:bg-surface-800 rounded-xl" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="card p-6">
        <TableSkeleton rows={8} cols={6} />
      </div>
    </div>
  );
}
