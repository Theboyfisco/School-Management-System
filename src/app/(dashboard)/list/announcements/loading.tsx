import { TableSkeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="h-10 w-64 bg-surface-200 dark:bg-surface-800 rounded-xl" />
          <div className="h-4 w-80 bg-surface-200 dark:bg-surface-800 rounded-lg" />
        </div>
        <div className="h-11 w-44 bg-surface-200 dark:bg-surface-800 rounded-xl" />
      </div>

      {/* Stats Skeleton */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-12 h-12 bg-surface-200 dark:bg-surface-800 rounded-xl" />
              <div className="space-y-2">
                <div className="h-3 w-12 bg-surface-200 dark:bg-surface-800 rounded-full" />
                <div className="h-5 w-8 bg-surface-200 dark:bg-surface-800 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters Skeleton */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="h-10 w-full lg:max-w-md bg-surface-200 dark:bg-surface-800 rounded-xl" />
        <div className="w-10 h-10 bg-surface-200 dark:bg-surface-800 rounded-xl self-end" />
      </div>

      {/* Table Skeleton */}
      <div className="card p-6">
        <TableSkeleton rows={8} cols={5} />
      </div>
    </div>
  );
}
