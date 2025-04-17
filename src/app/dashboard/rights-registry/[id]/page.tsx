import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Eye,
  Download,
  FileCheck,
  Edit,
  Shield,
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  Lock,
  Globe,
  Tag,
  Calendar,
  ExternalLink,
  AlertTriangle,
  Copy,
  Award,
  Fingerprint,
  BarChart
} from "lucide-react";
import Link from "next/link";
import { getCreativeWork } from "@/lib/actions/rights-registry";
import { notFound } from "next/navigation";
import Image from "next/image";
import { GenerateCertificateButton } from "@/components/ui/generate-certificate-button";

interface WorkDetailsPageParams {
  params: {
    id: string;
  };
}

export default async function WorkDetailsPage({ params }: WorkDetailsPageParams) {
  const workId = params.id;
  const workResult = await getCreativeWork(workId);

  if (!workResult.success || !workResult.work) {
    return notFound();
  }

  const work = workResult.work;
  const isOwner = workResult.isOwner;

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

  // Format dates for display
  const registeredDate = new Date(work.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-2">
          <Link href="/dashboard/rights-registry" className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-1">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Rights Registry
          </Link>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">{work.title}</h1>
                <Badge variant="outline" className="capitalize">
                  {work.type.toLowerCase()}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Registered on {registeredDate}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild className="gap-2">
                <Link href={`/dashboard/rights-registry/${workId}/certificate`}>
                  <Award className="h-4 w-4" />
                  <span>Certificate</span>
                </Link>
              </Button>
              <Button variant="outline" className="gap-2">
                <Eye className="h-4 w-4" />
                <span>Preview</span>
              </Button>
              {isOwner && (
                <Button className="gap-2">
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Work Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Work Preview */}
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Work Preview</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-0">
              <div className="w-full aspect-square bg-muted relative overflow-hidden">
                {work.thumbnailUrl ? (
                  <Image
                    src={work.thumbnailUrl}
                    alt={work.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    {getContentTypeIcon(work.type)}
                  </div>
                )}
              </div>

              <div className="p-4 w-full">
                <div className="flex flex-wrap gap-2 mt-2">
                  {(work.keywords || []).map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />{keyword}
                    </Badge>
                  ))}
                  {(work.keywords || []).length === 0 && (
                    <div className="text-sm text-muted-foreground">No keywords available</div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Download className="h-4 w-4" />
                <span>Download</span>
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Copy className="h-4 w-4" />
                <span>Copy ID</span>
              </Button>
            </CardFooter>
          </Card>

          {/* Middle Column - Work Details */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Work Details</CardTitle>
              <CardDescription>Details of your registered creative work</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="details" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="protection">Protection</TabsTrigger>
                  <TabsTrigger value="licensing">Licensing</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium">Content Type</h3>
                      <div className="flex items-center gap-1.5">
                        {getContentTypeIcon(work.type)}
                        <span className="text-sm capitalize">{work.type.toLowerCase()}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-sm font-medium">Category</h3>
                      <p className="text-sm">{work.category}</p>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-sm font-medium">Registration Status</h3>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className={`
                          ${work.registrationStatus === 'REGISTERED' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                            work.registrationStatus === 'PENDING' ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' :
                            'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'}
                        `}>
                          {work.registrationStatus === 'REGISTERED' ?
                            <Shield className="h-3 w-3 mr-1" /> :
                            work.registrationStatus === 'PENDING' ?
                            <Clock className="h-3 w-3 mr-1" /> :
                            <AlertTriangle className="h-3 w-3 mr-1" />
                          }
                          {work.registrationStatus}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-sm font-medium">Visibility</h3>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline">
                          {work.visibility === 'PUBLIC' ?
                            <Globe className="h-3 w-3 mr-1" /> :
                            work.visibility === 'PRIVATE' ?
                            <Lock className="h-3 w-3 mr-1" /> :
                            <Eye className="h-3 w-3 mr-1" />
                          }
                          {work.visibility}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 pt-4 border-t">
                    <h3 className="text-sm font-medium">Description</h3>
                    <p className="text-sm">
                      {work.description || "No description provided."}
                    </p>
                  </div>

                  <div className="space-y-1 pt-4 border-t">
                    <h3 className="text-sm font-medium">Metadata Hash</h3>
                    <div className="font-mono text-xs bg-muted p-2 rounded overflow-x-auto break-all">
                      {work.metadataHash || "No metadata hash available"}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="protection" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 border rounded-lg flex items-start gap-3">
                      <div className={`p-2 rounded-full ${work.aiTrainingOptOut ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-muted text-muted-foreground'}`}>
                        <Shield className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">AI Training Opt-Out</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {work.aiTrainingOptOut ?
                            "AI systems cannot use this work for training without explicit permission" :
                            "This work allows AI systems to use it for training"}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg flex items-start gap-3">
                      <div className={`p-2 rounded-full ${work.detectionEnabled ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400' : 'bg-muted text-muted-foreground'}`}>
                        <Eye className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Automated Detection</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {work.detectionEnabled ?
                            "This work is automatically monitored for unauthorized use" :
                            "Automated detection is disabled for this work"}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg flex items-start gap-3">
                      <div className={`p-2 rounded-full ${work.styleFingerprint ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-muted text-muted-foreground'}`}>
                        <Fingerprint className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Style Fingerprinting</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {work.styleFingerprint ?
                            "This work has a style fingerprint for enhanced detection" :
                            "No style fingerprint created for this work"}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg flex items-start gap-3">
                      <div className="p-2 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400">
                        <Shield className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Blockchain Registration</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {work.metadataHash ?
                            "This work is registered on blockchain for immutable proof" :
                            "Blockchain registration pending"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t flex justify-end">
                    <Button variant="outline" asChild className="gap-2">
                      <Link href={`/dashboard/rights-registry/${workId}/certificate`}>
                        <Award className="h-4 w-4" />
                        <span>View Ownership Certificate</span>
                      </Link>
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="licensing" className="space-y-4">
                  <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
                    <FileCheck className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No Active Licenses</h3>
                    <p className="text-muted-foreground text-center mt-2 mb-6 max-w-md">
                      This work currently doesn't have any active licenses.
                      Create a license to define how others can use your work.
                    </p>
                    <Button asChild>
                      <Link href="/dashboard/licensing/create">
                        Create License
                      </Link>
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="activity" className="space-y-4">
                  <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
                    <BarChart className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">Activity Overview</h3>
                    <p className="text-muted-foreground text-center mt-2 mb-6 max-w-md">
                      Track all activity related to this work including detection scans,
                      licensing changes, and usage analytics.
                    </p>
                    <Button asChild>
                      <Link href="/dashboard/analytics">
                        View Analytics
                      </Link>
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Actions Row */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Protection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {work.aiTrainingOptOut && work.detectionEnabled ? "Active" : "Partial"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {work.aiTrainingOptOut && work.detectionEnabled ?
                  "Full protection enabled" :
                  "Some protection features disabled"}
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full">
                Update Protection
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Licenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active licenses for this work
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/dashboard/licensing/create">
                  Create License
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Violations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground mt-1">
                Potential violations detected
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/dashboard/detection">
                  View Violations
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Marketplace</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Not Listed</div>
              <p className="text-xs text-muted-foreground mt-1">
                This work is not available in marketplace
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/dashboard/marketplace/create">
                  List in Marketplace
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Add the certificate button to the actions section */}
        <div className="flex items-center gap-2 mt-6">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/rights-registry/${workId}/certificate`}>
              <FileText className="h-4 w-4 mr-1" />
              View Certificates
            </Link>
          </Button>
          <GenerateCertificateButton
            workId={workId}
            workTitle={work.title || ""}
            hasBlockchainRegistration={!!work.metadataHash}
          />
          <Button variant="outline" size="sm">
            <Shield className="h-4 w-4 mr-1" />
            Verify Authenticity
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
