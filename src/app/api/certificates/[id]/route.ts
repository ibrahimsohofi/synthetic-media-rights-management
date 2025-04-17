import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyOnEthereum, getExplorerUrl } from "@/lib/ethereum-utils";
import { getCurrentUser } from "@/lib/auth-utils";

/**
 * API route for retrieving detailed certificate data
 * This handles both fetching by ID and generating certificate data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the certificate ID from the path
    const id = params.id;

    // Check if this is a download request
    const { searchParams } = new URL(request.url);
    const downloadFormat = searchParams.get("format");

    // If this is a download request, route to the download handler
    if (downloadFormat) {
      return handleCertificateDownload(request, id, downloadFormat);
    }

    // Otherwise, get certificate details
    return await handleCertificateDetails(request, id);
  } catch (error) {
    console.error("Error in certificate API:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Handler for certificate download
 */
async function handleCertificateDownload(request: NextRequest, id: string, format: string) {
  try {
    // Authenticate the user
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Fetch the certificate from the database
    const certificate = await prisma.certificate.findUnique({
      where: { id },
      include: {
        creativeWork: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                username: true
              }
            },
            blockchain: true
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

    // Check if the user is the owner
    if (certificate.ownerId !== user.id) {
      return NextResponse.json(
        { success: false, error: "You are not authorized to download this certificate" },
        { status: 403 }
      );
    }

    // Parse the certificate metadata
    let metadataJson: Record<string, unknown> = {};
    try {
      metadataJson = JSON.parse(certificate.metadataJson);
    } catch (error) {
      console.error("Error parsing certificate metadata:", error);
      return NextResponse.json(
        { success: false, error: "Invalid certificate metadata" },
        { status: 500 }
      );
    }

    // Generate certificate data
    const signedCertificate = {
      metadata: metadataJson,
      signature: certificate.signature,
      certificateVersion: metadataJson.version || "1.0.0",
      publicUrl: certificate.publicUrl
    };

    // For PDF/Image formats, we'd normally use a PDF generation library
    // For this demo, we'll return a JSON representation with certificate data
    // that the frontend can use to render a downloadable version

    if (format === "json") {
      return NextResponse.json({
        success: true,
        certificate: signedCertificate,
        work: {
          title: certificate.creativeWork.title,
          type: certificate.creativeWork.type,
          description: certificate.creativeWork.description,
          thumbnailUrl: certificate.creativeWork.thumbnailUrl,
          ownerName: certificate.creativeWork.owner?.name || "Unknown"
        }
      });
    }

    // For PDF/Image download, normally we'd generate the actual file here
    // For the demo, we'll just export a simplified HTML format that could be
    // converted to PDF/image on the client or by a microservice
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Certificate of Authenticity - ${certificate.creativeWork.title}</title>
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
                <div class="label">Title</div>
                <div class="value">${certificate.creativeWork.title}</div>
              </div>
              <div class="field">
                <div class="label">Creator</div>
                <div class="value">${certificate.creativeWork.owner?.name || "Unknown"}</div>
              </div>
              <div class="field">
                <div class="label">Certificate ID</div>
                <div class="value">${certificate.id}</div>
              </div>
              <div class="field">
                <div class="label">Date Issued</div>
                <div class="value">${new Date(certificate.createdAt).toLocaleDateString()}</div>
              </div>
              <div class="field">
                <div class="label">Certificate Type</div>
                <div class="value">${certificate.certificateType}</div>
              </div>
            </div>
            <div class="signature">
              <div class="qr-placeholder">[QR Code]</div>
              <p class="verification">Verify this certificate at: ${certificate.publicUrl}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return new NextResponse(htmlContent, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `attachment; filename="certificate-${certificate.id}.html"`
      }
    });
  } catch (error) {
    console.error("Error generating downloadable certificate:", error);
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

/**
 * Handler for retrieving certificate details
 */
async function handleCertificateDetails(request: NextRequest, id: string) {
  try {
    // Authenticate the user
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Fetch the certificate from the database
    const certificate = await prisma.certificate.findUnique({
      where: { id },
      include: {
        creativeWork: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                username: true
              }
            },
            blockchain: true
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

    // Check if the user is the owner or has access
    if (certificate.ownerId !== user.id) {
      return NextResponse.json(
        { success: false, error: "You are not authorized to view this certificate" },
        { status: 403 }
      );
    }

    // Parse the certificate metadata
    let metadataJson: Record<string, unknown> = {};
    try {
      metadataJson = JSON.parse(certificate.metadataJson);
    } catch (error) {
      console.error("Error parsing certificate metadata:", error);
      return NextResponse.json(
        { success: false, error: "Invalid certificate metadata" },
        { status: 500 }
      );
    }

    // Return certificate data
    return NextResponse.json({
      success: true,
      certificate: {
        id: certificate.id,
        certificateType: certificate.certificateType,
        isRevoked: certificate.isRevoked,
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
          owner: certificate.creativeWork.owner,
          metadataHash: certificate.creativeWork.metadataHash
        },
        metadata: {
          version: metadataJson.version,
          registeredAt: metadataJson.registeredAt,
          certificateId: metadataJson.certificateId,
          metadataHash: metadataJson.metadataHash,
          transactionId: metadataJson.transactionId,
          blockNumber: metadataJson.blockNumber,
          networkName: metadataJson.networkName,
          issuedAt: metadataJson.issuedAt
        },
        signature: certificate.signature
      }
    });
  } catch (error) {
    console.error("Error retrieving certificate:", error);
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
