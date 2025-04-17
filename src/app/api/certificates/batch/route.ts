import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-utils";
import { generateCertificate } from "@/lib/utils/certificate-generator";
import { registerOnBlockchain } from "@/lib/blockchain-utils";

interface BatchWorkResult {
  workId: string;
  success: boolean;
  error?: string;
  certificateId?: string;
}

/**
 * API endpoint for batch certificate generation
 * Generates certificates for multiple creative works at once
 */
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
    const { workIds, certificateType = "standard", registerOnBlockchain: shouldRegisterOnBlockchain = false } = body;

    if (!workIds || !Array.isArray(workIds) || workIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one work ID is required" },
        { status: 400 }
      );
    }

    // Get domain from request
    const host = request.headers.get("host") || "syntheticrights.com";
    const protocol = host.includes("localhost") ? "http" : "https";
    const domainUrl = `${protocol}://${host}`;

    // Fetch all works in one query
    const works = await prisma.creativeWork.findMany({
      where: {
        id: { in: workIds },
        ownerId: user.id // Ensure user only processes their own works
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            username: true,
          }
        },
        blockchain: true,
        certificates: true
      }
    });

    // Check if any works were not found or already have certificates
    const notFoundIds = workIds.filter(id => !works.find(w => w.id === id));
    const alreadyCertifiedIds = works
      .filter(work => work.certificates.length > 0)
      .map(work => work.id);

    if (notFoundIds.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Some works were not found or you don't have permission to access them",
          notFoundIds
        },
        { status: 404 }
      );
    }

    // Process each work and generate certificates
    const results: BatchWorkResult[] = [];

    for (const work of works) {
      try {
        // Skip works that already have certificates
        if (work.certificates.length > 0) {
          results.push({
            workId: work.id,
            success: false,
            error: "Work already has a certificate"
          });
          continue;
        }

        // Register on blockchain if requested and not already registered
        let blockchainResult = null;
        if (shouldRegisterOnBlockchain && !work.blockchain) {
          if (!work.metadataHash || work.metadataHash.startsWith('mh-')) {
            // Register on blockchain
            blockchainResult = await registerOnBlockchain(
              work.id,
              work.metadataHash || `0x${Date.now().toString(16)}`,
              work.ownerId
            );

            if (!blockchainResult.success) {
              results.push({
                workId: work.id,
                success: false,
                error: `Failed to register on blockchain: ${blockchainResult.error || "Unknown error"}`
              });
              continue;
            }
          }
        }

        // Refetch the work if blockchain registration was performed
        const finalWork = blockchainResult
          ? await prisma.creativeWork.findUnique({
              where: { id: work.id },
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
            })
          : work;

        if (!finalWork) {
          results.push({
            workId: work.id,
            success: false,
            error: "Work not found after blockchain registration"
          });
          continue;
        }

        // Generate certificate
        const certificate = await generateCertificate(
          finalWork,
          certificateType as any,
          domainUrl
        );

        // Store certificate in database
        const dbCertificate = await prisma.certificate.create({
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

        // Add to results
        results.push({
          workId: work.id,
          success: true,
          certificateId: dbCertificate.id
        });

        // Create a notification about the new certificate
        await prisma.notification.create({
          data: {
            userId: user.id,
            type: "RIGHTS_REGISTERED",
            title: "Certificate Generated",
            message: `Certificate for "${work.title}" has been generated successfully.`,
            metadata: {
              certificateId: dbCertificate.id,
              workId: work.id,
              certificateType
            }
          }
        });

      } catch (error) {
        console.error(`Error generating certificate for work ${work.id}:`, error);
        results.push({
          workId: work.id,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }

    // Return the results
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: successCount > 0,
      stats: {
        total: workIds.length,
        successful: successCount,
        failed: failureCount,
        alreadyCertified: alreadyCertifiedIds.length
      },
      results
    });
  } catch (error) {
    console.error("Error in batch certificate generation:", error);
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
