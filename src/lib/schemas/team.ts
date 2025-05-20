import { z } from "zod";

// Schema for team creation validation
export const createTeamSchema = z.object({
  name: z.string().min(2, "Team name must be at least 2 characters"),
  description: z.string().optional(),
  isPublic: z.coerce.boolean().default(false),
  generateInviteCode: z.coerce.boolean().default(true),
  defaultPermissions: z.string().default("canView"),
  avatarUrl: z.string().optional(),
}); 