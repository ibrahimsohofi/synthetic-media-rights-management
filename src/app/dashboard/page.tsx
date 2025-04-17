import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  CheckCheck,
  FileWarning,
  FileX,
  PlusCircle,
  Shield,
  TrendingUp
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your rights management status.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Registered Works
              </CardTitle>
              <Shield className="w-4 h-4 text-violet-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">127</div>
              <p className="text-xs text-muted-foreground">
                +3 works in the last 30 days
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Active Licenses
              </CardTitle>
              <CheckCheck className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">42</div>
              <p className="text-xs text-muted-foreground">
                +5 licenses in the last 30 days
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Potential Violations
              </CardTitle>
              <FileWarning className="w-4 h-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7</div>
              <p className="text-xs text-muted-foreground">
                -2 violations in the last 30 days
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Revenue Generated
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$2,489</div>
              <p className="text-xs text-muted-foreground">
                +$347 in the last 30 days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Recent Activity */}
          <Card className="border-border/50 md:col-span-2">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest updates across your registered works and licenses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {activityItems.map((item, i) => (
                  <div key={i} className="flex items-start">
                    <div
                      className={`mt-0.5 rounded-full p-1 mr-3 ${
                        item.type === "success"
                          ? "bg-green-500/20 text-green-600"
                          : item.type === "warning"
                          ? "bg-amber-500/20 text-amber-600"
                          : item.type === "danger"
                          ? "bg-red-500/20 text-red-600"
                          : "bg-blue-500/20 text-blue-600"
                      }`}
                    >
                      {item.icon}
                    </div>
                    <div className="space-y-1 flex-1">
                      <p className="text-sm font-medium leading-none">
                        {item.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                      <div className="flex items-center pt-1">
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                        <time className="ml-auto text-xs text-muted-foreground">
                          {item.time}
                        </time>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-border/50 row-start-1 lg:row-auto">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks to manage your rights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/dashboard/rights-registry/register">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Register New Work
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/dashboard/licensing/create">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create New License
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/dashboard/detection/scan">
                  <Shield className="mr-2 h-4 w-4" />
                  Run Detection Scan
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/dashboard/violations">
                  <FileX className="mr-2 h-4 w-4" />
                  Review Violations
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/dashboard/analytics/reports">
                  <BarChart className="mr-2 h-4 w-4" />
                  Generate Report
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Protection Status */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Protection Status</CardTitle>
            <CardDescription>
              Overview of your protected content categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="space-y-2 text-center">
                <div className="mx-auto my-2 flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/20">
                  <Shield className="h-8 w-8 text-violet-700 dark:text-violet-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Visual Works</p>
                  <p className="text-sm text-muted-foreground">48 items</p>
                </div>
              </div>

              <div className="space-y-2 text-center">
                <div className="mx-auto my-2 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                  <Shield className="h-8 w-8 text-blue-700 dark:text-blue-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Audio Works</p>
                  <p className="text-sm text-muted-foreground">32 items</p>
                </div>
              </div>

              <div className="space-y-2 text-center">
                <div className="mx-auto my-2 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                  <Shield className="h-8 w-8 text-green-700 dark:text-green-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Text Works</p>
                  <p className="text-sm text-muted-foreground">26 items</p>
                </div>
              </div>

              <div className="space-y-2 text-center">
                <div className="mx-auto my-2 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20">
                  <Shield className="h-8 w-8 text-amber-700 dark:text-amber-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Combined Works</p>
                  <p className="text-sm text-muted-foreground">21 items</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

const activityItems = [
  {
    type: "success",
    icon: <CheckCheck className="h-4 w-4" />,
    title: "New license agreement activated",
    description: "Company XYZ has licensed your character design for their marketing campaign",
    category: "Licensing",
    time: "2 hours ago"
  },
  {
    type: "warning",
    icon: <FileWarning className="h-4 w-4" />,
    title: "Potential infringement detected",
    description: "We detected similar voice patterns being used in an unauthorized podcast",
    category: "Detection",
    time: "Yesterday"
  },
  {
    type: "info",
    icon: <Shield className="h-4 w-4" />,
    title: "New work registered successfully",
    description: "Your latest portrait series has been added to the rights registry",
    category: "Registry",
    time: "3 days ago"
  },
  {
    type: "danger",
    icon: <FileX className="h-4 w-4" />,
    title: "Takedown notice sent",
    description: "Automated takedown notice issued for unauthorized use of your logo design",
    category: "Enforcement",
    time: "5 days ago"
  },
  {
    type: "success",
    icon: <TrendingUp className="h-4 w-4" />,
    title: "Royalty payment received",
    description: "You received $325 for licensed content usage this month",
    category: "Revenue",
    time: "1 week ago"
  }
];
