"use client";

import { useState } from 'react';

interface TableRowProps {
  children: React.ReactNode;
  index: number;
}

const TableRow = ({ children, index }: TableRowProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <tr
      className={`transition-all duration-200 border-l-[3px] ${
        isHovered
          ? 'bg-primary-50/50 dark:bg-primary-500/5 border-primary-500'
          : 'hover:bg-surface-50/50 dark:hover:bg-surface-800/30 border-transparent'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </tr>
  );
};

export default TableRow; 