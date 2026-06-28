import { prisma } from "@/lib/prisma";
import { CreateDiscussionInput, DiscussionItem } from "../types/discussion";
import { formatMediaUrl } from "@/modules/media/media.interface";
import { NotificationService } from "@/modules/notification/notification.interface";

/**
 * Core domain business logic & strictly isolated WRITE operations for Discussion domain.
 */
export const discussionService = {
  async getById(id: string): Promise<DiscussionItem | null> {
    const item = await prisma.discussion.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            photo_profile: true,
          },
        },
      },
    });

    if (!item) return null;

    const avatarUrl = formatMediaUrl(item.user.photo_profile?.url);
    return {
      id: item.id,
      artifact_id: item.artifact_id,
      parent_id: item.parent_id,
      content: item.content,
      count_boosts: item.count_boosts,
      count_reduces: item.count_reduces,
      count_replies: item.count_replies,
      boostsCount: item.count_boosts,
      reducesCount: item.count_reduces,
      repliesCount: item.count_replies,
      userVote: null,
      depth: 1,
      timeAgo: "Just now",
      created_at: item.created_at,
      updated_at: item.updated_at,
      author: {
        id: item.user.id,
        name: item.user.name,
        username: item.user.username,
        jobTitle: item.user.job_title || "-",
        photo_profile: avatarUrl,
        avatarUrl: avatarUrl,
      },
    };
  },

  async createDiscussion(userId: string, data: CreateDiscussionInput): Promise<DiscussionItem> {
    // ── 1. Ambil data yang dibutuhkan untuk notifikasi ──────────────────────
    // Ambil artifact owner dan parent discussion author (jika ada) sebelum transaksi
    const [artifact, parentDiscussion] = await Promise.all([
      prisma.artifact.findUnique({
        where: { id: data.artifact_id },
        select: { author_id: true },
      }),
      data.parent_id
        ? prisma.discussion.findUnique({
            where: { id: data.parent_id },
            select: { user_id: true },
          })
        : Promise.resolve(null),
    ]);

    // ── 2. Buat discussion dalam transaksi ──────────────────────────────────
    const discussion = await prisma.$transaction(async (tx) => {
      const created = await tx.discussion.create({
        data: {
          user_id: userId,
          artifact_id: data.artifact_id,
          parent_id: data.parent_id || null,
          content: data.content.trim(),
        },
        include: {
          user: {
            include: {
              photo_profile: true,
            },
          },
        },
      });

      // Update parent atau artifact counters
      if (data.parent_id) {
        await tx.discussion.update({
          where: { id: data.parent_id },
          data: { count_replies: { increment: 1 } },
        });
      }

      await tx.artifact.update({
        where: { id: data.artifact_id },
        data: { count_comments: { increment: 1 } },
      });

      return created;
    });

    // ── 3. Trigger notifikasi secara fire-and-forget ────────────────────────
    // Tidak di-await — jika gagal, tidak rollback discussion
    _triggerDiscussionNotifications({
      actorId: userId,
      artifactId: data.artifact_id,
      discussionId: discussion.id,
      artifactOwnerId: artifact?.author_id ?? null,
      parentAuthorId: parentDiscussion?.user_id ?? null,
      isReply: !!data.parent_id,
    }).catch((err) => {
      console.error("[Notification] Fire-and-forget gagal:", err);
    });

    // ── 4. Return discussion item ───────────────────────────────────────────
    const avatarUrl = formatMediaUrl(discussion.user.photo_profile?.url);
    return {
      id: discussion.id,
      artifact_id: discussion.artifact_id,
      parent_id: discussion.parent_id,
      content: discussion.content,
      count_boosts: discussion.count_boosts,
      count_reduces: discussion.count_reduces,
      count_replies: discussion.count_replies,
      boostsCount: discussion.count_boosts,
      reducesCount: discussion.count_reduces,
      repliesCount: discussion.count_replies,
      userVote: null,
      depth: data.parent_id ? 2 : 1,
      timeAgo: "Just now",
      created_at: discussion.created_at,
      updated_at: discussion.updated_at,
      author: {
        id: discussion.user.id,
        name: discussion.user.name,
        username: discussion.user.username,
        jobTitle: discussion.user.job_title || "-",
        photo_profile: avatarUrl,
        avatarUrl: avatarUrl,
      },
    };
  },
};

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Susun dan kirim notifikasi sesuai aturan:
 *
 * Root discussion (isReply = false):
 *   → NEW_DISCUSSION ke artifact owner (jika actor !== artifact owner)
 *
 * Reply (isReply = true):
 *   → NEW_DISCUSSION ke artifact owner (jika actor !== artifact owner)
 *   → DISCUSSION_REPLY ke parent author (jika actor !== parent author)
 *   → Jika parent author === artifact owner: hanya kirim DISCUSSION_REPLY (lebih spesifik)
 */
async function _triggerDiscussionNotifications(params: {
  actorId: string;
  artifactId: string;
  discussionId: string;
  artifactOwnerId: string | null;
  parentAuthorId: string | null;
  isReply: boolean;
}): Promise<void> {
  const {
    actorId,
    artifactId,
    discussionId,
    artifactOwnerId,
    parentAuthorId,
    isReply,
  } = params;

  const notifications: Array<() => Promise<void>> = [];

  if (isReply && parentAuthorId) {
    // REPLY CASE
    const sameOwner = parentAuthorId === artifactOwnerId;

    // Kirim DISCUSSION_REPLY ke parent author (jika bukan actor)
    if (parentAuthorId !== actorId) {
      notifications.push(() =>
        NotificationService.sendNotification({
          user_id: parentAuthorId,
          actor_id: actorId,
          type: "DISCUSSION_REPLY",
          artifact_id: artifactId,
          discussion_id: discussionId,
        })
      );
    }

    // Kirim NEW_DISCUSSION ke artifact owner — HANYA jika artifact owner BUKAN parent author
    // (menghindari 2 notif ke orang yang sama)
    if (artifactOwnerId && artifactOwnerId !== actorId && !sameOwner) {
      notifications.push(() =>
        NotificationService.sendNotification({
          user_id: artifactOwnerId,
          actor_id: actorId,
          type: "NEW_DISCUSSION",
          artifact_id: artifactId,
          discussion_id: discussionId,
        })
      );
    }
  } else {
    // ROOT DISCUSSION CASE
    // Kirim NEW_DISCUSSION ke artifact owner saja
    if (artifactOwnerId && artifactOwnerId !== actorId) {
      notifications.push(() =>
        NotificationService.sendNotification({
          user_id: artifactOwnerId,
          actor_id: actorId,
          type: "NEW_DISCUSSION",
          artifact_id: artifactId,
          discussion_id: discussionId,
        })
      );
    }
  }

  // Kirim semua secara paralel, jika ada 1 gagal sisanya tetap dikirim
  await Promise.allSettled(notifications.map((fn) => fn()));
}
