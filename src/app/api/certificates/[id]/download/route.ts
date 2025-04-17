import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { exportCertificate, generateCertificate } from "@/lib/utils/certificate-generator";
import { generateCertificatePdf } from "@/components/ui/downloadable-certificate-pdf";
import { checkApiPermission } from "@/lib/api-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = params;

    // Check session and permissions
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Get format from query parameter (pdf or json)
    const format = request.nextUrl.searchParams.get("format") || "pdf";

    // Fetch the certificate record
    const certificate = await prisma.certificate.findUnique({
      where: { id },
      include: {
        creativeWork: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            blockchain: true,
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!certificate) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }

    // Check if user has permission to access this certificate
    const hasPermission = await checkApiPermission(
      session.user.id,
      certificate.ownerId,
      certificate.creativeWork.ownerId
    );

    if (!hasPermission) {
      return NextResponse.json({ error: "You don't have permission to access this certificate" }, { status: 403 });
    }

    // Create certificate metadata
    const metadataJson = certificate.metadataJson;

    if (format === "json") {
      // Convert metadata to JSON and return it
      return new NextResponse(metadataJson, {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="certificate-${certificate.id}.json"`,
        },
      });
    } else if (format === "pdf") {
      // Parse the metadata to generate the certificate data
      const metadata = JSON.parse(metadataJson);

      // Prepare the certificate data structure expected by the PDF generator
      const certificateData = {
        workId: certificate.workId,
        workTitle: certificate.creativeWork.title,
        ownerName: certificate.owner.name || "Unknown",
        registeredAt: certificate.createdAt,
        metadataHash: metadata.metadataHash || "",
        certificateId: certificate.id,
        signature: certificate.signature,
        transactionId: metadata.transactionId,
        blockNumber: metadata.blockNumber,
        networkName: metadata.networkName,
        certificateType: certificate.certificateType,
        expiresAt: metadata.expiresAt,
        thumbnailUrl: certificate.creativeWork.thumbnailUrl || undefined,
      };

      // Generate PDF
      const watermarkOptions = {
        enabled: true,
        text: "SYNTHETIC RIGHTS CERTIFICATE",
        opacity: 0.15,
        angle: -45,
        color: "#6366f1", // Indigo color
        fontSize: 24
      };

      // Generate the PDF
      const pdfBlob = await generateCertificatePdf(certificateData, watermarkOptions);

      // Convert the PDF blob to an array buffer
      const arrayBuffer = await pdfBlob.arrayBuffer();

      // Return the PDF
      return new NextResponse(arrayBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="certificate-${certificate.id}.pdf"`,
        },
      });
    } else if (format === "html") {
      // Generate HTML representation
      const signedCertificate = {
        metadata: JSON.parse(metadataJson),
        signature: certificate.signature,
        certificateVersion: "1.0.0",
        publicUrl: certificate.publicUrl,
      };

      const htmlContent = exportCertificate(signedCertificate, "html");

      return new NextResponse(htmlContent, {
        headers: {
          "Content-Type": "text/html",
          "Content-Disposition": `attachment; filename="certificate-${certificate.id}.html"`,
        },
      });
    } else {
      return NextResponse.json(
        { error: "Invalid format. Supported formats: pdf, json, html" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error downloading certificate:", error);
    return NextResponse.json(
      { error: "Failed to download certificate" },
      { status: 500 }
    );
  }
}
