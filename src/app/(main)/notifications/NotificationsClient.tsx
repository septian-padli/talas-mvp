"use client";

import React, { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  UserPlus,
  MessageSquare,
  CornerDownRight,
  AtSign,
  Eye,
  Rocket,
  Repeat,
  Megaphone,
  Bell,
  Sparkles,
} from "lucide-react";
import { useNotificationList, useMarkNotificationsAsRead } from "@/hooks/useNotifications";
import { NotificationItem } from "@/modules/notification/types/notification";
import { NotificationType } from "@prisma/client";
import AvatarUser from "@/components/ui/avataruser";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// ── Date Grouping Helper ─────────────────────────────────────────────────────
type TimeGroupKey = "Hari Ini" | "Kemarin" | "Minggu Ini" | "Lebih Lama";

function groupNotificationsByPeriod(notifications: NotificationItem[]) {
  const groups: Record<TimeGroupKey, NotificationItem[]> = {
    "Hari Ini": [],
    Kemarin: [],
    "Minggu Ini": [],
    "Lebih Lama": [],
  };

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 86400000;
  const thisWeekStart = todayStart - 6 * 86400000;

  notifications.forEach((item) => {
    const itemDate = new Date(item.updated_at || item.created_at).getTime();
    if (itemDate >= todayStart) {
      groups["Hari Ini"].push(item);
    } else if (itemDate >= yesterdayStart) {
      groups["Kemarin"].push(item);
    } else if (itemDate >= thisWeekStart) {
      groups["Minggu Ini"].push(item);
    } else {
      groups["Lebih Lama"].push(item);
    }
  });

  return groups;
}

// ── Notification Type Config ─────────────────────────────────────────────────
interface TypeMeta {
  icon: React.ElementType;
  colorClass: string;
  badgeBg: string;
  formatTitle: (item: NotificationItem) => React.ReactNode;
}

