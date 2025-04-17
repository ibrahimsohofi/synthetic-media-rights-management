"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DownloadableCertificatePdf, type WatermarkOptions } from "./downloadable-certificate-pdf";
import {
  Download,
  Eye,
  Paintbrush,
  RefreshCw,
  Share2,
  Loader2
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { format } from "date-fns";

interface CertificateData {
  workId: string;
  workTitle: string;
  ownerName: string;
  registeredAt: Date | string;
  metadataHash: string;
  certificateId: string;
  signature: string;
  transactionId?: string;
  blockNumber?: number;
  networkName?: string;
  certificateType: string;
  expiresAt?: Date | string;
  thumbnailUrl?: string;
}

interface DownloadableCertificateProps {
  certificate: CertificateData;
  previewMode?: boolean;
  allowCustomization?: boolean;
  defaultWatermark?: WatermarkOptions;
}

export function DownloadableCertificate({
  certificate,
  previewMode = false,
  allowCustomization = true,
  defaultWatermark
}: DownloadableCertificateProps) {
  const [watermarkOptions, setWatermarkOptions] = useState<WatermarkOptions>(
    defaultWatermark || {
      enabled: true,
      text: "SYNTHETIC RIGHTS CERTIFICATE",
      opacity: 0.15,
      angle: -45,
      color: "#6366f1",
      fontSize: 24
    }
  );

  const [activeTab, setActiveTab] = useState("preview");
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // Color presets
  const colorPresets = [
    { name: "Indigo", value: "#6366f1" },
    { name: "Violet", value: "#8b5cf6" },
    { name: "Green", value: "#10b981" },
    { name: "Blue", value: "#3b82f6" },
    { name: "Red", value: "#ef4444" },
    { name: "Gray", value: "#6b7280" },
  ];

  // Effect to generate PDF when watermark options change
  useEffect(() => {
    if (previewMode) return;

    generatePdf();

    // Cleanup function to revoke object URL when component unmounts
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [watermarkOptions, certificate]);

  // Generate PDF with current watermark options
  const generatePdf = async () => {
    setGeneratingPdf(true);

    // Clear previous PDF URL if it exists
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }

    try {
      // Create a new PDF with the current watermark options
      const newPdfBlob = await generateCertificatePdf(certificate, watermarkOptions);
      setPdfBlob(newPdfBlob);

      // Create a URL for the PDF blob
      const newPdfUrl = URL.createObjectURL(newPdfBlob);
      setPdfUrl(newPdfUrl);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setGeneratingPdf(false);
    }
  };

  // Download the generated PDF
  const downloadPdf = () => {
    if (!pdfUrl) return;

    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `${certificate.workTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-certificate.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Share the certificate via Web Share API if available
  const shareCertificate = async () => {
    if (!pdfBlob || !navigator.share) return;

    try {
      const file = new File(
        [pdfBlob],
        `${certificate.workTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-certificate.pdf`,
        { type: "application/pdf" }
      );

      await navigator.share({
        title: `Certificate for ${certificate.workTitle}`,
        text: `Synthetic Media Rights Certificate for ${certificate.workTitle}`,
        files: [file]
      });
    } catch (error) {
      console.error("Error sharing certificate:", error);
    }
  };

  // Format a date for display
  const formatDate = (date: string | Date | undefined | null) => {
    if (!date) return "N/A";
    return format(new Date(date), "PPP");
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Certificate of Authenticity</CardTitle>
        <CardDescription>
          {certificate.certificateType === "premium" ? "Premium" : "Standard"} certificate for {certificate.workTitle}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span>Preview</span>
            </TabsTrigger>
            {allowCustomization && (
              <TabsTrigger value="customize" className="flex items-center gap-2">
                <Paintbrush className="h-4 w-4" />
                <span>Customize</span>
              </TabsTrigger>
            )}
          </TabsList>

          <div className="p-4">
            <TabsContent value="preview" className="mt-0 space-y-4">
              <div className="aspect-[1/1.414] w-full border rounded-md overflow-hidden bg-white relative">
                {/* Certificate Preview */}
                <div className="absolute inset-0 p-4 flex flex-col">
                  {/* Header */}
                  <div className="text-center mb-4">
                    <h2 className="text-lg font-bold text-indigo-700">Certificate of Authenticity</h2>
                    <p className="text-sm text-gray-600">SyntheticRights Platform</p>
                    <p className="text-xs text-gray-500">Blockchain Verified Digital Rights Certificate</p>
                  </div>

                  {/* Content */}
                  <div className="flex-1 border rounded-md bg-gray-50 p-3 relative overflow-hidden">
                    {/* Watermark */}
                    {watermarkOptions.enabled && (
                      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
                        <div
                          className="whitespace-nowrap text-center font-bold"
                          style={{
                            opacity: watermarkOptions.opacity,
                            transform: `rotate(${watermarkOptions.angle}deg)`,
                            color: watermarkOptions.color,
                            fontSize: `${watermarkOptions.fontSize}px`,
                          }}
                        >
                          {watermarkOptions.text || "SYNTHETIC RIGHTS"}
                        </div>
                      </div>
                    )}

                    {/* Certificate Content */}
                    <div className="relative z-10">
                      <h3 className="text-base font-semibold mb-2">Creative Work Details</h3>
                      <div className="space-y-1 mb-3">
                        <div className="flex">
                          <span className="text-xs font-medium w-28">Title:</span>
                          <span className="text-xs">{certificate.workTitle}</span>
                        </div>
                        <div className="flex">
                          <span className="text-xs font-medium w-28">Creator:</span>
                          <span className="text-xs">{certificate.ownerName}</span>
                        </div>
                        <div className="flex">
                          <span className="text-xs font-medium w-28">Registration Date:</span>
                          <span className="text-xs">{formatDate(certificate.registeredAt)}</span>
                        </div>
                        <div className="flex">
                          <span className="text-xs font-medium w-28">Certificate Type:</span>
                          <span className="text-xs capitalize">{certificate.certificateType}</span>
                        </div>
                        {certificate.expiresAt && (
                          <div className="flex">
                            <span className="text-xs font-medium w-28">Expires On:</span>
                            <span className="text-xs">{formatDate(certificate.expiresAt)}</span>
                          </div>
                        )}
                      </div>

                      <h3 className="text-base font-semibold mb-2">Verification Details</h3>
                      <div className="space-y-1 mb-3">
                        <div className="flex">
                          <span className="text-xs font-medium w-28">Certificate ID:</span>
                          <span className="text-xs font-mono truncate">{certificate.certificateId}</span>
                        </div>
                        <div className="flex">
                          <span className="text-xs font-medium w-28">Content Hash:</span>
                          <span className="text-xs font-mono truncate">{certificate.metadataHash.substring(0, 16)}...</span>
                        </div>
                        {certificate.transactionId && (
                          <div className="flex">
                            <span className="text-xs font-medium w-28">Transaction ID:</span>
                            <span className="text-xs font-mono truncate">{certificate.transactionId.substring(0, 8)}...{certificate.transactionId.substring(certificate.transactionId.length - 8)}</span>
                          </div>
                        )}
                        {certificate.networkName && (
                          <div className="flex">
                            <span className="text-xs font-medium w-28">Blockchain:</span>
                            <span className="text-xs">{certificate.networkName}</span>
                          </div>
                        )}
                      </div>

                      {/* QR Code */}
                      <div className="absolute right-4 top-4 w-24 h-24 bg-white p-1 rounded-md border shadow-sm">
                        <QRCodeSVG
                          value={`https://syntheticrights.com/verify/${certificate.metadataHash}`}
                          size={86}
                          level="H"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-2 text-center">
                    <p className="text-xs text-gray-500">
                      Verify at: syntheticrights.com/verify/{certificate.metadataHash.substring(0, 8)}...
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Digital Signature: {certificate.signature.substring(0, 8)}...{certificate.signature.substring(certificate.signature.length - 8)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                <p>This is a preview of your certificate. The PDF version will be higher quality and include all details.</p>
              </div>
            </TabsContent>

            {allowCustomization && (
              <TabsContent value="customize" className="mt-0 space-y-4">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label htmlFor="watermark-toggle">Watermark</Label>
                      <div className="flex items-center">
                        <input
                          id="watermark-toggle"
                          type="checkbox"
                          className="mr-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          checked={watermarkOptions.enabled}
                          onChange={(e) => setWatermarkOptions({
                            ...watermarkOptions,
                            enabled: e.target.checked
                          })}
                        />
                        <Label htmlFor="watermark-toggle" className="text-sm">
                          {watermarkOptions.enabled ? "Enabled" : "Disabled"}
                        </Label>
                      </div>
                    </div>

                    {watermarkOptions.enabled && (
                      <div className="space-y-4 border rounded-md p-3 bg-muted/30">
                        <div className="space-y-2">
                          <Label htmlFor="watermark-text">Watermark Text</Label>
                          <Input
                            id="watermark-text"
                            value={watermarkOptions.text}
                            onChange={(e) => setWatermarkOptions({
                              ...watermarkOptions,
                              text: e.target.value
                            })}
                            placeholder="Enter watermark text"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="flex justify-between">
                            <span>Opacity: {Math.round(watermarkOptions.opacity * 100)}%</span>
                          </Label>
                          <Slider
                            defaultValue={[watermarkOptions.opacity * 100]}
                            min={5}
                            max={50}
                            step={5}
                            onValueChange={(value) => setWatermarkOptions({
                              ...watermarkOptions,
                              opacity: value[0] / 100
                            })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="flex justify-between">
                            <span>Rotation: {watermarkOptions.angle}°</span>
                          </Label>
                          <Slider
                            defaultValue={[watermarkOptions.angle]}
                            min={-90}
                            max={90}
                            step={15}
                            onValueChange={(value) => setWatermarkOptions({
                              ...watermarkOptions,
                              angle: value[0]
                            })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="flex justify-between">
                            <span>Font Size: {watermarkOptions.fontSize}px</span>
                          </Label>
                          <Slider
                            defaultValue={[watermarkOptions.fontSize]}
                            min={12}
                            max={36}
                            step={2}
                            onValueChange={(value) => setWatermarkOptions({
                              ...watermarkOptions,
                              fontSize: value[0]
                            })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="watermark-color">Color</Label>
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <Select
                                value={watermarkOptions.color}
                                onValueChange={(color) => setWatermarkOptions({
                                  ...watermarkOptions,
                                  color
                                })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a color" />
                                </SelectTrigger>
                                <SelectContent>
                                  {colorPresets.map((preset) => (
                                    <SelectItem key={preset.value} value={preset.value}>
                                      <div className="flex items-center gap-2">
                                        <div
                                          className="w-4 h-4 rounded-full"
                                          style={{ backgroundColor: preset.value }}
                                        />
                                        <span>{preset.name}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <Input
                              type="color"
                              className="w-12 h-9 p-1"
                              value={watermarkOptions.color}
                              onChange={(e) => setWatermarkOptions({
                                ...watermarkOptions,
                                color: e.target.value
                              })}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setWatermarkOptions({
                        enabled: true,
                        text: "SYNTHETIC RIGHTS CERTIFICATE",
                        opacity: 0.15,
                        angle: -45,
                        color: "#6366f1",
                        fontSize: 24
                      });
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset to Default
                  </Button>
                </div>
              </TabsContent>
            )}
          </div>
        </Tabs>
      </CardContent>

      <CardFooter className="flex gap-2 justify-between border-t p-4 bg-muted/30">
        {!previewMode && (
          <>
            <Button variant="outline" className="w-full sm:w-auto" onClick={generatePdf} disabled={generatingPdf}>
              {generatingPdf ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh PDF
                </>
              )}
            </Button>

            <div className="flex gap-2 flex-1 sm:flex-initial sm:justify-end">
              {navigator.share && (
                <Button variant="outline" className="flex-1 sm:flex-initial" onClick={shareCertificate} disabled={!pdfBlob}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              )}

              <Button className="flex-1 sm:flex-initial" onClick={downloadPdf} disabled={!pdfUrl}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </>
        )}

        {previewMode && (
          <Button className="w-full" disabled>
            <Download className="h-4 w-4 mr-2" />
            Download Certificate
          </Button>
        )}
      </CardFooter>

      {/* Hidden component to generate the PDF */}
      {!previewMode && (
        <div className="hidden">
          <DownloadableCertificatePdf
            data={certificate}
            watermarkOptions={watermarkOptions}
            onGenerated={(blob) => {
              setPdfBlob(blob);
              setPdfUrl(URL.createObjectURL(blob));
              setGeneratingPdf(false);
            }}
          />
        </div>
      )}
    </Card>
  );
}

// Helper function to generate a certificate PDF without using the React component
async function generateCertificatePdf(
  data: CertificateData,
  watermarkOptions: WatermarkOptions
): Promise<Blob> {
  // Import the function at runtime to avoid server-side errors
  const { generateCertificatePdf } = await import("./downloadable-certificate-pdf");
  return generateCertificatePdf(data, watermarkOptions);
}
