export type DiscussionUserVote = "BOOST" | "REDUCE" | null;

export interface DiscussionAuthor {
  id: string;
  name: string;
  username: string;
  jobTitle?: string | null;
  photo_profile?: string | null;
  avatarUrl?: string | null;
}

export interface DiscussionItem {
  id: string;
  artifact_id: string;
  parent_id?: string | null;
  content: string;
  count_boosts: number;
  count_reduces: number;
  count_replies: number;
  boostsCount?: number;
  reducesCount?: number;
  repliesCount?: number;
  userVote?: DiscussionUserVote;
  depth?: number;
  timeAgo?: string;
  created_at?: Date | string;
  updated_at?: Date | string;
  author: DiscussionAuthor;
  replies?: DiscussionItem[];
}

export interface CreateDiscussionInput {
  artifact_id: string;
  content: string;
  parent_id?: string | null;
}

export interface DiscussionQueryFilters {
  artifact_id: string;
  parent_id?: string | null;
  page?: number;
  limit?: number;
}

export interface DiscussionListResponse {
  items: DiscussionItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
