"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { FileWarning, AlertCircle, ArrowLeft, Clock, Calendar, ExternalLink, ThumbsUp, ThumbsDown, Trash2, Flag, Hammer, Link as LinkIcon, MessageSquare } from "lucide-react";
import { DmcaGenerator } from "@/components/ui/dmca-generator";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface ViolationDetailsProps {
  params: {
    id: string;
  };
}

// This would normally come from the database
const VIOLATION_STATUSES = {
  PENDING: { label: "Pending Review", color: "warning" },
  CONFIRMED: { label: "Confirmed Violation", color: "destructive" },
  DISMISSED: { label: "Dismissed", color: "default" },
  RESOLVED: { label: "Resolved", color: "success" }
};

export default function ViolationDetailsPage({ params }: ViolationDetailsProps) {
  const router = useRouter();
  const violationId = params.id;
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [violation, setViolation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // In a real application, we would fetch the violation details from the API
    // For this demo, we'll use a mock violation object
    const fetchViolation = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));

        // Mock violation data
        const mockViolation = {
          id: violationId,
          status: "CONFIRMED", // PENDING, CONFIRMED, DISMISSED, RESOLVED
          sourceUrl: "https://example-infringing-site.com/copied-content/image123",
          sourcePlatform: "Example Platform",
          detectionMethod: "Visual Fingerprint Matching",
          matchConfidence: 94.5,
          description: "Unauthorized use of your registered image work. The work appears to have been used without proper attribution or licensing in a commercial context.",
          evidenceUrls: [
            "https://example-infringing-site.com/copied-content/image123",
            "https://cdn.example-infringing-site.com/images/image123.jpg"
          ],
          resolutionNotes: "",
          detectedAt: new Date("2025-04-01T10:15:00Z"),
          updatedAt: new Date("2025-04-02T14:30:00Z"),
          resolvedAt: null,
          creativeWork: {
            id: "cw-12345",
            title: "Mountain Sunset Original Series #4",
            type: "IMAGE",
            thumbnailUrl: "https://source.unsplash.com/random/800x600/?landscape,sunset",
            registeredAt: new Date("2025-03-15"),
            metadataHash: "0xabc123def456...",
            certificateId: "cert-1234567890",
            ownerId: "user-123"
          },
          owner: {
            name: "Creative Artist",
            email: "artist@example.com"
          },
          actions: [
            {
              id: "action-1",
              type: "DETECTION",
              description: "Violation detected by automated scan",
              timestamp: new Date("2025-04-01T10:15:00Z")
            },
            {
              id: "action-2",
              type: "REVIEW",
              description: "Manual review confirmed the violation",
              timestamp: new Date("2025-04-02T14:30:00Z")
            }
          ]
        };

        setViolation(mockViolation);
      } catch (err) {
        console.error("Error fetching violation:", err);
        setError("Failed to load violation details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchViolation();
  }, [violationId]);

  const updateViolationStatus = async (newStatus: string) => {
    try {
      toast.info(`Updating violation status to ${newStatus.toLowerCase()}...`);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update local state
      setViolation(prev => ({
        ...prev,
        status: newStatus,
        updatedAt: new Date(),
        resolvedAt: ["RESOLVED", "DISMISSED"].includes(newStatus) ? new Date() : null
      }));

      // Show success message
      toast.success(`Violation status updated to ${newStatus.toLowerCase()}`);
    } catch (error) {
      console.error("Error updating violation status:", error);
      toast.error("Failed to update violation status");
    }
  };

  const handleDeleteViolation = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this violation record? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      toast.info("Deleting violation record...");

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success("Violation record deleted successfully");
      router.push("/dashboard/detection/violations");
    } catch (error) {
      console.error("Error deleting violation:", error);
      toast.error("Failed to delete violation record");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 border-t-2 border-b-2 border-primary rounded-full animate-spin"></div>
            <h3 className="text-xl font-medium">Loading violation details...</h3>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error || !violation) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error || "An error occurred while loading the violation details."}
            </AlertDescription>
          </Alert>

          <Button variant="outline" asChild>
            <Link href="/dashboard/detection/violations">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Violations
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // Helper to get the appropriate badge color based on violation status
  const getStatusBadge = (status: string) => {
    const statusInfo = VIOLATION_STATUSES[status as keyof typeof VIOLATION_STATUSES] ||
                      { label: status, color: "default" };

    return (
      <Badge variant={statusInfo.color as "default" | "secondary" | "destructive" | "outline" | "success" | "warning"}>
        {statusInfo.label}
      </Badge>
    );
  };

  // Format date for display
  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Breadcrumb>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard/detection">Detection</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard/detection/violations">Violations</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <span>Violation #{violation.id.substring(0, 8)}</span>
            </BreadcrumbItem>
          </Breadcrumb>

          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/detection/violations">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Violations
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-xl">
                    Violation Details
                    <span className="ml-3 inline-block">{getStatusBadge(violation.status)}</span>
                  </CardTitle>
                  <CardDescription>
                    Detected on {formatDate(violation.detectedAt)}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-3">
                    <TabsTrigger value="details">Violation Details</TabsTrigger>
                    <TabsTrigger value="actions">Take Action</TabsTrigger>
                    <TabsTrigger value="history">Activity History</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-6 mt-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <h3 className="text-sm font-medium mb-2">Original Work</h3>
                        <div className="aspect-video w-full rounded-md overflow-hidden border mb-2">
                          <img
                            src={violation.creativeWork.thumbnailUrl}
                            alt={violation.creativeWork.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h4 className="text-sm font-medium">{violation.creativeWork.title}</h4>
                        <p className="text-xs text-muted-foreground">Registered on {formatDate(violation.creativeWork.registeredAt)}</p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium mb-2">Infringing Content</h3>
                        <div className="aspect-video w-full rounded-md overflow-hidden border mb-2 bg-muted flex items-center justify-center">
                          <div className="text-center p-4">
                            <FileWarning className="h-8 w-8 mx-auto mb-2 text-amber-500" />
                            <p className="text-sm">Violation source evidence</p>
                            <p className="text-xs text-muted-foreground mt-1">Actual content may vary</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-medium">Infringing URL</h4>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                            window.open(violation.sourceUrl, '_blank');
                          }} title="Open URL in new tab">
                            <ExternalLink className="h-4 w-4" />
                            <span className="sr-only">Visit URL</span>
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{violation.sourceUrl}</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Violation Information</h3>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Detection Method</p>
                          <p className="text-sm">{violation.detectionMethod}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Match Confidence</p>
                          <p className="text-sm font-medium">{violation.matchConfidence}%</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Platform</p>
                          <p className="text-sm">{violation.sourcePlatform}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Detected</p>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <p className="text-sm">{formatDate(violation.detectedAt)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Description</p>
                        <p className="text-sm">{violation.description}</p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Evidence URLs</p>
                        <ul className="space-y-1">
                          {violation.evidenceUrls.map((url: string, index: number) => (
                            <li key={index} className="flex items-center justify-between text-sm">
                              <span className="truncate">{url}</span>
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                                window.open(url, '_blank');
                              }}>
                                <ExternalLink className="h-4 w-4" />
                                <span className="sr-only">Visit URL</span>
                              </Button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="actions" className="space-y-6 mt-6">
                    {/* DMCA Generator */}
                    <div className="space-y-4">
                      <h3 className="text-base font-medium">DMCA Takedown Notice</h3>
                      <p className="text-sm text-muted-foreground">
                        Generate a DMCA takedown notice to send to the platform to request removal of your content.
                      </p>

                      <DmcaGenerator
                        workId={violation.creativeWork.id}
                        workTitle={violation.creativeWork.title}
                        workType={violation.creativeWork.type}
                        registeredDate={violation.creativeWork.registeredAt}
                        metadataHash={violation.creativeWork.metadataHash}
                        certificateId={violation.creativeWork.certificateId}
                        userInfo={{
                          name: violation.owner.name,
                          email: violation.owner.email
                        }}
                        defaultInfringingUrl={violation.sourceUrl}
                      />
                    </div>

                    <Separator />

                    {/* Update Status */}
                    <div className="space-y-4">
                      <h3 className="text-base font-medium">Update Violation Status</h3>
                      <p className="text-sm text-muted-foreground">
                        Change the status of this violation based on your actions or findings.
                      </p>

                      <div className="flex flex-wrap gap-3">
                        {violation.status !== "CONFIRMED" && (
                          <Button onClick={() => updateViolationStatus("CONFIRMED")} className="gap-2">
                            <ThumbsUp className="h-4 w-4" />
                            <span>Confirm Violation</span>
                          </Button>
                        )}

                        {violation.status !== "DISMISSED" && (
                          <Button
                            variant="outline"
                            onClick={() => updateViolationStatus("DISMISSED")}
                            className="gap-2"
                          >
                            <ThumbsDown className="h-4 w-4" />
                            <span>Dismiss</span>
                          </Button>
                        )}

                        {violation.status !== "RESOLVED" && (
                          <Button
                            variant="outline"
                            onClick={() => updateViolationStatus("RESOLVED")}
                            className="gap-2"
                          >
                            <Check className="h-4 w-4" />
                            <span>Mark as Resolved</span>
                          </Button>
                        )}

                        {violation.status !== "PENDING" && (
                          <Button
                            variant="outline"
                            onClick={() => updateViolationStatus("PENDING")}
                            className="gap-2"
                          >
                            <Clock className="h-4 w-4" />
                            <span>Set to Pending</span>
                          </Button>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Additional Actions */}
                    <div className="space-y-4">
                      <h3 className="text-base font-medium">Additional Actions</h3>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Card className="bg-card/50">
                          <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-sm">Contact Platform</CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <p className="text-xs text-muted-foreground mb-3">
                              Reach out to the platform directly to request content removal.
                            </p>
                            <Button variant="outline" className="w-full gap-2" onClick={() => {
                              toast.info("Opening platform contact page...");
                              window.open(`mailto:dmca@example.com?subject=DMCA%20Takedown%20Request%20-%20Violation%20${violationId}`, '_blank');
                            }}>
                              <MessageSquare className="h-4 w-4" />
                              <span>Contact Platform</span>
                            </Button>
                          </CardContent>
                        </Card>

                        <Card className="bg-card/50">
                          <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-sm">Report to Legal Team</CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <p className="text-xs text-muted-foreground mb-3">
                              Escalate this violation to your legal team for further action.
                            </p>
                            <Button variant="outline" className="w-full gap-2" onClick={() => {
                              toast.success("Violation reported to legal team");
                            }}>
                              <Hammer className="h-4 w-4" />
                              <span>Report to Legal</span>
                            </Button>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="history" className="space-y-6 mt-6">
                    <div className="space-y-4">
                      <h3 className="text-base font-medium">Activity Timeline</h3>
                      <div className="space-y-4">
                        {violation.actions.map((action: any, index: number) => (
                          <div key={index} className="flex gap-3">
                            <div className="relative mt-1">
                              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                {action.type === "DETECTION" ? (
                                  <Flag className="h-4 w-4 text-amber-600" />
                                ) : action.type === "REVIEW" ? (
                                  <Eye className="h-4 w-4 text-blue-600" />
                                ) : (
                                  <MessageSquare className="h-4 w-4 text-green-600" />
                                )}
                              </div>
                              {index < violation.actions.length - 1 && (
                                <div className="absolute top-8 bottom-0 left-1/2 w-0.5 -ml-0.5 bg-muted h-full"></div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">
                                  {action.type === "DETECTION" ? "Violation Detected" :
                                   action.type === "REVIEW" ? "Manual Review" : action.type}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(action.timestamp)}
                                </span>
                              </div>
                              <p className="text-sm mt-1">{action.description}</p>
                            </div>
                          </div>
                        ))}

                        {/* Current status in timeline */}
                        <div className="flex gap-3">
                          <div className="mt-1">
                            <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary flex items-center justify-center">
                              <Clock className="h-4 w-4 text-primary" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                Current Status: {VIOLATION_STATUSES[violation.status as keyof typeof VIOLATION_STATUSES]?.label}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Updated {formatDate(violation.updatedAt)}
                              </span>
                            </div>
                            {violation.status === "RESOLVED" && violation.resolvedAt && (
                              <p className="text-sm mt-1">
                                This violation was resolved on {formatDate(violation.resolvedAt)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <Alert variant="default" className="bg-muted/50">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        All actions taken on this violation are logged for record-keeping purposes.
                      </AlertDescription>
                    </Alert>
                  </TabsContent>
                </Tabs>
              </CardContent>

              <CardFooter className="flex justify-between border-t pt-6">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteViolation}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Record</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="gap-2"
                >
                  <Link href={`/dashboard/rights-registry/${violation.creativeWork.id}`}>
                    <LinkIcon className="h-4 w-4" />
                    <span>View Original Work</span>
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Violation Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    {getStatusBadge(violation.status)}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Detection Date</span>
                    <span className="text-sm">{new Date(violation.detectedAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Match Confidence</span>
                    <span className="text-sm font-medium">{violation.matchConfidence}%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Platform</span>
                    <span className="text-sm">{violation.sourcePlatform}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">Original Work</span>
                  <p className="text-sm font-medium">{violation.creativeWork.title}</p>
                  <Badge variant="outline">{violation.creativeWork.type}</Badge>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href={`/dashboard/rights-registry/${violation.creativeWork.id}/certificate`}>
                    View Ownership Certificate
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Recommended Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="rounded-full h-5 w-5 bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400 text-xs mt-0.5">
                      1
                    </div>
                    <span>Generate a DMCA takedown notice for the platform</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="rounded-full h-5 w-5 bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400 text-xs mt-0.5">
                      2
                    </div>
                    <span>Contact the platform's legal department</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="rounded-full h-5 w-5 bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400 text-xs mt-0.5">
                      3
                    </div>
                    <span>Update the violation status once resolved</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Import needed by component
function Eye(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function Check(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
