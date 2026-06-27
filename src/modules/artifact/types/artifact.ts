import { CollabStatusType } from "@prisma/client";
import { UserListItem, UserBase } from "@/modules/user/types/user";
import { MediaItem } from "@/modules/media/types/media";

/**
 * ==========================================
 * ARTIFACT DOMAIN TYPES & INTERFACES
 * 100% Aligned with Prisma Database Schema
 * ==========================================
 */

// 1. BASE ARTIFACT INTERFACE (Direct 1:1 mapping with Artifact database table columns)
export interface ArtifactBase {
  id: string;
  slug: string;
  author_id: string;
  guild_id: string | null;
  title: string;
  content: string;
  is_archived: boolean;

  // Denormalized Counters
  count_boosts: number;
  count_reduces: number;
  count_comments: number;
  count_amplifies: number;

  // Timestamps
  created_at: Date;
  updated_at: Date;
}

// 2. RELATIONAL ENTITY SUMMARIES (Mapped from Prisma relations)

/** UI / Presentation summary for artifact author */
export interface ArtifactAuthorSummary {
  id?: string;
  name: string;
  username: string;
  photo_profile?: string | null;
  avatarUrl?: string | null;
  job_title?: string | null;
  jobTitle?: string | null;
  is_verified?: boolean;
  coAuthorsCount?: number;
}

/** Mapped from Guild model */
export interface ArtifactGuildSummary {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
}

/** Mapped from Collaboration junction model */
export interface ArtifactCoAuthor {
  id: string;
  user_id: string;
  artifact_id: string;
  status: CollabStatusType;
  created_at: Date;
  updated_at: Date;
  user: UserBase;
}

/** Mapped from Tag model via ArtifactTag junction */
export interface ArtifactTagItem {
  id: string;
  name: string;
}

/** Engagement type helper */
export type ArtifactUserVote = "BOOST" | "REDUCE" | null;

// ==========================================
// VIEW MODELS (LIST & DETAIL FOR AGGREGATORS)
// ==========================================

/**
 * Lean View Model for Feeds and List Aggregations
 */
export interface ArtifactListItem extends ArtifactBase {
  snippet: string; // Truncated preview content

  // Relations
  author: UserListItem;
  guild: ArtifactGuildSummary | null;
  media: MediaItem[];
  tags: ArtifactTagItem[];

  // Contextual User Engagement (if authenticated)
  userEngagement?: {
    hasBoosted: boolean;
    hasReduced: boolean;
    isCollected: boolean;
    isAmplified: boolean;
  };
}

/**
 * Comprehensive View Model for Full Single Artifact Page Aggregations
 */
export interface ArtifactDetail extends ArtifactBase {
  // Relations
  author: UserListItem;
  guild: ArtifactGuildSummary | null;
  coAuthors: ArtifactCoAuthor[];
  media: MediaItem[];
  tags: ArtifactTagItem[];

  // Contextual User Engagement (if authenticated)
  userEngagement?: {
    hasBoosted: boolean;
    hasReduced: boolean;
    isCollected: boolean;
    isAmplified: boolean;
  };
}

/**
 * Frontend Presentation Model (Bridge for UI components until card design alignment)
 */
export interface ArtifactData {
  id: string;
  slug?: string;
  author_id?: string;
  guild_id?: string | null;
  title: string;
  content: string;
  is_archived?: boolean;
  author: ArtifactAuthorSummary;
  guild?: ArtifactGuildSummary | null;
  guildName?: string | null;
  timeAgo: string;
  mediaItems?: Array<{ id: string; url?: string; alt?: string }>;
  media?: MediaItem[];
  tags?: ArtifactTagItem[] | string[];
  count_boosts?: number;
  boostsCount?: number;
  count_reduces?: number;
  reducesCount?: number;
  count_comments?: number;
  commentsCount?: number;
  count_amplifies?: number;
  amplifiesCount?: number;
  isCollected?: boolean;
  isAmplified?: boolean;
  userVote?: ArtifactUserVote;
}

// ==========================================
// INPUT DTOs & QUERY FILTERS
// ==========================================

export interface CreateArtifactDTO {
  author_id: string;
  title: string;
  content: string;
  guild_id?: string | null;
  tags?: string[];
  coAuthorIds?: string[];
}

export interface UpdateArtifactDTO {
  title?: string;
  content?: string;
  guild_id?: string | null;
  tags?: string[];
  is_archived?: boolean;
}

export interface ArtifactQueryFilters {
  guild_id?: string;
  author_id?: string;
  tag?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "latest" | "popular" | "trending";
}

// ==========================================
// API RESPONSE PAYLOADS
// ==========================================

export interface ArtifactResponse {
  success: boolean;
  message?: string;
  data: ArtifactDetail;
}

export interface ArtifactListResponse {
  items: ArtifactListItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
