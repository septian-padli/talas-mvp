import { prisma } from "@/lib/prisma";
import { formatMediaUrl } from "@/modules/media/media.interface";
import {
  GetNotificationsFilter,
  NotificationItem,
} from "@/modules/notification/types/notification";

const DEFAULT_PAGE_LIMIT = 20;

/**
 * Complex READ operations involving cross-module JOIN queries for Notification domain.
 */
export const notificationAggregator = {
  /**
   * Ambil daftar notifikasi milik seorang user, diurutkan dari yang terbaru (updated_at DESC).
   * Melakukan JOIN ke User (actor, last_actor), Artifact, dan Discussion.
   */
  async getForUser(
    userId: string,
    filter: GetNotificationsFilter = {}
  ): Promise<NotificationItem[]> {
    const { unread_only = false, page = 1, limit = DEFAULT_PAGE_LIMIT } = filter;

    const notifications = await prisma.notification.findMany({
      where: {
        user_id: userId,
        ...(unread_only ? { is_read: false } : {}),
      },
      include: {
        actor: {
          include: { photo_profile: true },
        },
        last_actor: {
          include: { photo_profile: true },
        },
        artifact: {
          include: {
            author: {
              select: { username: true },
            },
          },
        },
        discussion: {
          select: { id: true, content: true },
        },
      },
      orderBy: { updated_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return notifications.map((n) => {
      const actorAvatarUrl = formatMediaUrl(n.actor?.photo_profile?.url);
      const lastActorAvatarUrl = formatMediaUrl(n.last_actor?.photo_profile?.url);

      return {
        id: n.id,
        type: n.type,
        is_read: n.is_read,

        actor: n.actor
          ? {
              id: n.actor.id,
              name: n.actor.name,
              username: n.actor.username,
              avatarUrl: actorAvatarUrl,
            }
          : null,

        actor_count: n.actor_count,

        last_actor: n.last_actor
          ? {
              id: n.last_actor.id,
              name: n.last_actor.name,
              username: n.last_actor.username,
              avatarUrl: lastActorAvatarUrl,
            }
          : null,

        artifact: n.artifact
          ? {
              id: n.artifact.id,
              title: n.artifact.title,
              slug: n.artifact.slug,
              author_username: n.artifact.author.username,
            }
          : null,

        discussion: n.discussion
          ? {
              id: n.discussion.id,
              // Truncate panjang preview discussion ke 100 char
              content: n.discussion.content.slice(0, 100),
            }
          : null,

        created_at: n.created_at,
        updated_at: n.updated_at,
      } satisfies NotificationItem;
    });
  },
};
