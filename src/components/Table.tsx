"use client";

import React, { useState } from 'react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { TableSkeleton } from './Skeleton';

interface Column {
  header: string;
  accessor: string;
  className?: string;
  sortable?: boolean;
}

interface TableProps {
  columns: Column[];
  children: React.ReactNode;
  loading?: boolean;
  emptyMessage?: string;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
}

const Table = ({
  columns,
  children,
  loading = false,
  emptyMessage = "No data available",
  onSort,
  sortColumn,
  sortDirection,
}: TableProps) => {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const handleSort = (column: string) => {
    if (!onSort) return;
    const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(column, newDirection);
  };

  if (loading) {
    return (
      <div className="card p-6">
        <TableSkeleton rows={8} cols={columns.length} />
      </div>
    );
  }

  const childrenArray = React.Children.toArray(children);
  if (childrenArray.length === 0) {
    return (
      <div className="card overflow-hidden">
        <div className="px-6 py-12 text-center">
          <div className="mx-auto w-16 h-16 bg-surface-100 dark:bg-surface-800 rounded-2xl flex items-center justify-center mb-4 text-surface-400 dark:text-surface-500">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2 font-display">No data found</h3>
          <p className="text-surface-500 dark:text-surface-400 text-sm max-w-xs mx-auto">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto scrollbar-hide">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-50/50 dark:bg-surface-800/30 border-b border-surface-100 dark:border-surface-700/50">
              {columns.map((column) => (
                <th
                  key={column.accessor}
                  className={`px-6 py-4 text-[10px] font-bold text-surface-500 dark:text-surface-400 uppercase tracking-[0.12em] font-display ${
                    column.sortable ? 'cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-700/30 transition-colors' : ''
                  } ${column.className || ''}`}
                  onClick={() => column.sortable && handleSort(column.accessor)}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.header}</span>
                    {column.sortable && (
                      <div className="flex flex-col opacity-60">
                        <ChevronUpIcon
                          className={`w-3 h-3 ${
                            sortColumn === column.accessor && sortDirection === 'asc'
                              ? 'text-primary-600 dark:text-primary-400 opacity-100'
                              : 'text-surface-400'
                          }`}
                        />
                        <ChevronDownIcon
                          className={`w-3 h-3 -mt-1 ${
                            sortColumn === column.accessor && sortDirection === 'desc'
                              ? 'text-primary-600 dark:text-primary-400 opacity-100'
                              : 'text-surface-400'
                          }`}
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-50 dark:divide-surface-700/30">
            {children}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
