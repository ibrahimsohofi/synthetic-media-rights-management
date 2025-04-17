import type { Metadata } from "next";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchIcon, Shield, Eye, BarChart2, FilePlus, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Detection Services | SyntheticRights",
  description: "Monitor and manage unauthorized usage of your synthetic media content",
};

export default function DetectionPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Detection Services</h1>
            <p className="text-muted-foreground">
              Detect unauthorized usage and verify content authenticity
            </p>
          </div>
          <div className="flex flex-wrap gap-2 self-start">
            <Button asChild>
              <Link href="/dashboard/detection/scan">
                <SearchIcon className="mr-2 h-4 w-4" />
                Start Detection Scan
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/detection/verify">
                <Eye className="mr-2 h-4 w-4" />
                Verify Content
              </Link>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="violations">Violations</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Monitored Works
                  </CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">86</div>
                  <p className="text-xs text-muted-foreground">
                    Works with detection enabled
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Scans
                  </CardTitle>
                  <SearchIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4</div>
                  <p className="text-xs text-muted-foreground">
                    Ongoing automatic scans
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Potential Violations
                  </CardTitle>
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">7</div>
                  <p className="text-xs text-muted-foreground">
                    +2 in the last 30 days
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Resolved
                  </CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">21</div>
                  <p className="text-xs text-muted-foreground">
                    +5 in the last 30 days
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Recent Detection Activity</CardTitle>
                  <CardDescription>
                    Latest monitoring and verification results
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((item, i) => (
                      <div key={i} className="flex items-start">
                        <div
                          className={`mt-0.5 rounded-full p-1 mr-3 ${
                            item.type === "violation"
                              ? "bg-red-500/20 text-red-600"
                              : item.type === "verification"
                              ? "bg-green-500/20 text-green-600"
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
                <CardFooter>
                  <Button variant="outline" size="sm" className="ml-auto">
                    View All Activity
                  </Button>
                </CardFooter>
              </Card>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Detection Services</CardTitle>
                    <CardDescription>
                      Available monitoring options
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Web Monitoring</span>
                        <Badge className="bg-green-500">Active</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Social Media</span>
                        <Badge className="bg-green-500">Active</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Image Search</span>
                        <Badge className="bg-green-500">Active</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">NFT Marketplaces</span>
                        <Badge className="bg-amber-500">Limited</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Video Monitoring</span>
                        <Badge variant="outline">Premium</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Audio Fingerprinting</span>
                        <Badge variant="outline">Premium</Badge>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button size="sm" variant="outline" className="w-full">
                      Upgrade Detection
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Verification Tools</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-full bg-violet-100 dark:bg-violet-900/20">
                          <Eye className="h-4 w-4 text-violet-600" />
                        </div>
                        <div className="text-sm font-medium">
                          <Link href="/dashboard/detection/verify" className="hover:underline">
                            Content Verification
                          </Link>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/20">
                          <Shield className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="text-sm font-medium">
                          <Link href="/dashboard/support/articles/blockchain-verification" className="hover:underline">
                            Blockchain Verification
                          </Link>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-full bg-green-100 dark:bg-green-900/20">
                          <FilePlus className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="text-sm font-medium">
                          <Link href="/dashboard/rights-registry/register" className="hover:underline">
                            Register New Work
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="violations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Potential Violations</CardTitle>
                <CardDescription>
                  Detected unauthorized usage of your registered works
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <SearchIcon className="mx-auto h-8 w-8 mb-4 opacity-50" />
                  <p>Select "Violations" to view detailed list</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verification" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Content Verification</CardTitle>
                <CardDescription>
                  Verify if content is registered on the blockchain
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Button asChild size="lg" className="gap-2">
                    <Link href="/dashboard/detection/verify">
                      <Eye className="h-5 w-5" />
                      <span>Go to Verification Tool</span>
                    </Link>
                  </Button>
                  <p className="text-sm text-muted-foreground mt-4">
                    Upload content or provide a hash to verify authenticity and ownership
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Detection Reports</CardTitle>
                <CardDescription>
                  Analytics and insights on detection activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart2 className="mx-auto h-8 w-8 mb-4 opacity-50" />
                  <p>Select "Reports" to view analytics</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

const recentActivity = [
  {
    type: "violation",
    icon: <AlertTriangle className="h-4 w-4" />,
    title: "Potential infringement detected",
    description: "AI-generated image similar to your 'Neon Dreams' artwork found on marketplace",
    category: "Image",
    time: "2 hours ago"
  },
  {
    type: "verification",
    icon: <CheckCircle2 className="h-4 w-4" />,
    title: "Content verification successful",
    description: "Blockchain verification confirmed ownership of 'Digital Flora Series'",
    category: "Verification",
    time: "Yesterday"
  },
  {
    type: "scan",
    icon: <Clock className="h-4 w-4" />,
    title: "Scheduled scan completed",
    description: "Weekly scan of 42 web domains completed with 2 potential matches",
    category: "Automatic",
    time: "2 days ago"
  },
  {
    type: "violation",
    icon: <AlertTriangle className="h-4 w-4" />,
    title: "Deepfake audio detected",
    description: "Voice clone detected in podcast using your registered voice pattern",
    category: "Audio",
    time: "3 days ago"
  },
  {
    type: "verification",
    icon: <CheckCircle2 className="h-4 w-4" />,
    title: "License verification request",
    description: "Company XYZ requested verification of license for 'Urban Architecture' series",
    category: "Licensing",
    time: "5 days ago"
  }
];
