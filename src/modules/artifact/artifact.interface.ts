import { Artifact } from "@prisma/client";
import {
  CreateArtifactDTO,
  UpdateArtifactDTO,
  ArtifactQueryFilters,
  ArtifactDetail,
  ArtifactListResponse,
} from "./types/artifact";

export * from "./types/artifact";

/**
 * Data contracts, type definitions, DTOs, and cross-module facades for Artifact module.
 * External modules MUST communicate with Artifact domain exclusively through this interface file.
 */

export interface IArtifactService {
  create(data: CreateArtifactDTO): Promise<Artifact>;
  update(id: string, authorId: string, data: UpdateArtifactDTO): Promise<Artifact>;
  delete(id: string, authorId: string): Promise<boolean>;
  archive(id: string, authorId: string): Promise<Artifact>;
}

export interface IArtifactAggregator {
  getById(id: string, currentUserId?: string): Promise<ArtifactDetail | null>;
  getBySlug(slug: string, currentUserId?: string): Promise<ArtifactDetail | null>;
  getFeed(filters: ArtifactQueryFilters, currentUserId?: string): Promise<ArtifactListResponse>;
}

// Service Facade (Strict WRITE Operations)
export const ArtifactService: IArtifactService = {
  async create(data) {
    const { artifactService } = await import("./services/artifact.service");
    return artifactService.create(data);
  },
  async update(id, authorId, data) {
    const { artifactService } = await import("./services/artifact.service");
    return artifactService.update(id, authorId, data);
  },
  async delete(id, authorId) {
    const { artifactService } = await import("./services/artifact.service");
    return artifactService.delete(id, authorId);
  },
  async archive(id, authorId) {
    const { artifactService } = await import("./services/artifact.service");
    return artifactService.archive(id, authorId);
  },
};

// Aggregator Facade (Permissive READ Operations & JOINs)
export const ArtifactAggregator: IArtifactAggregator = {
  async getById(id, currentUserId) {
    const { artifactAggregator } = await import("./artifact.aggregator");
    return artifactAggregator.getById(id, currentUserId);
  },
  async getBySlug(slug, currentUserId) {
    const { artifactAggregator } = await import("./artifact.aggregator");
    return artifactAggregator.getBySlug(slug, currentUserId);
  },
  async getFeed(filters, currentUserId) {
    const { artifactAggregator } = await import("./artifact.aggregator");
    return artifactAggregator.getFeed(filters, currentUserId);
  },
};
