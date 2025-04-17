import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  Link2,
  Shield,
  FileWarning,
  ExternalLink,
  Globe,
  MessageSquare,
  Share2,
  Download,
  Sparkles,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { getViolationById, updateViolationStatus } from "@/lib/actions/detection";
import { notFound } from "next/navigation";
import Image from "next/image";

interface ViolationPageParams {
  params: {
    id: string;
  };
}

export default async function ViolationDetailPage({ params }: ViolationPageParams) {
  const violationId = params.id;
  const violationResult = await getViolationById(violationId);

  if (!violationResult.success || !violationResult.violation) {
    return notFound();
  }

  const violation = violationResult.violation;
  const work = violation.creativeWork;

  // Format dates for display
  const detectedDate = new Date(violation.detectedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const updatedDate = new Date(violation.updatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Helper for getting content type icon
  const getContentTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'image':
        return <ImageIcon className="h-5 w-5" />;
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'audio':
        return <Music className="h-5 w-5" />;
      case 'text':
        return <FileText className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  // Get severity class based on match confidence
  const getSeverityClass = (confidence: number) => {
    if (confidence > 90) {
      return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30";
    } else if (confidence > 75) {
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30";
    }
    return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30";
  };

  // Get status badge class and icon
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return {
          class: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30",
          icon: <Clock className="h-3.5 w-3.5 mr-1" />
        };
      case 'CONFIRMED':
        return {
          class: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30",
          icon: <AlertTriangle className="h-3.5 w-3.5 mr-1" />
        };
      case 'DISMISSED':
        return {
          class: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800/30",
          icon: <XCircle className="h-3.5 w-3.5 mr-1" />
        };
      case 'RESOLVED':
        return {
          class: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30",
          icon: <CheckCircle className="h-3.5 w-3.5 mr-1" />
        };
      default:
        return {
          class: "",
          icon: <Clock className="h-3.5 w-3.5 mr-1" />
        };
    }
  };

  const statusBadge = getStatusBadge(violation.status);

  // Format detection summary
  const detectionSummary = `This ${work.type.toLowerCase()} was detected with ${Math.round(violation.matchConfidence * 100)}% match confidence using ${violation.detectionMethod} detection.`;

  // AI analysis results (simulated)
  const aiAnalysis = {
    summary: "Based on pattern analysis, this appears to be an unauthorized use of your original work.",
    riskLevel: Math.round(violation.matchConfidence * 100) > 90 ? "High" : Math.round(violation.matchConfidence * 100) > 75 ? "Medium" : "Low",
    recommendations: [
      "Send a takedown notice to the platform",
      "Offer a retroactive licensing option",
      "Document this violation for future reference"
    ],
    similarCases: 12,
    resolutionRate: "87%",
    estimatedTimeToResolve: "5-7 days",
    legalRisks: "Low - standard copyright infringement case"
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-2">
          <Link href="/dashboard/detection" className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-1">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Detection
          </Link>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <FileWarning className="h-6 w-6 text-amber-500" />
                Violation Report
              </h1>
              <p className="text-muted-foreground mt-1">
                Detailed information about the potential unauthorized use of your work
              </p>
            </div>

            <Badge variant="outline" className={`text-sm flex items-center px-3 py-1 ${statusBadge.class}`}>
              {statusBadge.icon}
              <span>Status: {violation.status.charAt(0) + violation.status.slice(1).toLowerCase()}</span>
            </Badge>
          </div>
        </div>

        {/* Violation Summary Card */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getContentTypeIcon(work.type)}
                <span>Violation Details</span>
              </CardTitle>
              <CardDescription>
                Information about the detected violation and affected work
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold mb-1">Detected Content</h3>
                    <div className="h-[180px] w-full bg-muted rounded-md relative overflow-hidden">
                      {/* Mock violation image/content for visualization */}
                      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center">
                        {getContentTypeIcon(work.type)}
                      </div>

                      {/* If you have a screenshot/evidence, you would show it here */}
                      {violation.evidenceUrls && violation.evidenceUrls.length > 0 && (
                        <Image
                          src={violation.evidenceUrls[0]}
                          alt="Violation evidence"
                          fill
                          className="object-cover"
                        />
                      )}

                      <div className="absolute bottom-2 right-2">
                        <Badge variant="outline" className={`text-xs ${getSeverityClass(violation.matchConfidence * 100)}`}>
                          {Math.round(violation.matchConfidence * 100)}% Match
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Found At</Label>
                    <div className="flex items-center justify-between">
                      <a
                        href={violation.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-violet-600 hover:underline flex items-center"
                      >
                        {violation.sourceUrl.substring(0, 40)}...
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                      <Button variant="ghost" size="sm" className="h-7 px-2">
                        <Globe className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Detection Method</Label>
                    <p className="text-sm">{violation.detectionMethod}</p>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Detected On</Label>
                    <p className="text-sm">{detectedDate}</p>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Last Updated</Label>
                    <p className="text-sm">{updatedDate}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold mb-1">Your Original Work</h3>
                    <div className="h-[180px] w-full bg-muted rounded-md relative overflow-hidden">
                      {/* Original work thumbnail */}
                      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-blue-500/10 flex items-center justify-center">
                        {getContentTypeIcon(work.type)}
                      </div>

                      {work.thumbnailUrl && (
                        <Image
                          src={work.thumbnailUrl}
                          alt={work.title}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Title</Label>
                    <p className="text-sm font-medium">{work.title}</p>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Type</Label>
                    <div className="flex items-center gap-1.5">
                      {getContentTypeIcon(work.type)}
                      <span className="text-sm">{work.type.charAt(0) + work.type.slice(1).toLowerCase()}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Registration Status</Label>
                    <div className="flex items-center gap-1.5">
                      <Shield className="h-4 w-4 text-violet-600" />
                      <span className="text-sm">{work.registrationStatus}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Category</Label>
                    <p className="text-sm">{work.category}</p>
                  </div>

                  <Button variant="outline" asChild className="w-full mt-2">
                    <Link href={`/dashboard/rights-registry/${work.id}`}>
                      View Complete Work Details
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="space-y-1 mb-2">
                  <Label className="text-sm font-semibold">Violation Description</Label>
                  <p className="text-sm">{violation.description || detectionSummary}</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 mt-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Automated Assessment</Label>
                    <div className="flex items-center gap-1.5">
                      <Progress value={violation.matchConfidence * 100} className="h-2 flex-1" />
                      <span className="text-sm font-medium">{Math.round(violation.matchConfidence * 100)}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Match confidence based on content analysis
                    </p>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Resolution Notes</Label>
                    <p className="text-sm">
                      {violation.resolutionNotes || "No resolution notes available yet."}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Analysis Card - Add this after the Violation Summary Card */}
          <Card className="border-border/50 mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-violet-600" />
                <span>AI-Assisted Analysis</span>
              </CardTitle>
              <CardDescription>
                Automated insights and recommendations based on similar cases
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-violet-50 dark:bg-violet-900/10 rounded-md border border-violet-100 dark:border-violet-800/30">
                <p className="text-sm font-medium text-violet-800 dark:text-violet-300">
                  {aiAnalysis.summary}
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">Risk Level</Label>
                    <Badge className={`${
                      aiAnalysis.riskLevel === "High"
                        ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                        : aiAnalysis.riskLevel === "Medium"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                        : "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                    }`}>
                      {aiAnalysis.riskLevel}
                    </Badge>
                  </div>
                  <Progress
                    value={aiAnalysis.riskLevel === "High" ? 90 : aiAnalysis.riskLevel === "Medium" ? 60 : 30}
                    className={`h-2 ${
                      aiAnalysis.riskLevel === "High"
                        ? "bg-red-100 dark:bg-red-900/20"
                        : aiAnalysis.riskLevel === "Medium"
                        ? "bg-amber-100 dark:bg-amber-900/20"
                        : "bg-green-100 dark:bg-green-900/20"
                    }`}
                  />
                  <p className="text-xs text-muted-foreground">
                    Based on match confidence and context
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Similar Cases</Label>
                  <p className="text-sm font-medium">
                    {aiAnalysis.similarCases} similar violations
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Resolution rate: {aiAnalysis.resolutionRate}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Estimated Resolution</Label>
                  <p className="text-sm font-medium">
                    {aiAnalysis.estimatedTimeToResolve}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Legal risks: {aiAnalysis.legalRisks}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Recommended Actions</Label>
                <div className="space-y-2">
                  {aiAnalysis.recommendations.map((recommendation, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="h-5 w-5 rounded-full bg-violet-100 dark:bg-violet-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="h-3 w-3 text-violet-600 dark:text-violet-400" />
                      </div>
                      <p className="text-sm">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Take Action</CardTitle>
              <CardDescription>
                Options to address this violation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <form action={async (formData) => {
                  const status = formData.get('status') as string;
                  const notes = formData.get('notes') as string;

                  // In a real app, we'd also include the notes
                  await updateViolationStatus(violation.id, status);
                }}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="status">Update Status</Label>
                      <Select name="status" defaultValue={violation.status}>
                        <SelectTrigger id="status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">Pending Review</SelectItem>
                          <SelectItem value="CONFIRMED">Confirm Violation</SelectItem>
                          <SelectItem value="DISMISSED">Dismiss</SelectItem>
                          <SelectItem value="RESOLVED">Mark as Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Resolution Notes</Label>
                      <Textarea
                        id="notes"
                        name="notes"
                        placeholder="Add details about how this violation was resolved..."
                        defaultValue={violation.resolutionNotes || ""}
                        rows={3}
                      />
                    </div>

                    <Button type="submit" className="w-full">Update Status</Button>
                  </div>
                </form>

                <hr className="border-border/50" />

                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Enforcement Options</h3>

                  <Button variant="outline" className="w-full justify-start gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>Send DMCA Takedown</span>
                  </Button>

                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Link2 className="h-4 w-4" />
                    <span>Request Attribution</span>
                  </Button>

                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Share2 className="h-4 w-4" />
                    <span>Offer Licensing</span>
                  </Button>
                </div>

                <hr className="border-border/50" />

                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Documentation</h3>

                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Download className="h-4 w-4" />
                    <span>Download Report</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enforcement Timeline */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Enforcement Timeline</CardTitle>
            <CardDescription>
              History of actions taken for this violation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center dark:bg-violet-900/20">
                  <Clock className="h-4 w-4 text-violet-600" />
                </div>
                <div className="flex-1 space-y-1 pb-4 border-b">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Violation Detected</h4>
                    <Badge variant="outline" className="text-xs">Automated</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{detectedDate}</p>
                  <p className="text-sm">
                    Potential unauthorized use detected via automated scanning.
                  </p>
                </div>
              </div>

              {/* Show any additional timeline events if available */}
              {violation.status !== 'PENDING' && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center dark:bg-amber-900/20">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Status Updated</h4>
                      <Badge variant="outline" className="text-xs">Manual</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{updatedDate}</p>
                    <p className="text-sm">
                      Violation status changed to {violation.status.charAt(0) + violation.status.slice(1).toLowerCase()}.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* DMCA Takedown Notice Generator */}
        <Card className="border-border/50 mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileWarning className="h-5 w-5 text-amber-600" />
              <span>DMCA Takedown Notice Generator</span>
            </CardTitle>
            <CardDescription>
              Prepare a formal DMCA takedown notice for this violation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-md border border-amber-100 dark:border-amber-800/30">
              <div className="flex gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                    Legal Notice
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                    Sending false DMCA claims may result in legal consequences. Only proceed if you are certain that your rights have been violated and you are authorized to act on behalf of the copyright owner.
                  </p>
                </div>
              </div>
            </div>

            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient Platform/Website</Label>
                <Input
                  id="recipient"
                  defaultValue={violation.sourceUrl.split('/')[2]}
                  placeholder="e.g. instagram.com"
                />
                <p className="text-xs text-muted-foreground">The platform where your content is being used without permission</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="original-work">Description of Original Work</Label>
                <Textarea
                  id="original-work"
                  defaultValue={`${work.title} - a ${work.type.toLowerCase()} created by me on ${new Date(work.createdAt).toLocaleDateString()}.`}
                  rows={2}
                />
                <p className="text-xs text-muted-foreground">Describe your original copyrighted work</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="infringing-url">Infringing URL</Label>
                <Input
                  id="infringing-url"
                  defaultValue={violation.sourceUrl}
                  placeholder="https://example.com/infringing-content"
                />
                <p className="text-xs text-muted-foreground">The specific URL where your work is being used without permission</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="good-faith">Good Faith Statement</Label>
                <Textarea
                  id="good-faith"
                  defaultValue="I have a good faith belief that the use of the described material in the manner complained of is not authorized by the copyright owner, its agent, or the law."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accuracy">Statement of Accuracy</Label>
                <Textarea
                  id="accuracy"
                  defaultValue="The information in this notification is accurate, and under penalty of perjury, I am authorized to act on behalf of the owner of an exclusive right that is allegedly infringed."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-info">Your Contact Information</Label>
                <Textarea
                  id="contact-info"
                  placeholder="Your full name, address, phone number, and email address"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">Required for valid DMCA notices. This information may be shared with the recipient of the takedown notice.</p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" className="gap-2">
                  <Download className="h-4 w-4" />
                  <span>Download as PDF</span>
                </Button>
                <Button type="button" variant="outline" className="gap-2">
                  <Share2 className="h-4 w-4" />
                  <span>Send via Email</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" asChild>
            <Link href="/dashboard/detection">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to All Violations
            </Link>
          </Button>

          <Button variant="outline" disabled>
            Next Violation
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
