import { z } from "zod";

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