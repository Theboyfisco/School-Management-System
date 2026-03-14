import { TableSkeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-surface-200 dark:bg-surface-700 rounded-lg animate-pulse" />
          <div className="h-4 w-64 bg-surface-100 dark:bg-surface-800 rounded-md animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-surface-200 dark:bg-surface-700 rounded-xl animate-pulse" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-white dark:bg-surface-800 rounded-2xl border border-surface-100 dark:border-surface-700/50 p-5 space-y-4">
            <div className="flex justify-between items-center">
              <div className="w-10 h-10 bg-surface-100 dark:bg-surface-700 rounded-xl animate-pulse" />
              <div className="w-12 h-5 bg-surface-50 dark:bg-surface-700 rounded-full animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-8 w-16 bg-surface-200 dark:bg-surface-700 rounded-lg animate-pulse" />
              <div className="h-4 w-24 bg-surface-100 dark:bg-surface-800 rounded-md animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <TableSkeleton rows={8} cols={5} />
      </div>
    </div>
  );
}
