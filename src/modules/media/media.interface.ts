import { Media } from "@prisma/client";
import {
  CreateMediaDTO,
  BatchCreateMediaDTO,
  UpdateMediaDTO,
  RequestPresignedUrlDTO,
  PresignedUrlResponse,
  MediaItem,
  MediaDetail,
} from "./types/media";

export * from "./types/media";
export * from "./utils/mediaUrl";

/**
 * Data contracts, type definitions, DTOs, and cross-module facades for Media module.
 * External modules MUST communicate with Media domain exclusively through this interface file.
 */

export interface IMediaService {
  getById(id: string): Promise<Media | null>;
  create(data: CreateMediaDTO): Promise<Media>;
  batchCreate(data: BatchCreateMediaDTO): Promise<Media[]>;
  update(id: string, data: UpdateMediaDTO): Promise<Media>;
  delete(id: string): Promise<boolean>;
  getPresignedUploadUrl(data: RequestPresignedUrlDTO): Promise<PresignedUrlResponse>;
}

export interface IMediaAggregator {
  getByArtifactId(artifactId: string): Promise<MediaItem[]>;
  getDetailById(id: string): Promise<MediaDetail | null>;
}

// Service Facade (Strict WRITE Operations)
export const MediaService: IMediaService = {
  async getById(id: string) {
    const { mediaService } = await import("./services/media.service");
    return mediaService.getById(id);
  },
  async create(data: CreateMediaDTO) {
    const { mediaService } = await import("./services/media.service");
    return mediaService.create(data);
  },
  async batchCreate(data: BatchCreateMediaDTO) {
    const { mediaService } = await import("./services/media.service");
    return mediaService.batchCreate(data);
  },
  async update(id: string, data: UpdateMediaDTO) {
    const { mediaService } = await import("./services/media.service");
    return mediaService.update(id, data);
  },
  async delete(id: string) {
    const { mediaService } = await import("./services/media.service");
    return mediaService.delete(id);
  },
  async getPresignedUploadUrl(data: RequestPresignedUrlDTO) {
    const { mediaService } = await import("./services/media.service");
    return mediaService.getPresignedUploadUrl(data);
  },
};

// Aggregator Facade (Permissive READ Operations & JOINs)
export const MediaAggregator: IMediaAggregator = {
  async getByArtifactId(artifactId: string) {
    const { mediaAggregator } = await import("./media.aggregator");
    return mediaAggregator.getByArtifactId(artifactId);
  },
  async getDetailById(id: string) {
    const { mediaAggregator } = await import("./media.aggregator");
    return mediaAggregator.getDetailById(id);
  },
};
