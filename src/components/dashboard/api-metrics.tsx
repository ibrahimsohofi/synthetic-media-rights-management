import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Clock, AlertCircle, Server } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import type { APIMetrics } from '@/lib/monitoring/types';

interface APIMetricsProps {
  metrics: APIMetrics[];
  timeRange: '1h' | '24h' | '7d' | '30d';
}

const STATUS_COLORS = {
  '2xx': '#22c55e',
  '3xx': '#3b82f6',
  '4xx': '#f59e0b',
  '5xx': '#ef4444',
};

const METHOD_COLORS = {
  GET: '#3b82f6',
  POST: '#22c55e',
  PUT: '#f59e0b',
  DELETE: '#ef4444',
  PATCH: '#8b5cf6',
};

export function APIMetrics({ metrics, timeRange }: APIMetricsProps) {
  // Process metrics for visualization
  const responseTimeData = metrics.reduce((acc, metric) => {
    const hour = new Date(metric.timestamp).toISOString().slice(0, 13);
    if (!acc[hour]) {
      acc[hour] = {
        avg: 0,
        count: 0,
        min: Infinity,
        max: 0,
      };
    }
    acc[hour].avg = (acc[hour].avg * acc[hour].count + metric.responseTime) / (acc[hour].count + 1);
    acc[hour].count++;
    acc[hour].min = Math.min(acc[hour].min, metric.responseTime);
    acc[hour].max = Math.max(acc[hour].max, metric.responseTime);
    return acc;
  }, {} as Record<string, { avg: number; count: number; min: number; max: number }>);

  const responseTimeChartData = Object.entries(responseTimeData)
    .map(([hour, data]) => ({
      hour,
      avg: Math.round(data.avg),
      min: data.min,
      max: data.max,
    }))
    .sort((a, b) => a.hour.localeCompare(b.hour));

  const statusCodeDistribution = metrics.reduce((acc, metric) => {
    const status = Math.floor(metric.statusCode / 100) + 'xx';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const methodDistribution = metrics.reduce((acc, metric) => {
    acc[metric.method] = (acc[metric.method] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const endpointUsage = metrics.reduce((acc, metric) => {
    if (!acc[metric.endpoint]) {
      acc[metric.endpoint] = {
        count: 0,
        avgResponseTime: 0,
        errors: 0,
      };
    }
    acc[metric.endpoint].count++;
    acc[metric.endpoint].avgResponseTime = 
      (acc[metric.endpoint].avgResponseTime * (acc[metric.endpoint].count - 1) + metric.responseTime) / 
      acc[metric.endpoint].count;
    if (metric.statusCode >= 400) {
      acc[metric.endpoint].errors++;
    }
    return acc;
  }, {} as Record<string, { count: number; avgResponseTime: number; errors: number }>);

  // Calculate summary metrics
  const totalRequests = metrics.length;
  const avgResponseTime = metrics.reduce((sum, m) => sum + m.responseTime, 0) / totalRequests;
  const errorRate = metrics.filter(m => m.statusCode >= 400).length / totalRequests;
  const uniqueEndpoints = Object.keys(endpointUsage).length;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests}</div>
            <p className="text-xs text-muted-foreground">
              In the last {timeRange}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(avgResponseTime)}ms</div>
            <p className="text-xs text-muted-foreground">
              Across all endpoints
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {(errorRate * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Failed requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Active Endpoints</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueEndpoints}</div>
            <p className="text-xs text-muted-foreground">
              Unique routes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Response Time Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Response Time Trends</CardTitle>
            <CardDescription>
              Average, minimum, and maximum response times over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={responseTimeChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="hour"
                    tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                  />
                  <YAxis label={{ value: 'Response Time (ms)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value) => [`${value}ms`, '']}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="avg"
                    stroke="#3b82f6"
                    name="Average"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="min"
                    stroke="#22c55e"
                    name="Minimum"
                    strokeWidth={1}
                  />
                  <Line
                    type="monotone"
                    dataKey="max"
                    stroke="#ef4444"
                    name="Maximum"
                    strokeWidth={1}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Code Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Status Code Distribution</CardTitle>
            <CardDescription>
              Distribution of HTTP status codes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={Object.entries(statusCodeDistribution).map(([status, count]) => ({
                    status,
                    count,
                    color: STATUS_COLORS[status as keyof typeof STATUS_COLORS],
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6">
                    {Object.entries(statusCodeDistribution).map(([status], index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[status as keyof typeof STATUS_COLORS]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Method Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>HTTP Method Distribution</CardTitle>
            <CardDescription>
              Distribution of HTTP methods used
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={Object.entries(methodDistribution).map(([method, count]) => ({
                    method,
                    count,
                    color: METHOD_COLORS[method as keyof typeof METHOD_COLORS],
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="method" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6">
                    {Object.entries(methodDistribution).map(([method], index) => (
                      <Cell key={`cell-${index}`} fill={METHOD_COLORS[method as keyof typeof METHOD_COLORS]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Endpoint Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Endpoint Performance</CardTitle>
            <CardDescription>
              Top endpoints by request volume and performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] overflow-y-auto">
              {Object.entries(endpointUsage)
                .sort((a, b) => b[1].count - a[1].count)
                .slice(0, 5)
                .map(([endpoint, stats]) => (
                  <div key={endpoint} className="mb-4 p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <code className="text-sm font-mono">{endpoint}</code>
                      <Badge variant={stats.errors > 0 ? "destructive" : "default"}>
                        {stats.errors} errors
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Requests: </span>
                        {stats.count}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Avg Time: </span>
                        {Math.round(stats.avgResponseTime)}ms
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 