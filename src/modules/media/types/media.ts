/**
 * ==========================================
 * MEDIA DOMAIN TYPES & INTERFACES (DRY & MODULAR)
 * ==========================================
 */

// 1. BASE MEDIA INTERFACE (Shared core fields across media components)
export interface MediaBase {
  id: string;
  url: string;
  caption?: string | null;
  order: number;
}

// 2. MEDIA METADATA INTERFACE (File size & creation timestamp)
export interface MediaMetadata {
  size: number;
  created_at: Date;
}

// ==========================================
// VIEW MODELS (ITEM & DETAIL)
// ==========================================

/**
 * Lean View Model for Media Cards / Carousel previews
 */
export interface MediaItem extends MediaBase {
  artifact_id: string | null;
}

/**
 * Full Relational Media Detail View Model
 */
export interface MediaDetail extends MediaBase, MediaMetadata {
  artifact_id: string | null;
}

// ==========================================
// INPUT DTOs & PRESIGNED URL PAYLOADS
// ==========================================

/**
 * DTO for requesting a Cloudflare R2 Presigned Upload URL directly from the client browser
 */
export interface RequestPresignedUrlDTO {
  filename: string;
  fileType: string;
  fileSize: number;
  artifact_id?: string;
  folder?: "avatars" | "artifacts";
}

/**
 * Response payload containing presigned PUT URL for direct R2 S3 uploads
 */
export interface PresignedUrlResponse {
  uploadUrl: string;
  fileKey: string;
  publicUrl: string;
}

/**
 * DTO for creating a single Media database record after successful R2 upload
 */
export interface CreateMediaDTO {
  artifact_id?: string | null;
  url: string;
  size?: number;
  caption?: string | null;
  order?: number;
}

/**
 * DTO for batch saving multiple uploaded media items
 */
export interface BatchCreateMediaDTO {
  artifact_id: string;
  items: Array<{
    url: string;
    size?: number;
    caption?: string | null;
    order?: number;
  }>;
}

/**
 * DTO for updating media caption or order sequence
 */
export interface UpdateMediaDTO {
  caption?: string | null;
  order?: number;
}

// ==========================================
// API RESPONSE PAYLOADS
// ==========================================

export interface MediaResponse {
  success: boolean;
  message?: string;
  data: MediaDetail;
}

export interface MediaListResponse {
  items: MediaItem[];
  total: number;
}
