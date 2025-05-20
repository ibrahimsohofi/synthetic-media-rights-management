import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart } from "@/components/charts/line-chart";
import { BarChart } from "@/components/charts/bar-chart";
import { PieChart } from "@/components/charts/pie-chart";
import { AreaChart } from "@/components/charts/area-chart";
import { RadarChart } from "@/components/charts/radar-chart";

// Mock data for demonstration
const mockThreatData = {
  timeline: Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      threats: Math.floor(Math.random() * 100),
      blocked: Math.floor(Math.random() * 80),
      investigated: Math.floor(Math.random() * 60),
    };
  }),
  distribution: [
    { name: "Malware", value: 45, color: "#ef4444" },
    { name: "Phishing", value: 30, color: "#f59e0b" },
    { name: "DDoS", value: 15, color: "#3b82f6" },
    { name: "Other", value: 10, color: "#10b981" },
  ],
  metrics: [
    { metric: "Severity", current: 75, baseline: 60 },
    { metric: "Response Time", current: 85, baseline: 70 },
    { metric: "Detection Rate", current: 90, baseline: 80 },
    { metric: "False Positives", current: 65, baseline: 50 },
    { metric: "Coverage", current: 80, baseline: 75 },
  ],
};

interface DashboardOverviewProps {
  isLoading?: boolean;
  theme?: "light" | "dark";
}

export function DashboardOverview({ isLoading = false, theme = "light" }: DashboardOverviewProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[400px] w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert variant="info">
        <AlertTitle>Threat Analysis Dashboard</AlertTitle>
        <AlertDescription>
          Real-time overview of security threats and system status
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Threat Timeline */}
        <div className="bg-card rounded-lg border p-4">
          <h3 className="text-lg font-semibold mb-4">Threat Timeline</h3>
          <LineChart
            data={mockThreatData.timeline}
            xAxis="date"
            series={[
              { key: "threats", label: "Total Threats", color: "#ef4444" },
              { key: "blocked", label: "Blocked", color: "#10b981" },
              { key: "investigated", label: "Investigated", color: "#3b82f6" },
            ]}
            height={300}
            theme={theme}
          />
        </div>

        {/* Threat Distribution */}
        <div className="bg-card rounded-lg border p-4">
          <h3 className="text-lg font-semibold mb-4">Threat Distribution</h3>
          <PieChart
            data={mockThreatData.distribution}
            height={300}
            theme={theme}
          />
        </div>

        {/* Threat Metrics */}
        <div className="bg-card rounded-lg border p-4">
          <h3 className="text-lg font-semibold mb-4">Threat Metrics</h3>
          <RadarChart
            data={mockThreatData.metrics}
            metrics={mockThreatData.metrics.map(m => m.metric)}
            series={[
              { key: "current", label: "Current", color: "#3b82f6" },
              { key: "baseline", label: "Baseline", color: "#94a3b8" },
            ]}
            height={300}
            theme={theme}
          />
        </div>

        {/* Daily Threat Count */}
        <div className="bg-card rounded-lg border p-4">
          <h3 className="text-lg font-semibold mb-4">Daily Threat Count</h3>
          <BarChart
            data={mockThreatData.timeline}
            xAxis="date"
            series={[
              { key: "threats", label: "Threats", color: "#ef4444" },
            ]}
            height={300}
            theme={theme}
          />
        </div>
      </div>
    </div>
  );
} 