import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyOnBlockchain, fuzzyVerifyOnBlockchain } from "@/lib/blockchain-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: { hash: string } }
) {
  try {
    const { hash } = params;

    if (!hash) {
      return NextResponse.json(
        { success: false, error: "No hash provided" },
        { status: 400 }
      );
    }

    // First try an exact match
    const workWithExactHash = await prisma.creativeWork.findFirst({
      where: {
        metadataHash: hash,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            isPublic: true,
          },
        },
        blockchain: true,
      },
    });

    if (workWithExactHash) {
      // If the work is not public, return limited information
      if (!workWithExactHash.owner.isPublic && workWithExactHash.visibility !== "PUBLIC") {
        return NextResponse.json({
          success: true,
          verified: true,
          workId: workWithExactHash.id,
          workTitle: workWithExactHash.title,
          owner: {
            name: workWithExactHash.owner.name || "Anonymous",
          },
          type: workWithExactHash.type,
          registrationStatus: workWithExactHash.registrationStatus,
          registeredAt: workWithExactHash.blockchain?.registeredAt,
          blockchainInfo: {
            transactionId: workWithExactHash.blockchain?.transactionId,
            blockNumber: workWithExactHash.blockchain?.blockNumber,
            networkName: workWithExactHash.blockchain?.networkName,
          },
          metadataHash: workWithExactHash.metadataHash,
          // No file URLs or thumbnail for privacy
        });
      }

      // Return full verification info for public works
      return NextResponse.json({
        success: true,
        verified: true,
        workId: workWithExactHash.id,
        workTitle: workWithExactHash.title,
        description: workWithExactHash.description,
        owner: {
          id: workWithExactHash.owner.id,
          name: workWithExactHash.owner.name,
          username: workWithExactHash.owner.username,
          avatar: workWithExactHash.owner.avatar,
        },
        type: workWithExactHash.type,
        category: workWithExactHash.category,
        thumbnailUrl: workWithExactHash.thumbnailUrl,
        registrationStatus: workWithExactHash.registrationStatus,
        registeredAt: workWithExactHash.blockchain?.registeredAt,
        blockchainInfo: {
          transactionId: workWithExactHash.blockchain?.transactionId,
          blockNumber: workWithExactHash.blockchain?.blockNumber,
          networkName: workWithExactHash.blockchain?.networkName,
          verified: workWithExactHash.blockchain?.verified,
        },
        metadataHash: workWithExactHash.metadataHash,
        createdAt: workWithExactHash.createdAt,
      });
    }

    // If no exact match, try to verify the hash on the blockchain directly
    // This is useful if the hash was registered externally or on a different platform
    const blockchainVerification = await verifyOnBlockchain(hash);

    if (blockchainVerification.verified) {
      return NextResponse.json({
        success: true,
        verified: true,
        workId: "external", // Indicate this is externally registered
        registeredAt: blockchainVerification.registrationTime,
        blockchainInfo: {
          transactionId: blockchainVerification.transactionId,
          networkName: "Polygon", // Default for demo
        },
        metadataHash: hash,
        message: "This content was verified on the blockchain but is not registered in our system."
      });
    }

    // If all verification attempts failed
    return NextResponse.json({
      success: false,
      verified: false,
      error: "No matching registration found for this hash",
    });
  } catch (error) {
    console.error("Error in verification API:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
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
