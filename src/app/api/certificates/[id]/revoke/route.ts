import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-utils";

/**
 * API endpoint for revoking a certificate
 * This will mark the certificate as revoked and record the reason
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const id = params.id;
    const body = await request.json();
    const { reason } = body;

    if (!reason || reason.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Reason for revocation is required" },
        { status: 400 }
      );
    }

    // Find the certificate and ensure user is the owner
    const certificate = await prisma.certificate.findUnique({
      where: { id },
      include: {
        creativeWork: {
          select: {
            ownerId: true,
            title: true
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

    // Check if the user is the owner of the creative work or the certificate
    const isOwner = certificate.ownerId === user.id || certificate.creativeWork.ownerId === user.id;

    if (!isOwner) {
      return NextResponse.json(
        { success: false, error: "You are not authorized to revoke this certificate" },
        { status: 403 }
      );
    }

    // If certificate is already revoked
    if (certificate.isRevoked) {
      return NextResponse.json(
        { success: false, error: "Certificate is already revoked" },
        { status: 400 }
      );
    }

    // Revoke the certificate
    const updatedCertificate = await prisma.certificate.update({
      where: { id },
      data: {
        isRevoked: true,
        // Store revocation reason in metadata
        metadataJson: JSON.stringify({
          ...JSON.parse(certificate.metadataJson || "{}"),
          revocation: {
            revokedAt: new Date().toISOString(),
            revokedBy: user.id,
            reason
          }
        })
      }
    });

    // Create a notification about certificate revocation
    await prisma.notification.create({
      data: {
        userId: certificate.ownerId,
        type: "SYSTEM",
        title: "Certificate Revoked",
        message: `Your certificate for "${certificate.creativeWork.title}" has been revoked.`,
        metadata: {
          certificateId: certificate.id,
          workId: certificate.workId,
          reason
        }
      }
    });

    return NextResponse.json({
      success: true,
      certificate: {
        id: updatedCertificate.id,
        isRevoked: updatedCertificate.isRevoked,
        revokedAt: new Date(),
      }
    });
  } catch (error) {
    console.error("Error revoking certificate:", error);
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
