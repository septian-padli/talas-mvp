import { prisma } from "@/lib/prisma";
import {
  SendNotificationInput,
  AGGREGATED_NOTIFICATION_TYPES,
} from "../types/notification";

/**
 * Core domain business logic & strictly isolated WRITE operations for Notification domain.
 * External modules must call this only via notification.interface.ts (cross-module facade).
 */
export const notificationService = {
  /**
   * Kirim notifikasi ke 1 user.
   *
   * - Untuk tipe AGGREGATED (ARTIFACT_BOOST, ARTIFACT_AMPLIFY, NEW_WATCHER):
   *   Menggunakan findFirst + manual update/create (Instagram-style).
   *   Jika sudah ada row untuk (user_id, type, artifact_id), increment actor_count.
   *   Jika belum ada, buat row baru.
   *
   * - Untuk tipe NON-AGGREGATED (NEW_DISCUSSION, DISCUSSION_REPLY, dll):
   *   Buat row baru setiap kejadian — karena setiap diskusi/reply adalah event berbeda.
   *
   * - Skip jika actor_id === user_id (tidak notifikasi diri sendiri).
   */
  async sendNotification(input: SendNotificationInput): Promise<void> {
    const { user_id, actor_id, type, artifact_id, discussion_id } = input;

    // Dedup: tidak notifikasi diri sendiri
    if (actor_id && actor_id === user_id) return;

    if (AGGREGATED_NOTIFICATION_TYPES.has(type)) {
      // ── Agregat: findFirst + update/create ──────────────────────────────
      const existing = await prisma.notification.findFirst({
        where: {
          user_id,
          type,
          artifact_id: artifact_id ?? null,
        },
        select: { id: true },
      });

      if (existing) {
        // Notifikasi sudah ada → increment actor_count, update last_actor, reset is_read
        await prisma.notification.update({
          where: { id: existing.id },
          data: {
            actor_count: { increment: 1 },
            last_actor_id: actor_id ?? null,
            is_read: false, // Reset ke unread saat ada actor baru
            // updated_at di-handle @updatedAt secara otomatis
          },
        });
      } else {
        // Notifikasi baru untuk tipe agregat
        await prisma.notification.create({
          data: {
            user_id,
            actor_id: actor_id ?? null,
            type,
            artifact_id: artifact_id ?? null,
            discussion_id: discussion_id ?? null,
            actor_count: 1,
            last_actor_id: null,
          },
        });
      }
    } else {
      // ── Non-agregat: buat row baru setiap event ─────────────────────────
      await prisma.notification.create({
        data: {
          user_id,
          actor_id: actor_id ?? null,
          type,
          artifact_id: artifact_id ?? null,
          discussion_id: discussion_id ?? null,
          actor_count: 1,
          last_actor_id: null,
        },
      });
    }
  },

  /**
   * Kirim notifikasi ke banyak user sekaligus (non-agregat, individual rows).
   * - Actor yang ada di daftar penerima akan di-skip (tidak notif diri sendiri).
   * - Array kosong → tidak ada operasi DB.
   */
  async sendBatchNotifications(inputs: SendNotificationInput[]): Promise<void> {
    if (inputs.length === 0) return;

    // Filter: hapus actor dari daftar penerima
    const filtered = inputs.filter(
      (input) => !input.actor_id || input.actor_id !== input.user_id
    );

    if (filtered.length === 0) return;

    await prisma.notification.createMany({
      data: filtered.map((input) => ({
        user_id: input.user_id,
        actor_id: input.actor_id ?? null,
        type: input.type,
        artifact_id: input.artifact_id ?? null,
        discussion_id: input.discussion_id ?? null,
        actor_count: 1,
        last_actor_id: null,
      })),
      skipDuplicates: true,
    });
  },

  /**
   * Tandai semua notifikasi user sebagai sudah dibaca (is_read = true).
   * Dipanggil ketika user membuka panel notifikasi — sesuai rule 3.7 AGENTS.md.
   */
  async markAllAsRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: {
        user_id: userId,
        is_read: false,
      },
      data: {
        is_read: true,
      },
    });
  },
};
