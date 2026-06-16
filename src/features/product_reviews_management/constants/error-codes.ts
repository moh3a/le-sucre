import type { ErrorDef } from "@/features/inventory_management_system/shared/error-codes";

export const REVIEW_ERROR = {
  NOT_FOUND: {
    code: "REVIEW_NOT_FOUND",
    status: 404,
    message: {
      fr: "Avis introuvable",
      en: "Review not found",
      ar: "المراجعة غير موجودة",
    },
  },
  PRODUCT_NOT_FOUND: {
    code: "REVIEW_PRODUCT_NOT_FOUND",
    status: 404,
    message: {
      fr: "Produit introuvable pour l'avis",
      en: "Product not found for review",
      ar: "المنتج غير موجود للمراجعة",
    },
  },
  ALREADY_EXISTS: {
    code: "REVIEW_ALREADY_EXISTS",
    status: 409,
    message: {
      fr: "Vous avez déjà évalué ce produit",
      en: "You have already reviewed this product",
      ar: "لقد قمت بتقييم هذا المنتج بالفعل",
    },
  },
  RATING_INVALID: {
    code: "REVIEW_RATING_INVALID",
    status: 400,
    message: {
      fr: "La note doit être comprise entre 1 et 5",
      en: "Rating must be between 1 and 5",
      ar: "يجب أن يكون التقييم بين 1 و 5",
    },
  },
  CONTENT_TOO_SHORT: {
    code: "REVIEW_CONTENT_TOO_SHORT",
    status: 400,
    message: {
      fr: "Le contenu de l'avis est trop court",
      en: "Review content is too short",
      ar: "محتوى المراجعة قصير جداً",
    },
  },
  CONTENT_TOO_LONG: {
    code: "REVIEW_CONTENT_TOO_LONG",
    status: 400,
    message: {
      fr: "Le contenu de l'avis dépasse la longueur maximale",
      en: "Review content exceeds maximum length",
      ar: "محتوى المراجعة يتجاوز الحد الأقصى للطول",
    },
  },
  SPAM_DETECTED: {
    code: "REVIEW_SPAM_DETECTED",
    status: 429,
    message: {
      fr: "Avis signalé comme spam, veuillez réessayer plus tard",
      en: "Review flagged as spam, please try later",
      ar: "تم وضع علامة على المراجعة كبريد عشوائي",
    },
  },
  PURCHASE_REQUIRED: {
    code: "REVIEW_PURCHASE_REQUIRED",
    status: 403,
    message: {
      fr: "Seuls les acheteurs vérifiés peuvent évaluer ce produit",
      en: "Only verified purchasers can review this product",
      ar: "يمكن للمشترين الموثقين فقط تقييم هذا المنتج",
    },
  },
  NOT_PURCHASED: {
    code: "REVIEW_NOT_PURCHASED",
    status: 403,
    message: {
      fr: "Vous n'avez pas acheté ce produit",
      en: "You have not purchased this product",
      ar: "لم تقم بشراء هذا المنتج",
    },
  },
  CACHE_GET_FAILED: {
    code: "REVIEW_CACHE_GET_FAILED",
    status: 500,
    message: {
      fr: "Échec de la lecture du cache des avis",
      en: "Failed to read review cache",
      ar: "فشل قراءة ذاكرة التخزين المؤقت للمراجعات",
    },
  },
  CACHE_SET_FAILED: {
    code: "REVIEW_CACHE_SET_FAILED",
    status: 500,
    message: {
      fr: "Échec de l'écriture du cache des avis",
      en: "Failed to write review cache",
      ar: "فشل كتابة ذاكرة التخزين المؤقت للمراجعات",
    },
  },
  CACHE_INVALIDATION_FAILED: {
    code: "REVIEW_CACHE_INVALIDATION_FAILED",
    status: 500,
    message: {
      fr: "Échec de l'invalidation du cache des avis",
      en: "Failed to invalidate review cache",
      ar: "فشل إبطال ذاكرة التخزين المؤقت للمراجعات",
    },
  },
} as const satisfies Record<string, ErrorDef>;

export const REPORT_ERROR = {
  NOT_FOUND: {
    code: "REPORT_NOT_FOUND",
    status: 404,
    message: {
      fr: "Signalement introuvable",
      en: "Report not found",
      ar: "البلاغ غير موجود",
    },
  },
  ALREADY_EXISTS: {
    code: "REPORT_ALREADY_EXISTS",
    status: 409,
    message: {
      fr: "Vous avez déjà signalé cet avis",
      en: "You have already reported this review",
      ar: "لقد أبلغت عن هذه المراجعة بالفعل",
    },
  },
  REASON_INVALID: {
    code: "REPORT_REASON_INVALID",
    status: 400,
    message: {
      fr: "Motif de signalement invalide",
      en: "Invalid report reason",
      ar: "سبب البلاغ غير صالح",
    },
  },
  REVIEW_NOT_FOUND: {
    code: "REPORT_REVIEW_NOT_FOUND",
    status: 404,
    message: {
      fr: "Avis introuvable pour le signalement",
      en: "Review not found for reporting",
      ar: "المراجعة غير موجودة للتبليغ",
    },
  },
} as const satisfies Record<string, ErrorDef>;

export const MODERATION_ERROR = {
  REVIEW_NOT_FOUND: {
    code: "MODERATION_REVIEW_NOT_FOUND",
    status: 404,
    message: {
      fr: "Avis introuvable pour la modération",
      en: "Review not found for moderation",
      ar: "المراجعة غير موجودة للمراجعة",
    },
  },
  ALREADY_APPROVED: {
    code: "MODERATION_ALREADY_APPROVED",
    status: 409,
    message: {
      fr: "L'avis est déjà approuvé",
      en: "Review is already approved",
      ar: "المراجعة معتمدة بالفعل",
    },
  },
  ALREADY_REJECTED: {
    code: "MODERATION_ALREADY_REJECTED",
    status: 409,
    message: {
      fr: "L'avis est déjà rejeté",
      en: "Review is already rejected",
      ar: "المراجعة مرفوضة بالفعل",
    },
  },
  ACTION_INVALID: {
    code: "MODERATION_ACTION_INVALID",
    status: 400,
    message: {
      fr: "Action de modération invalide",
      en: "Invalid moderation action",
      ar: "إجراء المراجعة غير صالح",
    },
  },
  STATS_FAILED: {
    code: "MODERATION_STATS_FAILED",
    status: 500,
    message: {
      fr: "Échec de la récupération des statistiques de modération",
      en: "Failed to retrieve moderation statistics",
      ar: "فشل استرداد إحصائيات المراجعة",
    },
  },
  TRENDS_FAILED: {
    code: "MODERATION_TRENDS_FAILED",
    status: 500,
    message: {
      fr: "Échec de la récupération des tendances d'évaluation",
      en: "Failed to retrieve rating trends",
      ar: "فشل استرداد اتجاهات التقييم",
    },
  },
} as const satisfies Record<string, ErrorDef>;

export const HELPFUL_ERROR = {
  REVIEW_NOT_FOUND: {
    code: "HELPFUL_REVIEW_NOT_FOUND",
    status: 404,
    message: {
      fr: "Avis introuvable",
      en: "Review not found",
      ar: "المراجعة غير موجودة",
    },
  },
  ALREADY_VOTED: {
    code: "HELPFUL_ALREADY_VOTED",
    status: 409,
    message: {
      fr: "Vous avez déjà voté cet avis comme utile",
      en: "You have already voted this review as helpful",
      ar: "لقد صوتت بالفعل على هذه المراجعة كمفيدة",
    },
  },
} as const satisfies Record<string, ErrorDef>;
