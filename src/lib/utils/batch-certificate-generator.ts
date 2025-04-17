/**
 * Batch Certificate Generator for Synthetic Media Rights Management
 *
 * This utility provides functions for generating batches of certificates
 * efficiently, with progress tracking and error handling.
 */

import { generateCertificatePdf, type WatermarkOptions } from "@/components/ui/downloadable-certificate-pdf";
import { generateCertificate } from "./certificate-generator";
import { prisma } from "@/lib/prisma";
import JSZip from "jszip";

export interface BatchCertificateOptions {
  userId: string;
  workIds: string[];
  certificateType?: "standard" | "premium";
  includeBlockchain?: boolean;
  domainUrl: string;
  watermarkOptions?: WatermarkOptions;
  progressCallback?: (progress: BatchCertificateProgress) => void;
}

export interface BatchCertificateProgress {
  total: number;
  processed: number;
  success: number;
  failed: number;
  currentItemId?: string;
  currentItemTitle?: string;
  certificates: BatchCertificateResult[];
}

export interface BatchCertificateResult {
  workId: string;
  workTitle: string;
  certificateId?: string;
  success: boolean;
  error?: string;
}

/**
 * Generate certificates for multiple creative works in batch
 */
export async function generateBatchCertificates(
  options: BatchCertificateOptions
): Promise<{ success: boolean; zipBlob?: Blob; progress: BatchCertificateProgress }> {
  const {
    userId,
    workIds,
    certificateType = "standard",
    includeBlockchain = false,
    domainUrl,
    watermarkOptions,
    progressCallback
  } = options;

  // Initialize progress
  const progress: BatchCertificateProgress = {
    total: workIds.length,
    processed: 0,
    success: 0,
    failed: 0,
    certificates: []
  };

  // Initialize ZIP file for bundling certificates
  const zip = new JSZip();
  const certificatesFolder = zip.folder("certificates");

  if (!certificatesFolder) {
    return {
      success: false,
      progress: {
        ...progress,
        failed: workIds.length
      }
    };
  }

  // Process each work
  for (const workId of workIds) {
    try {
      // Update progress with current work
      const work = await prisma.creativeWork.findUnique({
        where: {
          id: workId,
          ownerId: userId // Ensure the user owns this work
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              username: true,
            }
          },
          blockchain: true
        }
      });

      if (!work) {
        // Work not found or user doesn't own it
        progress.processed++;
        progress.failed++;
        progress.certificates.push({
          workId,
          workTitle: "Unknown Work",
          success: false,
          error: "Work not found or access denied"
        });

        // Notify progress
        if (progressCallback) {
          progressCallback({ ...progress });
        }
        continue;
      }

      // Update current item in progress
      progress.currentItemId = workId;
      progress.currentItemTitle = work.title;

      if (progressCallback) {
        progressCallback({ ...progress });
      }

      // Handle blockchain registration if requested
      // In a real implementation, this would integrate with the blockchain utils
      let blockchainData = work.blockchain;
      if (includeBlockchain && certificateType === "premium" && !blockchainData) {
        // In a real implementation, this would actually register on the blockchain
        // For now, we simulate it with mock data
        const transactionId = `0x${Array.from(
          { length: 64 },
          () => Math.floor(Math.random() * 16).toString(16)
        ).join("")}`;

        const blockNumber = Math.floor(Math.random() * 1000000) + 8000000;

        // In a real impl, this would be updated in the database
        blockchainData = {
          id: `blockchain-${Date.now()}`,
          transactionId,
          blockNumber,
          networkName: "Polygon",
          registeredAt: new Date(),
          verified: true,
          creativeWorkId: workId,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }

      // Generate certificate object
      const certificate = await generateCertificate(
        {
          ...work,
          blockchain: blockchainData
        },
        certificateType,
        domainUrl
      );

      // Store certificate in database
      // In a real integration, we'd use a transaction for this
      const dbCertificate = await prisma.certificate.create({
        data: {
          id: certificate.metadata.certificateId,
          workId: work.id,
          certificateType,
          ownerId: userId,
          metadataJson: JSON.stringify(certificate.metadata),
          signature: certificate.signature,
          publicUrl: certificate.publicUrl,
          expiresAt: certificate.metadata.expiresAt,
        }
      });

      // Generate PDF
      const certificateData = {
        workId: work.id,
        workTitle: work.title,
        ownerName: work.owner?.name || "Unknown",
        registeredAt: work.createdAt,
        metadataHash: work.metadataHash || "",
        certificateId: certificate.metadata.certificateId,
        signature: certificate.signature,
        transactionId: blockchainData?.transactionId,
        blockNumber: blockchainData?.blockNumber,
        networkName: blockchainData?.networkName,
        certificateType,
        expiresAt: certificate.metadata.expiresAt,
        thumbnailUrl: work.thumbnailUrl
      };

      // Generate PDF blob with watermark options if provided
      const pdfBlob = await generateCertificatePdf(certificateData, watermarkOptions);

      // Create safe filename
      const safeTitle = work.title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
      const filename = `${safeTitle}-certificate.pdf`;

      // Add to ZIP
      certificatesFolder.file(filename, pdfBlob);

      // Update progress
      progress.processed++;
      progress.success++;
      progress.certificates.push({
        workId,
        workTitle: work.title,
        certificateId: certificate.metadata.certificateId,
        success: true
      });

    } catch (error) {
      console.error(`Error processing work ${workId}:`, error);

      // Update progress with error
      progress.processed++;
      progress.failed++;
      progress.certificates.push({
        workId,
        workTitle: progress.currentItemTitle || "Unknown Work",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }

    // Notify progress after each item
    if (progressCallback) {
      progressCallback({ ...progress });
    }
  }

  try {
    // Generate the ZIP file
    const zipBlob = await zip.generateAsync({ type: "blob" });
    return { success: true, zipBlob, progress };
  } catch (error) {
    console.error("Error generating ZIP file:", error);
    return { success: false, progress };
  }
}
