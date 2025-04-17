import { type NextRequest, NextResponse } from "next/server";
import { getUnreadNotificationCount } from "@/lib/actions/notifications";
import { getCurrentUser } from "@/lib/auth-utils";

/**
 * GET /api/notifications/count - Get unread notification count
 */
export async function GET(request: NextRequest) {
  try {
    // Get the current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get unread notification count
    const result = await getUnreadNotificationCount(user.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to get unread notification count" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      count: result.count
    });
  } catch (error) {
    console.error("Error in GET /api/notifications/count:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
