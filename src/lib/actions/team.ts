"use server";

import { getCurrentUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { createNotification } from "./notifications";
import type { TeamRole, MemberStatus } from "@prisma/client";
import { nanoid } from "nanoid";
import { createTeamSchema } from "@/lib/schemas/team";

// Type for team response
type TeamResponse = {
  success: boolean;
  message: string;
  teamId?: string;
};

/**
 * Create a new team
 */
export async function createTeam(formData: FormData): Promise<TeamResponse> {
  const user = await getCurrentUser();

  if (!user) {
    return { success: false, message: "Authentication required" };
  }

  try {
    // Extract form data
    const rawData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string || "",
      isPublic: formData.get("isPublic") as string,
      generateInviteCode: formData.get("generateInviteCode") as string,
      defaultPermissions: formData.get("defaultPermissions") as string || "canView",
      avatarUrl: formData.get("avatarUrl") as string || undefined,
    };

    // Validate form data
    const validatedFields = createTeamSchema.safeParse(rawData);

    if (!validatedFields.success) {
      const errors = validatedFields.error.flatten().fieldErrors;
      const errorMessage = Object.values(errors).flat()[0] || "Invalid form data";
      return { success: false, message: errorMessage };
    }

    // Generate unique invite code if requested
    const inviteCode = validatedFields.data.generateInviteCode ? nanoid(10) : null;

    // Create team in the database
    const team = await prisma.team.create({
      data: {
        name: validatedFields.data.name,
        description: validatedFields.data.description,
        isPublic: validatedFields.data.isPublic,
        inviteCode,
        avatarUrl: validatedFields.data.avatarUrl,
        ownerId: user.id,
      },
    });

    // Add the creator as a team member with OWNER role
    await prisma.teamMember.create({
      data: {
        teamId: team.id,
        userId: user.id,
        role: "OWNER" as TeamRole,
        permissions: "canView,canEdit,canAdd,canDelete,canInvite", // All permissions
        status: "ACTIVE" as MemberStatus,
      },
    });

    return {
      success: true,
      message: "Team created successfully",
      teamId: team.id,
    };
  } catch (error) {
    console.error("Team creation error:", error);
    return { success: false, message: "Failed to create team" };
  }
}

/**
 * Get all teams for the current user
 */
export async function getUserTeams() {
  const user = await getCurrentUser();

  if (!user) {
    return { success: false, message: "Authentication required", teams: [] };
  }

  try {
    // Find teams where the user is a member or owner
    const teamsAsMember = await prisma.teamMember.findMany({
      where: {
        userId: user.id,
        status: "ACTIVE" as MemberStatus,
      },
      include: {
        team: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
              },
            },
            members: {
              where: {
                status: "ACTIVE" as MemberStatus,
              },
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    // Extract team data and add role information
    const teams = teamsAsMember.map((membership) => ({
      ...membership.team,
      role: membership.role,
      permissions: membership.permissions.split(','),
      memberCount: membership.team.members.length,
    }));

    return { success: true, teams };
  } catch (error) {
    console.error("Error fetching user teams:", error);
    return { success: false, message: "Failed to fetch teams", teams: [] };
  }
}

/**
 * Get a team by ID
 */
export async function getTeam(teamId: string) {
  const user = await getCurrentUser();

  if (!user) {
    return { success: false, message: "Authentication required" };
  }

  try {
    // Check if the user is a member of the team
    const membership = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId: user.id,
        status: "ACTIVE" as MemberStatus,
      },
    });

    // If not a member, check if the team is public
    if (!membership) {
      const team = await prisma.team.findUnique({
        where: { id: teamId },
      });

      if (!team || !team.isPublic) {
        return { success: false, message: "Team not found or you don't have access" };
      }

      // Allow read-only access to public teams
      return {
        success: true,
        team,
        isPublicAccess: true,
        userRole: null,
        userPermissions: [],
      };
    }

    // Get full team details for members
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!team) {
      return { success: false, message: "Team not found" };
    }

    // Parse permissions
    const userPermissions = membership.permissions.split(',');

    return {
      success: true,
      team,
      isPublicAccess: false,
      userRole: membership.role,
      userPermissions,
      isOwner: team.ownerId === user.id,
    };
  } catch (error) {
    console.error("Error fetching team:", error);
    return { success: false, message: "Failed to fetch team" };
  }
}

