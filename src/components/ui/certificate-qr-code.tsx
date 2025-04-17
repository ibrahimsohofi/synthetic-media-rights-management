"use client";

import React, { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react"; // Use the named import instead of default
import { Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface CertificateQRCodeProps {
  workId: string;
  metadataHash: string;
  title: string;
  showControls?: boolean;
  size?: number;
  bgColor?: string;
  fgColor?: string;
  logoUrl?: string;
}

export function CertificateQRCode({
  workId,
  metadataHash,
  title,
  showControls = true,
  size = 180,
  bgColor = "#ffffff",
  fgColor = "#000000",
  logoUrl,
}: CertificateQRCodeProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Generate the verification URL
  const verificationUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/verify/${metadataHash}`
    : `/verify/${metadataHash}`;

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  const downloadQRCode = () => {
    if (!qrRef.current) return;

    try {
      // Find the canvas element inside our ref
      const canvas = qrRef.current.querySelector("canvas");
      if (!canvas) {
        toast.error("Could not find QR code canvas element");
        return;
      }

      // Create a temporary link element
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `${title.replace(/\s+/g, '-').toLowerCase()}-qr-code.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("QR code downloaded successfully");
    } catch (error) {
      console.error("Error downloading QR code:", error);
      toast.error("Failed to download QR code");
    }
  };

  const copyVerificationLink = () => {
    navigator.clipboard.writeText(verificationUrl)
      .then(() => {
        setIsCopied(true);
        toast.success("Verification link copied to clipboard");
      })
      .catch(() => {
        toast.error("Failed to copy verification link");
      });
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Certificate QR Code</CardTitle>
        <CardDescription>
          Scan to verify authenticity
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center pt-2 pb-4">
        <div className="border p-3 rounded-lg bg-white" ref={qrRef}>
          <QRCodeSVG
            id={`qr-code-${workId}`}
            value={verificationUrl}
            size={size}
            bgColor={bgColor}
            fgColor={fgColor}
            level="H" // High error correction for better readability
            includeMargin={true}
            imageSettings={
              logoUrl
                ? {
                    src: logoUrl,
                    x: undefined,
                    y: undefined,
                    height: size * 0.2,
                    width: size * 0.2,
                    excavate: true,
                  }
                : undefined
            }
          />
        </div>
      </CardContent>
      {showControls && (
        <CardFooter className="pt-0 flex justify-between gap-2 pb-3">
          <Button variant="outline" size="sm" onClick={downloadQRCode} className="flex-1">
            <Download className="h-4 w-4 mr-1" /> Download
          </Button>
          <Button variant="outline" size="sm" onClick={copyVerificationLink} className="flex-1">
            <Share2 className="h-4 w-4 mr-1" /> {isCopied ? "Copied!" : "Copy Link"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
