import { z } from "zod";

// Schema for marketplace listing validation
export const createListingSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().positive("Price must be greater than 0"),
  licenseType: z.enum(["COMMERCIAL", "EXCLUSIVE", "LIMITED", "PERSONAL", "EDUCATIONAL"]),
  duration: z.coerce.number().int().nonnegative(),
  creativeWorkId: z.string().uuid("Invalid work ID"),
  featured: z.coerce.boolean().default(false),
  permissions: z.string().default(""),
  restrictions: z.string().default(""),
}); 