/**
 * Invite a user to a team
 */
export async function inviteTeamMember(teamId: string, email: string, role: TeamRole) {
  const user = await getCurrentUser();

  if (!user) {
    return { success: false, message: "Authentication required" };
  }

  try {
    // Check if the user has permission to invite members
    const membership = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId: user.id,
        status: "ACTIVE" as MemberStatus,
      },
    });

    if (!membership) {
      return { success: false, message: "You are not a member of this team" };
    }

    // Check if the user has invite permissions
    const permissions = membership.permissions.split(',');
    const isOwnerOrAdmin = membership.role === "OWNER" || membership.role === "ADMIN";

    if (!isOwnerOrAdmin && !permissions.includes("canInvite")) {
      return { success: false, message: "You don't have permission to invite team members" };
    }

    // Get the team
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return { success: false, message: "Team not found" };
    }

    // Find the user to invite by email
    const userToInvite = await prisma.user.findFirst({
      where: { email },
    });

    if (!userToInvite) {
      return { success: false, message: "User not found with the provided email" };
    }

    // Check if the user is already a member
    const existingMembership = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId: userToInvite.id,
      },
    });

    if (existingMembership) {
      if (existingMembership.status === "ACTIVE") {
        return { success: false, message: "User is already a member of this team" };
      } else if (existingMembership.status === "INVITED") {
        return { success: false, message: "User has already been invited to this team" };
      } else {
        // If status is SUSPENDED, update it to INVITED
        await prisma.teamMember.update({
          where: { id: existingMembership.id },
          data: { status: "INVITED" as MemberStatus },
        });
      }
    } else {
      // Create a new membership with INVITED status
      await prisma.teamMember.create({
        data: {
          teamId,
          userId: userToInvite.id,
          role,
          permissions: "canView", // Default permissions for invited members
          status: "INVITED" as MemberStatus,
        },
      });
    }

    // Send a notification to the invited user
    await createNotification({
      userId: userToInvite.id,
      type: "SYSTEM",
      title: "Team Invitation",
      message: `You have been invited to join the team "${team.name}" by ${user.name || user.username || "a user"}`,
      linkUrl: `/dashboard/team/invites`,
      metadata: {
        teamId,
        teamName: team.name,
        inviterId: user.id,
        inviterName: user.name || user.username,
      },
    });

    return { success: true, message: "Invitation sent successfully" };
  } catch (error) {
    console.error("Error inviting team member:", error);
    return { success: false, message: "Failed to invite team member" };
  }
}

/**
 * Join a team with an invite code
 */
