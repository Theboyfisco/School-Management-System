import { TableSkeleton } from "@/components/Skeleton";

const Loading = () => {
  return (
    <div className="p-8">
      <div className="card p-8">
        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <div className="h-8 bg-surface-200 dark:bg-surface-700/50 rounded-lg w-48 animate-pulse" />
            <div className="h-4 bg-surface-100 dark:bg-surface-800 rounded-lg w-64 animate-pulse" />
          </div>
          <TableSkeleton rows={10} cols={5} />
        </div>
      </div>
    </div>
  );
};

export default Loading;
