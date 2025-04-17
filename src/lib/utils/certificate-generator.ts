/**
 * Certificate Generator for Synthetic Media Rights Management
 *
 * This utility provides functions for generating, signing, and verifying
 * certificates of authenticity for registered creative works.
 */

import { sha256 } from "../crypto-utils";
import type { CreativeWork, User, BlockchainRegistration } from "@prisma/client";

export type CertificateType = "standard" | "premium" | "enhanced";

export interface CertificateMetadata {
  version: string;
  registeredAt: Date;
  certificateId: string;
  creativeWorkId: string;
  ownerId: string;
  ownerName: string;
  title: string;
  type: string;
  registrationType: CertificateType;
  metadataHash: string;
  transactionId?: string;
  blockNumber?: number;
  networkName?: string;
  contentFingerprint?: string;
  aiTrainingStatus: boolean;
  verificationUrl: string;
  issuedAt: Date;
  expiresAt?: Date;
  additionalData?: Record<string, unknown>;
}

export interface SignedCertificate {
  metadata: CertificateMetadata;
  signature: string;
  certificateVersion: string;
  publicUrl: string;
}

// The current certificate version
const CERTIFICATE_VERSION = "1.0.0";

/**
 * Generate a certificate ID
 */
export function generateCertificateId(): string {
  const randomPart = Array.from(
    { length: 16 },
    () => Math.floor(Math.random() * 16).toString(16)
  ).join("");

  return `cert-${Date.now()}-${randomPart}`;
}

/**
 * Create a comprehensive metadata hash that uniquely identifies the work
 * This could be used for blockchain registration
 */
export async function generateMetadataHash(
  work: Pick<CreativeWork, "title" | "description" | "type" | "category" | "fileUrls" | "keywords" | "styleFingerprint">,
  owner: Pick<User, "id" | "name">,
  timestamp = new Date().toISOString()
): Promise<string> {
  // Create a structured metadata object
  const metadata = {
    title: work.title,
    description: work.description || "",
    type: work.type,
    category: work.category,
    fileUrls: work.fileUrls,
    keywords: work.keywords,
    authorId: owner.id,
    authorName: owner.name,
    styleFingerprint: work.styleFingerprint,
    timestamp,
    nonce: Math.random().toString(36).substring(2, 15)
  };

  // Sort keys to ensure consistent hash generation
  const sortedData = Object.keys(metadata)
    .sort()
    .reduce((acc, key) => {
      acc[key] = metadata[key];
      return acc;
    }, {} as Record<string, any>);

  // Create a string representation and hash it
  const metadataString = JSON.stringify(sortedData);
  const hash = await sha256(metadataString);

  return `0x${hash}`;
}

/**
 * Generate a certificate for a creative work
 */
export async function generateCertificate(
  work: CreativeWork & {
    owner: Pick<User, "id" | "name">;
    blockchain?: BlockchainRegistration;
  },
  certificateType: CertificateType = "standard",
  domainUrl = "https://syntheticrights.com"
): Promise<SignedCertificate> {
  // Generate certificate ID
  const certificateId = generateCertificateId();

  // Create verification URL
  const verificationUrl = `${domainUrl}/verify/${work.metadataHash}`;

  // Calculate expiration date (1 year from now for standard, never for premium)
  const expiresAt = certificateType === "standard"
    ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    : undefined;

  // Create metadata
  const metadata: CertificateMetadata = {
    version: CERTIFICATE_VERSION,
    registeredAt: work.createdAt,
    certificateId,
    creativeWorkId: work.id,
    ownerId: work.owner.id,
    ownerName: work.owner.name || "Unknown",
    title: work.title,
    type: work.type,
    registrationType: certificateType,
    metadataHash: work.metadataHash || "",
    transactionId: work.blockchain?.transactionId,
    blockNumber: work.blockchain?.blockNumber || undefined,
    networkName: work.blockchain?.networkName || undefined,
    aiTrainingStatus: work.aiTrainingOptOut,
    verificationUrl,
    issuedAt: new Date(),
    expiresAt,
    additionalData: {
      detectionEnabled: work.detectionEnabled,
      registrationStatus: work.registrationStatus,
      category: work.category,
      visibility: work.visibility
    }
  };

  // Create a digital signature (in production, this would use a proper signing key)
  // Here we're just simulating a signature with a hash of the metadata
  const signatureInput = JSON.stringify(metadata) + Date.now().toString();
  const signature = await sha256(signatureInput);

  // Create public URL
  const publicUrl = `${domainUrl}/certificate/${certificateId}`;

  return {
    metadata,
    signature,
    certificateVersion: CERTIFICATE_VERSION,
    publicUrl
  };
}

/**
 * Verify a certificate's authenticity
 */