export async function joinTeamWithCode(inviteCode: string) {
  const user = await getCurrentUser();

  if (!user) {
    return { success: false, message: "Authentication required" };
  }

  try {
    // Find the team with the provided invite code
    const team = await prisma.team.findFirst({
      where: { inviteCode },
    });

    if (!team) {
      return { success: false, message: "Invalid invite code or team not found" };
    }

    // Check if the user is already a member
    const existingMembership = await prisma.teamMember.findFirst({
      where: {
        teamId: team.id,
        userId: user.id,
      },
    });

    if (existingMembership) {
      if (existingMembership.status === "ACTIVE") {
        return { success: false, message: "You are already a member of this team" };
      } else if (existingMembership.status === "SUSPENDED") {
        return { success: false, message: "Your membership in this team has been suspended" };
      } else {
        // If status is INVITED, update it to ACTIVE
        await prisma.teamMember.update({
          where: { id: existingMembership.id },
          data: { status: "ACTIVE" as MemberStatus },
        });
      }
    } else {
      // Create a new membership with ACTIVE status
      await prisma.teamMember.create({
        data: {
          teamId: team.id,
          userId: user.id,
          role: "MEMBER" as TeamRole,
          permissions: "canView", // Default permissions for new members
          status: "ACTIVE" as MemberStatus,
        },
      });
    }

    // Notify team owner
    await createNotification({
      userId: team.ownerId,
      type: "SYSTEM",
      title: "New Team Member",
      message: `${user.name || user.username || "A user"} has joined your team "${team.name}" using an invite code`,
      linkUrl: `/dashboard/team/${team.id}/members`,
      metadata: {
        teamId: team.id,
        teamName: team.name,
        newMemberId: user.id,
        newMemberName: user.name || user.username,
      },
    });

    return {
      success: true,
      message: "Successfully joined the team",
      teamId: team.id,
    };
  } catch (error) {
    console.error("Error joining team:", error);
    return { success: false, message: "Failed to join team" };
  }
}

/**
 * Update team member permissions
 */
export async function updateTeamMemberPermissions(
  teamId: string,
  memberId: string,
  role: TeamRole,
  permissions: string[]
) {
  const user = await getCurrentUser();

  if (!user) {
    return { success: false, message: "Authentication required" };
  }

  try {
    // Check if the current user is the team owner or an admin
    const currentUserMembership = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId: user.id,
        status: "ACTIVE" as MemberStatus,
      },
    });

    if (!currentUserMembership) {
      return { success: false, message: "You are not a member of this team" };
    }

    const isOwnerOrAdmin = currentUserMembership.role === "OWNER" || currentUserMembership.role === "ADMIN";

    if (!isOwnerOrAdmin) {
      return { success: false, message: "You don't have permission to update member permissions" };
    }

    // Only owners can modify admin roles
    const memberToUpdate = await prisma.teamMember.findUnique({
      where: { id: memberId },
    });

    if (!memberToUpdate) {
      return { success: false, message: "Team member not found" };
    }

    if (memberToUpdate.role === "ADMIN" && currentUserMembership.role !== "OWNER") {
      return { success: false, message: "Only the team owner can modify admin permissions" };
    }

    // Team owners cannot have their permissions changed
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return { success: false, message: "Team not found" };
    }

    if (memberToUpdate.userId === team.ownerId) {
      return { success: false, message: "Team owner permissions cannot be modified" };
    }

    // Update member permissions
    await prisma.teamMember.update({
      where: { id: memberId },
      data: {
        role,
        permissions: permissions.join(','),
      },
    });

    return { success: true, message: "Member permissions updated successfully" };
  } catch (error) {
    console.error("Error updating member permissions:", error);
    return { success: false, message: "Failed to update member permissions" };
  }
}

/**
 * Remove a member from a team
 */
export async function removeTeamMember(teamId: string, memberId: string) {
  const user = await getCurrentUser();

  if (!user) {
    return { success: false, message: "Authentication required" };
  }

  try {
    // Check if the current user is the team owner or an admin
    const currentUserMembership = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId: user.id,
        status: "ACTIVE" as MemberStatus,
      },
    });

    if (!currentUserMembership) {
      return { success: false, message: "You are not a member of this team" };
    }

    const isOwnerOrAdmin = currentUserMembership.role === "OWNER" || currentUserMembership.role === "ADMIN";

    if (!isOwnerOrAdmin) {
      return { success: false, message: "You don't have permission to remove team members" };
    }

    // Get the member to remove
    const memberToRemove = await prisma.teamMember.findUnique({
      where: { id: memberId },
      include: {
        user: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!memberToRemove) {
      return { success: false, message: "Team member not found" };
    }

    // Check if trying to remove the team owner
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return { success: false, message: "Team not found" };
    }

    if (memberToRemove.user.id === team.ownerId) {
      return { success: false, message: "Team owner cannot be removed" };
    }

    // Only owner can remove admins
    if (memberToRemove.role === "ADMIN" && currentUserMembership.role !== "OWNER") {
      return { success: false, message: "Only the team owner can remove admins" };
    }

    // Remove the member
    await prisma.teamMember.delete({
      where: { id: memberId },
    });

    // Notify the removed user
    await createNotification({
      userId: memberToRemove.user.id,
      type: "SYSTEM",
      title: "Removed from Team",
      message: `You have been removed from the team "${team.name}"`,
      metadata: {
        teamId: team.id,
        teamName: team.name,
      },
    });

    return { success: true, message: "Member removed successfully" };
  } catch (error) {
    console.error("Error removing team member:", error);
    return { success: false, message: "Failed to remove team member" };
  }
}

