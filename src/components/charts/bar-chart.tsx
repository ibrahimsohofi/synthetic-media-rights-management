import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/utils';

interface BarChartProps {
  data: any[];
  xAxis: string;
  series: {
    key: string;
    label: string;
    color: string;
  }[];
  height?: number;
  theme?: 'light' | 'dark';
  className?: string;
}

export function BarChart({
  data,
  xAxis,
  series,
  height = 400,
  theme = 'light',
  className,
}: BarChartProps) {
  const textColor = theme === 'dark' ? '#fff' : '#000';
  const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey={xAxis}
            stroke={textColor}
            tick={{ fill: textColor }}
          />
          <YAxis stroke={textColor} tick={{ fill: textColor }} />
          <Tooltip
            contentStyle={{
              backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
              border: 'none',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            labelStyle={{ color: textColor }}
          />
          <Legend />
          {series.map(({ key, label, color }) => (
            <Bar
              key={key}
              dataKey={key}
              name={label}
              fill={color}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
} 