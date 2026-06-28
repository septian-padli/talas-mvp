import { NotificationType } from "@prisma/client";

// ==========================================
// NOTIFICATION TYPE CONSTANTS
// ==========================================

/**
 * Types that use Instagram-style aggregation (1 row per user+type+artifact, actor_count incremented).
 */
export const AGGREGATED_NOTIFICATION_TYPES = new Set<NotificationType>([
  "ARTIFACT_BOOST",
  "ARTIFACT_AMPLIFY",
  "NEW_WATCHER",
]);

// ==========================================
// DTOs & RESPONSE SHAPES
// ==========================================

export interface NotificationActorInfo {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
}

export interface NotificationArtifactInfo {
  id: string;
  title: string;
  slug: string;
  author_username: string;
}

export interface NotificationDiscussionInfo {
  id: string;
  content: string; // Truncated preview
}

/**
 * Shape returned to the client when fetching user's notification list.
 */
export interface NotificationItem {
  id: string;
  type: NotificationType;
  is_read: boolean;

  /** Primary actor (first or last, depending on aggregation) */
  actor: NotificationActorInfo | null;

  /** Aggregation fields */
  actor_count: number;
  last_actor: NotificationActorInfo | null;

  artifact: NotificationArtifactInfo | null;
  discussion: NotificationDiscussionInfo | null;

  created_at: Date;
  updated_at: Date;
}

// ==========================================
// SERVICE INPUT TYPES
// ==========================================

/**
 * Payload to send a notification to a single user.
 */
export interface SendNotificationInput {
  /** ID penerima notifikasi */
  user_id: string;
  /** ID actor yang memicu (undefined untuk notif sistem) */
  actor_id?: string;
  type: NotificationType;
  artifact_id?: string;
  discussion_id?: string;
}

/**
 * Filter for fetching user's notification list.
 */
export interface GetNotificationsFilter {
  unread_only?: boolean;
  page?: number;
  limit?: number;
}
