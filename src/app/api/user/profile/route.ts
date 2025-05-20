import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      username,
      bio,
      avatar,
      creatorType,
      portfolioUrl,
      isPublic,
    } = body;

    // Validate username if provided
    if (username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username,
          id: { not: session.user.id },
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Username is already taken" },
          { status: 400 }
        );
      }
    }

    // Validate portfolio URL if provided
    if (portfolioUrl) {
      try {
        new URL(portfolioUrl);
      } catch {
        return NextResponse.json(
          { error: "Invalid portfolio URL" },
          { status: 400 }
        );
      }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name || null,
        username: username || null,
        bio: bio || null,
        avatar: avatar || null,
        creatorType: creatorType || null,
        portfolioUrl: portfolioUrl || null,
        isPublic,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        username: updatedUser.username,
        bio: updatedUser.bio,
        avatar: updatedUser.avatar,
        creatorType: updatedUser.creatorType,
        portfolioUrl: updatedUser.portfolioUrl,
        isPublic: updatedUser.isPublic,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 