/**
 * Leave a team
 */
export async function leaveTeam(teamId: string) {
  const user = await getCurrentUser();

  if (!user) {
    return { success: false, message: "Authentication required" };
  }

  try {
    // Check if the user is a member of the team
    const membership = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId: user.id,
        status: "ACTIVE" as MemberStatus,
      },
    });

    if (!membership) {
      return { success: false, message: "You are not a member of this team" };
    }

    // Check if the user is the team owner
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return { success: false, message: "Team not found" };
    }

    if (team.ownerId === user.id) {
      return { success: false, message: "Team owners cannot leave their teams. Please transfer ownership first or delete the team." };
    }

    // Remove the user from the team
    await prisma.teamMember.delete({
      where: { id: membership.id },
    });

    // Notify team owner
    await createNotification({
      userId: team.ownerId,
      type: "SYSTEM",
      title: "Team Member Left",
      message: `${user.name || user.username || "A member"} has left your team "${team.name}"`,
      linkUrl: `/dashboard/team/${team.id}/members`,
      metadata: {
        teamId: team.id,
        teamName: team.name,
        memberId: user.id,
        memberName: user.name || user.username,
      },
    });

    return { success: true, message: "Successfully left the team" };
  } catch (error) {
    console.error("Error leaving team:", error);
    return { success: false, message: "Failed to leave team" };
  }
}

/**
 * Update team information
 */
export async function updateTeam(teamId: string, formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    return { success: false, message: "Authentication required" };
  }

  try {
    // Check if the user is the team owner or an admin
    const membership = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId: user.id,
        status: "ACTIVE" as MemberStatus,
      },
    });

    if (!membership) {
      return { success: false, message: "You are not a member of this team" };
    }

    const isOwnerOrAdmin = membership.role === "OWNER" || membership.role === "ADMIN";

    if (!isOwnerOrAdmin) {
      return { success: false, message: "You don't have permission to update team information" };
    }

    // Extract form data
    const rawData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string || "",
      isPublic: formData.get("isPublic") as string,
      avatarUrl: formData.get("avatarUrl") as string || undefined,
    };

    // Validate form data
    const validationSchema = z.object({
      name: z.string().min(2, "Team name must be at least 2 characters"),
      description: z.string().optional(),
      isPublic: z.coerce.boolean(),
      avatarUrl: z.string().optional(),
    });

    const validatedFields = validationSchema.safeParse(rawData);

    if (!validatedFields.success) {
      const errors = validatedFields.error.flatten().fieldErrors;
      const errorMessage = Object.values(errors).flat()[0] || "Invalid form data";
      return { success: false, message: errorMessage };
    }

    // Update team in the database
    await prisma.team.update({
      where: { id: teamId },
      data: {
        name: validatedFields.data.name,
        description: validatedFields.data.description,
        isPublic: validatedFields.data.isPublic,
        avatarUrl: validatedFields.data.avatarUrl,
      },
    });

    return {
      success: true,
      message: "Team updated successfully",
    };
  } catch (error) {
    console.error("Team update error:", error);
    return { success: false, message: "Failed to update team" };
  }
}
