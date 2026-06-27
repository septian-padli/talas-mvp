import { prisma } from "@/lib/prisma";

/**
 * Complex READ operations involving cross-module JOIN queries for Media domain.
 */
export const mediaAggregator = {
  async getByArtifactId(artifactId: string) {
    return prisma.media.findMany({
      where: { artifact_id: artifactId },
      orderBy: { order: "asc" },
    });
  },

  async getDetailById(id: string) {
    return prisma.media.findUnique({
      where: { id },
    });
  },
};
