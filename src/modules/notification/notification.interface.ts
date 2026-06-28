/**
 * Data contracts, type definitions, DTOs, and cross-module facades for Notification module.
 * External modules MUST communicate with Notification domain exclusively through this interface.
 */

export type {
  NotificationItem,
  SendNotificationInput,
  GetNotificationsFilter,
  NotificationActorInfo,
  NotificationArtifactInfo,
  NotificationDiscussionInfo,
} from "./types/notification";

// ==========================================
// SERVICE FACADE — WRITE OPERATIONS
// ==========================================

export interface INotificationService {
  sendNotification(input: import("./types/notification").SendNotificationInput): Promise<void>;
  sendBatchNotifications(inputs: import("./types/notification").SendNotificationInput[]): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
}

export const NotificationService: INotificationService = {
  async sendNotification(input) {
    const { notificationService } = await import("./services/notification.service");
    return notificationService.sendNotification(input);
  },

  async sendBatchNotifications(inputs) {
    const { notificationService } = await import("./services/notification.service");
    return notificationService.sendBatchNotifications(inputs);
  },

  async markAllAsRead(userId) {
    const { notificationService } = await import("./services/notification.service");
    return notificationService.markAllAsRead(userId);
  },
};

// ==========================================
// AGGREGATOR FACADE — READ OPERATIONS
// ==========================================

export interface INotificationAggregator {
  getForUser(
    userId: string,
    filter?: import("./types/notification").GetNotificationsFilter
  ): Promise<import("./types/notification").NotificationItem[]>;
  getUnreadCount(userId: string): Promise<number>;
}

export const NotificationAggregator: INotificationAggregator = {
  async getForUser(userId, filter) {
    const { notificationAggregator } = await import("./notification.aggregator");
    return notificationAggregator.getForUser(userId, filter);
  },

  async getUnreadCount(userId) {
    const { notificationAggregator } = await import("./notification.aggregator");
    return notificationAggregator.getUnreadCount(userId);
  },
};
