"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, CheckCircle2, Clock } from "lucide-react";

const mockThreats = [
  {
    id: 1,
    type: "Malware Detection",
    severity: "high",
    status: "investigating",
    source: "192.168.1.100",
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    description: "Suspicious executable detected in upload directory",
  },
  {
    id: 2,
    type: "Brute Force Attempt",
    severity: "medium",
    status: "blocked",
    source: "10.0.0.50",
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    description: "Multiple failed login attempts detected",
  },
  {
    id: 3,
    type: "SQL Injection Attempt",
    severity: "high",
    status: "blocked",
    source: "172.16.0.25",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    description: "Potential SQL injection in search parameter",
  },
  {
    id: 4,
    type: "Suspicious File Upload",
    severity: "low",
    status: "resolved",
    source: "192.168.1.150",
    timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    description: "Unusual file type uploaded to server",
  },
];

const severityColors = {
  high: "destructive",
  medium: "warning",
  low: "default",
} as const;

const statusIcons = {
  investigating: Clock,
  blocked: Shield,
  resolved: CheckCircle2,
} as const;

export default function ThreatsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Threats</h1>
          <p className="text-muted-foreground">
            Monitor and manage security threats
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {mockThreats.map((threat) => {
          const StatusIcon = statusIcons[threat.status];
          return (
            <Card key={threat.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-base font-medium">
                    {threat.type}
                  </CardTitle>
                  <CardDescription>
                    {threat.description}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={severityColors[threat.severity]}>
                    {threat.severity}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <StatusIcon className="h-3 w-3" />
                    {threat.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <AlertTriangle className="mr-1 h-4 w-4" />
                      Source: {threat.source}
                    </div>
                    <div>
                      {threat.timestamp.toLocaleString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Alert>
        <AlertTitle>Threat Monitoring Active</AlertTitle>
        <AlertDescription>
          System is actively monitoring for security threats. All threats are being logged and analyzed in real-time.
        </AlertDescription>
      </Alert>
    </div>
  );
} 