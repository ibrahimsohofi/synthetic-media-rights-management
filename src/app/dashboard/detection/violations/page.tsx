"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Pagination } from "@/components/ui/pagination";
import { ArrowLeft, AlertTriangle, CheckCircle, Clock, XCircle, Search, FileWarning } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// In a real app, this would be a server component using server actions
// to fetch violations with proper pagination, filtering, and sorting
export default function ViolationsListPage() {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  // This would typically be data from the server
  const violations = mockViolations.filter(violation => {
    // Apply status filter
    if (activeFilter !== "all" && violation.status.toLowerCase() !== activeFilter) {
      return false;
    }

    // Apply search filter (search in title, source, or work type)
    if (searchQuery && !violation.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !violation.source.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !violation.workType.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    return true;
  });

  const totalResults = violations.length;
  const resultsPerPage = 10;
  const totalPages = Math.ceil(totalResults / resultsPerPage);

  // Get paginated results
  const paginatedViolations = violations.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );

  // Status badge helper
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return {
          color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30",
          icon: <Clock className="h-3.5 w-3.5 mr-1" />
        };
      case 'confirmed':
        return {
          color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30",
          icon: <AlertTriangle className="h-3.5 w-3.5 mr-1" />
        };
      case 'dismissed':
        return {
          color: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800/30",
          icon: <XCircle className="h-3.5 w-3.5 mr-1" />
        };
      case 'resolved':
        return {
          color: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30",
          icon: <CheckCircle className="h-3.5 w-3.5 mr-1" />
        };
      default:
        return {
          color: "",
          icon: <Clock className="h-3.5 w-3.5 mr-1" />
        };
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-start">
          <div>
            <Link
              href="/dashboard/detection"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-1"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Detection Center
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">Violations</h1>
            <p className="text-muted-foreground">
              Monitor and manage unauthorized usage of your creative works
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Filters and Search */}
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search violations..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="sm:w-[200px]">
                  <Select
                    onValueChange={(value) => setActiveFilter(value)}
                    defaultValue={activeFilter}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Violations</SelectItem>
                      <SelectItem value="pending">Pending Review</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="dismissed">Dismissed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" size="sm" className="sm:w-auto h-10" onClick={() => {
                  setSearchQuery("");
                  setActiveFilter("all");
                }}>
                  Reset Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for quick filtering */}
          <Tabs defaultValue="all" className="space-y-4" onValueChange={(value) => setActiveFilter(value)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {renderViolationsList(paginatedViolations, getStatusBadge)}
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              {renderViolationsList(paginatedViolations, getStatusBadge)}
            </TabsContent>

            <TabsContent value="confirmed" className="space-y-4">
              {renderViolationsList(paginatedViolations, getStatusBadge)}
            </TabsContent>

            <TabsContent value="resolved" className="space-y-4">
              {renderViolationsList(paginatedViolations, getStatusBadge)}
            </TabsContent>
          </Tabs>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function renderViolationsList(violations: any[], getStatusBadge: (status: string) => { color: string, icon: React.ReactNode }) {
  if (violations.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
          <FileWarning className="h-10 w-10 mb-3 opacity-50" />
          <h3 className="text-lg font-medium">No violations found</h3>
          <p className="text-sm mt-1">
            No violations match your current filters
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {violations.map((violation) => {
        const statusBadge = getStatusBadge(violation.status);

        return (
          <Card key={violation.id} className="overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-32 lg:w-48 h-32 md:h-auto relative bg-muted">
                {violation.thumbnailUrl ? (
                  <Image
                    src={violation.thumbnailUrl}
                    alt={violation.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <FileWarning className="h-8 w-8" />
                  </div>
                )}
                <Badge
                  className="absolute top-2 right-2"
                  variant="outline"
                >
                  {violation.workType}
                </Badge>
              </div>

              <div className="flex-1 p-4">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-semibold">
                      <Link
                        href={`/dashboard/detection/violations/${violation.id}`}
                        className="hover:underline"
                      >
                        {violation.title}
                      </Link>
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Detected on {violation.detectedDate} • {violation.matchConfidence}% match
                    </p>
                  </div>

                  <Badge variant="outline" className={`flex items-center ${statusBadge.color}`}>
                    {statusBadge.icon}
                    <span>{violation.status}</span>
                  </Badge>
                </div>

                <p className="text-sm mb-3">
                  {violation.description}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
                  <div className="text-muted-foreground">
                    <span className="font-medium">Source:</span>{" "}
                    <a
                      href={violation.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {violation.sourceDisplay || violation.source}
                    </a>
                  </div>
                  <div className="text-muted-foreground">
                    <span className="font-medium">Detection Method:</span>{" "}
                    {violation.detectionMethod}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" asChild>
                    <Link href={`/dashboard/detection/violations/${violation.id}`}>
                      View Details
                    </Link>
                  </Button>
                  {violation.status === "Pending" && (
                    <>
                      <Button size="sm" variant="outline">
                        Confirm
                      </Button>
                      <Button size="sm" variant="outline">
                        Dismiss
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// Mock data for the violations
const mockViolations = [
  {
    id: "violation-1",
    title: "Unauthorized use of 'Neon Dreams' artwork",
    description: "AI-generated image similar to your 'Neon Dreams' artwork found on marketplace.",
    workType: "Image",
    status: "Pending",
    matchConfidence: 94,
    detectedDate: "April 12, 2025",
    source: "https://nft-marketplace.example.com/item/12345",
    sourceDisplay: "nft-marketplace.example.com",
    detectionMethod: "Image Recognition",
    thumbnailUrl: "https://images.unsplash.com/photo-1607893378714-007fd47c8719?q=80&w=1000"
  },
  {
    id: "violation-2",
    title: "Deepfake audio using registered voice pattern",
    description: "Voice clone detected in podcast using your registered voice pattern.",
    workType: "Audio",
    status: "Confirmed",
    matchConfidence: 89,
    detectedDate: "April 10, 2025",
    source: "https://podcast.example.com/episode/76545",
    sourceDisplay: "podcast.example.com",
    detectionMethod: "Audio Fingerprinting",
    thumbnailUrl: "https://images.unsplash.com/photo-1619983081593-e2ba5b543168?q=80&w=1000"
  },
  {
    id: "violation-3",
    title: "Unlicensed use of 'Urban Architecture' series",
    description: "Commercial website using images from your 'Urban Architecture' photo series without license.",
    workType: "Image",
    status: "Resolved",
    matchConfidence: 100,
    detectedDate: "April 5, 2025",
    source: "https://architecture-firm.example.com/projects",
    sourceDisplay: "architecture-firm.example.com",
    detectionMethod: "Web Crawler",
    thumbnailUrl: "https://images.unsplash.com/photo-1486718448742-163732cd1544?q=80&w=1000"
  },
  {
    id: "violation-4",
    title: "Derivative of 'Abstract Motion' used in advertisement",
    description: "Modified version of your 'Abstract Motion' video sequence used in commercial advertisement.",
    workType: "Video",
    status: "Confirmed",
    matchConfidence: 82,
    detectedDate: "April 3, 2025",
    source: "https://video-platform.example.com/watch?v=abc123",
    sourceDisplay: "video-platform.example.com",
    detectionMethod: "Video Analysis",
    thumbnailUrl: "https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?q=80&w=1000"
  },
  {
    id: "violation-5",
    title: "Ambient soundscape used without credit",
    description: "Your 'City Nights' ambient track used in YouTube video without attribution or license.",
    workType: "Audio",
    status: "Pending",
    matchConfidence: 97,
    detectedDate: "April 1, 2025",
    source: "https://youtube.example.com/watch?v=xyz789",
    sourceDisplay: "youtube.example.com",
    detectionMethod: "Audio Matching",
    thumbnailUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1000"
  },
  {
    id: "violation-6",
    title: "Digital portrait on social media account",
    description: "Your 'Digital Portrait Series' work being used as profile picture on multiple accounts.",
    workType: "Image",
    status: "Dismissed",
    matchConfidence: 72,
    detectedDate: "March 28, 2025",
    source: "https://social-network.example.com/user/profile",
    sourceDisplay: "social-network.example.com",
    detectionMethod: "Visual Search",
    thumbnailUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=1000"
  },
  {
    id: "violation-7",
    title: "Techno track remix without permission",
    description: "Unauthorized remix of your 'Midnight Electric' track found on music platform.",
    workType: "Audio",
    status: "Confirmed",
    matchConfidence: 88,
    detectedDate: "March 25, 2025",
    source: "https://music-streaming.example.com/track/67890",
    sourceDisplay: "music-streaming.example.com",
    detectionMethod: "Audio Fingerprinting",
    thumbnailUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1000"
  },
  {
    id: "violation-8",
    title: "AI-generated variations of registered artwork",
    description: "Multiple AI-generated variations of your work found being sold as NFTs.",
    workType: "Image",
    status: "Pending",
    matchConfidence: 91,
    detectedDate: "March 22, 2025",
    source: "https://nft-marketplace.example.com/collection/abcde",
    sourceDisplay: "nft-marketplace.example.com",
    detectionMethod: "Style Detection",
    thumbnailUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1000"
  }
];
