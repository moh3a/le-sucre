import type { ErrorDef } from "@/features/inventory_management_system/shared/error-codes";

export const MEDIA_ERROR = {
  NOT_FOUND: {
    code: "MEDIA_NOT_FOUND",
    status: 404,
    message: { fr: "Fichier introuvable", en: "Media not found", ar: "الوسائط غير موجودة" },
  },
  UPLOAD_FAILED: {
    code: "MEDIA_UPLOAD_FAILED",
    status: 400,
    message: { fr: "Échec de l'importation", en: "Upload failed", ar: "فشل الرفع" },
  },
  DELETE_FAILED: {
    code: "MEDIA_DELETE_FAILED",
    status: 400,
    message: { fr: "Échec de la suppression", en: "Delete failed", ar: "فشل الحذف" },
  },
  INVALID_FILE_TYPE: {
    code: "MEDIA_INVALID_FILE_TYPE",
    status: 400,
    message: {
      fr: "Type de fichier non autorisé",
      en: "Invalid file type",
      ar: "نوع الملف غير مسموح",
    },
  },
  FILE_TOO_LARGE: {
    code: "MEDIA_FILE_TOO_LARGE",
    status: 400,
    message: { fr: "Fichier trop volumineux", en: "File too large", ar: "الملف كبير جداً" },
  },
  USAGE_NOT_FOUND: {
    code: "MEDIA_USAGE_NOT_FOUND",
    status: 404,
    message: { fr: "Utilisation introuvable", en: "Usage not found", ar: "الاستخدام غير موجود" },
  },
} as const satisfies Record<string, ErrorDef>;

export const MEDIA_KINDS = ["image", "video", "document", "audio"] as const;

export const MEDIA_PROVIDERS = ["local", "s3", "cdn"] as const;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/svg+xml",
] as const;

export const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg"] as const;

export const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024;
export const MAX_DOCUMENT_SIZE = 20 * 1024 * 1024;

export const ENTITY_TYPES = [
  "product",
  "category",
  "brand",
  "variant",
  "page",
  "banner",
  "campaign",
  "review",
  "user",
  "collection",
] as const;
