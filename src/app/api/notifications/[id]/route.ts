import { type NextRequest, NextResponse } from "next/server";
import { markNotificationAsRead, deleteNotification } from "@/lib/actions/notifications";
import { getCurrentUser } from "@/lib/auth-utils";

type RouteParams = {
  params: {
    id: string;
  };
};

/**
 * PATCH /api/notifications/[id] - Mark a notification as read
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const notificationId = params.id;
    if (!notificationId) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 }
      );
    }

    // Get the current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Mark notification as read
    const result = await markNotificationAsRead(notificationId, user.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to mark notification as read" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error in PATCH /api/notifications/[id]:`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications/[id] - Delete a notification
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const notificationId = params.id;
    if (!notificationId) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 }
      );
    }

    // Get the current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Delete notification
    const result = await deleteNotification(notificationId, user.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to delete notification" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error in DELETE /api/notifications/[id]:`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
