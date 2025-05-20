import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cpu, HardDrive, Network, Memory } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import type { SystemMetrics } from '@/lib/monitoring/types';

interface SystemMetricsProps {
  metrics: SystemMetrics[];
  timeRange: '1h' | '24h' | '7d' | '30d';
}

const METRIC_COLORS = {
  cpu: {
    usage: '#3b82f6',
    temperature: '#ef4444',
  },
  memory: {
    used: '#ef4444',
    free: '#22c55e',
    cached: '#f59e0b',
  },
  disk: {
    used: '#ef4444',
    free: '#22c55e',
    read: '#3b82f6',
    write: '#8b5cf6',
  },
  network: {
    in: '#3b82f6',
    out: '#8b5cf6',
    connections: '#f59e0b',
  },
};

export function SystemMetrics({ metrics, timeRange }: SystemMetricsProps) {
  // Process metrics for visualization
  const processMetrics = (metrics: SystemMetrics[]) => {
    return metrics.map(metric => ({
      timestamp: new Date(metric.timestamp).toISOString(),
      cpu: {
        usage: metric.cpu.usage,
        temperature: metric.cpu.temperature,
      },
      memory: {
        used: metric.memory.used,
        free: metric.memory.free,
        cached: metric.memory.cached,
        total: metric.memory.total,
      },
      disk: {
        used: metric.disk.used,
        free: metric.disk.free,
        read: metric.disk.readRate,
        write: metric.disk.writeRate,
      },
      network: {
        in: metric.network.inRate,
        out: metric.network.outRate,
        connections: metric.network.connections,
      },
    }));
  };

  const chartData = processMetrics(metrics);

  // Calculate summary metrics
  const latestMetric = metrics[metrics.length - 1];
  const cpuUsage = latestMetric?.cpu.usage ?? 0;
  const memoryUsage = latestMetric?.memory.used / latestMetric?.memory.total ?? 0;
  const diskUsage = latestMetric?.disk.used / (latestMetric?.disk.used + latestMetric?.disk.free) ?? 0;
  const networkIn = latestMetric?.network.inRate ?? 0;
  const networkOut = latestMetric?.network.outRate ?? 0;

  // Calculate trends
  const calculateTrend = (values: number[]) => {
    if (values.length < 2) return 0;
    const first = values[0];
    const last = values[values.length - 1];
    return ((last - first) / first) * 100;
  };

  const cpuTrend = calculateTrend(metrics.map(m => m.cpu.usage));
  const memoryTrend = calculateTrend(metrics.map(m => m.memory.used / m.memory.total));
  const diskTrend = calculateTrend(metrics.map(m => m.disk.used / (m.disk.used + m.disk.free)));
  const networkTrend = calculateTrend(metrics.map(m => m.network.inRate + m.network.outRate));

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cpuUsage.toFixed(1)}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span className={cpuTrend > 0 ? 'text-destructive' : 'text-green-500'}>
                {cpuTrend > 0 ? '↑' : '↓'} {Math.abs(cpuTrend).toFixed(1)}%
              </span>
              <span className="ml-1">vs last {timeRange}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Memory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(memoryUsage * 100).toFixed(1)}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span className={memoryTrend > 0 ? 'text-destructive' : 'text-green-500'}>
                {memoryTrend > 0 ? '↑' : '↓'} {Math.abs(memoryTrend).toFixed(1)}%
              </span>
              <span className="ml-1">vs last {timeRange}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(diskUsage * 100).toFixed(1)}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span className={diskTrend > 0 ? 'text-destructive' : 'text-green-500'}>
                {diskTrend > 0 ? '↑' : '↓'} {Math.abs(diskTrend).toFixed(1)}%
              </span>
              <span className="ml-1">vs last {timeRange}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Network Traffic</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(networkIn + networkOut).toFixed(1)} MB/s
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span className={networkTrend > 0 ? 'text-destructive' : 'text-green-500'}>
                {networkTrend > 0 ? '↑' : '↓'} {Math.abs(networkTrend).toFixed(1)}%
              </span>
              <span className="ml-1">vs last {timeRange}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* CPU Usage */}
        <Card>
          <CardHeader>
            <CardTitle>CPU Usage & Temperature</CardTitle>
            <CardDescription>
              CPU utilization and temperature over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                  />
                  <YAxis yAxisId="left" label={{ value: 'Usage (%)', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" label={{ value: 'Temperature (°C)', angle: 90, position: 'insideRight' }} />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value, name) => {
                      const unit = name.includes('temperature') ? '°C' : '%';
                      return [`${value}${unit}`, name];
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="cpu.usage"
                    stroke={METRIC_COLORS.cpu.usage}
                    name="CPU Usage"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="cpu.temperature"
                    stroke={METRIC_COLORS.cpu.temperature}
                    name="CPU Temperature"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Memory Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Memory Usage</CardTitle>
            <CardDescription>
              Memory utilization over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                  />
                  <YAxis label={{ value: 'Memory (GB)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value) => [`${(value as number / 1024).toFixed(1)} GB`, '']}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="memory.used"
                    stackId="1"
                    stroke={METRIC_COLORS.memory.used}
                    fill={METRIC_COLORS.memory.used}
                    name="Used"
                  />
                  <Area
                    type="monotone"
                    dataKey="memory.cached"
                    stackId="1"
                    stroke={METRIC_COLORS.memory.cached}
                    fill={METRIC_COLORS.memory.cached}
                    name="Cached"
                  />
                  <Area
                    type="monotone"
                    dataKey="memory.free"
                    stackId="1"
                    stroke={METRIC_COLORS.memory.free}
                    fill={METRIC_COLORS.memory.free}
                    name="Free"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Disk I/O */}
        <Card>
          <CardHeader>
            <CardTitle>Disk I/O</CardTitle>
            <CardDescription>
              Disk read and write rates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                  />
                  <YAxis label={{ value: 'Rate (MB/s)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value) => [`${value} MB/s`, '']}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="disk.read"
                    stroke={METRIC_COLORS.disk.read}
                    name="Read Rate"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="disk.write"
                    stroke={METRIC_COLORS.disk.write}
                    name="Write Rate"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Network Traffic */}
        <Card>
          <CardHeader>
            <CardTitle>Network Traffic</CardTitle>
            <CardDescription>
              Network input/output rates and connections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                  />
                  <YAxis yAxisId="left" label={{ value: 'Rate (MB/s)', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" label={{ value: 'Connections', angle: 90, position: 'insideRight' }} />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value, name) => {
                      const unit = name.includes('connections') ? '' : ' MB/s';
                      return [`${value}${unit}`, name];
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="network.in"
                    stroke={METRIC_COLORS.network.in}
                    name="Inbound"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="network.out"
                    stroke={METRIC_COLORS.network.out}
                    name="Outbound"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="network.connections"
                    stroke={METRIC_COLORS.network.connections}
                    name="Connections"
                    strokeWidth={1}
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 