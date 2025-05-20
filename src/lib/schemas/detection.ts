import { z } from "zod";

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