import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-utils";

/**
 * API route for listing certificates
 * This can be filtered by workId or other parameters
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate the user
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const workId = searchParams.get("workId");
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Build query based on parameters
    const query: any = {
      where: {
        ownerId: user.id,
        ...(workId ? { workId } : {})
      },
      orderBy: {
        createdAt: "desc" as const
      },
      take: limit,
      skip,
      include: {
        creativeWork: {
          select: {
            id: true,
            title: true,
            type: true,
            metadataHash: true,
            thumbnailUrl: true
          }
        }
      }
    };

    // Get total count of certificates for pagination
    const totalCount = await prisma.certificate.count({
      where: query.where
    });

    // Fetch certificates
    const certificates = await prisma.certificate.findMany(query);

    // Transform the results for the response
    const formattedCertificates = certificates.map(cert => ({
      id: cert.id,
      workId: cert.workId,
      creativeWork: {
        id: cert.creativeWork.id,
        title: cert.creativeWork.title,
        type: cert.creativeWork.type,
        metadataHash: cert.creativeWork.metadataHash,
        thumbnailUrl: cert.creativeWork.thumbnailUrl
      },
      certificateType: cert.certificateType,
      isRevoked: cert.isRevoked,
      createdAt: cert.createdAt,
      expiresAt: cert.expiresAt,
      publicUrl: cert.publicUrl
    }));

    return NextResponse.json({
      success: true,
      certificates: formattedCertificates,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error("Error listing certificates:", error);
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
