"use client";

import { useState } from 'react';

interface TableRowProps {
  children: React.ReactNode;
  index: number;
  isPending?: boolean;
}

const TableRow = ({ children, index, isPending }: TableRowProps) => {
  const [isHovered, setIsHovered] = useState(false);

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