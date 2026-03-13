"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

type CountChartProps = {
  data: Array<{
    name: string;
    value: number;
    color: string;
    href?: string;
  }>;
};

// Color mapping for both chart and summary
const colorMap: { [key: string]: string } = {
  'bg-blue-500': '#3B82F6',
  'bg-green-500': '#10B981',
  'bg-purple-500': '#8B5CF6',
  'bg-orange-500': '#F59E0B',
  'bg-red-500': '#EF4444',
  'bg-yellow-500': '#EAB308',
  'bg-pink-500': '#EC4899',
  'bg-indigo-500': '#6366F1',
  'bg-primary-500': '#6366F1',
  'bg-accent-500': '#7C3AED',
  'bg-success-500': '#10B981',
  'bg-warning-500': '#F59E0B',
  'bg-danger-500': '#EF4444',
  'bg-warning-400': '#FBBF24',
};

// Custom Legend component for right-side display
const CustomLegend = ({ payload, activeIndex, setActiveIndex, onItemClick }: { payload?: any[], activeIndex: number, setActiveIndex: (i: number) => void, onItemClick?: (href: string) => void }) => {
  if (!payload) return null;
  return (
    <div
      className="w-full max-w-xs md:max-w-none md:w-auto flex md:flex-col flex-row gap-2 md:gap-2 overflow-x-auto md:overflow-y-auto md:overflow-x-visible scrollbar-thin scrollbar-thumb-blue-200 dark:scrollbar-thumb-blue-900"
      style={{
        maxHeight: "220px",
        minWidth: 160,
      }}
      role="list"
    >
      {payload.map((entry, index) => (
        <button
          key={`legend-item-${index}`}
          className={`flex items-center px-2 py-1 rounded transition-all duration-150 focus:outline-none whitespace-nowrap ${activeIndex === index ? 'bg-blue-50 dark:bg-blue-900/30 scale-105' : ''} ${entry.href ? 'cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/20' : ''}`}
          style={{ cursor: entry.href ? 'pointer' : 'default' }}
          tabIndex={0}
          aria-label={`${entry.label}: ${entry.value} (${entry.percent}%)`}
          onMouseEnter={() => setActiveIndex(index)}
          onFocus={() => setActiveIndex(index)}
          onMouseLeave={() => setActiveIndex(-1)}
          onClick={() => entry.href && onItemClick?.(entry.href)}
        >
          <span
            className="inline-block w-3 h-3 rounded-full mr-2 border"
            style={{ backgroundColor: entry.color, borderColor: entry.color }}
            aria-hidden="true"
          ></span>
          <span className="truncate text-gray-700 dark:text-gray-200 font-medium" title={entry.value}>
            {entry.label}
          </span>
          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">{entry.value}</span>
          <span className="ml-1 text-xs text-gray-400">({entry.percent}%)</span>
        </button>
      ))}
    </div>
  );
};

// Custom Tooltip with premium styling
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload[0]) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-sm font-bold text-surface-900 dark:text-white">{data.name}</p>
      <p className="text-lg font-bold mt-0.5" style={{ color: colorMap[data.color] || '#6B7280' }}>{data.value}</p>
      {data.href && (
        <p className="text-[10px] text-primary-500 mt-1 font-semibold uppercase tracking-wider">Click to view details</p>
      )}
    </div>
  );
};

const CountChart = ({ data }: CountChartProps) => {
  const filteredData = data.filter(item => item.value > 0);
  const total = filteredData.reduce((sum, item) => sum + item.value, 0);
  const [activeIndex, setActiveIndex] = useState(-1);
  const router = useRouter();

  const handleSegmentClick = (entry: any) => {
    if (entry?.href) {
      router.push(entry.href);
    }
  };

  if (filteredData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <div className="text-4xl mb-2">📊</div>
          <p>No data available</p>
        </div>
      </div>
    );
  }

  const COLORS = filteredData.map(item => colorMap[item.color] || '#6B7280');

  // Legend payload with label, value, percent, and drill-down href
  const legendPayload = filteredData.map((item, i) => ({
    color: COLORS[i % COLORS.length],
    label: item.name,
    value: item.value,
    percent: ((item.value / total) * 100).toFixed(0),
    href: item.href,
  }));

  return (
    <div className="bg-gradient-to-br from-white via-blue-50 to-blue-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 shadow-lg border border-gray-100 dark:border-gray-700 rounded-2xl w-full h-96 flex flex-col md:flex-row items-center justify-between p-6 gap-4 transition-all duration-300">
      <div className="flex-1 flex flex-col items-center justify-center relative h-full min-w-[220px]">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={filteredData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={110}
              labelLine={false}
              isAnimationActive={true}
              animationDuration={700}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              fill="#8884d8"
              dataKey="value"
              activeIndex={activeIndex}
              onMouseEnter={(_, idx) => setActiveIndex(idx)}
              onMouseLeave={() => setActiveIndex(-1)}
              onClick={(_, idx) => handleSegmentClick(filteredData[idx])}
              style={{ cursor: 'pointer' }}
            >
              {filteredData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Center total value */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none select-none">
          <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">{total}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Total</span>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center w-full md:w-auto">
        <CustomLegend 
          payload={legendPayload} 
          activeIndex={activeIndex} 
          setActiveIndex={setActiveIndex}
          onItemClick={(href) => router.push(href)}
        />
      </div>
    </div>
  );
};

export default CountChart;
