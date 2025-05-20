import { z } from "zod";

// Schema for creative work registration validation
export const createWorkSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
  type: z.enum(["IMAGE", "VIDEO", "AUDIO", "TEXT"]),
  category: z.string().min(1, "Category is required"),
  fileUrls: z.string().min(1, "At least one file is required"), // Updated to string
  thumbnailUrl: z.string().optional(),
  aiTrainingOptOut: z.boolean().default(true),
  detectionEnabled: z.boolean().default(true),
  keywords: z.string().optional().default(""), // Updated to string
  visibility: z.enum(["PRIVATE", "PUBLIC", "LIMITED"]).default("PRIVATE"),
}); 