import type { z } from "zod";
import type {
  media_dto,
  create_media_dto,
  update_media_dto,
  list_media_dto,
  media_usage_dto,
  create_media_usage_dto,
} from "../models/media.dto";
import type { MEDIA_KINDS, MEDIA_PROVIDERS, ENTITY_TYPES } from "../constants";

export type MediaKind = (typeof MEDIA_KINDS)[number];
export type MediaProvider = (typeof MEDIA_PROVIDERS)[number];
export type EntityType = (typeof ENTITY_TYPES)[number];

export type MediaDTO = z.infer<typeof media_dto>;
export type CreateMediaDTO = z.infer<typeof create_media_dto>;
export type UpdateMediaDTO = z.infer<typeof update_media_dto>;
export type ListMediaDTO = z.infer<typeof list_media_dto>;

export type MediaUsageDTO = z.infer<typeof media_usage_dto>;
export type CreateMediaUsageDTO = z.infer<typeof create_media_usage_dto>;

export interface MediaListItem extends MediaDTO {
  usage_count: number;
  usages?: MediaUsageDTO[];
}

export interface CroppedAreaData {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface UploadWithCropOptions {
  file: File;
  cropData?: CroppedAreaData;
  aspectRatio?: number;
  alt?: string;
  caption?: string;
  entity_type?: string;
  entity_id?: string;
  field?: string;
  is_primary?: boolean;
}

export interface MediaPickerOptions {
  multiple?: boolean;
  allowed_types?: string[];
  max_files?: number;
  entity_type?: string;
  entity_id?: string;
  field?: string;
}

export interface ImageSize {
  width: number;
  height: number;
  size: number;
  storage_key: string;
  url: string;
  format: string;
}

export interface ImageSizes {
  thumbnail: ImageSize;
  medium: ImageSize;
  original: ImageSize;
}

export interface UploadResult {
  id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  kind: MediaKind;
  size: number;
  width: number | null;
  height: number | null;
  url: string;
  storage_key: string;
  provider: MediaProvider;
  alt: string | null;
  caption: string | null;
  is_public: boolean;
  uploaded_by: string | null;
  variants?: ImageSizes;
  blur_hash?: string | null;
}

export interface UploadValidation {
  valid: boolean;
  error?: string;
  warnings?: string[];
  sanitized_svg?: string;
}
