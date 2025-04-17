import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyOnEthereum, getExplorerUrl } from "@/lib/ethereum-utils";

/**
 * API route for generating certificate data (JSON format)
 * This will be used by the frontend to generate PDF certificates
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workId = params.id;

    // In a real implementation, this would fetch the work from the database
    const work = await prisma.creativeWork.findUnique({
      where: { id: workId },
      include: {
        owner: true,
        blockchain: true
      }
    });

    if (!work) {
      return NextResponse.json(
        { error: "Work not found" },
        { status: 404 }
      );
    }

    // If there's no blockchain record, verify with Ethereum
    let blockchainData = work.blockchain;

    if (!blockchainData && work.metadataHash) {
      // Get blockchain data from Ethereum (simulated in development)
      const ethereumResult = await verifyOnEthereum(work.metadataHash);

      if (ethereumResult.verified) {
        blockchainData = {
          id: "",
          creativeWorkId: work.id,
          transactionId: ethereumResult.transactionId || "",
          blockNumber: ethereumResult.blockNumber || 0,
          networkName: ethereumResult.networkName || "Polygon",
          registeredAt: ethereumResult.registrationTime || new Date(),
          verified: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }
    }

    // Generate certificate data
    const certificateData = {
      // Work information
      work: {
        id: work.id,
        title: work.title,
        description: work.description,
        type: work.type,
        category: work.category,
        metadataHash: work.metadataHash,
        thumbnailUrl: work.thumbnailUrl,
        keywords: work.keywords,
        aiTrainingOptOut: work.aiTrainingOptOut,
        detectionEnabled: work.detectionEnabled,
        registrationStatus: work.registrationStatus,
        visibility: work.visibility,
        createdAt: work.createdAt.toISOString(),
      },

      // Owner information
      owner: {
        id: work.owner.id,
        name: work.owner.name,
        username: work.owner.username,
        creatorType: work.owner.creatorType,
      },

      // Blockchain information
      blockchain: blockchainData
        ? {
            transactionId: blockchainData.transactionId,
            blockNumber: blockchainData.blockNumber,
            networkName: blockchainData.networkName,
            registeredAt: blockchainData.registeredAt.toISOString(),
            verified: blockchainData.verified,
            explorerUrl: getExplorerUrl(
              blockchainData.networkName.toLowerCase(),
              blockchainData.transactionId
            )
          }
        : null,

      // Certificate metadata
      certificate: {
        issueDate: new Date().toISOString(),
        issuer: "SyntheticRights Platform",
        verificationUrl: `https://syntheticrights.com/verify/${work.id}`,
        signatureHash: `sig_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`
      }
    };

    return NextResponse.json(certificateData);
  } catch (error) {
    console.error("Error generating certificate:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * API route for retrieving a certificate by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Certificate ID is required" },
        { status: 400 }
      );
    }

    // Find the certificate
    const certificate = await prisma.certificate.findUnique({
      where: { id },
      include: {
        creativeWork: {
          select: {
            id: true,
            title: true,
            type: true,
            thumbnailUrl: true,
            metadataHash: true,
            registrationStatus: true,
            blockchain: true,
            visibility: true
          }
        },
        owner: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            isPublic: true
          }
        }
      }
    });

    if (!certificate) {
      return NextResponse.json(
        { success: false, error: "Certificate not found" },
        { status: 404 }
      );
    }

    // Check if certificate is revoked
    if (certificate.isRevoked) {
      return NextResponse.json(
        {
          success: false,
          error: "This certificate has been revoked",
          revokedAt: certificate.updatedAt
        },
        { status: 410 } // Gone
      );
    }

    // Check if certificate has expired
    if (certificate.expiresAt && new Date(certificate.expiresAt) < new Date()) {
      return NextResponse.json(
        {
          success: false,
          error: "This certificate has expired",
          expiredAt: certificate.expiresAt,
        },
        { status: 410 } // Gone
      );
    }

    // Parse the metadata JSON
    let metadataJson = {};
    try {
      metadataJson = JSON.parse(certificate.metadataJson);
    } catch (err) {
      console.error("Error parsing certificate metadata:", err);
    }

    // Prepare response based on visibility settings
    // For public works, we return complete information
    if (certificate.creativeWork.visibility === "PUBLIC") {
      return NextResponse.json({
        success: true,
        certificate: {
          id: certificate.id,
          workId: certificate.workId,
          ownerId: certificate.ownerId,
          certificateType: certificate.certificateType,
          publicUrl: certificate.publicUrl,
          createdAt: certificate.createdAt,
          expiresAt: certificate.expiresAt,
          owner: certificate.owner,
          work: certificate.creativeWork,
          metadata: metadataJson,
          signature: certificate.signature
        }
      });
    }

    // For non-public works, return limited information
    return NextResponse.json({
      success: true,
      certificate: {
        id: certificate.id,
        certificateType: certificate.certificateType,
        publicUrl: certificate.publicUrl,
        createdAt: certificate.createdAt,
        expiresAt: certificate.expiresAt,
        owner: {
          name: certificate.owner.name || "Anonymous"
        },
        work: {
          title: certificate.creativeWork.title,
          type: certificate.creativeWork.type,
          registrationStatus: certificate.creativeWork.registrationStatus
        },
        metadata: {
          version: (metadataJson as any).version,
          registeredAt: (metadataJson as any).registeredAt,
          certificateId: (metadataJson as any).certificateId,
          metadataHash: (metadataJson as any).metadataHash,
          transactionId: (metadataJson as any).transactionId,
          blockNumber: (metadataJson as any).blockNumber,
          networkName: (metadataJson as any).networkName,
          issuedAt: (metadataJson as any).issuedAt
        },
        signature: certificate.signature
      }
    });
  } catch (error) {
    console.error("Error retrieving certificate:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve certificate" },
      { status: 500 }
    );
  }
}
