"use client";

import { ITEM_PER_PAGE } from "@/lib/settings";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

const Pagination = ({ page, count }: { page: number; count: number }) => {
  const router = useRouter();

  const pagesCount = Math.ceil(count / ITEM_PER_PAGE);
  const hasPrev = page > 1;
  const hasNext = page < pagesCount;

  const changePage = (newPage: number) => {
    if (newPage < 1 || newPage > pagesCount) return;
    const params = new URLSearchParams(window.location.search);
    params.set("page", newPage.toString());
    router.push(`${window.location.pathname}?${params}`);
  };

  return (
    <div className="flex items-center justify-between gap-4 py-4 w-full">
      <button
        disabled={!hasPrev}
        className="btn btn-secondary btn-sm gap-1 pl-2.5"
        onClick={() => changePage(page - 1)}
      >
        <ChevronLeftIcon className="w-4 h-4" />
        <span>Prev</span>
      </button>
      
      <div className="flex items-center gap-1.5">
        {Array.from({ length: pagesCount }, (_, index) => {
          const pageIndex = index + 1;
          // Only show 5 pages around current page if there are many pages
          if (pagesCount > 7) {
            if (pageIndex !== 1 && pageIndex !== pagesCount && Math.abs(pageIndex - page) > 1) {
              if (Math.abs(pageIndex - page) === 2) return <span key={pageIndex} className="text-surface-400 px-1">...</span>;
              return null;
            }
          }
          
          return (
            <button
              key={pageIndex}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-all duration-200 ${
                page === pageIndex 
                  ? "bg-primary-600 text-white shadow-glow" 
                  : "text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800"
              }`}
              onClick={() => changePage(pageIndex)}
            >
              {pageIndex}
            </button>
          );
        })}
      </div>

      <button
        disabled={!hasNext}
        className="btn btn-secondary btn-sm gap-1 pr-2.5"
        onClick={() => changePage(page + 1)}
      >
        <span>Next</span>
        <ChevronRightIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Pagination;
