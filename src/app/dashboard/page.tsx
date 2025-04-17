import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  CheckCheck,
  FileWarning,
  FileX,
  PlusCircle,
  Shield,
  TrendingUp,
  Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getDashboardStats } from "@/lib/data/dashboard-stats";
import { Suspense } from "react";
import { ActivityFeed } from "@/components/ui/activity-feed";

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
        <Suspense fallback={<StatsGridSkeleton />}>
          <DashboardStatsGrid />
        </Suspense>

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
              <Suspense fallback={<ActivitySkeleton />}>
                <ActivityFeed />
              </Suspense>
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
                <Link href="/dashboard/detection/violations">
                  <FileX className="mr-2 h-4 w-4" />
                  Review Violations
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/dashboard/analytics">
                  <BarChart className="mr-2 h-4 w-4" />
                  View Analytics
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Protection Status */}
        <Suspense fallback={<ProtectionStatusSkeleton />}>
          <ProtectionStatus />
        </Suspense>
      </div>
    </DashboardLayout>
  );
}

// Stats grid with real data
async function DashboardStatsGrid() {
  const { success, stats } = await getDashboardStats();

  if (!success || !stats) {
    return <StatsGridSkeleton />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">
            Registered Works
          </CardTitle>
          <Shield className="w-4 h-4 text-violet-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.registeredWorks.count}</div>
          <p className="text-xs text-muted-foreground">
            {stats.registeredWorks.changeText}
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
          <div className="text-2xl font-bold">{stats.activeLicenses.count}</div>
          <p className="text-xs text-muted-foreground">
            {stats.activeLicenses.changeText}
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
          <div className="text-2xl font-bold">{stats.potentialViolations.count}</div>
          <p className="text-xs text-muted-foreground">
            {stats.potentialViolations.changeText}
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
          <div className="text-2xl font-bold">${stats.revenueGenerated.amount}</div>
          <p className="text-xs text-muted-foreground">
            {stats.revenueGenerated.changeText}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Protection status grid with real data
async function ProtectionStatus() {
  const { success, stats } = await getDashboardStats();

  if (!success || !stats) {
    return <ProtectionStatusSkeleton />;
  }

  return (
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
              <p className="text-sm font-medium leading-none">Image Works</p>
              <p className="text-sm text-muted-foreground">{stats.worksBreakdown.images} items</p>
            </div>
          </div>

          <div className="space-y-2 text-center">
            <div className="mx-auto my-2 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
              <Shield className="h-8 w-8 text-blue-700 dark:text-blue-400" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">Video Works</p>
              <p className="text-sm text-muted-foreground">{stats.worksBreakdown.videos} items</p>
            </div>
          </div>

          <div className="space-y-2 text-center">
            <div className="mx-auto my-2 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <Shield className="h-8 w-8 text-green-700 dark:text-green-400" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">Audio Works</p>
              <p className="text-sm text-muted-foreground">{stats.worksBreakdown.audio} items</p>
            </div>
          </div>

          <div className="space-y-2 text-center">
            <div className="mx-auto my-2 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20">
              <Shield className="h-8 w-8 text-amber-700 dark:text-amber-400" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">Text Works</p>
              <p className="text-sm text-muted-foreground">{stats.worksBreakdown.text} items</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Skeleton loading states
function StatsGridSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array(4).fill(null).map((_, i) => (
        <Card key={i} className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <div className="h-5 w-32 bg-muted animate-pulse rounded"></div>
            <div className="h-4 w-4 bg-muted animate-pulse rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2"></div>
            <div className="h-4 w-40 bg-muted animate-pulse rounded"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="space-y-6">
      {Array(3).fill(null).map((_, i) => (
        <div key={i} className="flex items-start animate-pulse">
          <div className="mt-0.5 rounded-full p-2 mr-3 bg-muted"></div>
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-muted rounded w-2/3"></div>
            <div className="h-3 bg-muted rounded w-full"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProtectionStatusSkeleton() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="h-6 w-32 bg-muted animate-pulse rounded mb-2"></div>
        <div className="h-4 w-48 bg-muted animate-pulse rounded"></div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array(4).fill(null).map((_, i) => (
            <div key={i} className="space-y-4 text-center">
              <div className="mx-auto my-2 h-16 w-16 rounded-full bg-muted animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-4 w-20 mx-auto bg-muted animate-pulse rounded"></div>
                <div className="h-3 w-12 mx-auto bg-muted animate-pulse rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
