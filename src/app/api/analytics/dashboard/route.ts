import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfDay, subDays } from "date-fns";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get total scans
    const totalScans = await prisma.detectionScan.count({
      where: {
        initiatedById: session.user.id,
      },
    });

    // Get violations data
    const violations = await prisma.violation.findMany({
      where: {
        reportedById: session.user.id,
      },
      select: {
        status: true,
      },
    });

    const violationsByStatus = violations.reduce((acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get active protections (works being monitored)
    const activeProtections = await prisma.creativeWork.count({
      where: {
        ownerId: session.user.id,
        detectionEnabled: true,
      },
    });

    // Get recent activity (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = startOfDay(subDays(new Date(), i));
      return date;
    }).reverse();

    const recentScans = await prisma.detectionScan.findMany({
      where: {
        initiatedById: session.user.id,
        startedAt: {
          gte: last7Days[0],
        },
      },
      select: {
        startedAt: true,
      },
    });

    const recentViolations = await prisma.violation.findMany({
      where: {
        reportedById: session.user.id,
        detectedAt: {
          gte: last7Days[0],
        },
      },
      select: {
        detectedAt: true,
      },
    });

    // Get scan types distribution
    const scansByType = await prisma.detectionScan.groupBy({
      by: ['scanType'],
      where: {
        initiatedById: session.user.id,
      },
      _count: {
        scanType: true,
      },
    });

    // Format the response
    const response = {
      totalScans,
      violationsDetected: violations.length,
      resolvedViolations: violationsByStatus.RESOLVED || 0,
      activeProtections,
      scansByType: scansByType.map(type => ({
        name: type.scanType,
        count: type._count.scanType,
      })),
      violationsByStatus: Object.entries(violationsByStatus).map(([name, value]) => ({
        name,
        value,
      })),
      recentActivity: last7Days.map(date => {
        const dayScans = recentScans.filter(scan => 
          startOfDay(scan.startedAt).getTime() === date.getTime()
        ).length;
        
        const dayViolations = recentViolations.filter(violation =>
          startOfDay(violation.detectedAt).getTime() === date.getTime()
        ).length;

        return {
          date: date.toISOString().split('T')[0],
          scans: dayScans,
          violations: dayViolations,
        };
      }),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 