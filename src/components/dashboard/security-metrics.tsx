import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, AlertTriangle, Lock, Globe } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import type { SecurityEvent } from '@/lib/monitoring/types';

interface SecurityMetricsProps {
  events: SecurityEvent[];
  timeRange: '1h' | '24h' | '7d' | '30d';
}

const SEVERITY_COLORS = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#3b82f6',
};

const THREAT_TYPE_COLORS = {
  sql_injection: '#ef4444',
  xss_attempt: '#f59e0b',
  rate_limit: '#3b82f6',
  invalid_method: '#8b5cf6',
  invalid_origin: '#ec4899',
  suspicious_ip: '#14b8a6',
  other: '#6b7280',
};

export function SecurityMetrics({ events, timeRange }: SecurityMetricsProps) {
  // Process events for visualization
  const threatTypeDistribution = events.reduce((acc, event) => {
    const type = event.type || 'other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const severityDistribution = events.reduce((acc, event) => {
    acc[event.severity] = (acc[event.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const timelineData = events.reduce((acc, event) => {
    const hour = new Date(event.timestamp).toISOString().slice(0, 13);
    if (!acc[hour]) {
      acc[hour] = { high: 0, medium: 0, low: 0 };
    }
    acc[hour][event.severity]++;
    return acc;
  }, {} as Record<string, Record<string, number>>);

  const timelineChartData = Object.entries(timelineData)
    .map(([hour, counts]) => ({
      hour,
      high: counts.high,
      medium: counts.medium,
      low: counts.low,
    }))
    .sort((a, b) => a.hour.localeCompare(b.hour));

  const pieChartData = Object.entries(threatTypeDistribution).map(([type, count]) => ({
    name: type,
    value: count,
    color: THREAT_TYPE_COLORS[type as keyof typeof THREAT_TYPE_COLORS] || THREAT_TYPE_COLORS.other,
  }));

  const severityPieData = Object.entries(severityDistribution).map(([severity, count]) => ({
    name: severity,
    value: count,
    color: SEVERITY_COLORS[severity as keyof typeof SEVERITY_COLORS],
  }));

  // Calculate metrics
  const totalThreats = events.length;
  const highSeverityThreats = events.filter(e => e.severity === 'high').length;
  const uniqueIPs = new Set(events.map(e => e.ipAddress)).size;
  const uniqueEndpoints = new Set(events.map(e => e.endpoint)).size;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Threats</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalThreats}</div>
            <p className="text-xs text-muted-foreground">
              Detected in the last {timeRange}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">High Severity</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{highSeverityThreats}</div>
            <p className="text-xs text-muted-foreground">
              {((highSeverityThreats / totalThreats) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Unique IPs</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueIPs}</div>
            <p className="text-xs text-muted-foreground">
              Distinct sources
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Targeted Endpoints</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueEndpoints}</div>
            <p className="text-xs text-muted-foreground">
              Affected routes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Threat Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Threat Timeline</CardTitle>
            <CardDescription>
              Distribution of threats by severity over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="hour"
                    tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                  />
                  <Line
                    type="monotone"
                    dataKey="high"
                    stroke={SEVERITY_COLORS.high}
                    name="High Severity"
                  />
                  <Line
                    type="monotone"
                    dataKey="medium"
                    stroke={SEVERITY_COLORS.medium}
                    name="Medium Severity"
                  />
                  <Line
                    type="monotone"
                    dataKey="low"
                    stroke={SEVERITY_COLORS.low}
                    name="Low Severity"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Threat Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Threat Types</CardTitle>
            <CardDescription>
              Distribution of detected threat types
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Severity Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Severity Distribution</CardTitle>
            <CardDescription>
              Distribution of threats by severity level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                  >
                    {severityPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent High Severity Threats */}
        <Card>
          <CardHeader>
            <CardTitle>Recent High Severity Threats</CardTitle>
            <CardDescription>
              Latest critical security events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] overflow-y-auto">
              {events
                .filter(event => event.severity === 'high')
                .slice(0, 5)
                .map((event, index) => (
                  <Alert
                    key={index}
                    variant="destructive"
                    className="mb-2"
                  >
                    <AlertTitle>{event.type}</AlertTitle>
                    <AlertDescription>
                      <p>IP: {event.ipAddress}</p>
                      <p>Endpoint: {event.endpoint}</p>
                      <p>Time: {new Date(event.timestamp).toLocaleString()}</p>
                      {event.details && (
                        <pre className="mt-2 text-sm bg-destructive/10 p-2 rounded">
                          {JSON.stringify(event.details, null, 2)}
                        </pre>
                      )}
                    </AlertDescription>
                  </Alert>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 