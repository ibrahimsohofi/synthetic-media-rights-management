import React from 'react';
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/utils';

interface AreaChartProps {
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

export function AreaChart({
  data,
  xAxis,
  series,
  height = 400,
  theme = 'light',
  className,
}: AreaChartProps) {
  const textColor = theme === 'dark' ? '#fff' : '#000';
  const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <defs>
            {series.map(({ key, color }) => (
              <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
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
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              name={label}
              stroke={color}
              fillOpacity={1}
              fill={`url(#gradient-${key})`}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
} 