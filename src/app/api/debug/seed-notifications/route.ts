import { type NextRequest, NextResponse } from "next/server";
import { seedNotifications } from "@/lib/data/seed-notifications";
import { getCurrentUser } from "@/lib/auth-utils";

/**
 * POST /api/debug/seed-notifications - Seeds test notifications for the current user
 * IMPORTANT: This is for development/demo purposes only and should be removed in production
 */
export async function POST(request: NextRequest) {
  try {
    // Get the current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Seed notifications for the current user
    const result = await seedNotifications(user.id);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in POST /api/debug/seed-notifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
