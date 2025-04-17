"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Download, FileDown, Loader2, AlertTriangle, CheckCircle, Package } from "lucide-react";
import { toast } from "sonner";
import JSZip from "jszip";

interface Certificate {
  id: string;
  workId: string;
  title: string;
  createdAt: string;
  type: string;
  certificateType: string;
}

interface BatchCertificateDownloadProps {
  certificates: Certificate[];
  onComplete?: () => void;
}

export function BatchCertificateDownload({ certificates, onComplete }: BatchCertificateDownloadProps) {
  const [selectedCertificates, setSelectedCertificates] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<"pdf" | "json">("pdf");
  const [progress, setProgress] = useState({
    total: 0,
    processed: 0,
    failed: 0
  });

  // Toggle select all certificates
  const toggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);

    if (newSelectAll) {
      setSelectedCertificates(certificates.map(cert => cert.id));
    } else {
      setSelectedCertificates([]);
    }
  };

  // Toggle selection of a single certificate
  const toggleCertificateSelection = (certId: string) => {
    if (selectedCertificates.includes(certId)) {
      setSelectedCertificates(selectedCertificates.filter(id => id !== certId));
      if (selectAll) setSelectAll(false);
    } else {
      setSelectedCertificates([...selectedCertificates, certId]);
      if (selectedCertificates.length + 1 === certificates.length) {
        setSelectAll(true);
      }
    }
  };

  // Start batch download process
  const startBatchDownload = async () => {
    if (selectedCertificates.length === 0) {
      toast.error("Please select at least one certificate to download");
      return;
    }

    setDownloading(true);
    setProgress({
      total: selectedCertificates.length,
      processed: 0,
      failed: 0
    });

    try {
      // Create a new ZIP file
      const zip = new JSZip();
      const folder = zip.folder("certificates");

      // Process each certificate
      for (let i = 0; i < selectedCertificates.length; i++) {
        const certId = selectedCertificates[i];
        const certificate = certificates.find(c => c.id === certId);

        if (!certificate) {
          setProgress(prev => ({
            ...prev,
            processed: prev.processed + 1,
            failed: prev.failed + 1
          }));
          continue;
        }

        try {
          // Simulate fetching certificate data (in a real app, this would call an API)
          // For PDF, use the endpoint that generates and returns a PDF
          // For JSON, use the endpoint that returns the certificate data in JSON format
          const url = `/api/certificates/${certId}/download?format=${downloadFormat}`;
          const response = await fetch(url);

          if (!response.ok) {
            throw new Error(`Failed to download certificate ${certId}`);
          }

          // Get the certificate data
          const blob = await response.blob();

          // Sanitize the filename
          const fileName = certificate.title
            .replace(/[^a-z0-9]/gi, '-')
            .toLowerCase();

          // Add to zip with appropriate file extension
          const extension = downloadFormat === "pdf" ? "pdf" : "json";
          folder?.file(`${fileName}-certificate.${extension}`, blob);

          // Update progress
          setProgress(prev => ({
            ...prev,
            processed: prev.processed + 1
          }));
        } catch (error) {
          console.error(`Error downloading certificate ${certId}:`, error);
          setProgress(prev => ({
            ...prev,
            processed: prev.processed + 1,
            failed: prev.failed + 1
          }));
        }

        // Small delay to prevent overwhelming the browser
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Generate the ZIP file
      const zipBlob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: {
          level: 6
        }
      });

      // Create download link
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `synthetic-rights-certificates-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);

      toast.success("Batch download complete!");

      if (progress.failed > 0) {
        toast.warning(`${progress.failed} certificates failed to download`);
      }

      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error("Error creating batch download:", error);
      toast.error("Failed to create batch download");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          <span>Batch Certificate Download</span>
        </CardTitle>
        <CardDescription>
          Download multiple certificates at once as a ZIP archive
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {certificates.length === 0 ? (
          <Alert>
            <AlertDescription>
              No certificates available for download. Register your works to generate certificates.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-2">
              <Checkbox
                id="select-all"
                checked={selectAll}
                onCheckedChange={toggleSelectAll}
                disabled={downloading}
              />
              <Label htmlFor="select-all" className="text-sm font-medium">
                Select all certificates ({certificates.length})
              </Label>
            </div>

            <div className="border rounded-md divide-y max-h-[300px] overflow-y-auto">
              {certificates.map(cert => (
                <div
                  key={cert.id}
                  className="p-3 flex items-center justify-between hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id={`cert-${cert.id}`}
                      checked={selectedCertificates.includes(cert.id)}
                      onCheckedChange={() => toggleCertificateSelection(cert.id)}
                      disabled={downloading}
                    />
                    <div>
                      <p className="text-sm font-medium">{cert.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {cert.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(cert.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Badge variant={cert.certificateType === "premium" ? "default" : "secondary"}>
                    {cert.certificateType}
                  </Badge>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 mt-4">
              <div className="space-y-1">
                <Label htmlFor="format-pdf" className="text-sm flex items-center gap-2">
                  <Checkbox
                    id="format-pdf"
                    checked={downloadFormat === "pdf"}
                    onCheckedChange={() => setDownloadFormat("pdf")}
                    disabled={downloading}
                  />
                  PDF Format
                </Label>
                <p className="text-xs text-muted-foreground ml-6">
                  Download certificates as high-quality PDF documents
                </p>
              </div>

              <div className="space-y-1">
                <Label htmlFor="format-json" className="text-sm flex items-center gap-2">
                  <Checkbox
                    id="format-json"
                    checked={downloadFormat === "json"}
                    onCheckedChange={() => setDownloadFormat("json")}
                    disabled={downloading}
                  />
                  JSON Format
                </Label>
                <p className="text-xs text-muted-foreground ml-6">
                  Download raw certificate data for integration
                </p>
              </div>
            </div>

            {downloading && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>Downloading certificates...</span>
                  <span>
                    {progress.processed} of {progress.total} complete
                  </span>
                </div>
                <Progress
                  value={(progress.processed / progress.total) * 100}
                  className="h-2"
                />
                {progress.failed > 0 && (
                  <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                    <AlertTriangle className="h-3 w-3" />
                    {progress.failed} certificates failed to download
                  </p>
                )}
              </div>
            )}

            {!downloading && progress.processed > 0 && (
              <Alert variant={progress.failed > 0 ? "warning" : "success"} className="mt-4">
                {progress.failed > 0 ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  Downloaded {progress.processed - progress.failed} of {progress.total} certificates successfully
                  {progress.failed > 0 && (
                    <>, {progress.failed} failed</>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </CardContent>

      <CardFooter className="border-t pt-4">
        <Button
          onClick={startBatchDownload}
          disabled={downloading || selectedCertificates.length === 0}
          className="w-full flex items-center justify-center gap-2"
        >
          {downloading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Preparing Download...</span>
            </>
          ) : (
            <>
              <FileDown className="h-4 w-4" />
              <span>
                Download {selectedCertificates.length} Certificate{selectedCertificates.length !== 1 ? 's' : ''} as ZIP
              </span>
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
