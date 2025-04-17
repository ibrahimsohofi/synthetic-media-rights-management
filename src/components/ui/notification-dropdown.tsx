"use client";

import { useState } from "react";
import { useNotifications } from "@/hooks/use-notifications";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import type { NotificationType } from "@prisma/client";
import {
  AlertOctagon,
  Bell,
  Check,
  CheckCheck,
  Clock,
  Info,
  Loader2,
  Shield,
  Trash2,
  WalletCards,
  X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export function NotificationDropdown() {
  const [open, setOpen] = useState<boolean>(false);
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loading
  } = useNotifications({
    refreshInterval: 30000, // 30 seconds
    pageSize: 5,
    initialUnreadOnly: false
  });

  // Function to get icon based on notification type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "VIOLATION_DETECTED":
        return <AlertOctagon className="h-4 w-4 text-amber-500" />;
      case "LICENSE_CREATED":
        return <CheckCheck className="h-4 w-4 text-green-500" />;
      case "LICENSE_EXPIRED":
        return <Clock className="h-4 w-4 text-red-500" />;
      case "MARKETPLACE_INTEREST":
        return <WalletCards className="h-4 w-4 text-blue-500" />;
      case "RIGHTS_REGISTERED":
        return <Shield className="h-4 w-4 text-violet-500" />;
      case "SYSTEM":
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  // Get background color based on notification type
  const getNotificationColor = (type: NotificationType, isRead: boolean) => {
    const baseClass = isRead ? "bg-muted/40" : "bg-muted";

    const typeColors = {
      "VIOLATION_DETECTED": "border-l-4 border-amber-500",
      "LICENSE_CREATED": "border-l-4 border-green-500",
      "LICENSE_EXPIRED": "border-l-4 border-red-500",
      "MARKETPLACE_INTEREST": "border-l-4 border-blue-500",
      "RIGHTS_REGISTERED": "border-l-4 border-violet-500",
      "SYSTEM": "border-l-4 border-gray-500"
    };

    return `${baseClass} ${typeColors[type] || typeColors.SYSTEM}`;
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    // Mark all as read when closing
    if (!newOpen && unreadCount > 0) {
      markAllAsRead();
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-violet-600 flex items-center justify-center text-[10px] font-medium text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-8"
              onClick={() => markAllAsRead()}
            >
              <Check className="h-3 w-3 mr-1" /> Mark all as read
            </Button>
          )}
        </div>

        <div className="max-h-[calc(80vh-8rem)] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-8 px-4 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 flex gap-3 relative group",
                    getNotificationColor(notification.type, notification.isRead)
                  )}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-1 pr-6">
                    <p className={cn(
                      "text-sm",
                      !notification.isRead && "font-medium"
                    )}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                      {!notification.isRead && (
                        <Badge variant="outline" className="text-[10px] h-4 bg-violet-500/10 text-violet-600 border-violet-200 dark:border-violet-800/30">
                          New
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Action buttons - visible on hover */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <div className="p-2 border-t text-center">
            <Button variant="ghost" size="sm" className="text-xs w-full" asChild>
              <a href="/dashboard/notifications">View all notifications</a>
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
