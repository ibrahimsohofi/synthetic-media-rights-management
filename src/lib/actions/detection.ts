"use server";

import { z } from "zod";
import { getCurrentUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { createViolationNotification } from "./notifications";

// Schema for detection scan validation
export const scanSchema = z.object({
  scanType: z.enum(["url", "file", "text"]),
  scanTarget: z.string().optional(),
  scanScope: z.enum(["social", "marketplace", "entire"]),
  selectedWorks: z.array(z.string()).min(1, "At least one work must be selected"),
  notifyOnMatch: z.boolean().default(true),
  takedownEnabled: z.boolean().default(false),
  licenseOfferEnabled: z.boolean().default(false),
});

// Type for scan parameters
type ScanParams = {
  scanType: "url" | "file" | "text";
  scanTarget?: string;
  scanScope: "social" | "marketplace" | "entire";
  selectedWorks: string[];
  notifyOnMatch: boolean;
  takedownEnabled: boolean;
  licenseOfferEnabled: boolean;
};

// Type for scan results
type ScanResult = {
  success: boolean;
  message: string;
  results?: {
    total: number;
    matches: Array<{
      workId: string;
      workTitle: string;
      sourceUrl: string;
      platform: string;
      confidence: number;
      timestamp: string;
    }>;
  };
};

/**
 * Start a detection scan for unauthorized use of registered works
 */
export async function startDetectionScan(formData: FormData): Promise<ScanResult> {
  const user = await getCurrentUser();

  if (!user) {
    return { success: false, message: "Authentication required" };
  }

  try {
    // Extract form data
    const rawData = {
      scanType: formData.get("scanType") as "url" | "file" | "text",
      scanTarget: formData.get("scanTarget") as string | undefined,
      scanScope: formData.get("scanScope") as "social" | "marketplace" | "entire",
      selectedWorks: formData.getAll("selectedWorks") as string[],
      notifyOnMatch: formData.get("notifyOnMatch") === "true",
      takedownEnabled: formData.get("takedownEnabled") === "true",
      licenseOfferEnabled: formData.get("licenseOfferEnabled") === "true",
    };

    // Validate input parameters
    const validatedFields = scanSchema.safeParse(rawData);

    if (!validatedFields.success) {
      const errors = validatedFields.error.flatten().fieldErrors;
      const errorMessage = Object.values(errors).flat()[0] || "Invalid scan parameters";
      return { success: false, message: errorMessage };
    }

    // Verify the works belong to the current user
    const works = await prisma.creativeWork.findMany({
      where: {
        id: { in: rawData.selectedWorks },
        ownerId: user.id,
      },
      select: {
        id: true,
        title: true,
        type: true,
        category: true,
        metadataHash: true,
      },
    });

    if (works.length === 0) {
      return { success: false, message: "No valid works found for scanning" };
    }

    // Simulate detection results
    // In a real implementation, this would call external detection services
    const mockResults = {
      total: Math.floor(Math.random() * 8) + 1, // 1-8 matches
      matches: generateMockMatches(works),
    };

    // Create violation records and notifications for each detected match
    for (const match of mockResults.matches) {
      // Create a violation record
      const violation = await prisma.violation.create({
        data: {
          sourceUrl: match.sourceUrl,
          detectionMethod: `automated-${rawData.scanType}-scan`,
          matchConfidence: match.confidence / 100, // Convert to decimal
          description: `Potential unauthorized use of your work detected during ${rawData.scanScope} scan using ${rawData.scanType} method.`,
          creativeWorkId: match.workId,
          reportedById: user.id,
          evidenceUrls: match.sourceUrl, // For SQLite compatibility - store as string
          status: "PENDING",
        },
      });

      // Create a notification for the violation if enabled
      if (rawData.notifyOnMatch) {
        await createViolationNotification(
          user.id,
          violation.id,
          match.workTitle,
          match.platform,
          match.confidence / 100
        );
      }
    }

    return {
      success: true,
      message: "Scan initiated successfully",
      results: mockResults,
    };
  } catch (error) {
    console.error("Detection scan error:", error);
    return { success: false, message: "Failed to start detection scan" };
  }
}

/**
 * Generate mock detection matches for testing
 */
function generateMockMatches(works: any[]) {
  const platforms = [
    "Instagram",
    "Pinterest",
    "DeviantArt",
    "Behance",
    "Facebook",
    "Twitter",
    "ArtStation",
    "Dribbble",
    "YouTube",
    "TikTok",
  ];

  const matches = [];
  const totalMatches = Math.floor(Math.random() * 8) + 1; // 1-8 matches

  for (let i = 0; i < totalMatches; i++) {
    const randomWork = works[Math.floor(Math.random() * works.length)];
    const randomPlatform = platforms[Math.floor(Math.random() * platforms.length)];
    const confidence = Math.floor(Math.random() * 30) + 70; // 70-99% confidence

    matches.push({
      workId: randomWork.id,
      workTitle: randomWork.title,
      sourceUrl: `https://www.${randomPlatform.toLowerCase()}.com/user${Math.floor(Math.random() * 10000)}/post${Math.floor(Math.random() * 100000)}`,
      platform: randomPlatform,
      confidence,
      timestamp: new Date().toISOString(),
    });
  }

  return matches;
}

/**
 * Get all violations for a user
 */
export async function getUserViolations() {
  const user = await getCurrentUser();

  if (!user) {
    return { success: false, message: "Authentication required", violations: [] };
  }

  try {
    const violations = await prisma.violation.findMany({
      where: {
        reportedById: user.id
      },
      include: {
        creativeWork: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
      },
      orderBy: { detectedAt: "desc" },
    });

    return { success: true, violations };
  } catch (error) {
    console.error("Error fetching violations:", error);
    return { success: false, message: "Failed to fetch violations", violations: [] };
  }
}

/**
 * Report a new violation
 */
export async function reportViolation(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    return { success: false, message: "Authentication required" };
  }

  try {
    const creativeWorkId = formData.get("creativeWorkId") as string;
    const sourceUrl = formData.get("sourceUrl") as string;
    const description = formData.get("description") as string;
    const matchConfidence = Number.parseFloat(formData.get("matchConfidence") as string) || 85;
    const detectionMethod = formData.get("detectionMethod") as string || "manual-report";
    const platform = formData.get("platform") as string || "Unknown platform";

    // Validate the work belongs to the user
    const work = await prisma.creativeWork.findFirst({
      where: {
        id: creativeWorkId,
        ownerId: user.id,
      },
    });

    if (!work) {
      return { success: false, message: "Creative work not found or you don't have permission" };
    }

    // Create the violation record
    const violation = await prisma.violation.create({
      data: {
        sourceUrl,
        description,
        matchConfidence: matchConfidence / 100, // Convert from percentage to decimal
        detectionMethod,
        creativeWorkId,
        reportedById: user.id,
        evidenceUrls: sourceUrl, // For SQLite compatibility - store as string
        status: "PENDING",
      },
    });

    // Create a notification for the violation
    await createViolationNotification(
      user.id,
      violation.id,
      work.title,
      platform,
      matchConfidence / 100
    );

    return {
      success: true,
      message: "Violation reported successfully",
      violation,
    };
  } catch (error) {
    console.error("Error reporting violation:", error);
    return { success: false, message: "Failed to report violation" };
  }
}

