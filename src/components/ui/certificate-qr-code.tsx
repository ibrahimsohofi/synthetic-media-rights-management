"use client";

import { useState } from "react";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Share2, Copy, Download, QrCode } from "lucide-react";

interface CertificateQRCodeProps {
  verificationUrl: string;
  metadataHash: string;
  workId: string;
  size?: number;
}

export function CertificateQRCode({
  verificationUrl,
  metadataHash,
  workId,
  size = 200
}: CertificateQRCodeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Create a full verification URL if only the hash is provided
  const fullUrl = verificationUrl.includes("://")
    ? verificationUrl
    : `${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${metadataHash}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    const canvas = document.getElementById('certificate-qr') as HTMLCanvasElement;
    if (!canvas) return;

    const svgElement = canvas.querySelector('svg');
    if (!svgElement) return;

    // Convert the SVG to a data URL
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    // Create a canvas to convert to PNG
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size * 2; // Higher resolution
      canvas.height = size * 2;
      const context = canvas.getContext('2d');
      if (!context) return;

      // Fill background white
      context.fillStyle = 'white';
      context.fillRect(0, 0, canvas.width, canvas.height);

      // Draw the QR code
      context.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Create download link
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `verification-qr-${workId.substring(0, 8)}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(svgUrl);
    };
    img.src = svgUrl;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <QrCode className="h-4 w-4" />
          <span>QR Code</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Verification QR Code</DialogTitle>
          <DialogDescription>
            Scan this QR code to verify the authenticity of this creative work on the blockchain.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-4">
          <div
            id="certificate-qr"
            className="bg-white p-4 rounded-lg mb-4"
            style={{ maxWidth: `${size}px` }}
          >
            <QRCode
              value={fullUrl}
              size={size}
              level="H"
              className="rounded"
            />
          </div>
          <p className="text-xs text-muted-foreground text-center mb-4 max-w-xs overflow-hidden text-ellipsis">
            {fullUrl}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleCopyLink}
            >
              <Copy className="h-4 w-4" />
              {copied ? "Copied!" : "Copy Link"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleDownloadQR}
            >
              <Download className="h-4 w-4" />
              Download QR
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