const NOTIFICATION_TYPE_META: Record<NotificationType, TypeMeta> = {
  COLLAB_INVITE: {
    icon: UserPlus,
    colorClass: "text-teal-400",
    badgeBg: "bg-teal-500/10 border-teal-500/30",
    formatTitle: (item) => (
      <>
        <strong className="font-semibold text-white">{item.actor?.name || "Seseorang"}</strong> mengundang Anda untuk berkolaborasi
      </>
    ),
  },
  COLLAB_ACCEPTED: {
    icon: UserPlus,
    colorClass: "text-emerald-400",
    badgeBg: "bg-emerald-500/10 border-emerald-500/30",
    formatTitle: (item) => (
      <>
        <strong className="font-semibold text-white">{item.actor?.name || "Seseorang"}</strong> menerima undangan kolaborasi Anda
      </>
    ),
  },
  COLLAB_REJECTED: {
    icon: UserPlus,
    colorClass: "text-rose-400",
    badgeBg: "bg-rose-500/10 border-rose-500/30",
    formatTitle: (item) => (
      <>
        <strong className="font-semibold text-white">{item.actor?.name || "Seseorang"}</strong> menolak undangan kolaborasi
      </>
    ),
  },
  NEW_DISCUSSION: {
    icon: MessageSquare,
    colorClass: "text-sky-400",
    badgeBg: "bg-sky-500/10 border-sky-500/30",
    formatTitle: (item) => (
      <>
        <strong className="font-semibold text-white">{item.actor?.name || "Seseorang"}</strong> memulai diskusi baru di karya Anda
      </>
    ),
  },
  DISCUSSION_REPLY: {
    icon: CornerDownRight,
    colorClass: "text-indigo-400",
    badgeBg: "bg-indigo-500/10 border-indigo-500/30",
    formatTitle: (item) => (
      <>
        <strong className="font-semibold text-white">{item.actor?.name || "Seseorang"}</strong> membalas diskusi Anda
      </>
    ),
  },
  USER_MENTION: {
    icon: AtSign,
    colorClass: "text-amber-400",
    badgeBg: "bg-amber-500/10 border-amber-500/30",
    formatTitle: (item) => (
      <>
        <strong className="font-semibold text-white">{item.actor?.name || "Seseorang"}</strong> menyebut Anda dalam komentar
      </>
    ),
  },
  NEW_WATCHER: {
    icon: Eye,
    colorClass: "text-cyan-400",
    badgeBg: "bg-cyan-500/10 border-cyan-500/30",
    formatTitle: (item) =>
      item.actor_count > 1 ? (
        <>
          <strong className="font-semibold text-white">{item.last_actor?.name || item.actor?.name || "Seseorang"}</strong> dan{" "}
          <strong className="font-semibold text-white">{item.actor_count - 1} lainnya</strong> mulai mengamati karya Anda
        </>
      ) : (
        <>
          <strong className="font-semibold text-white">{item.actor?.name || "Seseorang"}</strong> mulai mengamati profil Anda
        </>
      ),
  },
  ARTIFACT_BOOST: {
    icon: Rocket,
    colorClass: "text-emerald-400",
    badgeBg: "bg-emerald-500/10 border-emerald-500/30",
    formatTitle: (item) =>
      item.actor_count > 1 ? (
        <>
          <strong className="font-semibold text-white">{item.last_actor?.name || item.actor?.name || "Seseorang"}</strong> dan{" "}
          <strong className="font-semibold text-white">{item.actor_count - 1} lainnya</strong> memberikan Boost pada karya Anda
        </>
      ) : (
        <>
          <strong className="font-semibold text-white">{item.actor?.name || "Seseorang"}</strong> memberikan Boost pada karya Anda
        </>
      ),
  },
  ARTIFACT_AMPLIFY: {
    icon: Repeat,
    colorClass: "text-purple-400",
    badgeBg: "bg-purple-500/10 border-purple-500/30",
    formatTitle: (item) =>
      item.actor_count > 1 ? (
        <>
          <strong className="font-semibold text-white">{item.last_actor?.name || item.actor?.name || "Seseorang"}</strong> dan{" "}
          <strong className="font-semibold text-white">{item.actor_count - 1} lainnya</strong> mengamplifikasi karya Anda
        </>
      ) : (
        <>
          <strong className="font-semibold text-white">{item.actor?.name || "Seseorang"}</strong> mengamplifikasi karya Anda
        </>
      ),
  },
  GUILD_ANNOUNCEMENT: {
    icon: Megaphone,
    colorClass: "text-orange-400",
    badgeBg: "bg-orange-500/10 border-orange-500/30",
    formatTitle: () => `Pengumuman baru dari Serikat`,
  },
};