/**
 * Get a specific violation by ID
 */
export async function getViolationById(violationId: string) {
  const user = await getCurrentUser();

  if (!user) {
    return { success: false, message: "Authentication required" };
  }

  try {
    const violation = await prisma.violation.findUnique({
      where: { id: violationId },
      include: {
        creativeWork: {
          select: {
            id: true,
            title: true,
            type: true,
            category: true,
            thumbnailUrl: true,
            registrationStatus: true,
          },
        },
      },
    });

    if (!violation) {
      return { success: false, message: "Violation not found" };
    }

    // Check if the user has permission (either they reported it or they own the creative work)
    const isReporter = violation.reportedById === user.id;
    const isWorkOwner = violation.creativeWork.ownerId === user.id;

    if (!isReporter && !isWorkOwner) {
      return { success: false, message: "You don't have permission to view this violation" };
    }

    return { success: true, violation };
  } catch (error) {
    console.error("Error fetching violation:", error);
    return { success: false, message: "Failed to fetch violation details" };
  }
}

/**
 * Update a violation's status
 */
export async function updateViolationStatus(violationId: string, status: string, notes?: string) {
  const user = await getCurrentUser();

  if (!user) {
    return { success: false, message: "Authentication required" };
  }

  try {
    // Verify the violation belongs to the user
    const violation = await prisma.violation.findFirst({
      where: {
        id: violationId,
        reportedById: user.id,
      },
    });

    if (!violation) {
      return { success: false, message: "Violation not found or you don't have permission" };
    }

    // Update status and notes if provided
    const updateData: any = {
      status: status as any, // Cast to any since we're accepting a string but need to match the enum
      resolvedAt: status === "RESOLVED" || status === "DISMISSED" ? new Date() : null,
    };

    // Add resolution notes if provided
    if (notes) {
      updateData.resolutionNotes = notes;
    }

    // Update the violation
    const updatedViolation = await prisma.violation.update({
      where: { id: violationId },
      data: updateData,
    });

    return {
      success: true,
      message: `Violation status updated to ${status}`,
      violation: updatedViolation,
    };
  } catch (error) {
    console.error("Error updating violation status:", error);
    return { success: false, message: "Failed to update violation status" };
  }
}
