"use client";

import { useState, useEffect, useCallback } from 'react';
import type { NotificationType } from '@prisma/client';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  linkUrl?: string | null;
  isRead: boolean;
  createdAt: string;
  metadata?: Record<string, any> | null;
}

interface NotificationsResponse {
  success: boolean;
  notifications: Notification[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface UseNotificationsOptions {
  refreshInterval?: number; // in milliseconds
  pageSize?: number;
  initialUnreadOnly?: boolean;
}

export function useNotifications({
  refreshInterval = 60000, // Default refresh every minute
  pageSize = 10,
  initialUnreadOnly = false
}: UseNotificationsOptions = {}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [pagination, setPagination] = useState<{
    total: number;
    totalPages: number;
    limit: number;
  }>({
    total: 0,
    totalPages: 0,
    limit: pageSize
  });
  const [unreadOnly, setUnreadOnly] = useState<boolean>(initialUnreadOnly);

  // Fetch notifications
  const fetchNotifications = useCallback(async (pageNum = page, onlyUnread = unreadOnly) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: pageSize.toString(),
        unreadOnly: onlyUnread.toString()
      });

      const response = await fetch(`/api/notifications?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json() as NotificationsResponse;

      if (data.success) {
        setNotifications(data.notifications);
        setPagination({
          total: data.pagination.total,
          totalPages: data.pagination.totalPages,
          limit: data.pagination.limit
        });
      } else {
        throw new Error(data.error || 'Failed to fetch notifications');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [page, unreadOnly, pageSize]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/count');
      if (!response.ok) {
        throw new Error('Failed to fetch unread count');
      }

      const data = await response.json();
      if (data.success) {
        setUnreadCount(data.count);
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, []);

  // Mark a notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH'
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      // Update local state
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );

      // Update unread count
      fetchUnreadCount();
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, [fetchUnreadCount]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH'
      });

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }

      // Update local state
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, isRead: true }))
      );

      // Update unread count
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  }, []);

  // Delete a notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }

      // Update local state
      setNotifications(prev =>
        prev.filter(notification => notification.id !== notificationId)
      );

      // If the notification was unread, update unread count
      const wasUnread = notifications.find(n => n.id === notificationId)?.isRead === false;
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  }, [notifications]);

  // Change page
  const goToPage = useCallback((pageNum: number) => {
    setPage(pageNum);
  }, []);

  // Toggle unread only filter
  const toggleUnreadOnly = useCallback(() => {
    setUnreadOnly(prev => !prev);
  }, []);

  // Initial fetch and periodic refresh
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();

    // Set up periodic refresh if interval is provided
    if (refreshInterval > 0) {
      const intervalId = setInterval(() => {
        fetchNotifications();
        fetchUnreadCount();
      }, refreshInterval);

      return () => clearInterval(intervalId);
    }
  }, [fetchNotifications, fetchUnreadCount, refreshInterval]);

  // Refetch when page or unreadOnly changes
  useEffect(() => {
    fetchNotifications(page, unreadOnly);
  }, [fetchNotifications, page, unreadOnly]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    pagination,
    page,
    unreadOnly,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    goToPage,
    toggleUnreadOnly,
    refresh: fetchNotifications
  };
}
