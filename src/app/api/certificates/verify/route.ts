import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyCertificate } from "@/lib/utils/certificate-generator";

/**
 * API route for verifying certificates by their ID
 * This endpoint is publicly accessible for verification purposes
 */
export async function GET(request: NextRequest) {
  try {
    // Get certificate ID from query parameters
    const { searchParams } = new URL(request.url);
    const certificateId = searchParams.get("id");

    if (!certificateId) {
      return NextResponse.json(
        {
          verified: false,
          message: "Certificate ID is required"
        },
        { status: 400 }
      );
    }

    // Find the certificate by ID
    const certificate = await prisma.certificate.findUnique({
      where: { id: certificateId },
      include: {
        creativeWork: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                username: true,
                email: false // Exclude email for privacy
              }
            },
            blockchain: true
          }
        }
      }
    });

    if (!certificate) {
      return NextResponse.json(
        {
          verified: false,
          message: "Certificate not found"
        },
        { status: 404 }
      );
    }

    // Check if the certificate is revoked
    if (certificate.isRevoked) {
      return NextResponse.json(
        {
          verified: false,
          message: "This certificate has been revoked",
          revokedAt: certificate.updatedAt
        },
        { status: 410 }
      );
    }

    // Check if the certificate has expired
    if (certificate.expiresAt && new Date(certificate.expiresAt) < new Date()) {
      return NextResponse.json(
        {
          verified: false,
          message: "This certificate has expired",
          expiredAt: certificate.expiresAt
        },
        { status: 410 }
      );
    }

    // Parse certificate metadata
    let metadataJson = {};
    try {
      metadataJson = JSON.parse(certificate.metadataJson);
    } catch (error) {
      console.error("Error parsing certificate metadata:", error);
      return NextResponse.json(
        {
          verified: false,
          message: "Invalid certificate data"
        },
        { status: 500 }
      );
    }

    // Verify certificate using the certificate generator utility
    // In a real implementation, this would check the digital signature
    const certificateObj = {
      metadata: metadataJson,
      signature: certificate.signature,
      certificateVersion: metadataJson.version || "1.0.0",
      publicUrl: certificate.publicUrl
    };

    const verification = await verifyCertificate(certificateObj);

    if (!verification.valid) {
      return NextResponse.json(
        {
          verified: false,
          message: verification.message
        },
        { status: 400 }
      );
    }

    // If we get here, certificate is valid - return complete information
    return NextResponse.json({
      verified: true,
      certificate: {
        id: certificate.id,
        certificateType: certificate.certificateType,
        createdAt: certificate.createdAt,
        expiresAt: certificate.expiresAt,
        publicUrl: certificate.publicUrl,
        work: {
          id: certificate.creativeWork.id,
          title: certificate.creativeWork.title,
          description: certificate.creativeWork.description,
          type: certificate.creativeWork.type,
          category: certificate.creativeWork.category,
          thumbnailUrl: certificate.creativeWork.thumbnailUrl,
          ownerName: certificate.creativeWork.owner?.name || "Anonymous"
        },
        metadata: metadataJson,
        blockchain: certificate.creativeWork.blockchain ? {
          transactionId: certificate.creativeWork.blockchain.transactionId,
          blockNumber: certificate.creativeWork.blockchain.blockNumber,
          networkName: certificate.creativeWork.blockchain.networkName,
          registeredAt: certificate.creativeWork.blockchain.registeredAt
        } : null
      }
    });
  } catch (error) {
    console.error("Error verifying certificate:", error);
    return NextResponse.json(
      {
        verified: false,
        message: "An error occurred during verification",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
