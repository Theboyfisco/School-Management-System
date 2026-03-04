"use client";

import Image from "next/image";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  {
    name: "Jan",
    income: 4000,
    expense: 2400,
  },
  {
    name: "Feb",
    income: 3000,
    expense: 1398,
  },
  {
    name: "Mar",
    income: 2000,
    expense: 9800,
  },
  {
    name: "Apr",
    income: 2780,
    expense: 3908,
  },
  {
    name: "May",
    income: 1890,
    expense: 4800,
  },
  {
    name: "Jun",
    income: 2390,
    expense: 3800,
  },
  {
    name: "Jul",
    income: 3490,
    expense: 4300,
  },
  {
    name: "Aug",
    income: 3490,
    expense: 4300,
  },
  {
    name: "Sep",
    income: 3490,
    expense: 4300,
  },
  {
    name: "Oct",
    income: 3490,
    expense: 4300,
  },
  {
    name: "Nov",
    income: 3490,
    expense: 4300,
  },
  {
    name: "Dec",
    income: 3490,
    expense: 4300,
  },
];

const FinanceChart = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl w-full h-full p-4 transition-colors duration-200">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Finance</h1>
        <button className="hover:bg-gray-100 dark:hover:bg-gray-700/50 p-1 rounded-full transition-colors">
          <Image src="/more.png" alt="" width={20} height={20} className="dark:invert" />
        </button>
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart
          width={500}
          height={300}
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-200 dark:text-gray-700" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tick={{ fill: "currentColor" }}
            tickLine={false}
            tickMargin={10}
            className="text-gray-600 dark:text-gray-400"
          />
          <YAxis 
            axisLine={false} 
            tick={{ fill: "currentColor" }} 
            tickLine={false} 
            tickMargin={20}
            className="text-gray-600 dark:text-gray-400"
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "var(--tooltip-bg)",
              border: "1px solid var(--tooltip-border)",
              borderRadius: "10px",
              color: "var(--tooltip-text)"
            }}
            itemStyle={{
              color: "var(--tooltip-text)"
            }}
          />
          <Legend
            align="center"
            verticalAlign="top"
            wrapperStyle={{ 
              paddingTop: "10px", 
              paddingBottom: "30px",
              color: "var(--legend-text)"
            }}
          />
          <Line
            type="monotone"
            dataKey="income"
            stroke="#60A5FA"
            strokeWidth={5}
          />
          <Line 
            type="monotone" 
            dataKey="expense" 
            stroke="#F87171" 
            strokeWidth={5}
          />
        </LineChart>
      </ResponsiveContainer>
      <style jsx global>{`
        :root {
          --tooltip-bg: #ffffff;
          --tooltip-border: #e5e7eb;
          --tooltip-text: #1f2937;
          --legend-text: #4b5563;
        }
        
        .dark {
          --tooltip-bg: #1F2937;
          --tooltip-border: #374151;
          --tooltip-text: #F3F4F6;
          --legend-text: #9CA3AF;
        }
      `}</style>
    </div>
  );
};

export default FinanceChart;
