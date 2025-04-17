"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination } from "@/components/ui/pagination";
import { useNotifications } from "@/hooks/use-notifications";
import type { NotificationType } from "@prisma/client";
import {
  AlertOctagon,
  Bell,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  Info,
  Loader2,
  Shield,
  Trash2,
  WalletCards,
  XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [seedingNotifications, setSeedingNotifications] = useState<boolean>(false);
  const {
    notifications,
    loading,
    error,
    pagination,
    page,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    goToPage,
    refresh
  } = useNotifications({
    pageSize: 10,
    initialUnreadOnly: false
  });

  // Seed test notifications for development/demo purposes
  const seedTestNotifications = async () => {
    try {
      setSeedingNotifications(true);
      const response = await fetch('/api/debug/seed-notifications', {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to seed notifications');
      }

      await refresh();
    } catch (error) {
      console.error('Error seeding notifications:', error);
    } finally {
      setSeedingNotifications(false);
    }
  };

  // Function to get icon based on notification type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "VIOLATION_DETECTED":
        return <AlertOctagon className="h-5 w-5 text-amber-500" />;
      case "LICENSE_CREATED":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "LICENSE_EXPIRED":
        return <Clock className="h-5 w-5 text-red-500" />;
      case "MARKETPLACE_INTEREST":
        return <WalletCards className="h-5 w-5 text-blue-500" />;
      case "RIGHTS_REGISTERED":
        return <Shield className="h-5 w-5 text-violet-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  // Get background color based on notification type
  const getNotificationClass = (type: NotificationType, isRead: boolean) => {
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

  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !notification.isRead;
    return notification.type === activeTab;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground">
              Stay updated on rights management activities and alerts.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => refresh()}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Refresh
            </Button>
            <Button
              variant="default"
              onClick={() => markAllAsRead()}
              disabled={!notifications.some(n => !n.isRead)}
            >
              <Check className="h-4 w-4 mr-2" /> Mark All Read
            </Button>
            {/* Add seed button only in development */}
            {process.env.NODE_ENV !== 'production' && (
              <Button
                variant="outline"
                onClick={seedTestNotifications}
                disabled={seedingNotifications}
                className="ml-2 bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800/30 dark:hover:bg-amber-900/30"
              >
                {seedingNotifications ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Seed Test Data
              </Button>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
              <div>
                <CardTitle>All Notifications</CardTitle>
                <CardDescription>
                  Manage and review your notification history
                </CardDescription>
              </div>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                <TabsList className="grid grid-cols-3 sm:grid-cols-6">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="unread">Unread</TabsTrigger>
                  <TabsTrigger value="VIOLATION_DETECTED">Violations</TabsTrigger>
                  <TabsTrigger value="LICENSE_CREATED">Licenses</TabsTrigger>
                  <TabsTrigger value="MARKETPLACE_INTEREST">Marketplace</TabsTrigger>
                  <TabsTrigger value="RIGHTS_REGISTERED">Registry</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="py-12 text-center">
                <XCircle className="h-12 w-12 mx-auto text-red-500 mb-2" />
                <h3 className="text-lg font-medium">Error Loading Notifications</h3>
                <p className="text-muted-foreground">{error}</p>
                <Button variant="outline" className="mt-4" onClick={() => refresh()}>
                  Try Again
                </Button>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="h-12 w-12 mx-auto opacity-20 mb-4" />
                <h3 className="text-lg font-medium">No Notifications</h3>
                <p className="text-muted-foreground">
                  {activeTab === "all"
                    ? "You don't have any notifications yet."
                    : activeTab === "unread"
                      ? "You don't have any unread notifications."
                      : `You don't have any ${activeTab.toLowerCase().replace('_', ' ')} notifications.`}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-4 flex gap-4 relative group rounded-md transition-all",
                      getNotificationClass(notification.type, notification.isRead),
                      !notification.isRead && "hover:bg-muted/80"
                    )}
                    onClick={() => {
                      if (!notification.isRead) {
                        markAsRead(notification.id);
                      }
                    }}
                  >
                    <div className="mt-1 flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <h4 className={cn(
                          "text-base",
                          !notification.isRead && "font-medium"
                        )}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </p>
                          {!notification.isRead && (
                            <Badge variant="outline" className="text-xs h-5 bg-violet-500/10 text-violet-600 border-violet-200 dark:border-violet-800/30">
                              New
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>

                      <div className="flex items-center justify-between pt-2">
                        {notification.linkUrl ? (
                          <Button variant="ghost" size="sm" className="text-xs h-7 gap-1" asChild>
                            <a href={notification.linkUrl}>
                              <ExternalLink className="h-3 w-3" /> View Details
                            </a>
                          </Button>
                        ) : (
                          <div></div>
                        )}

                        <div className="flex gap-2">
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs h-7"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                            >
                              <Check className="h-3 w-3 mr-1" /> Mark as Read
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3 mr-1" /> Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {pagination.totalPages > 1 && (
                  <div className="flex justify-center mt-6">
                    <Pagination
                      currentPage={page}
                      totalPages={pagination.totalPages}
                      onPageChange={goToPage}
                    />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
