"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-utils";
import { hash, compare } from "bcrypt";
import { updateProfileSchema, updatePasswordSchema } from "@/lib/schemas/user";

// Schema for notification preferences validation
export const updateNotificationPreferencesSchema = z.object({
  emailNotifications: z.object({
    marketplaceActivity: z.boolean().optional(),
    rightsViolations: z.boolean().optional(),
    productUpdates: z.boolean().optional(),
    marketing: z.boolean().optional(),
  }).optional(),
  appNotifications: z.object({
    marketplaceActivity: z.boolean().optional(),
    rightsViolations: z.boolean().optional(),
    productUpdates: z.boolean().optional(),
    messages: z.boolean().optional(),
  }).optional(),
});

/**
 * Update user profile
 */
export async function updateUserProfile(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    return { success: false, message: "Authentication required" };
  }

  try {
    // Extract form data
    const data = {
      name: formData.get("name") as string,
      username: formData.get("username") as string,
      bio: formData.get("bio") as string,
      portfolioUrl: formData.get("portfolioUrl") as string,
      creatorType: formData.get("creatorType") as string,
      isPublic: formData.get("isPublic") === "true",
    };

    // Validate form data
    const validatedFields = updateProfileSchema.safeParse(data);

    if (!validatedFields.success) {
      const errors = validatedFields.error.flatten().fieldErrors;
      const errorMessage = Object.values(errors).flat()[0] || "Invalid form data";
      return { success: false, message: errorMessage };
    }

    // Check if username is changed and if it's unique
    if (data.username && data.username !== user.username) {
      const existingUser = await prisma.user.findUnique({
        where: { username: data.username },
      });

      if (existingUser) {
        return { success: false, message: "Username is already taken" };
      }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: validatedFields.data,
    });

    return { success: true, message: "Profile updated successfully" };
  } catch (error) {
    console.error("Profile update error:", error);
    return { success: false, message: "Failed to update profile" };
  }
}

/**
 * Update user password
 */
export async function updateUserPassword(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    return { success: false, message: "Authentication required" };
  }

  try {
    // Extract form data
    const data = {
      currentPassword: formData.get("currentPassword") as string,
      newPassword: formData.get("newPassword") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    };

    // Validate form data
    const validatedFields = updatePasswordSchema.safeParse(data);

    if (!validatedFields.success) {
      const errors = validatedFields.error.flatten().fieldErrors;
      const errorMessage = Object.values(errors).flat()[0] || "Invalid form data";
      return { success: false, message: errorMessage };
    }

    // Get the user's current password hash
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { passwordHash: true },
    });

    if (!dbUser) {
      return { success: false, message: "User not found" };
    }

    // Verify current password
    const isPasswordValid = await compare(data.currentPassword, dbUser.passwordHash);

    if (!isPasswordValid) {
      return { success: false, message: "Current password is incorrect" };
    }

    // Hash new password
    const passwordHash = await hash(data.newPassword, 10);

    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return { success: true, message: "Password updated successfully" };
  } catch (error) {
    console.error("Password update error:", error);
    return { success: false, message: "Failed to update password" };
  }
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    return { success: false, message: "Authentication required" };
  }

  try {
    // Extract form data
    const emailMarketplace = formData.get("emailMarketplace") === "true";
    const emailViolations = formData.get("emailViolations") === "true";
    const emailUpdates = formData.get("emailUpdates") === "true";
    const emailMarketing = formData.get("emailMarketing") === "true";

    const appMarketplace = formData.get("appMarketplace") === "true";
    const appViolations = formData.get("appViolations") === "true";
    const appUpdates = formData.get("appUpdates") === "true";
    const appMessages = formData.get("appMessages") === "true";

    // Create notification preferences object
    const notificationPreferences = {
      emailNotifications: {
        marketplaceActivity: emailMarketplace,
        rightsViolations: emailViolations,
        productUpdates: emailUpdates,
        marketing: emailMarketing,
      },
      appNotifications: {
        marketplaceActivity: appMarketplace,
        rightsViolations: appViolations,
        productUpdates: appUpdates,
        messages: appMessages,
      },
    };

    // Validate notification preferences
    const validatedFields = updateNotificationPreferencesSchema.safeParse(notificationPreferences);

    if (!validatedFields.success) {
      const errors = validatedFields.error.flatten().fieldErrors;
      const errorMessage = Object.values(errors).flat()[0] || "Invalid notification preferences";
      return { success: false, message: errorMessage };
    }

    // Update user notification preferences
    await prisma.user.update({
      where: { id: user.id },
      data: { notificationPreferences: notificationPreferences },
    });

    return { success: true, message: "Notification preferences updated successfully" };
  } catch (error) {
    console.error("Notification preferences update error:", error);
    return { success: false, message: "Failed to update notification preferences" };
  }
}

/**
 * Get user profile
 */
export async function getUserProfile() {
  const user = await getCurrentUser();

  if (!user) {
    return { success: false, message: "Authentication required" };
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        bio: true,
        avatar: true,
        creatorType: true,
        portfolioUrl: true,
        isPublic: true,
        notificationPreferences: true,
      },
    });

    if (!dbUser) {
      return { success: false, message: "User not found" };
    }

    return { success: true, user: dbUser };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return { success: false, message: "Failed to fetch user profile" };
  }
}
