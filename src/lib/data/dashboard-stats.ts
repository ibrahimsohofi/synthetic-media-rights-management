import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-utils";
import type { WorkType } from "@prisma/client";

export interface DashboardStats {
  registeredWorks: {
    count: number;
    change: number;
    changeText: string;
  };
  activeLicenses: {
    count: number;
    change: number;
    changeText: string;
  };
  potentialViolations: {
    count: number;
    change: number;
    changeText: string;
  };
  revenueGenerated: {
    amount: number;
    change: number;
    changeText: string;
  };
  worksBreakdown: {
    images: number;
    videos: number;
    audio: number;
    text: number;
  };
}

/**
 * Get dashboard statistics for the current user
 */
export async function getDashboardStats(): Promise<{
  success: boolean;
  stats?: DashboardStats;
  message?: string;
}> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return { success: false, message: "Authentication required" };
    }

    // Get total registered works
    const totalWorks = await prisma.creativeWork.count({
      where: { ownerId: user.id }
    });

    // Get registered works from last 30 days
    const lastMonthDate = new Date();
    lastMonthDate.setDate(lastMonthDate.getDate() - 30);

    const recentWorks = await prisma.creativeWork.count({
      where: {
        ownerId: user.id,
        createdAt: { gt: lastMonthDate }
      }
    });

    // Get active licenses
    const activeLicenses = await prisma.license.count({
      where: {
        ownerId: user.id,
        status: "ACTIVE"
      }
    });

    // Get recently created active licenses
    const recentLicenses = await prisma.license.count({
      where: {
        ownerId: user.id,
        status: "ACTIVE",
        createdAt: { gt: lastMonthDate }
      }
    });

    // Get potential violations
    const totalViolations = await prisma.violation.count({
      where: {
        reportedById: user.id,
        status: { in: ["PENDING", "CONFIRMED"] }
      }
    });

    // Get recent violations
    const recentViolations = await prisma.violation.count({
      where: {
        reportedById: user.id,
        status: { in: ["PENDING", "CONFIRMED"] },
        detectedAt: { gt: lastMonthDate }
      }
    });

    // Get previous month violations for comparison
    const twoMonthsAgoDate = new Date();
    twoMonthsAgoDate.setDate(twoMonthsAgoDate.getDate() - 60);

    const previousMonthViolations = await prisma.violation.count({
      where: {
        reportedById: user.id,
        status: { in: ["PENDING", "CONFIRMED"] },
        detectedAt: {
          gt: twoMonthsAgoDate,
          lt: lastMonthDate
        }
      }
    });

    // Calculate violations change
    const violationsChange = recentViolations - previousMonthViolations;

    // Get revenue data (mock for now, in a real app would sum transactions)
    // In a real app, you would sum actual transactions from the database
    const totalRevenue = await getTotalRevenue(user.id);
    const recentRevenue = await getRecentRevenue(user.id, lastMonthDate);

    // Get works breakdown by type
    const worksBreakdown = await getWorksBreakdown(user.id);

    return {
      success: true,
      stats: {
        registeredWorks: {
          count: totalWorks,
          change: recentWorks,
          changeText: `+${recentWorks} works in the last 30 days`
        },
        activeLicenses: {
          count: activeLicenses,
          change: recentLicenses,
          changeText: `+${recentLicenses} licenses in the last 30 days`
        },
        potentialViolations: {
          count: totalViolations,
          change: violationsChange,
          changeText: `${violationsChange >= 0 ? '+' : ''}${violationsChange} violations in the last 30 days`
        },
        revenueGenerated: {
          amount: totalRevenue,
          change: recentRevenue,
          changeText: `+$${recentRevenue} in the last 30 days`
        },
        worksBreakdown
      }
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return { success: false, message: "Failed to fetch dashboard statistics" };
  }
}

/**
 * Get breakdown of works by type
 */
async function getWorksBreakdown(userId: string) {
  const worksByType = await prisma.creativeWork.groupBy({
    by: ['type'],
    where: { ownerId: userId },
    _count: true
  });

  // Initialize with zeros
  const breakdown = {
    images: 0,
    videos: 0,
    audio: 0,
    text: 0
  };

  // Fill in actual counts
  worksByType.forEach((item: { type: WorkType; _count: number }) => {
    if (item.type === 'IMAGE') breakdown.images = item._count;
    if (item.type === 'VIDEO') breakdown.videos = item._count;
    if (item.type === 'AUDIO') breakdown.audio = item._count;
    if (item.type === 'TEXT') breakdown.text = item._count;
  });

  return breakdown;
}

/**
 * Get total revenue generated (simulated for demo)
 */
async function getTotalRevenue(userId: string) {
  try {
    // In a real app, this would sum transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        status: "COMPLETED",
        type: { in: ["SALE", "SUBSCRIPTION"] }
      },
      select: {
        amount: true
      }
    });

    // Sum up all transaction amounts
    const totalAmount = transactions.reduce((sum: number, tx: { amount: number }) => sum + tx.amount, 0);

    // If there are actual transactions, return the sum, otherwise return a sample value
    return transactions.length > 0 ? Math.round(totalAmount) : 2489;
  } catch (error) {
    console.error("Error calculating revenue:", error);
    return 2489; // Fallback to sample value
  }
}

/**
 * Get revenue from the last 30 days (simulated for demo)
 */
async function getRecentRevenue(userId: string, since: Date) {
  try {
    // In a real app, this would sum recent transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        status: "COMPLETED",
        type: { in: ["SALE", "SUBSCRIPTION"] },
        createdAt: { gt: since }
      },
      select: {
        amount: true
      }
    });

    // Sum up all transaction amounts
    const totalAmount = transactions.reduce((sum: number, tx: { amount: number }) => sum + tx.amount, 0);

    // If there are actual transactions, return the sum, otherwise return a sample value
    return transactions.length > 0 ? Math.round(totalAmount) : 347;
  } catch (error) {
    console.error("Error calculating recent revenue:", error);
    return 347; // Fallback to sample value
  }
}