export default function NotificationsClient() {
  const router = useRouter();
  const { notifications, isLoading } = useNotificationList();
  const markAsReadMutation = useMarkNotificationsAsRead();

  // Trigger mark all as read on mount
  useEffect(() => {
    markAsReadMutation.mutate();
  }, []);

  const groupedNotifications = useMemo(() => {
    return groupNotificationsByPeriod(notifications);
  }, [notifications]);

  const handleNotificationClick = (item: NotificationItem) => {
    if (item.artifact) {
      let targetUrl = `/${item.artifact.author_username}/af/${item.artifact.slug}`;
      if (item.discussion?.id) {
        targetUrl += `#discussion-${item.discussion.id}`;
      }
      router.push(targetUrl);
    } else if (item.actor?.username) {
      router.push(`/profile/${item.actor.username}`);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-olive-800/40 pb-5">
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <Skeleton className="w-48 h-8 rounded-md" />
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 flex-1">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="w-3/4 h-4 rounded-md" />
                  <Skeleton className="w-1/2 h-3 rounded-md" />
                </div>
              </div>
              <Skeleton className="w-16 h-3 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const hasNotifications = notifications.length > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-olive-800/40 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Bell size={22} strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Notifikasi</h1>
            <p className="text-sm text-white/60">Pemberitahuan dan aktivitas terbaru Anda</p>
          </div>
        </div>
        {hasNotifications && (
          <span className="text-xs font-medium text-emerald-400/80 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
            {notifications.length} Total Notifikasi
          </span>
        )}
      </div>

      {/* Empty State */}
      {!hasNotifications ? (
        <div className="py-16 text-center flex flex-col items-center justify-center rounded-3xl bg-olive-900/40 border border-olive-800/40 px-4">
          <div className="w-16 h-16 rounded-2xl bg-olive-800/40 border border-olive-700/30 flex items-center justify-center text-white/40 mb-4 shadow-inner">
            <Sparkles size={32} strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">Belum Ada Notifikasi</h3>
          <p className="text-sm text-white/50 max-w-sm">
            Saat ada interaksi atau diskusi baru pada karya Anda, pemberitahuan akan muncul di sini.
          </p>
        </div>
      ) : (
        /* Grouped Notification List */
        <div className="space-y-8">
          {(Object.keys(groupedNotifications) as TimeGroupKey[]).map((period) => {
            const items = groupedNotifications[period];
            if (items.length === 0) return null;

            return (
              <div key={period} className="space-y-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40 px-1 flex items-center gap-2">
                  <span>{period}</span>
                  <span className="h-px flex-1 bg-olive-800/40" />
                </h2>
                <div className="space-y-2.5">
                  {items.map((item) => {
                    const meta = NOTIFICATION_TYPE_META[item.type] || NOTIFICATION_TYPE_META.NEW_DISCUSSION;
                    const IconComponent = meta.icon;
                    const primaryActor = item.last_actor || item.actor;
                    const isUnread = !item.is_read;

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleNotificationClick(item)}
                        className={cn(
                          "group relative p-4 rounded-2xl transition-all duration-200 cursor-pointer border flex items-start sm:items-center justify-between gap-4 select-none",
                          isUnread
                            ? "bg-emerald-950/20 border-emerald-500/30 hover:bg-emerald-950/30 hover:border-emerald-500/50 shadow-sm"
                            : "bg-olive-900/30 border-olive-800/40 hover:bg-olive-800/40 hover:border-olive-700/50"
                        )}
                      >
                        {/* Unread Indicator Dot */}
                        {isUnread && (
                          <span className="absolute top-4 right-4 sm:top-1/2 sm:-translate-y-1/2 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                        )}

                        <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                          {/* Avatar with Type Badge Overlay */}
                          <div className="relative shrink-0">
                            <AvatarUser
                              src={primaryActor?.avatarUrl}
                              name={primaryActor?.name || "Talas"}
                              className="w-12 h-12 border border-olive-700/50"
                            />
                            <div
                              className={cn(
                                "absolute -bottom-1 -right-1 p-1 rounded-lg border flex items-center justify-center bg-olive-950 shadow-md",
                                meta.badgeBg,
                                meta.colorClass
                              )}
                            >
                              <IconComponent size={13} strokeWidth={2.5} />
                            </div>
                          </div>

                          {/* Text Info */}
                          <div className="space-y-1 min-w-0 flex-1 pr-4">
                            <p className="text-sm text-white/80 font-normal leading-snug group-hover:text-white transition-colors">
                              {meta.formatTitle(item)}{" "}
                              {item.artifact && (
                                <span className="">
                                  &quot;{item.artifact.title}&quot;
                                </span>
                              )}
                            </p>
                            {item.discussion?.content && (
                              <p className="text-xs text-white/50 line-clamp-1 italic bg-white/5 px-2.5 py-1 rounded-lg border border-white/5 w-fit max-w-full mt-1">
                                &quot;{item.discussion.content}&quot;
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Timestamp */}
                        <div className="text-xs text-white/40 font-mono shrink-0 whitespace-nowrap pt-1 sm:pt-0">
                          {formatTimeAgo(new Date(item.updated_at || item.created_at))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Simple Time Ago Helper ───────────────────────────────────────────────────
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Baru saja";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}j lalu`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}j lalu`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}h lalu`;
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}
