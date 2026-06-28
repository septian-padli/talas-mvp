"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { NotificationItem } from "@/modules/notification/types/notification";

// ── Query Keys ───────────────────────────────────────────────────────────────
export const notificationKeys = {
  all: ["notifications"] as const,
  unreadCount: () => [...notificationKeys.all, "unreadCount"] as const,
  list: (filter?: object) => [...notificationKeys.all, "list", filter] as const,
};

// ── 1. useNotificationBadge ──────────────────────────────────────────────────
async function fetchUnreadCount(): Promise<number> {
  const res = await apiClient("/api/notifications/unread-count");
  if (!res.ok) {
    if (res.status === 401) return 0;
    throw new Error("Failed to fetch unread notification count");
  }
  const json = await res.json();
  return json.count ?? 0;
}

export function useNotificationBadge() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: fetchUnreadCount,
    refetchInterval: 30000, // 30 seconds polling
    refetchIntervalInBackground: false, // Stop polling when tab is inactive to preserve VPS resources
  });

  return {
    unreadCount: data ?? 0,
    isLoading,
    isError,
    refetch,
  };
}

// ── 2. useNotificationList ───────────────────────────────────────────────────
async function fetchNotificationList(): Promise<NotificationItem[]> {
  const res = await apiClient("/api/notifications");
  if (!res.ok) {
    if (res.status === 401) return [];
    throw new Error("Failed to fetch notification list");
  }
  const json = await res.json();
  return json.data ?? [];
}

export function useNotificationList() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: notificationKeys.list(),
    queryFn: fetchNotificationList,
    refetchOnWindowFocus: false, // Fetch on-mount only
  });

  return {
    notifications: data ?? [],
    isLoading,
    isError,
    refetch,
  };
}

// ── 3. useMarkNotificationsAsRead ────────────────────────────────────────────
async function markNotificationsAsRead(): Promise<void> {
  const res = await apiClient("/api/notifications/mark-as-read", {
    method: "POST",
  });
  if (!res.ok) {
    throw new Error("Failed to mark notifications as read");
  }
}

export function useMarkNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationsAsRead,
    onSuccess: () => {
      // Instantly reset unread count badge to 0
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
    },
  });
}
