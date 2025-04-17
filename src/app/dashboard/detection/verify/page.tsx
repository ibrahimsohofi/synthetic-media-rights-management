"use client";

import type { Metadata } from "next";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { VerificationForm } from "@/components/ui/verification-form";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Eye, FilePenLine, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Content Verification | SyntheticRights",
  description: "Verify synthetic media authenticity on the blockchain",
};

export default function VerifyPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-start">
          <div>
            <Breadcrumb className="mb-2">
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard/detection">Detection</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <span>Verify Content</span>
              </BreadcrumbItem>
            </Breadcrumb>
            <h1 className="text-3xl font-bold tracking-tight">Verify Content</h1>
            <p className="text-muted-foreground">
              Check if synthetic media content has been registered on the blockchain
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <VerificationForm />
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-violet-600" />
                  Why Verify Content?
                </CardTitle>
                <CardDescription>
                  Understand how verification helps protect rights
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm space-y-4">
                <p>
                  Content verification allows you to check if a piece of synthetic media has been properly registered on the blockchain, establishing its provenance and ownership.
                </p>
                <p>
                  This is useful for:
                </p>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li>Checking authenticity before purchasing or licensing</li>
                  <li>Identifying potential rights infringements</li>
                  <li>Verifying your own registered content is properly protected</li>
                  <li>Providing evidence in disputes or legal proceedings</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-green-600" />
                  Privacy Options
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-4">
                <p><strong>Private Verification</strong> - Your content is only analyzed to generate a fingerprint for comparison against the blockchain registry. The content is not stored or logged.</p>
                <p><strong>Public Verification</strong> - The verification request is logged publicly, which can help establish a public record of verification attempts for dispute resolution.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <FilePenLine className="h-5 w-5 text-blue-600" />
                  Supported Formats
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>Verification supports the following formats:</p>
                <div className="grid grid-cols-2 gap-1">
                  <div>• JPG, PNG, WebP</div>
                  <div>• GIF, SVG</div>
                  <div>• MP4, WebM</div>
                  <div>• MP3, WAV</div>
                  <div>• PDF, TXT</div>
                  <div>• 3D Model files</div>
                </div>
                <p className="mt-2">
                  Maximum file size: 50MB
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-amber-600" />
                  Need Help?
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p>
                  If you have questions about verification or need assistance interpreting results, please visit our <a href="/dashboard/support/articles/verification-guide" className="text-primary hover:underline">Verification Guide</a> or contact support.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
