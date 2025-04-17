"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, ArrowLeft, Share2, Check } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VerificationCertificate } from "@/components/ui/verification-certificate";
import { CertificateQRCode } from "@/components/ui/certificate-qr-code";
import { DownloadableCertificate } from "@/components/ui/downloadable-certificate";
import { DownloadableCertificatePdf } from "@/components/ui/downloadable-certificate-pdf";
import { GenerateCertificateButton } from "@/components/ui/generate-certificate-button";
import { toast } from "sonner";

interface BlockchainData {
  workId: string;
  workTitle: string;
  ownerName: string;
  registeredAt: Date;
  transactionId?: string;
  blockNumber?: number;
  networkName?: string;
  metadataHash: string;
  mediaType: string;
  thumbnailUrl?: string;
  verified: boolean;
}

interface CertificateClientProps {
  workId: string;
  mockData: BlockchainData;
}

export function CertificateClient({ workId, mockData }: CertificateClientProps) {
  const [loading, setLoading] = useState(true);
  const [hasCertificate, setHasCertificate] = useState(false);
  const [certificateData, setCertificateData] = useState<any>({
    id: "",
    workId: "",
    signature: "",
    certificateType: "standard",
    expiresAt: null,
  });
  const [work, setWork] = useState<any>({
    id: workId,
    title: mockData.workTitle,
    type: mockData.mediaType,
    owner: { name: mockData.ownerName },
    createdAt: mockData.registeredAt,
    metadataHash: mockData.metadataHash,
  });
  const [blockchainData, setBlockchainData] = useState(mockData.verified ? {
    transactionId: mockData.transactionId,
    blockNumber: mockData.blockNumber,
    networkName: mockData.networkName,
  } : null);

  useEffect(() => {
    // In a real implementation, this would fetch actual work and certificate data
    const fetchData = async () => {
      try {
        setLoading(false);

        // Simulate a certificate if one exists
        if (Math.random() > 0.3) { // 70% chance to have a certificate for demo
          setHasCertificate(true);
          setCertificateData({
            id: `cert-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`,
            workId: workId,
            signature: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
            certificateType: Math.random() > 0.5 ? "premium" : "standard",
            expiresAt: Math.random() > 0.5 ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : null,
          });
        }
      } catch (error) {
        console.error("Error fetching certificate data:", error);
        toast.error("Failed to load certificate");
        setLoading(false);
      }
    };

    fetchData();
  }, [workId]);

  const handleCertificateGenerated = (certificate: any) => {
    setHasCertificate(true);
    setCertificateData(certificate);
    toast.success("Certificate generated successfully");
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/verify/${work.metadataHash}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Certificate for ${work.title}`,
          text: "View this certificate of authenticity",
          url
        });
      } catch (err) {
        // Copy to clipboard as fallback
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      }
    } else {
      // Copy to clipboard as fallback
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbItem>
          <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="/dashboard/rights-registry">Rights Registry</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href={`/dashboard/rights-registry/${workId}`}>{work.title}</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>Certificate</BreadcrumbItem>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/dashboard/rights-registry/${workId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Certificate of Authenticity</h1>
        </div>

        {hasCertificate && (
          <Button variant="outline" onClick={handleShare} className="gap-2">
            <Share2 className="h-4 w-4" />
            <span>Share Certificate</span>
          </Button>
        )}
      </div>

      {!loading && !hasCertificate && (
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>No Certificate Found</AlertTitle>
          <AlertDescription>
            This work doesn't have a certificate yet. Generate one to prove authenticity and ownership.
            <div className="mt-4">
              <GenerateCertificateButton
                workId={workId}
                onCertificateGenerated={handleCertificateGenerated}
              />
            </div>
          </AlertDescription>
        </Alert>
      )}

      {hasCertificate && (
        <div className="space-y-6">
          <Alert variant="success">
            <Check className="h-4 w-4" />
            <AlertTitle>Certificate Active</AlertTitle>
            <AlertDescription>
              This work has an active certificate of authenticity{" "}
              {blockchainData && "with blockchain verification"}.
              {certificateData.expiresAt && (
                <span className="block mt-1">
                  Expires: {new Date(certificateData.expiresAt).toLocaleDateString()}
                </span>
              )}
            </AlertDescription>
          </Alert>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <Card>
                <CardContent className="p-0">
                  <Tabs defaultValue="certificate">
                    <TabsList className="grid grid-cols-2 m-4">
                      <TabsTrigger value="certificate">Certificate</TabsTrigger>
                      <TabsTrigger value="downloadable">Downloadable PDF</TabsTrigger>
                    </TabsList>

                    <TabsContent value="certificate" className="m-0">
                      <VerificationCertificate
                        workTitle={work.title}
                        ownerName={work.owner?.name || "Unknown"}
                        registeredAt={new Date(work.createdAt)}
                        metadataHash={work.metadataHash || mockData.metadataHash}
                        certificateId={certificateData.id}
                        signature={certificateData.signature}
                        transactionId={blockchainData?.transactionId}
                        blockNumber={blockchainData?.blockNumber}
                        networkName={blockchainData?.networkName}
                        certificateType={certificateData.certificateType}
                        expiresAt={certificateData.expiresAt}
                      />
                    </TabsContent>

                    <TabsContent value="downloadable">
                      <div className="p-6 flex items-center justify-center">
                        <DownloadableCertificate
                          data={{
                            workId: workId,
                            workTitle: work.title,
                            ownerName: work.owner?.name || "Unknown",
                            registeredAt: new Date(work.createdAt),
                            metadataHash: work.metadataHash || mockData.metadataHash,
                            certificateId: certificateData.id,
                            signature: certificateData.signature,
                            transactionId: blockchainData?.transactionId,
                            blockNumber: blockchainData?.blockNumber,
                            networkName: blockchainData?.networkName,
                            certificateType: certificateData.certificateType,
                            expiresAt: certificateData.expiresAt,
                            thumbnailUrl: mockData.thumbnailUrl,
                          }}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Verification QR Code</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Anyone can scan this code to verify the authenticity of this work
                    </p>
                    <div className="border rounded-md p-4 flex items-center justify-center bg-white">
                      <CertificateQRCode
                        metadataHash={work.metadataHash || mockData.metadataHash}
                        size={200}
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2">Certificate Details</h3>
                    <dl className="space-y-2">
                      <div>
                        <dt className="text-xs text-muted-foreground">ID</dt>
                        <dd className="text-sm font-mono text-xs">{certificateData.id}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">Type</dt>
                        <dd className="text-sm">
                          {certificateData.certificateType === "premium" ? "Premium" : "Standard"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">Issued</dt>
                        <dd className="text-sm">{new Date().toLocaleDateString()}</dd>
                      </div>
                      {certificateData.expiresAt && (
                        <div>
                          <dt className="text-xs text-muted-foreground">Expires</dt>
                          <dd className="text-sm">{new Date(certificateData.expiresAt).toLocaleDateString()}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
