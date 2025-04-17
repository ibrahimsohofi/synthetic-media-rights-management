"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Loader2, Shield, FileCheck } from "lucide-react";
import { DownloadableCertificate } from "@/components/ui/downloadable-certificate";

export default function TestCertificatePage() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'preview'>('form');
  const [certificateType, setCertificateType] = useState<string>("standard");
  const [workTitle, setWorkTitle] = useState<string>("Sample Creative Work");
  const [description, setDescription] = useState<string>("This is a sample creative work for testing certificate generation");
  const [ownerName, setOwnerName] = useState<string>("Test Creator");
  const [thumbnailUrl, setThumbnailUrl] = useState<string>("https://picsum.photos/seed/syntheticrights/800/450");

  const [certificateData, setCertificateData] = useState<any>(null);

  const handleGenerateCertificate = async () => {
    setLoading(true);

    try {
      // In a real app, this would call the API
      // For the test page, we'll create sample data

      // Generate a sample certificate ID
      const randomPart = Array.from(
        { length: 16 },
        () => Math.floor(Math.random() * 16).toString(16)
      ).join("");
      const certificateId = `cert-${Date.now()}-${randomPart}`;

      // Generate a sample metadata hash
      const metadataHash = `0x${Array.from(
        { length: 64 },
        () => Math.floor(Math.random() * 16).toString(16)
      ).join("")}`;

      // Generate a digital signature
      const signature = `sig_${Array.from(
        { length: 40 },
        () => Math.floor(Math.random() * 16).toString(16)
      ).join("")}`;

      // Sample blockchain transaction details
      const transactionId = certificateType === 'premium' ?
        `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}` :
        undefined;

      const blockNumber = certificateType === 'premium' ?
        Math.floor(Math.random() * 1000000) + 8000000 :
        undefined;

      const networkName = certificateType === 'premium' ? 'Polygon' : undefined;

      // Create certificate data
      const newCertificateData = {
        workId: `work-${Date.now()}`,
        workTitle,
        ownerName,
        registeredAt: new Date(),
        metadataHash,
        certificateId,
        signature,
        transactionId,
        blockNumber,
        networkName,
        certificateType,
        expiresAt: certificateType === 'standard' ?
          new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) :
          undefined,
        thumbnailUrl
      };

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      setCertificateData(newCertificateData);
      setStep('preview');
      toast.success("Test certificate generated successfully");
    } catch (error) {
      console.error("Error generating test certificate:", error);
      toast.error("Failed to generate test certificate");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCertificateData(null);
    setStep('form');
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Certificate Tester</h1>
          <p className="text-muted-foreground">
            Generate and test PDF certificate generation with different options
          </p>
        </div>
      </div>

      {step === 'form' ? (
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Generate Test Certificate
            </CardTitle>
            <CardDescription>
              Fill out the form to generate a test certificate. This is for testing purposes only.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Work Title</Label>
              <Input
                id="title"
                value={workTitle}
                onChange={(e) => setWorkTitle(e.target.value)}
                placeholder="Enter the title of your creative work"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter a description of your creative work"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ownerName">Creator Name</Label>
              <Input
                id="ownerName"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Enter the creator's name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
              <Input
                id="thumbnailUrl"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="Enter the URL of a thumbnail image (optional)"
              />
              {thumbnailUrl && (
                <div className="h-24 border rounded-lg overflow-hidden mt-2">
                  <img
                    src={thumbnailUrl}
                    alt="Thumbnail preview"
                    className="h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://picsum.photos/seed/syntheticrights/800/450";
                    }}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2 pt-2">
              <Label>Certificate Type</Label>
              <RadioGroup
                value={certificateType}
                onValueChange={setCertificateType}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="standard" id="standard" />
                  <Label htmlFor="standard" className="font-normal">
                    Standard Certificate (expires after 1 year)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="premium" id="premium" />
                  <Label htmlFor="premium" className="font-normal">
                    Premium Certificate (never expires, includes blockchain verification)
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleGenerateCertificate}
              disabled={loading || !workTitle || !ownerName}
              className="w-full gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Certificate...
                </>
              ) : (
                <>
                  <FileCheck className="h-4 w-4" />
                  Generate Test Certificate
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="max-w-5xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Test Certificate Preview
                </span>
                <Button variant="outline" onClick={handleReset}>
                  Generate Another Certificate
                </Button>
              </CardTitle>
              <CardDescription>
                This is a test certificate with sample data. You can download it in different formats.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {certificateData && (
                <DownloadableCertificate
                  workId={certificateData.workId}
                  workTitle={certificateData.workTitle}
                  ownerName={certificateData.ownerName}
                  registeredAt={certificateData.registeredAt}
                  metadataHash={certificateData.metadataHash}
                  certificateId={certificateData.certificateId}
                  signature={certificateData.signature}
                  transactionId={certificateData.transactionId}
                  blockNumber={certificateData.blockNumber}
                  networkName={certificateData.networkName}
                  certificateType={certificateData.certificateType}
                  expiresAt={certificateData.expiresAt}
                  thumbnailUrl={certificateData.thumbnailUrl}
                />
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
