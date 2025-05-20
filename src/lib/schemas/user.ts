import { z } from "zod";

// Schema for profile update validation
export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  username: z.string().min(3, "Username must be at least 3 characters")
    .regex(/^[a-z0-9_-]+$/, "Username can only contain lowercase letters, numbers, underscores, and hyphens")
    .optional(),
  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),
  portfolioUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  creatorType: z.string().optional(),
  isPublic: z.boolean().optional(),
});

// Schema for password update validation
export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Please confirm your new password"),
}).refine(async (data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
}); 