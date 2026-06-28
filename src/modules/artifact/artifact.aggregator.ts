import { prisma } from "@/lib/prisma";
import { ArtifactQueryFilters, ArtifactDetail } from "./artifact.interface";
import { formatMediaUrl } from "@/modules/media/media.interface";

/**
 * Complex READ operations involving cross-module JOIN queries for Artifact domain.
 */
export const artifactAggregator = {
  async getById(id: string, currentUserId?: string): Promise<ArtifactDetail | null> {
    const artifact = await prisma.artifact.findUnique({
      where: { id },
      include: {
        author: {
          include: {
            photo_profile: true,
          },
        },
        guild: true,
        media: {
          orderBy: { order: "asc" },
        },
        tags: {
          include: { tag: true },
        },
      },
    });

    if (!artifact) return null;

    const formattedMedia = artifact.media.map((m) => ({
      ...m,
      url: formatMediaUrl(m.url) || m.url,
    }));

    const authorAvatarUrl = formatMediaUrl(artifact.author.photo_profile?.url);

    return {
      ...artifact,
      author: {
        ...artifact.author,
        photo_profile: authorAvatarUrl,
        avatarUrl: authorAvatarUrl,
        jobTitle: artifact.author.job_title || "-",
      },
      coAuthors: [],
      guildName: artifact.guild?.name || null,
      timeAgo: "Just now",
      mediaItems: formattedMedia.map((m) => ({ id: m.id, url: m.url })),
      media: formattedMedia as any,
      tags: artifact.tags.map((t) => ({ id: t.tag.id, name: t.tag.name })) as any,
      boostsCount: artifact.count_boosts,
      reducesCount: artifact.count_reduces,
      commentsCount: artifact.count_comments,
      amplifiesCount: artifact.count_amplifies,
    } as unknown as ArtifactDetail;
  },

  async getBySlug(slug: string, currentUserId?: string): Promise<ArtifactDetail | null> {
    const artifact = await prisma.artifact.findUnique({
      where: { slug },
      include: {
        author: {
          include: {
            photo_profile: true,
          },
        },
        guild: true,
        media: {
          orderBy: { order: "asc" },
        },
        tags: {
          include: { tag: true },
        },
      },
    });

    if (!artifact) return null;

    const formattedMedia = artifact.media.map((m) => ({
      ...m,
      url: formatMediaUrl(m.url) || m.url,
    }));

    const authorAvatarUrl = formatMediaUrl(artifact.author.photo_profile?.url);

    return {
      ...artifact,
      author: {
        ...artifact.author,
        photo_profile: authorAvatarUrl,
        avatarUrl: authorAvatarUrl,
        jobTitle: artifact.author.job_title || "-",
      },
      coAuthors: [],
      guildName: artifact.guild?.name || null,
      timeAgo: "Just now",
      mediaItems: formattedMedia.map((m) => ({ id: m.id, url: m.url })),
      media: formattedMedia as any,
      tags: artifact.tags.map((t) => ({ id: t.tag.id, name: t.tag.name })) as any,
      boostsCount: artifact.count_boosts,
      reducesCount: artifact.count_reduces,
      commentsCount: artifact.count_comments,
      amplifiesCount: artifact.count_amplifies,
    } as unknown as ArtifactDetail;
  },

  async getFeed(filters: ArtifactQueryFilters, currentUserId?: string) {
    return {
      items: [],
      total: 0,
      page: filters.page || 1,
      limit: filters.limit || 10,
      hasMore: false,
    };
  },
};
