import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { DetectionResult } from "@prisma/client";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const scan = await prisma.detectionScan.findUnique({
      where: {
        id: params.id,
      },
      include: {
        results: {
          include: {
            creativeWork: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });

    if (!scan) {
      return NextResponse.json(
        { error: "Scan not found" },
        { status: 404 }
      );
    }

    if (scan.initiatedById !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      id: scan.id,
      status: scan.status,
      progress: scan.progress,
      resultsCount: scan.results.length,
      results: scan.results.map((result: DetectionResult & {
        creativeWork: { title: string }
      }) => ({
        id: result.id,
        creativeWorkTitle: result.creativeWork.title,
        confidence: result.confidence,
        matchType: result.matchType,
        sourceUrl: result.sourceUrl,
      })),
    });
  } catch (error) {
    console.error("Error fetching scan status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 