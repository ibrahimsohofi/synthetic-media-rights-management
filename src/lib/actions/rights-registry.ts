"use server";

import { getCurrentUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import type { WorkType } from "@prisma/client";
import { createWorkSchema } from "@/lib/schemas/rights-registry";

// Type for work registration response
type RegisterWorkResponse = {
  success: boolean;
  message: string;
  workId?: string;
};

/**
 * Register a new creative work
 */
export async function registerCreativeWork(formData: FormData): Promise<RegisterWorkResponse> {
  const user = await getCurrentUser();

  if (!user) {
    return { success: false, message: "Authentication required" };
  }

  try {
    // Extract form data
    const rawData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      type: formData.get("type") as WorkType,
      category: formData.get("category") as string,
      // For SQLite compatibility we store as comma-separated string
      fileUrls: formData.get("fileUrls") ? (formData.get("fileUrls") as string) : "",
      thumbnailUrl: formData.get("thumbnailUrl") as string || undefined,
      aiTrainingOptOut: formData.get("aiTrainingOptOut") === "true",
      detectionEnabled: formData.get("detectionEnabled") === "true",
      // For SQLite compatibility we store as comma-separated string
      keywords: formData.get("keywords") ? (formData.get("keywords") as string) : "",
      visibility: formData.get("visibility") as "PRIVATE" | "PUBLIC" | "LIMITED" || "PRIVATE",
    };

    // Validate form data
    const validatedFields = createWorkSchema.safeParse(rawData);

    if (!validatedFields.success) {
      const errors = validatedFields.error.flatten().fieldErrors;
      const errorMessage = Object.values(errors).flat()[0] || "Invalid form data";
      return { success: false, message: errorMessage };
    }

    // Generate a metadata hash for blockchain registration
    // This would normally involve a call to a blockchain service
    const metadataHash = `mh-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;

    // Extract style fingerprint (would involve AI analysis in a real implementation)
    const styleFingerprint = {
      colors: ["#7e22ce", "#3b82f6"],
      textures: ["smooth", "gradients"],
      patterns: ["abstract"],
      styleScore: 0.87
    };

    // Create the creative work in the database
    const newWork = await prisma.creativeWork.create({
      data: {
        ...validatedFields.data,
        ownerId: user.id,
        metadataHash,
        styleFingerprint,
        registrationStatus: "PENDING", // Will be updated to REGISTERED after blockchain confirmation
      },
    });

    // In a real application, here we would call a service to register the work on a blockchain
    // For now, we'll simulate a successful registration by updating the status after a delay
    setTimeout(async () => {
      await prisma.creativeWork.update({
        where: { id: newWork.id },
        data: { registrationStatus: "REGISTERED" },
      });
    }, 5000);

    return {
      success: true,
      message: "Creative work registered successfully",
      workId: newWork.id,
    };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, message: "Failed to register creative work" };
  }
}

/**
 * Get all creative works for a user
 */
export async function getUserCreativeWorks() {
  const user = await getCurrentUser();

  if (!user) {
    return { success: false, message: "Authentication required", works: [] };
  }

  try {
    const works = await prisma.creativeWork.findMany({
      where: { ownerId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, works };
  } catch (error) {
    console.error("Error fetching works:", error);
    return { success: false, message: "Failed to fetch creative works", works: [] };
  }
}

/**
 * Get a single creative work by ID
 */
export async function getCreativeWork(id: string) {
  const user = await getCurrentUser();

  if (!user) {
    return { success: false, message: "Authentication required" };
  }

  try {
    const work = await prisma.creativeWork.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    });

    if (!work) {
      return { success: false, message: "Work not found" };
    }

    // Check if the user is the owner
    const isOwner = work.ownerId === user.id;

    // If work is private and user is not the owner, deny access
    if (work.visibility === "PRIVATE" && !isOwner) {
      return { success: false, message: "You do not have permission to view this work" };
    }

    return { success: true, work, isOwner };
  } catch (error) {
    console.error("Error fetching work:", error);
    return { success: false, message: "Failed to fetch creative work" };
  }
}
