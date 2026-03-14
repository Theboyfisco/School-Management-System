"use client";

import { useState, useEffect } from 'react';
import { useBulkSelection } from "./BulkSelectableTable";

interface TableRowProps {
  children: React.ReactNode;
  index: number;
  id?: string | number;
  isPending?: boolean;
}

const TableRow = ({ children, index, id, isPending: manualPending }: TableRowProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Try to get bulk selection context
  let isSelected = false;
  let isDeleting = false;
  try {
    const context = useBulkSelection();
    isSelected = id ? context.isSelected(id) : false;
    isDeleting = context.isDeleting;
  } catch {
    // Context not available, ignore
  }

  const isPending = manualPending || (isDeleting && isSelected);

  return (
    <tr
      className={`transition-all duration-300 border-l-[3px] ${
        isPending 
          ? 'opacity-40 grayscale pointer-events-none scale-[0.99] blur-[0.5px]' 
          : isHovered
            ? 'bg-primary-50/50 dark:bg-primary-500/5 border-primary-500'
            : 'hover:bg-surface-50/50 dark:hover:bg-surface-800/30 border-transparent'
      }`}
      onMouseEnter={() => !isPending && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </tr>
  );
};

export default TableRow; 