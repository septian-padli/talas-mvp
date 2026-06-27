import { AuthType, JobStatus } from "@prisma/client";

/**
 * ==========================================
 * USER DOMAIN TYPES & INTERFACES (DRY & MODULAR)
 * ==========================================
 */

// 1. BASE USER INTERFACE (Shared scalar fields across list & detail views)
export interface UserBase {
  id: string;
  username: string;
  name: string;
  photo_profile?: string | null;
  job_title?: string | null;
  job_status?: JobStatus | null;
  is_verified: boolean;
}

// 2. DENORMALIZED COUNTERS INTERFACE (Matching Prisma schema counters)
export interface UserCounters {
  count_artifacts: number;
  count_watcher: number;
  count_watchlist: number;
  count_amplify: number;
  count_collection: number;
  count_discussion: number;
}

// 3. SOCIAL LINKS INTERFACE
export interface UserSocialLinks {
  github?: string | null;
  linkedin?: string | null;
}

// ==========================================
// VIEW MODELS (LIST & DETAIL)
// ==========================================

/**
 * Lean View Model for User Directory, Search Results, & Cards
 */
export interface UserListItem extends UserBase {
  bio?: string | null;
  count_artifacts: number;
  count_watcher: number;
  created_at: Date;

  // Contextual Social State (if current user is authenticated)
  is_watched_by_me?: boolean;
}

/**
 * Comprehensive View Model for Full User Profile Page
 */
export interface UserDetail extends UserBase, UserCounters, UserSocialLinks {
  email: string;
  auth_type: AuthType;
  bio?: string | null;
  created_at: Date;
  updated_at: Date;

  // Contextual Social State (if current user is authenticated)
  is_watched_by_me?: boolean;
}

// ==========================================
// INPUT DTOs & FILTERS
// ==========================================

export interface UserQueryFilters {
  search?: string;
  job_status?: JobStatus;
  is_verified?: boolean;
  page?: number;
  limit?: number;
  sortBy?: "latest" | "popular" | "artifacts";
}

export interface UpdateUserProfileDTO {
  name?: string;
  job_title?: string | null;
  job_status?: JobStatus | null;
  bio?: string | null;
  github?: string | null;
  linkedin?: string | null;
  photo_profile?: string | null;
  photo_profile_id?: string | null;
}

// ==========================================
// API RESPONSE PAYLOADS
// ==========================================

export interface UserResponse {
  success: boolean;
  message?: string;
  data: UserDetail;
}

export interface UserListResponse {
  items: UserListItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
