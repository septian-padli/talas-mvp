/**
 * Integration tests untuk notificationService.
 *
 * Menggunakan database test nyata (talas_db) dengan cleanup setelah setiap test.
 * Jalankan: npm test -- src/modules/notification/services/notification.service.test.ts
 *
 * CATATAN: Membutuhkan database yang aktif dan DATABASE_URL tersedia di .env
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { notificationService } from "./notification.service";

// ── Test Fixtures ─────────────────────────────────────────────────────────────

let userA: { id: string };
let userB: { id: string };
let userC: { id: string };
let artifact: { id: string };

async function createTestUser(suffix: string) {
  return prisma.user.create({
    data: {
      username: `test_user_${suffix}_${Date.now()}`,
      email: `test_${suffix}_${Date.now()}@example.com`,
      name: `Test User ${suffix}`,
      is_verified: true,
    },
  });
}

async function createTestArtifact(authorId: string) {
  return prisma.artifact.create({
    data: {
      author_id: authorId,
      title: "Test Artifact",
      slug: `test-artifact-${Date.now()}`,
      content: "Test content body",
    },
  });
}

// Cleanup: hapus semua notifikasi, artifacts, dan users yang dibuat dalam test ini
afterEach(async () => {
  const userIds = [userA?.id, userB?.id, userC?.id].filter(Boolean) as string[];

  if (userIds.length > 0) {
    // Hapus notifikasi dulu (FK constraint)
    await prisma.notification.deleteMany({ where: { user_id: { in: userIds } } });
  }

  if (artifact?.id) {
    await prisma.artifact.delete({ where: { id: artifact.id } }).catch(() => {});
  }

  // Hapus semua user test sekaligus — deleteMany tidak throw jika tidak ada
  if (userIds.length > 0) {
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  }
});

// ── sendNotification ──────────────────────────────────────────────────────────

describe("notificationService.sendNotification", () => {
  beforeEach(async () => {
    userA = await createTestUser("A");
    userB = await createTestUser("B");
    artifact = await createTestArtifact(userA.id);
  });

  it("1. berhasil membuat notifikasi baru untuk tipe non-agregat (NEW_DISCUSSION)", async () => {
    await notificationService.sendNotification({
      user_id: userA.id,
      actor_id: userB.id,
      type: "NEW_DISCUSSION",
      artifact_id: artifact.id,
    });

    const notif = await prisma.notification.findFirst({
      where: { user_id: userA.id, type: "NEW_DISCUSSION" },
    });

    expect(notif).not.toBeNull();
    expect(notif?.actor_id).toBe(userB.id);
    expect(notif?.actor_count).toBe(1);
    expect(notif?.is_read).toBe(false);
  });

  it("2. UPSERT agregat: notifikasi ARTIFACT_BOOST pertama kali — buat row baru", async () => {
    await notificationService.sendNotification({
      user_id: userA.id,
      actor_id: userB.id,
      type: "ARTIFACT_BOOST",
      artifact_id: artifact.id,
    });

    const notif = await prisma.notification.findFirst({
      where: {
        user_id: userA.id,
        type: "ARTIFACT_BOOST",
        artifact_id: artifact.id,
      },
    });

    expect(notif).not.toBeNull();
    expect(notif?.actor_count).toBe(1);
    expect(notif?.actor_id).toBe(userB.id);
  });

  it("3. UPSERT agregat: ARTIFACT_BOOST ke-2 increment actor_count dan update last_actor_id", async () => {
    userC = await createTestUser("C");

    // Boost pertama dari userB
    await notificationService.sendNotification({
      user_id: userA.id,
      actor_id: userB.id,
      type: "ARTIFACT_BOOST",
      artifact_id: artifact.id,
    });

    // Boost kedua dari userC
    await notificationService.sendNotification({
      user_id: userA.id,
      actor_id: userC.id,
      type: "ARTIFACT_BOOST",
      artifact_id: artifact.id,
    });

    const notif = await prisma.notification.findFirst({
      where: {
        user_id: userA.id,
        type: "ARTIFACT_BOOST",
        artifact_id: artifact.id,
      },
    });

    // Harus tetap 1 row (UPSERT), actor_count = 2, last_actor = userC
    expect(notif?.actor_count).toBe(2);
    expect(notif?.last_actor_id).toBe(userC.id);
    expect(notif?.is_read).toBe(false);
  });

  it("4. skip notifikasi jika actor_id === user_id (tidak notif diri sendiri)", async () => {
    await notificationService.sendNotification({
      user_id: userA.id,
      actor_id: userA.id, // Same person!
      type: "NEW_DISCUSSION",
      artifact_id: artifact.id,
    });

    const count = await prisma.notification.count({
      where: { user_id: userA.id },
    });

    expect(count).toBe(0);
  });

  it("5. notifikasi tanpa artifact_id dan discussion_id tetap berhasil dibuat (notif sistem)", async () => {
    await notificationService.sendNotification({
      user_id: userA.id,
      type: "GUILD_ANNOUNCEMENT",
      // Tidak ada artifact_id atau discussion_id
    });

    const notif = await prisma.notification.findFirst({
      where: { user_id: userA.id, type: "GUILD_ANNOUNCEMENT" },
    });

    expect(notif).not.toBeNull();
    expect(notif?.artifact_id).toBeNull();
    expect(notif?.discussion_id).toBeNull();
  });

  it("6. UPSERT agregat reset is_read ke false saat ada actor baru", async () => {
    userC = await createTestUser("C");

    // Buat notif pertama
    await notificationService.sendNotification({
      user_id: userA.id,
      actor_id: userB.id,
      type: "ARTIFACT_BOOST",
      artifact_id: artifact.id,
    });

    // Tandai sebagai read secara manual
    await prisma.notification.updateMany({
      where: { user_id: userA.id, type: "ARTIFACT_BOOST" },
      data: { is_read: true },
    });

    // Actor baru masuk — harus reset is_read ke false
    await notificationService.sendNotification({
      user_id: userA.id,
      actor_id: userC.id,
      type: "ARTIFACT_BOOST",
      artifact_id: artifact.id,
    });

    const notif = await prisma.notification.findFirst({
      where: { user_id: userA.id, type: "ARTIFACT_BOOST" },
    });

    expect(notif?.is_read).toBe(false);
  });
});

// ── sendBatchNotifications ────────────────────────────────────────────────────

describe("notificationService.sendBatchNotifications", () => {
  beforeEach(async () => {
    userA = await createTestUser("A");
    userB = await createTestUser("B");
    userC = await createTestUser("C");
    artifact = await createTestArtifact(userA.id);
  });

  it("1. berhasil membuat multiple notifikasi sekaligus ke beberapa user", async () => {
    await notificationService.sendBatchNotifications([
      { user_id: userA.id, actor_id: userC.id, type: "NEW_DISCUSSION", artifact_id: artifact.id },
      { user_id: userB.id, actor_id: userC.id, type: "NEW_DISCUSSION", artifact_id: artifact.id },
    ]);

    const countA = await prisma.notification.count({ where: { user_id: userA.id } });
    const countB = await prisma.notification.count({ where: { user_id: userB.id } });

    expect(countA).toBe(1);
    expect(countB).toBe(1);
  });

  it("2. array kosong — tidak ada operasi DB, tidak error", async () => {
    await expect(notificationService.sendBatchNotifications([])).resolves.not.toThrow();

    const count = await prisma.notification.count({
      where: { user_id: { in: [userA.id, userB.id] } },
    });

    expect(count).toBe(0);
  });

  it("3. actor yang sama dimasukkan di daftar penerima — row actor di-skip, sisanya tetap dibuat", async () => {
    // userC adalah actor, sekaligus dimasukkan ke daftar penerima
    await notificationService.sendBatchNotifications([
      { user_id: userA.id, actor_id: userC.id, type: "NEW_DISCUSSION", artifact_id: artifact.id },
      { user_id: userC.id, actor_id: userC.id, type: "NEW_DISCUSSION", artifact_id: artifact.id }, // ini harus di-skip
    ]);

    const countA = await prisma.notification.count({ where: { user_id: userA.id } });
    const countC = await prisma.notification.count({ where: { user_id: userC.id } });

    expect(countA).toBe(1); // Tetap dibuat
    expect(countC).toBe(0); // Di-skip karena actor === penerima
  });
});

// ── markAllAsRead ─────────────────────────────────────────────────────────────

describe("notificationService.markAllAsRead", () => {
  beforeEach(async () => {
    userA = await createTestUser("A");
    userB = await createTestUser("B");
    artifact = await createTestArtifact(userA.id);
  });

  it("1. tandai semua notifikasi unread user menjadi is_read = true", async () => {
    // Buat beberapa notifikasi
    await prisma.notification.createMany({
      data: [
        {
          user_id: userA.id,
          actor_id: userB.id,
          type: "NEW_DISCUSSION",
          artifact_id: artifact.id,
          is_read: false,
        },
        {
          user_id: userA.id,
          actor_id: userB.id,
          type: "DISCUSSION_REPLY",
          artifact_id: artifact.id,
          is_read: false,
        },
      ],
    });

    await notificationService.markAllAsRead(userA.id);

    const unreadCount = await prisma.notification.count({
      where: { user_id: userA.id, is_read: false },
    });

    expect(unreadCount).toBe(0);
  });

  it("2. user tanpa notifikasi — tidak error, 0 rows updated", async () => {
    await expect(notificationService.markAllAsRead(userA.id)).resolves.not.toThrow();

    const count = await prisma.notification.count({ where: { user_id: userA.id } });
    expect(count).toBe(0);
  });

  it("3. notifikasi yang sudah is_read = true tidak berubah (idempotent)", async () => {
    // Buat 1 notif sudah dibaca, 1 belum
    await prisma.notification.createMany({
      data: [
        {
          user_id: userA.id,
          actor_id: userB.id,
          type: "NEW_DISCUSSION",
          artifact_id: artifact.id,
          is_read: true, // Sudah dibaca
        },
        {
          user_id: userA.id,
          actor_id: userB.id,
          type: "DISCUSSION_REPLY",
          artifact_id: artifact.id,
          is_read: false, // Belum dibaca
        },
      ],
    });

    await notificationService.markAllAsRead(userA.id);

    const allNotifs = await prisma.notification.findMany({
      where: { user_id: userA.id },
    });

    // Semua harus is_read = true, tidak ada yang berubah jadi false
    expect(allNotifs.every((n) => n.is_read)).toBe(true);
    expect(allNotifs).toHaveLength(2);
  });
});
