import { type NextRequest, NextResponse } from "next/server";
import { getUserNotifications, markAllNotificationsAsRead } from "@/lib/actions/notifications";
import { getCurrentUser } from "@/lib/auth-utils";

/**
 * GET /api/notifications - Get the current user's notifications
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

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    // Get notifications
    const result = await getUserNotifications({
      userId: user.id,
      page,
      limit,
      unreadOnly
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to get notifications" },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in GET /api/notifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/notifications - Mark all notifications as read
 */
export async function PATCH(request: NextRequest) {
  try {
    // Get the current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Mark all notifications as read
    const result = await markAllNotificationsAsRead(user.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to mark all notifications as read" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in PATCH /api/notifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
