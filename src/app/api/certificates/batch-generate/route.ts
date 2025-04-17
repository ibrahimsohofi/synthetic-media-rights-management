import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-utils";
import { generateBatchCertificates } from "@/lib/utils/batch-certificate-generator";
import { WatermarkOptions } from "@/components/ui/downloadable-certificate-pdf";

/**
 * API endpoint to generate multiple certificates for a batch of works
 * Returns a ZIP file containing all certificates
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
    const {
      workIds,
      certificateType = "standard",
      includeBlockchain = false,
      watermarkOptions
    } = body;

    if (!workIds || !Array.isArray(workIds) || workIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one work ID is required" },
        { status: 400 }
      );
    }

    // Limit the number of certificates that can be generated at once
    if (workIds.length > 50) {
      return NextResponse.json(
        { success: false, error: "Cannot generate more than 50 certificates at once" },
        { status: 400 }
      );
    }

    // Get the current domain from request for generating public URLs
    const host = request.headers.get("host") || "syntheticrights.com";
    const protocol = host.includes("localhost") ? "http" : "https";
    const domainUrl = `${protocol}://${host}`;

    // Generate certificates in batch
    const result = await generateBatchCertificates({
      userId: user.id,
      workIds,
      certificateType,
      includeBlockchain,
      domainUrl,
      watermarkOptions
    });

    // If generation failed or no blob was created
    if (!result.success || !result.zipBlob) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to generate certificates",
          progress: result.progress
        },
        { status: 500 }
      );
    }

    // Convert Blob to ArrayBuffer for response
    const arrayBuffer = await result.zipBlob.arrayBuffer();

    // Return the ZIP file
    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="certificates-${new Date().toISOString().slice(0, 10)}.zip"`
      }
    });
  } catch (error) {
    console.error("Error generating batch certificates:", error);
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
