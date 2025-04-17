import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyOnBlockchain, fuzzyVerifyOnBlockchain } from "@/lib/blockchain-utils";

/**
 * API route for verifying a creative work by its metadata hash
 * This endpoint is publicly accessible for verification purposes
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { hash: string } }
) {
  const hash = params.hash;

  if (!hash) {
    return NextResponse.json(
      {
        verified: false,
        message: "No hash provided for verification"
      },
      { status: 400 }
    );
  }

  try {
    // Look up the work by its metadata hash
    const work = await prisma.creativeWork.findFirst({
      where: { metadataHash: hash },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            username: true,
            email: false // Explicitly exclude email for privacy
          }
        },
        blockchain: true,
        license: true,
        certificates: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!work) {
      return NextResponse.json(
        {
          verified: false,
          message: "Content could not be verified. Hash not found in our registry."
        },
        { status: 404 }
      );
    }

    // Get the latest certificate if available
    const certificate = work.certificates[0] || null;

    // If certificate exists, parse its JSON metadata
    let certificateData = null;
    if (certificate) {
      try {
        certificateData = JSON.parse(certificate.metadataJson);
      } catch (e) {
        console.error("Error parsing certificate metadata", e);
      }
    }

    // Determine verification status
    // In a real system, this would include additional checks like expiration, etc.
    const verified = true; // For demo purposes, we consider the work verified if found

    // Log this verification for analytics
    // This could be stored in a verification_attempts table
    // (not implemented in this example)

    // Return the verification result with work details
    // but exclude sensitive information
    return NextResponse.json({
      verified,
      work: {
        id: work.id,
        title: work.title,
        description: work.description,
        type: work.type,
        category: work.category,
        createdAt: work.createdAt,
        registrationStatus: work.registrationStatus,
        visibility: work.visibility,
        aiTrainingOptOut: work.aiTrainingOptOut,
        detectionEnabled: work.detectionEnabled,
        thumbnailUrl: work.thumbnailUrl,
        fileUrls: work.fileUrls,
        ownerName: work.owner?.name || "Anonymous",
        license: work.license ? {
          type: work.license.licenseType,
          status: work.license.status,
          terms: work.license.terms,
          active: work.license.status === "ACTIVE"
        } : null
      },
      blockchain: work.blockchain ? {
        transactionId: work.blockchain.transactionId,
        blockNumber: work.blockchain.blockNumber,
        networkName: work.blockchain.networkName,
        timestamp: work.blockchain.timestamp
      } : null,
      certificate: certificate ? {
        certificateId: certificate.id,
        issuedAt: certificate.createdAt,
        expiresAt: certificate.expiresAt,
        certificateType: certificate.certificateType,
        registrationType: certificateData?.registrationType || "standard",
        transactionId: work.blockchain?.transactionId,
        blockNumber: work.blockchain?.blockNumber,
        networkName: work.blockchain?.networkName,
        registeredAt: certificateData?.registeredAt || work.createdAt,
        metadataHash: hash,
        ownerName: work.owner?.name || "Anonymous",
        signature: certificate.signature
      } : null
    });
  } catch (error) {
    console.error("Error verifying content:", error);
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

// For fuzzy verification with content
export async function POST(
  request: NextRequest,
  { params }: { params: { hash: string } }
) {
  try {
    const { hash } = params;
    const body = await request.json();

    // Need content to perform fuzzy verification
    if (!body.content && !body.metadata) {
      return NextResponse.json(
        { success: false, error: "Content or metadata required for fuzzy verification" },
        { status: 400 }
      );
    }

    // Perform fuzzy verification using content characteristics
    const fuzzyVerification = await fuzzyVerifyOnBlockchain(body.metadata || {});

    return NextResponse.json({
      success: true,
      verified: fuzzyVerification.verified,
      matchPercentage: fuzzyVerification.matchPercentage,
      registeredAt: fuzzyVerification.registrationTime,
      blockchainInfo: fuzzyVerification.verified ? {
        transactionId: fuzzyVerification.transactionId,
        networkName: "Polygon", // Default for demo
      } : undefined,
    });
  } catch (error) {
    console.error("Error in fuzzy verification API:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
