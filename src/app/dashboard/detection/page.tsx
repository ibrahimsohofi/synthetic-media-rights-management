// Add a new import for BrainCircuit icon
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Scan, AlertCircle, Search, FileX, BrainCircuit } from "lucide-react";
import Link from "next/link";

export default function DetectionPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Detection</h1>
          <p className="text-muted-foreground">
            Protect your rights by detecting unauthorized use of your creative works
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Original Scan Card */}
          <Card>
            <CardHeader className="pb-3">
              <Shield className="h-5 w-5 text-violet-500 mb-1" />
              <CardTitle>Content Scan</CardTitle>
              <CardDescription>
                Scan the web for unauthorized use of your registered works
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-4">
                Our AI-powered scanning technology checks social media, marketplaces, and websites
                for content matching your registered works.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <Scan className="h-4 w-4 mr-2 text-violet-500" />
                  <span>Multi-platform detection</span>
                </div>
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2 text-violet-500" />
                  <span>Real-time alerts</span>
                </div>
                <div className="flex items-center">
                  <Search className="h-4 w-4 mr-2 text-violet-500" />
                  <span>Visual & textual matching</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" asChild>
                <Link href="/dashboard/detection/scan">Start Content Scan</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* New AI Training Detection Card */}
          <Card>
            <CardHeader className="pb-3">
              <BrainCircuit className="h-5 w-5 text-blue-500 mb-1" />
              <CardTitle>AI Training Detection</CardTitle>
              <CardDescription>
                Detect if your content has been used to train AI models
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-4">
                Our advanced analysis can detect patterns indicating your content
                has been used in AI training datasets without authorization.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <BrainCircuit className="h-4 w-4 mr-2 text-blue-500" />
                  <span>Model-specific detection</span>
                </div>
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-blue-500" />
                  <span>Evidential reporting</span>
                </div>
                <div className="flex items-center">
                  <Search className="h-4 w-4 mr-2 text-blue-500" />
                  <span>Pattern analysis</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/dashboard/detection/training-analysis">Analyze AI Training</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Violations Card */}
          <Card>
            <CardHeader className="pb-3">
              <FileX className="h-5 w-5 text-red-500 mb-1" />
              <CardTitle>Violations</CardTitle>
              <CardDescription>
                Manage detected violations and take action
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-4">
                Review detected violations of your registered works and take appropriate
                action to protect your rights.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                  <span>Violation reports</span>
                </div>
                <div className="flex items-center">
                  <FileX className="h-4 w-4 mr-2 text-red-500" />
                  <span>Takedown requests</span>
                </div>
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-red-500" />
                  <span>Enforcement options</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/dashboard/detection/violations">View Violations</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Detection Stats & Tabs Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">Detection Statistics</h2>

          <Tabs defaultValue="activity">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
              <TabsTrigger value="stats">Detection Stats</TabsTrigger>
              <TabsTrigger value="risks">Risk Assessment</TabsTrigger>
            </TabsList>

            <TabsContent value="activity" className="p-4 border rounded-md mt-2">
              <div className="text-sm text-muted-foreground">
                <p>Most recent detection activity will be shown here.</p>
                <p className="mt-2">Start a scan to begin detecting unauthorized use of your works.</p>
              </div>
            </TabsContent>

            <TabsContent value="stats" className="p-4 border rounded-md mt-2">
              <div className="text-sm text-muted-foreground">
                <p>Detection statistics and trends will be shown here.</p>
                <p className="mt-2">Includes scan frequency, violation rates, and resolution metrics.</p>
              </div>
            </TabsContent>

            <TabsContent value="risks" className="p-4 border rounded-md mt-2">
              <div className="text-sm text-muted-foreground">
                <p>Risk assessment for your registered works will be shown here.</p>
                <p className="mt-2">Identifies which works are at highest risk based on past violations and industry trends.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}
