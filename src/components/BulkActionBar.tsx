"use client";

import { useState, useTransition } from "react";
import { TrashIcon, XMarkIcon, CheckIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";

interface BulkActionBarProps {
  selectedIds: (string | number)[];
  onClearSelection: () => void;
  tableName: string;
  deleteAction: (ids: (string | number)[]) => Promise<{ success: boolean; error: boolean; message?: string }>;
  onSuccess?: () => void;
  onExport?: (ids: (string | number)[]) => void;
  onAssignClass?: (ids: (string | number)[]) => void;
}

const BulkActionBar = ({
  selectedIds,
  onClearSelection,
  tableName,
  deleteAction,
  onSuccess,
  onExport,
  onAssignClass,
}: BulkActionBarProps) => {
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  if (selectedIds.length === 0) return null;

  const handleBulkDelete = () => {
    startTransition(async () => {
      const loadingToast = toast.loading(`Deleting ${selectedIds.length} ${tableName}(s)...`);
      try {
        const result = await deleteAction(selectedIds);
        if (result.success) {
          toast.update(loadingToast, {
            render: `Successfully deleted ${selectedIds.length} ${tableName}(s)`,
            type: "success",
            isLoading: false,
            autoClose: 3000,
          });
          onClearSelection();
          onSuccess?.();
        } else {
          toast.update(loadingToast, {
            render: result.message || "Delete operation failed",
            type: "error",
            isLoading: false,
            autoClose: 5000,
          });
        }
      } catch {
        toast.update(loadingToast, {
          render: "An unexpected error occurred",
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      }
      setShowConfirm(false);
    });
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
      <div className="flex items-center gap-3 bg-surface-900 dark:bg-surface-100 text-white dark:text-surface-900 pl-5 pr-3 py-3 rounded-2xl shadow-2xl border border-surface-700 dark:border-surface-300">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary-500 flex items-center justify-center text-white text-xs font-bold">
            {selectedIds.length}
          </div>
          <span className="text-sm font-medium whitespace-nowrap">
            {selectedIds.length === 1 ? "item" : "items"} selected
          </span>
        </div>

        <div className="w-px h-6 bg-surface-700 dark:bg-surface-300 mx-1" />

        {!showConfirm ? (
          <>
            {onAssignClass && (
              <button
                onClick={() => onAssignClass(selectedIds)}
                disabled={isPending}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-surface-300 dark:text-surface-700 hover:bg-white/10 dark:hover:bg-black/5 rounded-xl transition-colors"
                title="Assign selected to a class"
              >
                <CheckIcon className="w-4 h-4" />
                Assign
              </button>
            )}
            
            {onExport && (
              <button
                onClick={() => onExport(selectedIds)}
                disabled={isPending}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-surface-300 dark:text-surface-700 hover:bg-white/10 dark:hover:bg-black/5 rounded-xl transition-colors"
                title="Export selected as CSV"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
              </button>
            )}

            <button
              onClick={() => setShowConfirm(true)}
              disabled={isPending}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-red-400 dark:text-red-600 hover:bg-red-500/10 rounded-xl transition-colors"
            >
              <TrashIcon className="w-4 h-4" />
              Delete
            </button>
            <button
              onClick={onClearSelection}
              className="p-2 hover:bg-surface-700 dark:hover:bg-surface-200 rounded-xl transition-colors"
              title="Clear selection"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <span className="text-xs text-surface-400 dark:text-surface-600 whitespace-nowrap">Are you sure?</span>
            <button
              onClick={handleBulkDelete}
              disabled={isPending}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {isPending ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <CheckIcon className="w-4 h-4" />
              )}
              Confirm
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              disabled={isPending}
              className="px-3 py-2 text-sm font-medium hover:bg-surface-700 dark:hover:bg-surface-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default BulkActionBar;