export async function verifyCertificate(
  certificate: SignedCertificate
): Promise<{
  valid: boolean;
  expired: boolean;
  message: string;
}> {
  try {
    // Check if certificate has expired
    const isExpired = certificate.metadata.expiresAt &&
      new Date(certificate.metadata.expiresAt) < new Date();

    // In a real implementation, this would verify the digital signature
    // using a public key or verification service

    // For demonstration purposes, we're considering all certificates valid
    // unless they're expired

    if (isExpired) {
      return {
        valid: false,
        expired: true,
        message: "Certificate has expired. Please generate a new certificate."
      };
    }

    return {
      valid: true,
      expired: false,
      message: "Certificate is valid and authentic."
    };
  } catch (error) {
    return {
      valid: false,
      expired: false,
      message: "Failed to verify certificate: Invalid format or signature."
    };
  }
}

/**
 * Generate an exportable certificate in a specific format
 */
export function exportCertificate(
  certificate: SignedCertificate,
  format: "json" | "html" = "json"
): string {
  if (format === "json") {
    return JSON.stringify(certificate, null, 2);
  } else {
    // Generate an HTML representation of the certificate
    // This would be more elaborate in a real implementation
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Certificate of Authenticity - ${certificate.metadata.title}</title>
          <style>
            body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
            .certificate { border: 1px solid #ccc; padding: 2rem; border-radius: 8px; }
            .header { text-align: center; margin-bottom: 2rem; }
            .logo { font-weight: bold; font-size: 1.5rem; margin-bottom: 1rem; }
            .title { font-size: 2rem; font-weight: bold; margin-bottom: 0.5rem; }
            .subtitle { color: #666; margin-bottom: 2rem; }
            .details { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem; }
            .field { margin-bottom: 1rem; }
            .label { font-weight: bold; font-size: 0.875rem; color: #666; }
            .value { font-size: 1rem; }
            .signature { text-align: center; margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #eee; }
            .qr-placeholder { width: 150px; height: 150px; margin: 0 auto; background: #f0f0f0; display: flex; align-items: center; justify-content: center; }
            .verification { text-align: center; margin-top: 1rem; font-size: 0.875rem; color: #666; }
          </style>
        </head>
        <body>
          <div class="certificate">
            <div class="header">
              <div class="logo">SyntheticRights</div>
              <h1 class="title">Certificate of Authenticity</h1>
              <p class="subtitle">This certificate verifies the authenticity of the creative work detailed below.</p>
            </div>

            <div class="details">
              <div class="field">
                <div class="label">Creative Work</div>
                <div class="value">${certificate.metadata.title}</div>
              </div>
              <div class="field">
                <div class="label">Type</div>
                <div class="value">${certificate.metadata.type}</div>
              </div>
              <div class="field">
                <div class="label">Creator</div>
                <div class="value">${certificate.metadata.ownerName}</div>
              </div>
              <div class="field">
                <div class="label">Registered On</div>
                <div class="value">${new Date(certificate.metadata.registeredAt).toLocaleDateString()}</div>
              </div>
              <div class="field">
                <div class="label">Certificate ID</div>
                <div class="value">${certificate.metadata.certificateId}</div>
              </div>
              <div class="field">
                <div class="label">Blockchain Verified</div>
                <div class="value">${certificate.metadata.transactionId ? 'Yes' : 'No'}</div>
              </div>
              ${certificate.metadata.transactionId ? `
                <div class="field">
                  <div class="label">Transaction ID</div>
                  <div class="value">${certificate.metadata.transactionId.substring(0, 10)}...${certificate.metadata.transactionId.substring(certificate.metadata.transactionId.length - 6)}</div>
                </div>
              ` : ''}
              ${certificate.metadata.blockNumber ? `
                <div class="field">
                  <div class="label">Block Number</div>
                  <div class="value">${certificate.metadata.blockNumber}</div>
                </div>
              ` : ''}
              <div class="field">
                <div class="label">AI Training Opt-Out</div>
                <div class="value">${certificate.metadata.aiTrainingStatus ? 'Yes' : 'No'}</div>
              </div>
              <div class="field">
                <div class="label">Issued On</div>
                <div class="value">${new Date(certificate.metadata.issuedAt).toLocaleDateString()}</div>
              </div>
              ${certificate.metadata.expiresAt ? `
                <div class="field">
                  <div class="label">Expires On</div>
                  <div class="value">${new Date(certificate.metadata.expiresAt).toLocaleDateString()}</div>
                </div>
              ` : ''}
            </div>

            <div class="signature">
              <div class="qr-placeholder">[QR Code]</div>
              <p class="verification">Verify this certificate at: ${certificate.metadata.verificationUrl}</p>
              <p>Digital Signature: ${certificate.signature.substring(0, 16)}...${certificate.signature.substring(certificate.signature.length - 16)}</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
