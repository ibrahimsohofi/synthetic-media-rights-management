import type { Metadata } from "next";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { VerificationCertificate } from "@/components/ui/verification-certificate";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, ArrowLeft, Share2, Check } from "lucide-react";
import Link from "next/link";
import { CertificateQRCode } from "@/components/ui/certificate-qr-code";
import { DownloadableCertificate } from "@/components/ui/downloadable-certificate"; // Import the new component
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Import tabs component
import { GenerateCertificateButton } from "@/components/ui/generate-certificate-button"; // Import GenerateCertificateButton
import { CertificateClient } from "./certificate-client"; // Changed to named import

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

export default function CertificatePage({ params }: { params: { id: string } }) {
  const workId = params?.id || "unknown";

  return (
    <DashboardLayout>
      <CertificateClient workId={workId} mockData={mockBlockchainData} />
    </DashboardLayout>
  );
}
