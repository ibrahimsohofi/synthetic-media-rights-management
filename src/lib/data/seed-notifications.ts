import { prisma } from "@/lib/prisma";
import { NotificationType } from "@prisma/client";

/**
 * Seeds test notifications for a user
 * Run this function manually for testing
 */
export async function seedNotifications(userId: string) {
  // Delete existing notifications for this user first
  await prisma.notification.deleteMany({
    where: { userId }
  });

  // Sample notifications data
  const notifications = [
    {
      userId,
      type: NotificationType.VIOLATION_DETECTED,
      title: "Potential violation detected",
      message: "Your character design appears to have been used in an advertisement without proper licensing.",
      linkUrl: "/dashboard/detection",
      isRead: false,
      metadata: {
        workId: "work-123",
        workTitle: "Character Design - Futuristic Explorer",
        sourceUrl: "https://example.com/ad",
        matchConfidence: 0.87
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 15) // 15 minutes ago
    },
    {
      userId,
      type: NotificationType.LICENSE_CREATED,
      title: "New license agreement created",
      message: "A new license agreement has been created for your digital art collection.",
      linkUrl: "/dashboard/licensing",
      isRead: false,
      metadata: {
        licenseId: "license-456",
        licenseType: "COMMERCIAL",
        licensee: "CreativeAgency Ltd",
        workId: "work-456"
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3) // 3 hours ago
    },
    {
      userId,
      type: NotificationType.MARKETPLACE_INTEREST,
      title: "Interest in your marketplace listing",
      message: "Someone has expressed interest in licensing your music track. Check your messages for details.",
      linkUrl: "/dashboard/marketplace",
      isRead: true,
      metadata: {
        listingId: "listing-789",
        workId: "work-789",
        workTitle: "Ambient Soundscape - Serenity",
        interestedParty: "FilmProductions Inc"
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
    },
    {
      userId,
      type: NotificationType.RIGHTS_REGISTERED,
      title: "Work successfully registered",
      message: "Your collection of 3D models has been successfully registered in the rights registry.",
      linkUrl: "/dashboard/rights-registry",
      isRead: true,
      metadata: {
        workId: "work-101112",
        workTitle: "Architectural Elements 3D Collection",
        registrationId: "reg-101112"
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) // 3 days ago
    },
    {
      userId,
      type: NotificationType.LICENSE_EXPIRED,
      title: "License agreement expiring soon",
      message: "Your licensing agreement with DigitalMedia Corp is set to expire in 7 days. Consider renewal options.",
      linkUrl: "/dashboard/licensing",
      isRead: false,
      metadata: {
        licenseId: "license-131415",
        licenseType: "EXCLUSIVE",
        licensee: "DigitalMedia Corp",
        workId: "work-131415",
        expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) // 7 days from now
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5) // 5 days ago
    },
    {
      userId,
      type: NotificationType.SYSTEM,
      title: "Platform update announcement",
      message: "We've added new AI detection capabilities to better protect your synthetic media rights.",
      linkUrl: "/dashboard/settings",
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) // 7 days ago
    }
  ];

  // Insert all notifications
  await prisma.notification.createMany({
    data: notifications
  });

  console.log(`Seeded ${notifications.length} notifications for user ${userId}`);
  return { success: true, count: notifications.length };
}
