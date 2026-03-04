import React from "react";

interface SkeletonProps {
  className?: string;
}

const Skeleton = ({ className }: SkeletonProps) => {
  return (
    <div
      className={`bg-surface-200 dark:bg-surface-700 animate-pulse rounded-md ${className}`}
    />
  );
};

export const ProfileSkeleton = () => {
  return (
    <div className="flex-1 space-y-8 animate-fade-in pb-12">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="w-24 h-3" />
            <Skeleton className="w-48 h-8" />
          </div>
        </div>
        <Skeleton className="w-32 h-10 rounded-xl" />
      </div>

      {/* Hero Skeleton */}
      <div className="glass-strong rounded-[2.5rem] overflow-hidden border border-white/20 dark:border-surface-700/50 shadow-glass-lg relative h-[380px]">
        <Skeleton className="h-40 w-full" />
        <div className="px-8 pb-8 -mt-16 relative flex flex-col md:flex-row items-end gap-6">
          <Skeleton className="w-32 h-32 md:w-36 md:h-36 rounded-[1.75rem]" />
          <div className="flex-1 mb-2 space-y-3">
            <div className="flex gap-2">
              <Skeleton className="w-64 h-10" />
              <Skeleton className="w-24 h-6 rounded-full" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="w-32 h-4" />
              <Skeleton className="w-32 h-4" />
              <Skeleton className="w-32 h-4" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 px-8 mt-12">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
          <Skeleton className="h-[600px] rounded-2xl" />
        </div>
        <div className="space-y-8">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    </div>
  );
};

export default Skeleton;
