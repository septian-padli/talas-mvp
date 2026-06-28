import { prisma } from "@/lib/prisma";
import { formatMediaUrl } from "@/modules/media/media.interface";
import { DiscussionItem } from "./types/discussion";

/**
 * Complex READ operations involving cross-module JOIN queries for Discussion domain.
 */
export const discussionAggregator = {
  async getByArtifactId(artifactId: string, currentUserId?: string): Promise<DiscussionItem[]> {
    const rootDiscussions = await prisma.discussion.findMany({
      where: {
        artifact_id: artifactId,
        parent_id: null,
      },
      include: {
        user: {
          include: {
            photo_profile: true,
          },
        },
        replies: {
          include: {
            user: {
              include: {
                photo_profile: true,
              },
            },
            replies: {
              include: {
                user: {
                  include: {
                    photo_profile: true,
                  },
                },
              },
              orderBy: { created_at: "desc" },
            },
          },
          orderBy: { created_at: "desc" },
        },
      },
      orderBy: { created_at: "desc" },
    });

    const formatDiscussion = (item: any, depth: number): DiscussionItem => {
      const avatarUrl = formatMediaUrl(item.user.photo_profile?.url);
      const formattedReplies =
        item.replies && item.replies.length > 0
          ? item.replies.map((reply: any) => formatDiscussion(reply, Math.min(3, depth + 1)))
          : [];

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
        repliesCount: item.count_replies || formattedReplies.length,
        userVote: null,
        depth,
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
        replies: formattedReplies,
      };
    };

    return rootDiscussions.map((item) => formatDiscussion(item, 1));
  },
};
