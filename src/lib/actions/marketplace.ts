"use server";

import { getCurrentUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { createNotification } from "./notifications";
import type { LicenseType, ListingStatus } from "@prisma/client";
import { createListingSchema } from "@/lib/schemas/marketplace";

// Type for marketplace listing response
type MarketplaceResponse = {
  success: boolean;
  message: string;
  listingId?: string;
};

/**
 * Create a new marketplace listing
 */
export async function createMarketplaceListing(formData: FormData): Promise<MarketplaceResponse> {
  const user = await getCurrentUser();

  if (!user) {
    return { success: false, message: "Authentication required" };
  }

  try {
    // Extract form data
    const rawData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      price: formData.get("price") as string,
      licenseType: formData.get("licenseType") as LicenseType,
      duration: formData.get("duration") as string,
      creativeWorkId: formData.get("creativeWorkId") as string,
      featured: formData.get("featured") as string,
      permissions: formData.get("permissions") as string || "",
      restrictions: formData.get("restrictions") as string || "",
    };

    // Validate form data
    const validatedFields = createListingSchema.safeParse(rawData);

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

    // Verify the work is registered and not private
    if (work.registrationStatus !== "REGISTERED") {
      return { success: false, message: "Only registered works can be listed in the marketplace" };
    }

    if (work.visibility === "PRIVATE") {
      return { success: false, message: "Private works cannot be listed in the marketplace" };
    }

    // Calculate expiration date if duration is provided (0 means perpetual, no expiration)
    let expiresAt = null;
    if (validatedFields.data.duration > 0) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + validatedFields.data.duration);
    }

    // Create the marketplace listing
    const listing = await prisma.marketplaceListing.create({
      data: {
        title: validatedFields.data.title,
        description: validatedFields.data.description,
        price: validatedFields.data.price,
        licenseType: validatedFields.data.licenseType,
        duration: validatedFields.data.duration,
        creativeWorkId: validatedFields.data.creativeWorkId,
        sellerId: user.id,
        featured: validatedFields.data.featured,
        status: "ACTIVE" as ListingStatus,
        expiresAt,
      },
    });

    return {
      success: true,
      message: "Marketplace listing created successfully",
      listingId: listing.id,
    };
  } catch (error) {
    console.error("Listing creation error:", error);
    return { success: false, message: "Failed to create marketplace listing" };
  }
}

/**
 * Get all marketplace listings with optional filtering
 */
