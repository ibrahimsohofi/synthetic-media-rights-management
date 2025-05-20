import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Network, Globe, Shield, AlertTriangle } from "lucide-react";
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import type { NetworkMetrics } from '@/lib/monitoring/types';

interface NetworkAnalysisProps {
  metrics: NetworkMetrics[];
  timeRange: '1h' | '24h' | '7d' | '30d';
}

const NETWORK_COLORS = {
  traffic: {
    in: '#3b82f6',
    out: '#8b5cf6',
    total: '#10b981',
  },
  protocols: {
    http: '#3b82f6',
    https: '#10b981',
    ws: '#f59e0b',
    wss: '#ef4444',
  },
  status: {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
  },
  regions: {
    na: '#3b82f6',
    eu: '#10b981',
    as: '#f59e0b',
    sa: '#ef4444',
    af: '#8b5cf6',
    oc: '#6366f1',
  },
};

export function NetworkAnalysis({ metrics, timeRange }: NetworkAnalysisProps) {
  // Process metrics for visualization
  const processMetrics = (metrics: NetworkMetrics[]) => {
    return metrics.map(metric => ({
      timestamp: new Date(metric.timestamp).toISOString(),
      traffic: {
        in: metric.inRate,
        out: metric.outRate,
        total: metric.inRate + metric.outRate,
      },
      protocols: metric.protocols,
      status: metric.statusCodes,
      regions: metric.regionalTraffic,
      connections: metric.activeConnections,
      latency: metric.avgLatency,
      errors: metric.errorRate,
    }));
  };

  const chartData = processMetrics(metrics);

  // Calculate summary metrics
  const latestMetric = metrics[metrics.length - 1];
  const totalTraffic = latestMetric?.inRate + latestMetric?.outRate ?? 0;
  const errorRate = latestMetric?.errorRate ?? 0;
  const avgLatency = latestMetric?.avgLatency ?? 0;
  const activeConnections = latestMetric?.activeConnections ?? 0;

  // Calculate trends
  const calculateTrend = (values: number[]) => {
    if (values.length < 2) return 0;
    const first = values[0];
    const last = values[values.length - 1];
    return ((last - first) / first) * 100;
  };

  const trafficTrend = calculateTrend(metrics.map(m => m.inRate + m.outRate));
  const errorTrend = calculateTrend(metrics.map(m => m.errorRate));
  const latencyTrend = calculateTrend(metrics.map(m => m.avgLatency));
  const connectionsTrend = calculateTrend(metrics.map(m => m.activeConnections));

  // Process protocol distribution
  const protocolData = Object.entries(latestMetric?.protocols ?? {}).map(([name, value]) => ({
    name,
    value,
  }));

  // Process regional distribution
  const regionalData = Object.entries(latestMetric?.regionalTraffic ?? {}).map(([region, value]) => ({
    name: region.toUpperCase(),
    value,
  }));

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Traffic</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTraffic.toFixed(1)} MB/s</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span className={trafficTrend > 0 ? 'text-destructive' : 'text-green-500'}>
                {trafficTrend > 0 ? '↑' : '↓'} {Math.abs(trafficTrend).toFixed(1)}%
              </span>
              <span className="ml-1">vs last {timeRange}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(errorRate * 100).toFixed(2)}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span className={errorTrend > 0 ? 'text-destructive' : 'text-green-500'}>
                {errorTrend > 0 ? '↑' : '↓'} {Math.abs(errorTrend).toFixed(1)}%
              </span>
              <span className="ml-1">vs last {timeRange}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgLatency.toFixed(0)}ms</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span className={latencyTrend > 0 ? 'text-destructive' : 'text-green-500'}>
                {latencyTrend > 0 ? '↑' : '↓'} {Math.abs(latencyTrend).toFixed(1)}%
              </span>
              <span className="ml-1">vs last {timeRange}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeConnections}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span className={connectionsTrend > 0 ? 'text-destructive' : 'text-green-500'}>
                {connectionsTrend > 0 ? '↑' : '↓'} {Math.abs(connectionsTrend).toFixed(1)}%
              </span>
              <span className="ml-1">vs last {timeRange}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Traffic Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Traffic Analysis</CardTitle>
            <CardDescription>
              Network traffic patterns over time
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
                  <YAxis label={{ value: 'Rate (MB/s)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value) => [`${value} MB/s`, '']}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="traffic.in"
                    stackId="1"
                    stroke={NETWORK_COLORS.traffic.in}
                    fill={NETWORK_COLORS.traffic.in}
                    name="Inbound"
                  />
                  <Area
                    type="monotone"
                    dataKey="traffic.out"
                    stackId="1"
                    stroke={NETWORK_COLORS.traffic.out}
                    fill={NETWORK_COLORS.traffic.out}
                    name="Outbound"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Protocol Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Protocol Distribution</CardTitle>
            <CardDescription>
              Traffic by protocol type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={protocolData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {protocolData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={NETWORK_COLORS.protocols[entry.name as keyof typeof NETWORK_COLORS.protocols]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} MB/s`, '']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Regional Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Regional Traffic</CardTitle>
            <CardDescription>
              Traffic distribution by region
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={regionalData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {regionalData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={NETWORK_COLORS.regions[entry.name.toLowerCase() as keyof typeof NETWORK_COLORS.regions]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} MB/s`, '']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>
              Latency and error rates over time
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
                  <YAxis yAxisId="left" label={{ value: 'Latency (ms)', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" label={{ value: 'Error Rate (%)', angle: 90, position: 'insideRight' }} />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value, name) => {
                      const unit = name.includes('error') ? '%' : 'ms';
                      return [`${value}${unit}`, name];
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="latency"
                    stroke={NETWORK_COLORS.status.warning}
                    name="Latency"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="errors"
                    stroke={NETWORK_COLORS.status.error}
                    name="Error Rate"
                    strokeWidth={2}
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