"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle, ExternalLink, Calendar, Clock, Shield, Download } from "lucide-react";
import { QRCodeSVG } from "qrcode.react"; // Updated import
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

interface VerificationPageProps {
  params: {
    hash: string;
  };
}

export default function VerificationPage({ params }: VerificationPageProps) {
  const { hash } = params;
  const [verification, setVerification] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("certificate");

  useEffect(() => {
    const verifyHash = async () => {
      setIsLoading(true);
      try {
        // In a real application, this would be a fetch call to the API
        // For now, we'll use a mock response based on the hash parameter

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Simulate API response
        const mockVerification = {
          verified: true,
          certificate: {
            id: `cert-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
            certificateType: "premium",
            createdAt: new Date("2025-03-15T10:30:00Z"),
            expiresAt: null, // Premium certificates don't expire
            publicUrl: `/verify/${hash}`,
            work: {
              id: "work-12345",
              title: "Mountain Landscape Series #42",
              description: "A stunning AI-generated landscape featuring mountains and a lake at sunset.",
              type: "IMAGE",
              category: "Digital Art",
              thumbnailUrl: "https://source.unsplash.com/random/800x600/?landscape,mountains",
              ownerName: "Digital Creator"
            },
            metadata: {
              version: "1.0.0",
              registeredAt: new Date("2025-03-15T10:30:00Z"),
              certificateId: `cert-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
              creativeWorkId: "work-12345",
              ownerId: "user-abc123",
              ownerName: "Digital Creator",
              title: "Mountain Landscape Series #42",
              type: "IMAGE",
              registrationType: "premium",
              metadataHash: hash,
              transactionId: "0x8a4e9b8f72e3f8721b28490cfb51d675b60a63cfb85a2df7b57f0e38cd1dcb77",
              blockNumber: 8945721,
              networkName: "Polygon",
              aiTrainingStatus: true,
              verificationUrl: `/verify/${hash}`,
              issuedAt: new Date("2025-03-15T10:30:00Z")
            },
            blockchain: {
              transactionId: "0x8a4e9b8f72e3f8721b28490cfb51d675b60a63cfb85a2df7b57f0e38cd1dcb77",
              blockNumber: 8945721,
              networkName: "Polygon",
              registeredAt: new Date("2025-03-15T10:30:00Z")
            }
          }
        };

        setVerification(mockVerification);
      } catch (err) {
        console.error("Verification error:", err);
        setError("Failed to verify the certificate. Please check the hash and try again.");
      } finally {
        setIsLoading(false);
      }
    };

    verifyHash();
  }, [hash]);

  // Helper function to get badge variant based on verification status
  const getStatusBadge = (isVerified: boolean) => {
    if (isVerified) {
      return (
        <Badge variant="success" className="uppercase gap-1 px-3 py-1">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Verified</span>
        </Badge>
      );
    }
    return (
      <Badge variant="destructive" className="uppercase gap-1 px-3 py-1">
        <XCircle className="h-3.5 w-3.5" />
        <span>Not Verified</span>
      </Badge>
    );
  };

  // Helper function to format date
  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return "N/A";
    return format(new Date(date), "PPP");
  };

  // Block explorer URL based on network name
  const getBlockExplorerUrl = (network: string, transactionId: string) => {
    switch (network.toLowerCase()) {
      case 'ethereum':
      case 'mainnet':
        return `https://etherscan.io/tx/${transactionId}`;
      case 'polygon':
        return `https://polygonscan.com/tx/${transactionId}`;
      case 'arbitrum':
        return `https://arbiscan.io/tx/${transactionId}`;
      case 'optimism':
        return `https://optimistic.etherscan.io/tx/${transactionId}`;
      case 'base':
        return `https://basescan.org/tx/${transactionId}`;
      default:
        return `#`;
    }
  };

  const truncateHash = (hash: string) => {
    if (!hash) return "";
    return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`;
  };

  if (isLoading) {
    return (
      <div className="container max-w-screen-md mx-auto py-12 px-4">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Verifying Certificate</h2>
          <p className="text-muted-foreground">Please wait while we verify the authenticity of this certificate...</p>
        </div>
      </div>
    );
  }

  // Handle verification error
  if (error || !verification) {
    return (
      <div className="container max-w-screen-md mx-auto py-12 px-4">
        <div className="flex items-center mb-6">
          <Button variant="outline" size="sm" asChild className="mr-4">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Certificate Verification</h1>
        </div>

        <Card className="mb-6 border-destructive/50">
          <CardHeader className="bg-destructive/5">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              <CardTitle>Verification Failed</CardTitle>
            </div>
            <CardDescription>
              We couldn't verify the certificate for hash: {hash}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error || "The certificate could not be verified. This could be due to an invalid hash or certificate ID, or the certificate may have been revoked."}
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="bg-muted/50 flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/verify">
                Try Another Certificate
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/contact">
                Contact Support
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Certificate and work details for successful verification
  const { certificate } = verification;
  const { work, metadata, blockchain } = certificate;
  const blockExplorerUrl = getBlockExplorerUrl(blockchain.networkName, blockchain.transactionId);

  return (
    <div className="container max-w-screen-md mx-auto py-12 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center">
          <Button variant="outline" size="sm" asChild className="mr-4">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Certificate Verification</h1>
        </div>
        {getStatusBadge(verification.verified)}
      </div>

      <Card className="mb-8 overflow-hidden border-2 border-green-200 dark:border-green-900">
        <CardHeader className="bg-green-50 dark:bg-green-900/20 border-b border-green-100 dark:border-green-900/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
              <CardTitle>Verified Certificate</CardTitle>
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Verified on {formatDate(new Date())}</span>
            </div>
          </div>
          <CardDescription>
            This certificate confirms the authenticity and ownership of the creative work
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full rounded-none border-b">
              <TabsTrigger value="certificate" className="flex-1">Certificate Details</TabsTrigger>
              <TabsTrigger value="blockchain" className="flex-1">Blockchain Verification</TabsTrigger>
              <TabsTrigger value="content" className="flex-1">Content Information</TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="certificate" className="m-0">
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="md:col-span-2 space-y-6">
                    <div>
                      <h2 className="text-xl font-bold mb-3">{work.title}</h2>
                      <p className="text-sm text-muted-foreground mb-4">{work.description}</p>

                      <div className="aspect-video w-full rounded-md overflow-hidden border mb-4">
                        <img
                          src={work.thumbnailUrl}
                          alt={work.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Creator</p>
                          <p className="text-sm font-medium">{work.ownerName}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Content Type</p>
                          <p className="text-sm">{work.type} / {work.category}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Registration Date</p>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            <p className="text-sm">{formatDate(metadata.registeredAt)}</p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Certificate Type</p>
                          <div className="flex items-center gap-1.5">
                            <Badge variant="outline" className="capitalize">
                              {certificate.certificateType}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h3 className="text-sm font-medium">Certificate Information</h3>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Certificate ID</p>
                          <p className="text-sm font-mono text-xs">{certificate.id}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Issued Date</p>
                          <p className="text-sm">{formatDate(certificate.createdAt)}</p>
                        </div>
                        {certificate.expiresAt && (
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Expires On</p>
                            <p className="text-sm">{formatDate(certificate.expiresAt)}</p>
                          </div>
                        )}
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Content Hash</p>
                          <p className="text-sm font-mono text-xs break-all">{truncateHash(metadata.metadataHash)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 border rounded-md bg-muted/30">
                      <div className="flex flex-col items-center mb-3">
                        <h3 className="text-sm font-medium mb-2">Verification QR Code</h3>
                        <div className="bg-white p-2 rounded">
                          <QRCodeSVG // Updated component
                            value={certificate.publicUrl}
                            size={160}
                            level="H"
                            includeMargin={true}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-center text-muted-foreground">
                        Scan to verify this certificate
                      </p>
                    </div>

                    <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/30">
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <AlertDescription className="text-green-800 dark:text-green-300 text-sm">
                        This certificate is valid and authentic. It can be used to verify the ownership and authenticity of the creative work.
                      </AlertDescription>
                    </Alert>

                    {metadata.aiTrainingStatus && (
                      <div className="p-4 border rounded-md">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-purple-100 hover:bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/30">
                            AI Training Opt-Out
                          </Badge>
                        </div>
                        <p className="text-sm mt-2">
                          This work is protected from being used for AI model training without explicit permission.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="blockchain" className="m-0">
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-md">
                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">Blockchain Verification</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      This creative work has been permanently registered on the {blockchain.networkName} blockchain, providing immutable proof of ownership and timestamp.
                    </p>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-4">
                      <h3 className="text-base font-medium">Transaction Details</h3>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Transaction ID</p>
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-mono text-xs break-all">{truncateHash(blockchain.transactionId)}</p>
                            <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                              <a href={blockExplorerUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                                <span className="sr-only">View on {blockchain.networkName}</span>
                              </a>
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Block Number</p>
                          <p className="text-sm">{blockchain.blockNumber.toLocaleString()}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Network</p>
                          <p className="text-sm">{blockchain.networkName}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Registration Date</p>
                          <p className="text-sm">{formatDate(blockchain.registeredAt)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-base font-medium">Verification Information</h3>
                      <p className="text-sm text-muted-foreground">
                        Blockchain verification provides an immutable record that cannot be altered or tampered with. The timestamp and transaction details provide proof of when this work was registered.
                      </p>
                      <div className="mt-4">
                        <Button variant="outline" className="gap-2" asChild>
                          <a href={blockExplorerUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                            Verify on {blockchain.networkName}
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="content" className="m-0">
                <div className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-5">
                    <div className="md:col-span-3">
                      <div className="aspect-video w-full rounded-md overflow-hidden border">
                        <img
                          src={work.thumbnailUrl}
                          alt={work.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2 space-y-4">
                      <div>
                        <h2 className="text-xl font-bold">{work.title}</h2>
                        <p className="text-sm text-muted-foreground mt-1">{work.ownerName}</p>
                      </div>

                      <div className="space-y-1">
                        <Badge variant="outline" className="mr-2">
                          {work.type}
                        </Badge>
                        <Badge variant="outline">
                          {work.category}
                        </Badge>
                      </div>

                      <p className="text-sm">
                        {work.description}
                      </p>

                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Registered</p>
                        <p className="text-sm">
                          {formatDate(metadata.registeredAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-base font-medium">Content Protection</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="p-4 border rounded-md">
                        <h4 className="text-sm font-medium mb-2">Copyright Protection</h4>
                        <p className="text-sm text-muted-foreground">
                          This work is protected by copyright law. Unauthorized use, reproduction, or distribution is prohibited.
                        </p>
                      </div>

                      {metadata.aiTrainingStatus && (
                        <div className="p-4 border rounded-md">
                          <h4 className="text-sm font-medium mb-2">AI Training Protection</h4>
                          <p className="text-sm text-muted-foreground">
                            This work is protected from being used for AI model training without the creator's permission.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>

        <CardFooter className="flex flex-wrap gap-3 justify-between border-t p-6 bg-muted/30">
          <Button variant="outline" asChild className="gap-2">
            <a href={`/api/certificates/${certificate.id}/download?format=pdf`} target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4" />
              Download Certificate
            </a>
          </Button>

          <Button variant="outline" asChild className="gap-2">
            <a href={blockExplorerUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              Verify on {blockchain.networkName}
            </a>
          </Button>
        </CardFooter>
      </Card>

      <div className="flex flex-col items-center justify-center text-center max-w-lg mx-auto">
        <h3 className="text-base font-medium mb-2">Need to Verify Another Certificate?</h3>
        <p className="text-sm text-muted-foreground mb-4">
          You can verify any SyntheticRights certificate by entering the certificate hash or ID in the verification page.
        </p>
        <Button asChild>
          <Link href="/verify">
            Verify Another Certificate
          </Link>
        </Button>
      </div>
    </div>
  );
}
