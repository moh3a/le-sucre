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
  INVALID_IMAGE: {
    code: "MEDIA_INVALID_IMAGE",
    status: 400,
    message: {
      fr: "Image invalide ou corrompue",
      en: "Invalid or corrupted image",
      ar: "صورة غير صالحة أو تالفة",
    },
  },
  DIMENSION_EXCEEDED: {
    code: "MEDIA_DIMENSION_EXCEEDED",
    status: 400,
    message: {
      fr: "Dimensions de l'image trop grandes",
      en: "Image dimensions too large",
      ar: "أبعاد الصورة كبيرة جداً",
    },
  },
  OPTIMIZATION_FAILED: {
    code: "MEDIA_OPTIMIZATION_FAILED",
    status: 500,
    message: {
      fr: "Échec de l'optimisation de l'image",
      en: "Image optimization failed",
      ar: "فشل تحسين الصورة",
    },
  },
  RATE_LIMITED: {
    code: "MEDIA_RATE_LIMITED",
    status: 429,
    message: {
      fr: "Trop de requêtes, veuillez réessayer plus tard",
      en: "Too many requests, please try again later",
      ar: "طلبات كثيرة جداً، يرجى المحاولة لاحقاً",
    },
  },
  QUOTA_EXCEEDED: {
    code: "MEDIA_QUOTA_EXCEEDED",
    status: 429,
    message: {
      fr: "Quota d'importation dépassé",
      en: "Upload quota exceeded",
      ar: "تجاوز حد الرفع",
    },
  },
  SUSPICIOUS_FILE: {
    code: "MEDIA_SUSPICIOUS_FILE",
    status: 400,
    message: {
      fr: "Fichier suspect détecté",
      en: "Suspicious file detected",
      ar: "تم اكتشاف ملف مشبوه",
    },
  },
  SVG_SANITIZATION_FAILED: {
    code: "MEDIA_SVG_SANITIZATION_FAILED",
    status: 400,
    message: {
      fr: "Le fichier SVG contient du contenu non autorisé",
      en: "SVG file contains disallowed content",
      ar: "ملف SVG يحتوي على محتوى غير مسموح",
    },
  },
  MIME_MISMATCH: {
    code: "MEDIA_MIME_MISMATCH",
    status: 400,
    message: {
      fr: "Le type MIME déclaré ne correspond pas au contenu du fichier",
      en: "Declared MIME type does not match file content",
      ar: "نوع MIME المعلن لا يتطابق مع محتوى الملف",
    },
  },
  PATH_TRAVERSAL: {
    code: "MEDIA_PATH_TRAVERSAL",
    status: 400,
    message: {
      fr: "Tentative de path traversal détectée",
      en: "Path traversal attempt detected",
      ar: "تم اكتشاف محاولة اختراق المسار",
    },
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

export const ALLOWED_EXTENSIONS = [
  ".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".svg",
  ".mp4", ".webm", ".ogg",
  ".pdf", ".doc", ".docx",
] as const;

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

export const IMAGE_OPTIMIZATION = {
  THUMBNAIL_WIDTH: 150,
  THUMBNAIL_HEIGHT: 150,
  MEDIUM_WIDTH: 800,
  MEDIUM_HEIGHT: 800,
  QUALITY: 82,
  BLUR_SIZE: 32,
  BLUR_QUALITY: 30,
  MAX_DIMENSION_WIDTH: 10000,
  MAX_DIMENSION_HEIGHT: 10000,
  MAX_MEGAPIXELS: 50,
} as const;

export const UPLOAD_LIMITS = {
  MAX_FILES_PER_UPLOAD: 10,
  MAX_TOTAL_UPLOAD_SIZE: 200 * 1024 * 1024,
  MAX_FILENAME_LENGTH: 255,
  UPLOAD_RATE_LIMIT: 50,
  UPLOAD_RATE_WINDOW_HOURS: 1,
  MAX_SVG_SIZE: 1024 * 1024,
} as const;
