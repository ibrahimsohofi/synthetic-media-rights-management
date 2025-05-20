"use server";

import { getCurrentUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import type { NotificationType } from "@prisma/client";
import { redirect } from "next/navigation";
import { createNotificationSchema } from "@/lib/schemas/notifications";

// Type for notification response
type NotificationResponse = {
  success: boolean;
  message: string;
  notification?: any;
};

// Type for notifications response
type NotificationsResponse = {
  success: boolean;
  message?: string;
  notifications: any[];
};

/**
 * Create a new notification
 */
export async function createNotification(data: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  linkUrl?: string;
  metadata?: Record<string, any>;
}): Promise<NotificationResponse> {
  try {
    // Validate notification data
    const validatedFields = createNotificationSchema.safeParse(data);

    if (!validatedFields.success) {
      const errors = validatedFields.error.flatten().fieldErrors;
      const errorMessage = Object.values(errors).flat()[0] || "Invalid notification data";
      return { success: false, message: errorMessage };
    }

    // Create the notification
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        linkUrl: data.linkUrl,
        metadata: data.metadata || {},
        isRead: false,
        // Set expiration to 30 days from now
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      success: true,
      message: "Notification created successfully",
      notification,
    };
  } catch (error) {
    console.error("Error creating notification:", error);
    return { success: false, message: "Failed to create notification" };
  }
}

/**
 * Create a violation notification for a user
 */
export async function createViolationNotification(
  userId: string,
  violationId: string,
  workTitle: string,
  platform: string,
  confidence: number
): Promise<NotificationResponse> {
  try {
    const title = "Potential Violation Detected";
    const message = `Your work "${workTitle}" may have been used without permission on ${platform}. Confidence: ${Math.round(confidence * 100)}%`;
    const linkUrl = `/dashboard/detection/violations/${violationId}`;

    return await createNotification({
      userId,
      type: "VIOLATION_DETECTED",
      title,
      message,
      linkUrl,
      metadata: {
        violationId,
        workTitle,
        platform,
        confidence
      }
    });
  } catch (error) {
    console.error("Error creating violation notification:", error);
    return { success: false, message: "Failed to create violation notification" };
  }
}

/**
 * Get all notifications for the current user
 */
export async function getUserNotifications({
  userId,
  page = 1,
  limit = 10,
  unreadOnly = false
}: {
  userId: string;
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}): Promise<NotificationsResponse> {
  try {
    const skip = (page - 1) * limit;

    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly ? { isRead: false } : {}),
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    return { success: true, notifications };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return { success: false, message: "Failed to fetch notifications", notifications: [] };
  }
}

/**
 * Get unread notification count for the current user
 */
export async function getUnreadNotificationCount() {
  const user = await getCurrentUser();

  if (!user) {
    return { success: false, message: "Authentication required", count: 0 };
  }

  try {
    const count = await prisma.notification.count({
      where: {
        userId: user.id,
        isRead: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    return { success: true, count };
  } catch (error) {
    console.error("Error counting notifications:", error);
    return { success: false, message: "Failed to count notifications", count: 0 };
  }
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  const user = await getCurrentUser();

  if (!user) {
    return { success: false, message: "Authentication required" };
  }

  try {
    // Verify the notification belongs to the user
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId: user.id,
      },
    });

    if (!notification) {
      return { success: false, message: "Notification not found or you don't have permission" };
    }

    // Update the notification
    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return {
      success: true,
      message: "Notification marked as read",
      notification: updatedNotification,
    };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { success: false, message: "Failed to mark notification as read" };
  }
}

/**
 * Mark all notifications as read for the current user
 */
export async function markAllNotificationsAsRead() {
  const user = await getCurrentUser();

  if (!user) {
    return { success: false, message: "Authentication required" };
  }

  try {
    await prisma.notification.updateMany({
      where: {
        userId: user.id,
        isRead: false,
      },
      data: { isRead: true },
    });

    return { success: true, message: "All notifications marked as read" };
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return { success: false, message: "Failed to mark all notifications as read" };
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string) {
  const user = await getCurrentUser();

  if (!user) {
    return { success: false, message: "Authentication required" };
  }

  try {
    // Verify the notification belongs to the user
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId: user.id,
      },
    });

    if (!notification) {
      return { success: false, message: "Notification not found or you don't have permission" };
    }

    // Delete the notification
    await prisma.notification.delete({
      where: { id: notificationId },
    });

    return { success: true, message: "Notification deleted successfully" };
  } catch (error) {
    console.error("Error deleting notification:", error);
    return { success: false, message: "Failed to delete notification" };
  }
}
