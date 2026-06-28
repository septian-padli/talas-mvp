import {
  DiscussionItem,
  CreateDiscussionInput,
  DiscussionQueryFilters,
  DiscussionListResponse,
} from "./types/discussion";

export * from "./types/discussion";

/**
 * Data contracts, type definitions, DTOs, and cross-module facades for Discussion module.
 * External modules MUST communicate with Discussion domain exclusively through this interface.
 */

export interface IDiscussionService {
  getById(id: string): Promise<DiscussionItem | null>;
  createDiscussion(userId: string, data: CreateDiscussionInput): Promise<DiscussionItem>;
}

export interface IDiscussionAggregator {
  getByArtifactId(artifactId: string, currentUserId?: string): Promise<DiscussionItem[]>;
}

export const DiscussionService: IDiscussionService = {
  async getById(id: string) {
    const { discussionService } = await import("./services/discussion.service");
    return discussionService.getById(id);
  },
  async createDiscussion(userId, data) {
    const { discussionService } = await import("./services/discussion.service");
    return discussionService.createDiscussion(userId, data);
  },
};

export const DiscussionAggregator: IDiscussionAggregator = {
  async getByArtifactId(artifactId, currentUserId) {
    const { discussionAggregator } = await import("./discussion.aggregator");
    return discussionAggregator.getByArtifactId(artifactId, currentUserId);
  },
};
