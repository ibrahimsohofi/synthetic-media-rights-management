import { z } from "zod";

// Schema for notification creation
export const createNotificationSchema = z.object({
  userId: z.string(),
  type: z.enum([
    "VIOLATION_DETECTED",
    "LICENSE_CREATED",
    "LICENSE_EXPIRED",
    "MARKETPLACE_INTEREST",
    "RIGHTS_REGISTERED",
    "SYSTEM"
  ]),
  title: z.string(),
  message: z.string(),
  linkUrl: z.string().optional(),
  metadata: z.record(z.any()).optional(),
}); 