"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

const Skeleton = ({ className, style }: SkeletonProps) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-surface-200 dark:bg-surface-700/50 rounded-lg",
        className
      )}
      style={style}
    >
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: "linear",
        }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent dark:via-white/5"
      />
    </div>
  );
};

export const TableSkeleton = ({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) => {
  return (
    <div className="w-full space-y-4 animate-fade-in">
      {/* Header Skeleton */}
      <div className="flex gap-4 mb-6">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={`h-${i}`} className="h-4 flex-1" />
        ))}
      </div>
      {/* Row Skeletons */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={`r-${i}`} className="flex gap-4 py-4 border-b border-surface-100 dark:border-surface-800">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={`c-${i}-${j}`} className="h-10 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
};

export const ChartSkeleton = () => {
  return (
    <div className="w-full h-full flex flex-col gap-4 p-4 animate-fade-in">
      <div className="flex justify-between items-end h-64 gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="w-full" style={{ height: `${Math.random() * 80 + 20}%` }} />
        ))}
      </div>
      <div className="flex justify-between gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-12" />
        ))}
      </div>
    </div>
  );
};

export const ProfileSkeleton = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Side: Main Info Card */}
        <div className="flex-1 space-y-4">
          <div className="card p-6 flex flex-col md:flex-row gap-6">
            <Skeleton className="w-32 h-32 rounded-full mx-auto md:mx-0" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-8 w-64" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          </div>
          {/* Charts/Content Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
        {/* Right Side: Quick Info */}
        <div className="w-full lg:w-80 space-y-4">
          <div className="card p-6 space-y-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Skeleton;
