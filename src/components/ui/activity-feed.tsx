"use client";

import { useState, useEffect } from "react";
import { CheckCheck, FileWarning, FileX, Shield, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import type { NotificationType } from "@prisma/client";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  linkUrl?: string;
  createdAt: string;
}

interface ActivityItem {
  id: string;
  type: "success" | "warning" | "info" | "danger";
  icon: React.ReactNode;
  title: string;
  description: string;
  category: string;
  time: string;
  linkUrl?: string;
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchActivities() {
      try {
        const response = await fetch("/api/notifications?limit=5");

        if (!response.ok) {
          throw new Error("Failed to fetch activities");
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || "Failed to fetch activities");
        }

        // Transform notifications into activity items
        const mappedActivities = data.notifications.map((notification: Notification) =>
          transformNotificationToActivity(notification)
        );
        setActivities(mappedActivities);
      } catch (err) {
        console.error("Error fetching activities:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchActivities();
  }, []);

  // If there's an error, show it
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md text-sm">
        {error}
      </div>
    );
  }

  // If loading, show skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        {Array(3).fill(null).map((_, i) => (
          <div key={i} className="flex items-start animate-pulse">
            <div className="mt-0.5 rounded-full p-2 mr-3 bg-muted"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-muted rounded w-2/3"></div>
              <div className="h-3 bg-muted rounded w-full"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // If there are no activities, show a message
  if (activities.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No recent activity to display
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {activities.map((item) => (
        <div key={item.id} className="flex items-start">
          <div
            className={`mt-0.5 rounded-full p-1 mr-3 ${
              item.type === "success"
                ? "bg-green-500/20 text-green-600"
                : item.type === "warning"
                ? "bg-amber-500/20 text-amber-600"
                : item.type === "danger"
                ? "bg-red-500/20 text-red-600"
                : "bg-blue-500/20 text-blue-600"
            }`}
          >
            {item.icon}
          </div>
          <div className="space-y-1 flex-1">
            <p className="text-sm font-medium leading-none">
              {item.title}
            </p>
            <p className="text-sm text-muted-foreground">
              {item.description}
            </p>
            <div className="flex items-center pt-1">
              <Badge variant="outline" className="text-xs">
                {item.category}
              </Badge>
              <time className="ml-auto text-xs text-muted-foreground">
                {item.time}
              </time>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Helper function to transform a notification into an activity item
function transformNotificationToActivity(notification: Notification): ActivityItem {
  // Determine the type and icon based on notification type
  let type: "success" | "warning" | "info" | "danger";
  let icon: React.ReactNode;
  let category: string;

  switch (notification.type) {
    case "VIOLATION_DETECTED":
      type = "warning";
      icon = <FileWarning className="h-4 w-4" />;
      category = "Detection";
      break;
    case "LICENSE_CREATED":
      type = "success";
      icon = <CheckCheck className="h-4 w-4" />;
      category = "Licensing";
      break;
    case "LICENSE_EXPIRED":
      type = "warning";
      icon = <CheckCheck className="h-4 w-4" />;
      category = "Licensing";
      break;
    case "MARKETPLACE_INTEREST":
      type = "info";
      icon = <TrendingUp className="h-4 w-4" />;
      category = "Marketplace";
      break;
    case "RIGHTS_REGISTERED":
      type = "info";
      icon = <Shield className="h-4 w-4" />;
      category = "Registry";
      break;
    case "SYSTEM":
    default:
      type = "info";
      icon = <Shield className="h-4 w-4" />;
      category = "System";
      break;
  }

  return {
    id: notification.id,
    type,
    icon,
    title: notification.title,
    description: notification.message,
    category,
    time: formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true }),
    linkUrl: notification.linkUrl
  };
}
