import React from 'react';
import {
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/utils';

interface RadarChartProps {
  data: any[];
  metrics: string[];
  series: {
    key: string;
    label: string;
    color: string;
  }[];
  height?: number;
  theme?: 'light' | 'dark';
  className?: string;
}

export function RadarChart({
  data,
  metrics,
  series,
  height = 400,
  theme = 'light',
  className,
}: RadarChartProps) {
  const textColor = theme === 'dark' ? '#fff' : '#000';
  const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke={gridColor} />
          <PolarAngleAxis
            dataKey="metric"
            tick={{ fill: textColor }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: textColor }}
          />
          {series.map(({ key, label, color }) => (
            <Radar
              key={key}
              name={label}
              dataKey={key}
              stroke={color}
              fill={color}
              fillOpacity={0.6}
            />
          ))}
          <Legend />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
} 