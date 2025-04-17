"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { DownloadableCertificate } from "@/components/ui/downloadable-certificate";
import { Badge } from "@/components/ui/badge";
import { Shield, Award, QrCode, Workflow, FileCheck } from "lucide-react";

export default function CertificateShowcasePage() {
  const [activeTab, setActiveTab] = useState("enhanced-certificates");

  // Sample certificate data
  const sampleCertificate = {
    workId: "work-12345",
    workTitle: "Sunset Mountain Landscape",
    ownerName: "John Creator",
    registeredAt: new Date("2025-03-15T10:30:00Z"),
    metadataHash: "0x8a4e9b8f72e3f8721b28490cfb51d675b60a63cfb85a2df7b57f0e38cd1dcb77",
    certificateId: `cert-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    signature: "sig-a9d7e6f5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6",
    transactionId: "0x8a4e9b8f72e3f8721b28490cfb51d675b60a63cfb85a2df7b57f0e38cd1dcb77",
    blockNumber: 8945721,
    networkName: "Polygon",
    certificateType: "premium",
    thumbnailUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1170&auto=format&fit=crop"
  };

  const standardCertificate = {
    ...sampleCertificate,
    certificateId: `cert-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    certificateType: "standard",
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    workTitle: "Urban Cityscape at Night",
    transactionId: undefined,
    blockNumber: undefined,
    networkName: undefined
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enhanced Certificate Management</h1>
          <p className="text-muted-foreground mt-2">
            Explore our new certificate features designed to provide robust protection and verification for your creative works.
          </p>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="flex justify-between items-center">
            <TabsList className="grid grid-cols-3 w-[600px]">
              <TabsTrigger value="enhanced-certificates" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                <span>Enhanced Certificates</span>
              </TabsTrigger>
              <TabsTrigger value="batch-verification" className="flex items-center gap-2">
                <Workflow className="h-4 w-4" />
                <span>Batch Verification</span>
              </TabsTrigger>
              <TabsTrigger value="verification-tools" className="flex items-center gap-2">
                <FileCheck className="h-4 w-4" />
                <span>Verification Tools</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="enhanced-certificates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Enhanced Certificate Generation</CardTitle>
                <CardDescription>
                  Our certificates now include customizable watermarks, blockchain verification, and improved security features.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-xl font-medium">Premium Certificate</h3>
                    <p className="text-sm text-muted-foreground">
                      Premium certificates include blockchain verification and never expire. Ideal for high-value works that require the strongest protection.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 border-green-200 dark:border-green-800">
                        Blockchain Verified
                      </Badge>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                        No Expiration
                      </Badge>
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                        AI Training Protection
                      </Badge>
                    </div>
                    <DownloadableCertificate certificate={sampleCertificate} />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-medium">Standard Certificate</h3>
                    <p className="text-sm text-muted-foreground">
                      Standard certificates offer essential protection with a 1-year validity period. Suitable for most creative works.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                        1-Year Validity
                      </Badge>
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                        AI Training Protection
                      </Badge>
                    </div>
                    <DownloadableCertificate certificate={standardCertificate} />
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="bg-muted/40 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Certificate Features</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium">Customizable Watermarks</span>
                        <p className="text-muted-foreground">Personalize your certificates with custom watermarks including text, opacity, color, and angle settings.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium">QR Code Verification</span>
                        <p className="text-muted-foreground">Each certificate contains a QR code that directly links to the verification page for quick authenticity checks.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium">Blockchain Integration</span>
                        <p className="text-muted-foreground">Premium certificates include blockchain registration for immutable proof of ownership and timestamp verification.</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="batch-verification" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Batch Certificate Verification</CardTitle>
                <CardDescription>
                  Verify multiple certificates simultaneously for efficient rights management of your creative portfolio.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-medium mb-2">How It Works</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Our batch verification system allows you to check the validity of multiple certificates in a single operation, saving time when managing large collections.
                    </p>
                    <ul className="space-y-4">
                      <li className="flex gap-3">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">1</div>
                        <div>
                          <h4 className="font-medium">Enter Certificate Hashes</h4>
                          <p className="text-sm text-muted-foreground">Input multiple certificate hashes or IDs, separated by line breaks or commas.</p>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">2</div>
                        <div>
                          <h4 className="font-medium">Verification Process</h4>
                          <p className="text-sm text-muted-foreground">Our system verifies each certificate against the registry and blockchain records in parallel.</p>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">3</div>
                        <div>
                          <h4 className="font-medium">Review Results</h4>
                          <p className="text-sm text-muted-foreground">View a summary and detailed verification results for each certificate in the batch.</p>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">4</div>
                        <div>
                          <h4 className="font-medium">Export Report</h4>
                          <p className="text-sm text-muted-foreground">Download a comprehensive verification report for your records or for sharing with stakeholders.</p>
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <div className="aspect-video w-full bg-muted/30 rounded-lg border flex items-center justify-center p-6">
                      <div className="text-center space-y-4">
                        <Workflow className="h-16 w-16 mx-auto text-primary/60" />
                        <h3 className="font-medium">Batch Verification Dashboard</h3>
                        <p className="text-sm text-muted-foreground">
                          Our interactive dashboard provides real-time verification status and detailed results for each certificate in your batch.
                        </p>
                        <Button asChild className="mt-2">
                          <a href="/verify">Try Batch Verification</a>
                        </Button>
                      </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 p-4 rounded-lg border border-blue-200 dark:border-blue-800/30 text-sm">
                      <h4 className="font-medium mb-1">Pro Tip: Bulk Certificate Management</h4>
                      <p>
                        For large collections, use our API endpoints to automate batch certificate generation and verification. Perfect for studios and agencies managing extensive creative portfolios.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 border rounded-lg text-center">
                        <h4 className="font-medium text-2xl">100+</h4>
                        <p className="text-xs text-muted-foreground">Certificates Per Batch</p>
                      </div>
                      <div className="p-4 border rounded-lg text-center">
                        <h4 className="font-medium text-2xl">90%</h4>
                        <p className="text-xs text-muted-foreground">Time Savings vs. Individual Checks</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verification-tools" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Verification Tools</CardTitle>
                <CardDescription>
                  Powerful tools to verify the authenticity and ownership of creative works in various scenarios.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <Card className="border-2 border-primary/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <QrCode className="h-5 w-5 text-primary" />
                        <span>QR Code Scanner</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <p className="text-sm text-muted-foreground mb-4">
                        Our mobile-friendly QR code scanner allows instant verification of certificates from printed materials or digital displays.
                      </p>
                      <div className="aspect-video bg-muted/30 rounded-lg flex items-center justify-center mb-4">
                        <QrCode className="h-10 w-10 text-muted-foreground/50" />
                      </div>
                      <Button size="sm" className="w-full" asChild>
                        <a href="/verify">Open Scanner</a>
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-primary/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        <span>Blockchain Verification</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <p className="text-sm text-muted-foreground mb-4">
                        Directly verify the blockchain registration of your creative works for tamper-proof validation and timestamp confirmation.
                      </p>
                      <div className="aspect-video bg-muted/30 rounded-lg flex items-center justify-center mb-4">
                        <Shield className="h-10 w-10 text-muted-foreground/50" />
                      </div>
                      <Button size="sm" className="w-full" asChild>
                        <a href="/dashboard/support/articles/blockchain-verification">Learn More</a>
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-primary/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <FileCheck className="h-5 w-5 text-primary" />
                        <span>Content Matching</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <p className="text-sm text-muted-foreground mb-4">
                        Upload content to check if it matches any registered works in our database, helping identify potential infringements.
                      </p>
                      <div className="aspect-video bg-muted/30 rounded-lg flex items-center justify-center mb-4">
                        <FileCheck className="h-10 w-10 text-muted-foreground/50" />
                      </div>
                      <Button size="sm" className="w-full" asChild>
                        <a href="/dashboard/detection/scan">Try Content Matching</a>
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <Separator className="my-6" />

                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-green-800 dark:text-green-300 mb-2">
                    Enhanced Protection System
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-400 mb-4">
                    Our multi-layered verification system provides comprehensive protection for your creative works across the digital ecosystem.
                  </p>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-white dark:bg-green-900/40 rounded-lg border border-green-100 dark:border-green-800/50">
                      <h4 className="font-medium text-green-800 dark:text-green-300 mb-1">Certificate Verification</h4>
                      <p className="text-xs text-green-700 dark:text-green-400">
                        Verify the authenticity of certificates with cryptographic signatures and blockchain validation.
                      </p>
                    </div>
                    <div className="p-4 bg-white dark:bg-green-900/40 rounded-lg border border-green-100 dark:border-green-800/50">
                      <h4 className="font-medium text-green-800 dark:text-green-300 mb-1">Content Fingerprinting</h4>
                      <p className="text-xs text-green-700 dark:text-green-400">
                        Identify your works through unique digital fingerprints that can detect even modified versions.
                      </p>
                    </div>
                    <div className="p-4 bg-white dark:bg-green-900/40 rounded-lg border border-green-100 dark:border-green-800/50">
                      <h4 className="font-medium text-green-800 dark:text-green-300 mb-1">AI Training Controls</h4>
                      <p className="text-xs text-green-700 dark:text-green-400">
                        Manage how your content can be used for AI training with embedded permissions in certificates.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
