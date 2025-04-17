"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AITrainingBadge } from "@/components/ui/ai-training-badge";
import { FileCheck, MoreHorizontal, PlusCircle, Search, Shield, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function RightsRegistryPage() {
  // Mock data for registered creative works
  const creativeWorks = [
    {
      id: "cw1",
      title: "Neon Cityscape Series",
      type: "IMAGE",
      category: "Digital Art",
      registeredDate: "April 12, 2025",
      registrationStatus: "REGISTERED",
      aiTrainingStatus: true,
      blockchainVerified: true
    },
    {
      id: "cw2",
      title: "Abstract Motion Series",
      type: "VIDEO",
      category: "Motion Graphics",
      registeredDate: "April 10, 2025",
      registrationStatus: "REGISTERED",
      aiTrainingStatus: false,
      blockchainVerified: true
    },
    {
      id: "cw3",
      title: "Ambient Soundscape Collection",
      type: "AUDIO",
      category: "Sound Design",
      registeredDate: "April 5, 2025",
      registrationStatus: "REGISTERED",
      aiTrainingStatus: true,
      blockchainVerified: true
    },
    {
      id: "cw4",
      title: "Digital Portrait Series",
      type: "IMAGE",
      category: "Portrait",
      registeredDate: "March 28, 2025",
      registrationStatus: "REGISTERED",
      aiTrainingStatus: true,
      blockchainVerified: false
    },
    {
      id: "cw5",
      title: "Techno Beats EP",
      type: "AUDIO",
      category: "Music",
      registeredDate: "March 20, 2025",
      registrationStatus: "REGISTERED",
      aiTrainingStatus: false,
      blockchainVerified: true
    },
    {
      id: "cw6",
      title: "Urban Photography Collection",
      type: "IMAGE",
      category: "Photography",
      registeredDate: "March 15, 2025",
      registrationStatus: "PENDING",
      aiTrainingStatus: true,
      blockchainVerified: false
    }
  ];

  // Statistics derived from mock data
  const statsData = {
    totalWorks: creativeWorks.length,
    registeredWorks: creativeWorks.filter(work => work.registrationStatus === "REGISTERED").length,
    pendingWorks: creativeWorks.filter(work => work.registrationStatus === "PENDING").length,
    aiOptOutWorks: creativeWorks.filter(work => work.aiTrainingStatus).length,
    blockchainVerified: creativeWorks.filter(work => work.blockchainVerified).length,
  };

  // Filter function for search
  const filterWorks = (works, query) => {
    if (!query) return works;

    return works.filter(work =>
      work.title.toLowerCase().includes(query.toLowerCase()) ||
      work.category.toLowerCase().includes(query.toLowerCase()) ||
      work.type.toLowerCase().includes(query.toLowerCase())
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Rights Registry</h1>
            <p className="text-muted-foreground">
              Register and manage your synthetic media rights
            </p>
          </div>
          <Button asChild className="sm:self-start">
            <Link href="/dashboard/rights-registry/register">
              <PlusCircle className="mr-2 h-4 w-4" />
              Register New Work
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card className="md:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Your Rights Registry</CardTitle>
                <CardDescription>
                  View and manage your registered works
                </CardDescription>
              </div>
              <div className="relative w-full max-w-sm md:max-w-xs">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search registered works..."
                  className="pl-8"
                />
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList>
                  <TabsTrigger value="all">All Works</TabsTrigger>
                  <TabsTrigger value="images">Images</TabsTrigger>
                  <TabsTrigger value="video">Video</TabsTrigger>
                  <TabsTrigger value="audio">Audio</TabsTrigger>
                  <TabsTrigger value="text">Text</TabsTrigger>
                </TabsList>
                <div className="mt-4 rounded-md border">
                  <div className="grid grid-cols-[1fr,auto,auto,auto] items-center gap-4 p-4 text-sm font-medium">
                    <div>Title/Type</div>
                    <div>Category</div>
                    <div>Registered</div>
                    <div></div>
                  </div>
                  <div className="divide-y">
                    {creativeWorks.map((work) => (
                      <div key={work.id} className="grid grid-cols-[1fr,auto,auto,auto] items-center gap-4 p-4 text-sm">
                        <div className="font-medium">
                          <Link
                            href={`/dashboard/rights-registry/${work.id}`}
                            className="flex items-center hover:text-violet-600 transition-colors"
                          >
                            {work.title}
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary">{work.type}</Badge>
                            {work.aiTrainingStatus && <AITrainingBadge />}
                          </div>
                        </div>
                        <div className="text-muted-foreground">
                          {work.category}
                        </div>
                        <div className="text-muted-foreground">
                          {work.registeredDate}
                        </div>
                        <div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Link
                                  href={`/dashboard/rights-registry/${work.id}`}
                                  className="flex w-full"
                                >
                                  View details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Link
                                  href={`/dashboard/rights-registry/${work.id}/certificate`}
                                  className="flex w-full"
                                >
                                  View certificate
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>Create license</DropdownMenuItem>
                              <DropdownMenuItem>Detect violations</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Tabs>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Registry Stats</CardTitle>
                <CardDescription>
                  Overview of your registry
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Works</span>
                  <span className="text-sm font-medium">{statsData.totalWorks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Registered</span>
                  <span className="text-sm font-medium">{statsData.registeredWorks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Pending</span>
                  <span className="text-sm font-medium">{statsData.pendingWorks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">AI Opt-out</span>
                  <span className="text-sm font-medium">{statsData.aiOptOutWorks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Blockchain Verified</span>
                  <span className="text-sm font-medium">{statsData.blockchainVerified}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Verification</CardTitle>
                <CardDescription>
                  Your verification status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <div className="mr-2 h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <Shield className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Verified Creator</p>
                    <p className="text-xs text-muted-foreground">Identity verified</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="mr-2 h-8 w-8 rounded-full bg-violet-100 flex items-center justify-center">
                    <FileCheck className="h-4 w-4 text-violet-600" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Blockchain Enabled</p>
                    <p className="text-xs text-muted-foreground">Enhanced security</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  View Verification Details
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Helper function to format dates
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}
