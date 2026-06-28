import { prisma } from "@/lib/prisma";
import { CreateArtifactInput } from "../types/artifact";

export const artifactService = {
  async findBySlug(slug: string) {
    return prisma.artifact.findUnique({
      where: { slug },
      include: {
        author: true,
        media: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  },

  async create(data: any): Promise<any> {
    return null;
  },

  async update(id: string, authorId: string, data: any): Promise<any> {
    return null;
  },

  async delete(id: string, authorId: string): Promise<boolean> {
    return true;
  },

  async archive(id: string, authorId: string): Promise<any> {
    return null;
  },

  async createArtifact(authorId: string, data: CreateArtifactInput) {
    if (!data.title || !data.title.trim()) {
      throw { code: "VALIDATION_ERROR", message: "Judul karya wajib diisi." };
    }

    if (data.title.trim().length > 150) {
      throw { code: "TITLE_TOO_LONG", message: "Judul karya maksimal 150 karakter." };
    }

    // 1. Generate base slug from title
    const baseSlug = data.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    // 2. Author Duplicate Title Constraint Check
    const authorExisting = await prisma.artifact.findFirst({
      where: {
        author_id: authorId,
        slug: baseSlug,
      },
    });

    if (authorExisting) {
      throw {
        code: "DUPLICATE_TITLE",
        message: "Judul karya ini sudah pernah Anda gunakan. Silakan gunakan judul lain.",
      };
    }

    // 3. Check global slug collision & append suffix per AGENTS.md Rule 3.2
    let finalSlug = baseSlug;
    const globalExisting = await prisma.artifact.findUnique({
      where: { slug: baseSlug },
    });

    if (globalExisting) {
      finalSlug = `${baseSlug}-${Date.now().toString(36)}`;
    }

    // 4. Resolve and Upsert Tags by Slug
    const tagIdsToConnect: string[] = [];
    if (data.tags && data.tags.length > 0) {
      for (const rawTag of data.tags) {
        const cleanName = rawTag.trim();
        if (!cleanName) continue;
        const tagSlug = cleanName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");
        if (!tagSlug) continue;

        const tagRecord = await prisma.tag.upsert({
          where: { slug: tagSlug },
          create: {
            name: cleanName,
            slug: tagSlug,
          },
          update: {},
        });
        if (!tagIdsToConnect.includes(tagRecord.id)) {
          tagIdsToConnect.push(tagRecord.id);
        }
      }
    }

    // 5. Create Artifact, Media, and ArtifactTag records
    const artifact = await prisma.artifact.create({
      data: {
        author_id: authorId,
        title: data.title.trim(),
        slug: finalSlug,
        content: data.content,
        guild_id: data.guild_id || null,
        media:
          data.media && data.media.length > 0
            ? {
                create: data.media.map((m, idx) => ({
                  url: m.url,
                  caption: m.caption || null,
                  order: m.order !== undefined ? m.order : idx,
                  size: m.size || 0,
                })),
              }
            : undefined,
        tags:
          tagIdsToConnect.length > 0
            ? {
                create: tagIdsToConnect.map((tagId) => ({
                  tag_id: tagId,
                })),
              }
            : undefined,
      },
      include: {
        media: true,
        tags: {
          include: {
            tag: true,
          },
        },
        author: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    });

    return artifact;
  },
};
