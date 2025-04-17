"use client";

import { useState, useEffect } from "react";
import type { Metadata } from "next";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { VerificationCertificate } from "@/components/ui/verification-certificate";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, ArrowLeft, Share2, Check } from "lucide-react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CertificateQRCode } from "@/components/ui/certificate-qr-code"; // Added QR Code component

// In a real app, this would be fetched from the database
const mockBlockchainData = {
  workId: "842e63a7-5323-4e2b-9f91-8740eb4c5b33",
  workTitle: "Neural Network Generated Landscape Series #42",
  ownerName: "Content Creator",
  registeredAt: new Date("2025-03-12T14:32:56Z"),
  transactionId: "0x8a4e9b8f72e3f8721b28490cfb51d675b60a63cfb85a2df7b57f0e38cd1dcb77",
  blockNumber: 8945721,
  networkName: "Polygon",
  metadataHash: "0xf4a81d2d7eb3956d49b483eb86cdd2bb527dde7f3a8c08d1a973f23f2a0d5c1c",
  mediaType: "IMAGE",
  thumbnailUrl: "https://source.unsplash.com/random/800x600/?landscape,ai",
  verified: true,
};

export const metadata: Metadata = {
  title: "Verification Certificate | SyntheticRights",
  description: "Blockchain verification certificate for registered synthetic media",
};

export default function CertificatePage() {
  const params = useParams();
  const workId = params?.id as string || "unknown";

  const [work, setWork] = useState({
    id: "unknown",
    title: "Loading...",
    type: "IMAGE",
    metadataHash: "",
    ownerId: "",
    owner: {
      name: "Loading..."
    },
    createdAt: new Date()
  });

  const [blockchainData, setBlockchainData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [verificationUrl, setVerificationUrl] = useState("");
  const [copied, setCopied] = useState(false);

  // Simulate fetching data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, this would fetch from the server
        setIsLoading(false);
        setWork({
          id: workId,
          title: mockBlockchainData.workTitle,
          type: mockBlockchainData.mediaType,
          metadataHash: mockBlockchainData.metadataHash,
          ownerId: "user-123",
          owner: {
            name: mockBlockchainData.ownerName
          },
          createdAt: mockBlockchainData.registeredAt
        });

        setBlockchainData({
          transactionId: mockBlockchainData.transactionId,
          blockNumber: mockBlockchainData.blockNumber,
          networkName: mockBlockchainData.networkName,
          registeredAt: mockBlockchainData.registeredAt,
          verified: mockBlockchainData.verified
        });

        // Set a verification URL
        setVerificationUrl(`${window.location.origin}/verify/${mockBlockchainData.metadataHash}`);
      } catch (error) {
        console.error("Error fetching certificate data:", error);
      }
    };

    if (workId) {
      fetchData();
    }
  }, [workId]);

  // Handlers
  const handleCopyVerificationLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopied(true);

    // Reset copied state after 2 seconds
    setTimeout(() => {
      setCopied(false);
    }, 2000);
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
              <BreadcrumbLink href="/dashboard/rights-registry">Rights Registry</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/dashboard/rights-registry/${workId}`}>Work Details</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <span>Certificate</span>
            </BreadcrumbItem>
          </Breadcrumb>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/rights-registry/${workId}`}>
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to Work
              </Link>
            </Button>
            <CertificateQRCode
              verificationUrl={verificationUrl}
              metadataHash={work.metadataHash || mockBlockchainData.metadataHash}
              workId={workId}
            />
            <Button size="sm" onClick={handleCopyVerificationLink}>
              {copied ? (
                <>
                  <Check className="mr-1 h-4 w-4" />
                  Copied to Clipboard
                </>
              ) : (
                <>
                  <Share2 className="mr-1 h-4 w-4" />
                  Share Certificate
                </>
              )}
            </Button>
          </div>
        </div>

        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Verification Information</AlertTitle>
          <AlertDescription>
            This certificate provides blockchain verification of your registered synthetic media work.
            Share this certificate with others to prove ownership and authenticity.
          </AlertDescription>
        </Alert>

        <VerificationCertificate
          workId={workId}
          workTitle={work.title}
          ownerName={work.owner?.name || "Unknown"}
          registeredAt={new Date(work.createdAt)}
          transactionId={blockchainData?.transactionId || "0x..."}
          blockNumber={blockchainData?.blockNumber || 0}
          networkName={blockchainData?.networkName || "Polygon"}
          metadataHash={work.metadataHash || "mh..."}
          mediaType={work.type}
          thumbnailUrl={mockBlockchainData.thumbnailUrl || "https://source.unsplash.com/random/800x600/?landscape,ai"}
          verified={blockchainData?.verified}
        >
          <Card className="mt-4">
            <CardContent className="p-4">
              <h3 className="text-sm font-medium mb-2">About Verification Certificates</h3>
              <p className="text-sm text-muted-foreground">
                Your work is now protected with blockchain verification technology. This certificate
                serves as immutable proof of ownership and can be used to resolve disputes or license
                your content to others. The certificate includes a cryptographic hash of your work
                that can be independently verified on the blockchain.
              </p>
            </CardContent>
          </Card>
        </VerificationCertificate>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-medium mb-2">Verification Process</h3>
              <p className="text-sm text-muted-foreground">
                Learn more about how our blockchain verification system works and how to use this
                certificate to protect your rights.
              </p>
              <Button variant="link" size="sm" asChild className="px-0 mt-2">
                <Link href="/dashboard/support/articles/blockchain-verification">
                  Read the verification guide
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-medium mb-2">Need Help?</h3>
              <p className="text-sm text-muted-foreground">
                If you have questions about your verification certificate or need assistance with your
                registered works, our support team is here to help.
              </p>
              <Button variant="link" size="sm" asChild className="px-0 mt-2">
                <Link href="/dashboard/support">
                  Contact support
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
