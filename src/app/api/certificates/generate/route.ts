import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-utils";
import { generateCertificate } from "@/lib/utils/certificate-generator";
import { registerOnBlockchain } from "@/lib/blockchain-utils";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { workId, certificateType = "standard" } = body;

    if (!workId) {
      return NextResponse.json(
        { success: false, error: "Work ID is required" },
        { status: 400 }
      );
    }

    // Get the work with owner and blockchain details
    const work = await prisma.creativeWork.findUnique({
      where: { id: workId },
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
      return NextResponse.json(
        { success: false, error: "Work not found" },
        { status: 404 }
      );
    }

    // Check if user is the owner
    if (work.ownerId !== user.id) {
      return NextResponse.json(
        { success: false, error: "You are not authorized to generate a certificate for this work" },
        { status: 403 }
      );
    }

    // If blockchain registration was requested but not yet done, register now
    let blockchainResult = null;
    if (body.registerOnBlockchain && !work.blockchain) {
      // Generate metadata hash if not already present
      // In a real system, this would be a more sophisticated process
      if (!work.metadataHash || work.metadataHash.startsWith('mh-')) {
        // Get the current domain from request
        const host = request.headers.get("host") || "syntheticrights.com";
        const protocol = host.includes("localhost") ? "http" : "https";
        const domainUrl = `${protocol}://${host}`;

        // Register on blockchain
        blockchainResult = await registerOnBlockchain(
          work.id,
          work.metadataHash || `0x${Date.now().toString(16)}`,
          work.ownerId
        );

        if (!blockchainResult.success) {
          return NextResponse.json(
            {
              success: false,
              error: "Failed to register on blockchain",
              details: blockchainResult.error
            },
            { status: 500 }
          );
        }
      }
    }

    // Get the current domain from request for generating public URLs
    const host = request.headers.get("host") || "syntheticrights.com";
    const protocol = host.includes("localhost") ? "http" : "https";
    const domainUrl = `${protocol}://${host}`;

    // Refetch the work if blockchain registration was performed
    const finalWork = blockchainResult ?
      await prisma.creativeWork.findUnique({
        where: { id: workId },
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
      }) :
      work;

    // Generate certificate
    const certificate = await generateCertificate(
      finalWork,
      certificateType as any,
      domainUrl
    );

    // Store certificate in database
    await prisma.certificate.create({
      data: {
        id: certificate.metadata.certificateId,
        workId: work.id,
        certificateType,
        ownerId: user.id,
        metadataJson: JSON.stringify(certificate.metadata),
        signature: certificate.signature,
        publicUrl: certificate.publicUrl,
        expiresAt: certificate.metadata.expiresAt,
      }
    });

    return NextResponse.json({
      success: true,
      certificate
    });
  } catch (error) {
    console.error("Error generating certificate:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