export async function getMarketplaceListings(options?: {
  category?: string;
  licenseType?: LicenseType;
  priceMin?: number;
  priceMax?: number;
  featured?: boolean;
  limit?: number;
  sellerId?: string;
}) {
  try {
    const filters: any = {};

    // Apply optional filters
    if (options) {
      if (options.category) {
        filters.creativeWork = {
          category: options.category,
        };
      }

      if (options.licenseType) {
        filters.licenseType = options.licenseType;
      }

      if (options.priceMin !== undefined || options.priceMax !== undefined) {
        filters.price = {};
        if (options.priceMin !== undefined) filters.price.gte = options.priceMin;
        if (options.priceMax !== undefined) filters.price.lte = options.priceMax;
      }

      if (options.featured !== undefined) {
        filters.featured = options.featured;
      }

      if (options.sellerId) {
        filters.sellerId = options.sellerId;
      }
    }

    // Default to only active listings
    filters.status = "ACTIVE";

    const listings = await prisma.marketplaceListing.findMany({
      where: filters,
      include: {
        creativeWork: {
          select: {
            id: true,
            title: true,
            type: true,
            category: true,
            thumbnailUrl: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' }
      ],
      take: options?.limit || undefined,
    });

    return { success: true, listings };
  } catch (error) {
    console.error("Error fetching marketplace listings:", error);
    return { success: false, message: "Failed to fetch marketplace listings", listings: [] };
  }
}

/**
 * Get a single marketplace listing by ID
 */
export async function getMarketplaceListing(id: string) {
  try {
    const listing = await prisma.marketplaceListing.findUnique({
      where: { id },
      include: {
        creativeWork: {
          select: {
            id: true,
            title: true,
            type: true,
            category: true,
            thumbnailUrl: true,
            description: true,
            fileUrls: true,
            aiTrainingOptOut: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    if (!listing) {
      return { success: false, message: "Listing not found" };
    }

    return { success: true, listing };
  } catch (error) {
    console.error("Error fetching marketplace listing:", error);
    return { success: false, message: "Failed to fetch marketplace listing" };
  }
}

/**
 * Express interest in a marketplace listing
 */
export async function expressInterest(listingId: string, message: string) {
  const user = await getCurrentUser();

  if (!user) {
    return { success: false, message: "Authentication required" };
  }

  try {
    const listing = await prisma.marketplaceListing.findUnique({
      where: { id: listingId },
      include: {
        seller: true,
        creativeWork: {
          select: {
            title: true,
          },
        },
      },
    });

    if (!listing) {
      return { success: false, message: "Listing not found" };
    }

    // Don't allow expressing interest in your own listings
    if (listing.sellerId === user.id) {
      return { success: false, message: "You cannot express interest in your own listing" };
    }

    // Create a notification for the seller
    await createNotification({
      userId: listing.sellerId,
      type: "MARKETPLACE_INTEREST",
      title: "Interest in Your Listing",
      message: `${user.name || user.username || "Someone"} is interested in your listing "${listing.title}" for ${listing.creativeWork.title}`,
      linkUrl: `/dashboard/marketplace/listings/${listingId}/inquiries`,
      metadata: {
        listingId,
        interestedUserId: user.id,
        interestedUserName: user.name || user.username,
        message,
        creativeWorkTitle: listing.creativeWork.title,
      },
    });

    return { success: true, message: "Interest expressed successfully. The seller has been notified." };
  } catch (error) {
    console.error("Error expressing interest:", error);
    return { success: false, message: "Failed to express interest in this listing" };
  }
}

/**
 * Complete a marketplace transaction (purchase/license)
 */
export async function completeTransaction(listingId: string, paymentDetails: any) {
  const user = await getCurrentUser();

  if (!user) {
    return { success: false, message: "Authentication required" };
  }

  try {
    const listing = await prisma.marketplaceListing.findUnique({
      where: { id: listingId },
      include: {
        creativeWork: true,
        seller: true,
      },
    });

    if (!listing) {
      return { success: false, message: "Listing not found" };
    }

    if (listing.status !== "ACTIVE") {
      return { success: false, message: "This listing is no longer active" };
    }

    // Don't allow purchasing your own listings
    if (listing.sellerId === user.id) {
      return { success: false, message: "You cannot purchase your own listing" };
    }

    // In a real app, process payment here
    // For this demo, we'll just simulate it
    const paymentId = `pmt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Create transaction record
    const transaction = await prisma.transaction.create({
      data: {
        type: "PURCHASE",
        amount: listing.price,
        currency: "USD",
        status: "COMPLETED",
        paymentMethod: paymentDetails.method || "CREDIT_CARD",
        paymentId,
        description: `Purchase of license for "${listing.title}"`,
        userId: user.id,
        completedAt: new Date(),
      },
    });

    // Create a license based on the marketplace listing
    const license = await prisma.license.create({
      data: {
        title: `License for ${listing.title}`,
        type: listing.licenseType,
        status: "ACTIVE",
        terms: {
          price: listing.price,
          duration: listing.duration,
          purchaseDate: new Date().toISOString(),
          transactionId: transaction.id,
        },
        startDate: new Date(),
        endDate: listing.expiresAt,
        price: listing.price,
        permissions: paymentDetails.permissions || "",
        restrictions: paymentDetails.restrictions || "",
        creativeWorkId: listing.creativeWorkId,
        ownerId: listing.sellerId,
        licenseeId: user.id,
      },
    });

    // Update listing status to SOLD
    await prisma.marketplaceListing.update({
      where: { id: listingId },
      data: { status: "SOLD" },
    });

    // Create notifications for both parties
    await Promise.all([
      // Notify seller
      createNotification({
        userId: listing.sellerId,
        type: "LICENSE_CREATED",
        title: "Your Listing Was Purchased",
        message: `${user.name || user.username || "Someone"} purchased a license for "${listing.title}"`,
        linkUrl: `/dashboard/licensing/${license.id}`,
        metadata: { licenseId: license.id, transactionId: transaction.id },
      }),

      // Notify buyer
      createNotification({
        userId: user.id,
        type: "LICENSE_CREATED",
        title: "License Purchase Successful",
        message: `You've successfully purchased a license for "${listing.title}" by ${listing.seller.name || listing.seller.username}`,
        linkUrl: `/dashboard/licensing/${license.id}`,
        metadata: { licenseId: license.id, transactionId: transaction.id },
      }),
    ]);

    return {
      success: true,
      message: "Transaction completed successfully",
      licenseId: license.id,
      transactionId: transaction.id,
    };
  } catch (error) {
    console.error("Transaction error:", error);
    return { success: false, message: "Failed to complete transaction" };
  }
}
