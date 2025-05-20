import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ContentScanningService } from "@/lib/scanning/ContentScanningService";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { targetUrl, scanType, fingerprintTypes, similarityThreshold } = body;

    // Validate required fields
    if (!targetUrl || !scanType || !fingerprintTypes || !similarityThreshold) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate similarity threshold
    if (similarityThreshold < 0 || similarityThreshold > 1) {
      return NextResponse.json(
        { error: "Similarity threshold must be between 0 and 1" },
        { status: 400 }
      );
    }

    const scanningService = ContentScanningService.getInstance();
    const scan = await scanningService.initiateScan(session.user.id, {
      targetUrl,
      scanType,
      fingerprintTypes,
      similarityThreshold,
    });

    return NextResponse.json(scan);
  } catch (error) {
    console.error("Scanning error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 