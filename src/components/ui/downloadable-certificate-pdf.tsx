"use client";

import React, { useEffect } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { format } from "date-fns";
import QRCode from "qrcode";

export interface WatermarkOptions {
  enabled: boolean;
  text: string;
  opacity: number;
  angle: number;
  color: string;
  fontSize: number;
}

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

interface DownloadableCertificatePdfProps {
  data: CertificateData;
  watermarkOptions: WatermarkOptions;
  onGenerated: (blob: Blob) => void;
}

export function DownloadableCertificatePdf({
  data,
  watermarkOptions,
  onGenerated
}: DownloadableCertificatePdfProps) {
  useEffect(() => {
    const generatePdf = async () => {
      try {
        const blob = await generateCertificatePdf(data, watermarkOptions);
        onGenerated(blob);
      } catch (error) {
        console.error("Error generating PDF:", error);
      }
    };

    generatePdf();
  }, [data, watermarkOptions, onGenerated]);

  return null; // This component doesn't render anything visible
}

// Standalone function to generate certificate PDF
export async function generateCertificatePdf(
  data: CertificateData,
  watermarkOptions: WatermarkOptions
): Promise<Blob> {
  // Create a new PDF document
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  // Set up document metadata
  doc.setProperties({
    title: `Certificate of Authenticity - ${data.workTitle}`,
    subject: "Synthetic Media Rights Certificate",
    author: "SyntheticRights Platform",
    keywords: "certificate, digital rights, blockchain, authenticity",
    creator: "SyntheticRights Certificate Generator"
  });

  // Add logo and header
  const headerY = 20;
  doc.setFontSize(20);
  doc.setTextColor(75, 85, 99); // Gray-600
  doc.setFont("helvetica", "bold");
  doc.text("Certificate of Authenticity", 105, headerY, { align: "center" });

  doc.setFontSize(12);
  doc.setTextColor(107, 114, 128); // Gray-500
  doc.setFont("helvetica", "normal");
  doc.text("SyntheticRights Platform", 105, headerY + 7, { align: "center" });

  doc.setFontSize(10);
  doc.text("Blockchain Verified Digital Rights Certificate", 105, headerY + 12, { align: "center" });

  // Draw border and background for the main content area
  const marginX = 20;
  const contentStartY = headerY + 20;
  const contentWidth = 170;
  const contentHeight = 180;

  // Draw light gray background
  doc.setFillColor(249, 250, 251); // Gray-50
  doc.roundedRect(marginX, contentStartY, contentWidth, contentHeight, 2, 2, "F");

  // Draw border
  doc.setDrawColor(229, 231, 235); // Gray-200
  doc.setLineWidth(0.5);
  doc.roundedRect(marginX, contentStartY, contentWidth, contentHeight, 2, 2, "S");

  // Add watermark if enabled
  if (watermarkOptions.enabled) {
    // Parse color to RGB
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: Number.parseInt(result[1], 16),
        g: Number.parseInt(result[2], 16),
        b: Number.parseInt(result[3], 16)
      } : { r: 0, g: 0, b: 0 };
    };

    const color = hexToRgb(watermarkOptions.color);

    // Create watermark
    doc.saveGraphicsState();
    doc.setTextColor(color.r, color.g, color.b);
    doc.setGState(new doc.GState({ opacity: watermarkOptions.opacity }));
    doc.setFontSize(watermarkOptions.fontSize);
    doc.setFont("helvetica", "bold");

    // Position in the center of the content area
    const watermarkX = marginX + contentWidth / 2;
    const watermarkY = contentStartY + contentHeight / 2;

    // Rotate text
    doc.translate(watermarkX, watermarkY);
    doc.rotate(watermarkOptions.angle);
    doc.text(watermarkOptions.text, 0, 0, { align: "center" });

    // Reset transformation
    doc.restoreGraphicsState();
  }

  // Format dates
  const formatDate = (date: string | Date | undefined) => {
    if (!date) return "N/A";
    return format(new Date(date), "PPP");
  };

  // Certificate content
  let y = contentStartY + 15;

  // Draw section: Creative Work Details
  doc.setFontSize(14);
  doc.setTextColor(31, 41, 55); // Gray-800
  doc.setFont("helvetica", "bold");
  doc.text("Creative Work Details", marginX + 10, y);
  y += 10;

  // Content fields
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(75, 85, 99); // Gray-600
  doc.text("Title:", marginX + 10, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(55, 65, 81); // Gray-700
  doc.text(data.workTitle, marginX + 45, y);
  y += 7;

  doc.setFont("helvetica", "bold");
  doc.setTextColor(75, 85, 99);
  doc.text("Creator:", marginX + 10, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(55, 65, 81);
  doc.text(data.ownerName, marginX + 45, y);
  y += 7;

  doc.setFont("helvetica", "bold");
  doc.setTextColor(75, 85, 99);
  doc.text("Registration Date:", marginX + 10, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(55, 65, 81);
  doc.text(formatDate(data.registeredAt), marginX + 45, y);
  y += 7;

  doc.setFont("helvetica", "bold");
  doc.setTextColor(75, 85, 99);
  doc.text("Certificate Type:", marginX + 10, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(55, 65, 81);
  doc.text(data.certificateType.charAt(0).toUpperCase() + data.certificateType.slice(1), marginX + 45, y);
  y += 7;

  if (data.expiresAt) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(75, 85, 99);
    doc.text("Expires On:", marginX + 10, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(55, 65, 81);
    doc.text(formatDate(data.expiresAt), marginX + 45, y);
    y += 7;
  }

  y += 8;

  // Draw section: Verification Details
  doc.setFontSize(14);
  doc.setTextColor(31, 41, 55);
  doc.setFont("helvetica", "bold");
  doc.text("Verification Details", marginX + 10, y);
  y += 10;

  // Verification fields
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(75, 85, 99);
  doc.text("Certificate ID:", marginX + 10, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(55, 65, 81);
  doc.text(data.certificateId, marginX + 45, y);
  y += 7;

  doc.setFont("helvetica", "bold");
  doc.setTextColor(75, 85, 99);
  doc.text("Content Hash:", marginX + 10, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(55, 65, 81);
  // Truncate hash for better display
  doc.text(`${data.metadataHash.substring(0, 16)}...${data.metadataHash.substring(data.metadataHash.length - 16)}`, marginX + 45, y);
  y += 7;

  if (data.transactionId) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(75, 85, 99);
    doc.text("Transaction ID:", marginX + 10, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(55, 65, 81);
    // Truncate transaction ID for better display
    doc.text(`${data.transactionId.substring(0, 8)}...${data.transactionId.substring(data.transactionId.length - 8)}`, marginX + 45, y);
    y += 7;
  }

  if (data.networkName) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(75, 85, 99);
    doc.text("Blockchain:", marginX + 10, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(55, 65, 81);
    doc.text(data.networkName, marginX + 45, y);
    y += 7;
  }

  // Generate QR code for verification
  try {
    const verificationUrl = `https://syntheticrights.com/verify/${data.metadataHash}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 120,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Add QR code to the document
    const qrX = marginX + contentWidth - 40;
    const qrY = contentStartY + 40;
    const qrSize = 30;

    doc.addImage(qrCodeDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

    // Add QR code label
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128); // Gray-500
    doc.text("Scan to verify", qrX + qrSize / 2, qrY + qrSize + 5, { align: "center" });
  } catch (error) {
    console.error("Error generating QR code:", error);
  }

  // Add footer with verification info
  const footerY = contentStartY + contentHeight + 10;
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128); // Gray-500
  doc.text(`Verify this certificate at: syntheticrights.com/verify/${data.metadataHash.substring(0, 8)}...`, 105, footerY, { align: "center" });

  doc.setFontSize(8);
  doc.text(`Digital Signature: ${data.signature.substring(0, 12)}...${data.signature.substring(data.signature.length - 12)}`, 105, footerY + 5, { align: "center" });

  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175); // Gray-400
  doc.text(`Generated on ${format(new Date(), "PPP 'at' p")}`, 105, footerY + 10, { align: "center" });

  // Convert the PDF to a blob
  const pdfBlob = doc.output('blob');
  return pdfBlob;
}
