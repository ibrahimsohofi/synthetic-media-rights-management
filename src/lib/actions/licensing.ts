// Update the license functions to use comma-separated strings instead of arrays for SQLite compatibility
"use server";

import { getCurrentUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import type { LicenseType } from "@prisma/client";
import { createLicenseSchema } from "@/lib/schemas/licensing";

// Schema for license creation validation
export const createLicenseSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  type: z.enum(["COMMERCIAL", "EXCLUSIVE", "LIMITED", "PERSONAL", "EDUCATIONAL"]),
  startDate: z.string().transform(val => new Date(val)),
  endDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  price: z.number().optional(),
  royaltyPercentage: z.number().optional(),
  permissions: z.string(), // Comma-separated permissions for SQLite
  restrictions: z.string(), // Comma-separated restrictions for SQLite
  contractUrl: z.string().optional(),
  creativeWorkId: z.string(),
  licenseeId: z.string().optional(),
});

// Type for license response
type LicenseResponse = {
  success: boolean;
  message: string;
  licenseId?: string;
};

/**
 * Create a new license
 */
export async function createLicense(formData: FormData): Promise<LicenseResponse> {
  const user = await getCurrentUser();

  if (!user) {
    return { success: false, message: "Authentication required" };
  }

  try {
    // Extract form data
    const rawData = {
      title: formData.get("title") as string,
      type: formData.get("type") as LicenseType,
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string || undefined,
      price: formData.get("price") ? Number.parseFloat(formData.get("price") as string) : undefined,
      royaltyPercentage: formData.get("royaltyPercentage") ? Number.parseFloat(formData.get("royaltyPercentage") as string) : undefined,
      permissions: formData.get("permissions") as string, // Already comma-separated
      restrictions: formData.get("restrictions") as string, // Already comma-separated
      contractUrl: formData.get("contractUrl") as string || undefined,
      creativeWorkId: formData.get("creativeWorkId") as string,
      licenseeId: formData.get("licenseeId") as string || undefined,
    };

    // Validate form data
    const validatedFields = createLicenseSchema.safeParse(rawData);

    if (!validatedFields.success) {
      const errors = validatedFields.error.flatten().fieldErrors;
      const errorMessage = Object.values(errors).flat()[0] || "Invalid form data";
      return { success: false, message: errorMessage };
    }

    // Verify the work belongs to the user
    const work = await prisma.creativeWork.findFirst({
      where: {
        id: validatedFields.data.creativeWorkId,
        ownerId: user.id,
      },
    });

    if (!work) {
      return { success: false, message: "Creative work not found or you don't have permission" };
    }

    // Format the license terms
    const licenseTerms = {
      startDate: validatedFields.data.startDate,
      endDate: validatedFields.data.endDate,
      price: validatedFields.data.price,
      royaltyPercentage: validatedFields.data.royaltyPercentage,
      permissions: validatedFields.data.permissions, // Comma-separated string
      restrictions: validatedFields.data.restrictions, // Comma-separated string
    };

    // Create the license
    const license = await prisma.license.create({
      data: {
        title: validatedFields.data.title,
        type: validatedFields.data.type,
        terms: licenseTerms,
        status: "ACTIVE",
        startDate: validatedFields.data.startDate,
        endDate: validatedFields.data.endDate,
        price: validatedFields.data.price,
        royaltyPercentage: validatedFields.data.royaltyPercentage,
        permissions: validatedFields.data.permissions, // Comma-separated string
        restrictions: validatedFields.data.restrictions, // Comma-separated string
        contractUrl: validatedFields.data.contractUrl,
        creativeWorkId: validatedFields.data.creativeWorkId,
        ownerId: user.id,
        licenseeId: validatedFields.data.licenseeId,
      },
    });

    return {
      success: true,
      message: "License created successfully",
      licenseId: license.id,
    };
  } catch (error) {
    console.error("License creation error:", error);
    return { success: false, message: "Failed to create license" };
  }
}

/**
 * Get all licenses for the current user
 */
export async function getUserLicenses() {
  const user = await getCurrentUser();

  if (!user) {
    return { success: false, message: "Authentication required", licenses: [] };
  }

  try {
    const licenses = await prisma.license.findMany({
      where: {
        OR: [
          { ownerId: user.id },
          { licenseeId: user.id }
        ]
      },
      include: {
        creativeWork: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        licensee: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, licenses };
  } catch (error) {
    console.error("Error fetching licenses:", error);
    return { success: false, message: "Failed to fetch licenses", licenses: [] };
  }
}

/**
 * Get a license by ID
 */
export async function getLicense(id: string) {
  const user = await getCurrentUser();

  if (!user) {
    return { success: false, message: "Authentication required" };
  }

  try {
    const license = await prisma.license.findUnique({
      where: { id },
      include: {
        creativeWork: {
          select: {
            id: true,
            title: true,
            type: true,
            category: true,
            ownerId: true,
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        licensee: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    });

    if (!license) {
      return { success: false, message: "License not found" };
    }

    // Check if the user is the owner or licensee
    const isOwner = license.ownerId === user.id;
    const isLicensee = license.licenseeId === user.id;

    if (!isOwner && !isLicensee) {
      return { success: false, message: "You do not have permission to view this license" };
    }

    return { success: true, license, isOwner, isLicensee };
  } catch (error) {
    console.error("Error fetching license:", error);
    return { success: false, message: "Failed to fetch license" };
  }
}
