import { prisma } from "@/lib/prisma";
import { UserQueryFilters } from "./types/user";
import { formatMediaUrl } from "@/modules/media/media.interface";

/**
 * Complex READ operations involving cross-module JOIN queries for User domain.
 */
export const userAggregator = {
  async getByUsername(username: string, currentUserId?: string) {
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        photo_profile: true,
      },
    });

    if (!user) return null;

    let is_watched_by_me = false;
    if (currentUserId && currentUserId !== user.id) {
      const watchRecord = await prisma.watchlist.findUnique({
        where: {
          watcher_id_watched_id: {
            watcher_id: currentUserId,
            watched_id: user.id,
          },
        },
      });
      is_watched_by_me = !!watchRecord;
    }

    return {
      ...user,
      photo_profile: formatMediaUrl(user.photo_profile?.url),
      is_watched_by_me,
    };
  },

  async listUsers(filters: UserQueryFilters, currentUserId?: string) {
    // TODO: Implement relational list aggregation
    return {
      items: [],
      total: 0,
      page: filters.page || 1,
      limit: filters.limit || 10,
      hasMore: false,
    };
  },
};
