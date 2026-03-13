"use client";

import { ReactNode } from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface BaseFormProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  isSubmitting?: boolean;
  success?: boolean;
  error?: any;
  className?: string;
  customFooter?: ReactNode;
}

/**
 * BaseForm is a layout wrapper for all forms in the application.
 * It provides a consistent header, success/error alerts, and action buttons.
 * It is designed to be used inside a Modal (like FormModal).
 */
const BaseForm = ({
  title,
  subtitle,
  children,
  onSubmit,
  onCancel,
  submitLabel = "Save Changes",
  cancelLabel = "Cancel",
  isLoading = false,
  isSubmitting = false,
  success = false,
  error,
  className = "",
  customFooter
}: BaseFormProps) => {

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isLoading) return;
    onSubmit(e);
  };

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-surface-900 ${className}`}>
      {/* Header - Fixed at top */}
      <div className="p-8 border-b border-surface-100 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-800/30">
        <h2 className="text-2xl font-bold text-surface-900 dark:text-white font-display">
          {title}
        </h2>
        {subtitle && (
          <p className="text-surface-500 dark:text-surface-400 mt-1.5 text-sm font-medium">
            {subtitle}
          </p>
        )}
      </div>

      {/* Form Content - Scrollable */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {/* Success Alert */}
          {success && (
            <div className="bg-success-50 dark:bg-success-500/10 border border-success-200 dark:border-success-500/20 rounded-2xl p-4 animate-fade-in-up">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-success-500 flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-success-500/20">
                    <CheckCircleIcon className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-success-900 dark:text-success-400 font-bold">Success!</p>
                    <p className="text-success-700 dark:text-success-500 text-sm">Operation completed successfully.</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="bg-danger-50 dark:bg-danger-500/10 border border-danger-200 dark:border-danger-500/20 rounded-2xl p-4 animate-fade-in-up">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-danger-500 flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-danger-500/20">
                    <ExclamationTriangleIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-danger-900 dark:text-danger-400 font-bold">
                    {error.title || "Something went wrong"}
                  </p>
                  {error.message && (
                    <p className="text-danger-700 dark:text-danger-500 text-sm">
                      {error.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-8 pb-4">
            {children}
          </div>
        </div>

        {/* Sticky Actions Footer */}
        <div className="p-6 border-t border-surface-100 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-800/30 flex items-center justify-end gap-3">
          {customFooter ? customFooter : (
            <>
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting || isLoading}
                className="btn btn-secondary px-8 py-3"
              >
                {cancelLabel}
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="btn btn-primary px-10 py-3 gap-2 min-w-[160px]"
              >
                {isSubmitting || isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>{submitLabel}</span>
                )}
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default BaseForm;