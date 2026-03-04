"use client";
import Image from "next/image";
import {
  BarChart,
  Bar,
  Rectangle,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const AttendanceChart = ({
  data,
}: {
  data: { name: string; present: number; absent: number }[];
}) => {
  return (
    <>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart width={500} height={300} data={data} barSize={20}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-gray-200 dark:text-gray-700" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tick={{ fill: "currentColor" }}
            tickLine={false}
            className="text-gray-600 dark:text-gray-400"
          />
          <YAxis 
            axisLine={false} 
            tick={{ fill: "currentColor" }} 
            tickLine={false}
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
            align="left"
            verticalAlign="top"
            wrapperStyle={{ 
              paddingTop: "20px", 
              paddingBottom: "40px",
              color: "var(--legend-text)"
            }}
          />
          <Bar
            dataKey="present"
            fill="#60A5FA"
            legendType="circle"
            radius={[10, 10, 0, 0]}
          />
          <Bar
            dataKey="absent"
            fill="#F87171"
            legendType="circle"
            radius={[10, 10, 0, 0]}
          />
        </BarChart>
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
    </>
  );
};

export default AttendanceChart;
