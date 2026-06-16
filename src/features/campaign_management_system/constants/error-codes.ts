import type { ErrorDef } from "@/features/inventory_management_system/shared/error-codes";

export const CAMPAIGN_ERROR = {
  NOT_FOUND: {
    code: "CAMPAIGN_NOT_FOUND",
    status: 404,
    message: {
      fr: "Campagne introuvable",
      en: "Campaign not found",
      ar: "الحملة غير موجودة",
    },
  },
  SLUG_CONFLICT: {
    code: "CAMPAIGN_SLUG_CONFLICT",
    status: 409,
    message: {
      fr: "Une campagne avec ce slug existe déjà",
      en: "A campaign with this slug already exists",
      ar: "توجد حملة بهذا المعرف بالفعل",
    },
  },
  DATE_RANGE_INVALID: {
    code: "CAMPAIGN_DATE_RANGE_INVALID",
    status: 400,
    message: {
      fr: "La date de début doit être antérieure à la date de fin",
      en: "Start date must be before end date",
      ar: "يجب أن يكون تاريخ البدء قبل تاريخ الانتهاء",
    },
  },
  ALREADY_ACTIVE: {
    code: "CAMPAIGN_ALREADY_ACTIVE",
    status: 409,
    message: {
      fr: "La campagne est déjà active",
      en: "Campaign is already active",
      ar: "الحملة نشطة بالفعل",
    },
  },
  ALREADY_INACTIVE: {
    code: "CAMPAIGN_ALREADY_INACTIVE",
    status: 409,
    message: {
      fr: "La campagne est déjà inactive",
      en: "Campaign is already inactive",
      ar: "الحملة غير نشطة بالفعل",
    },
  },
  CANNOT_DELETE_ACTIVE: {
    code: "CAMPAIGN_CANNOT_DELETE_ACTIVE",
    status: 409,
    message: {
      fr: "Impossible de supprimer une campagne active",
      en: "Cannot delete an active campaign",
      ar: "لا يمكن حذف حملة نشطة",
    },
  },
  BANNER_NOT_FOUND: {
    code: "CAMPAIGN_BANNER_NOT_FOUND",
    status: 404,
    message: {
      fr: "Bannière de campagne introuvable",
      en: "Campaign banner not found",
      ar: "لافتة الحملة غير موجودة",
    },
  },
  SECTION_NOT_FOUND: {
    code: "CAMPAIGN_SECTION_NOT_FOUND",
    status: 404,
    message: {
      fr: "Section de campagne introuvable",
      en: "Campaign section not found",
      ar: "قسم الحملة غير موجود",
    },
  },
  BANNER_LIMIT_EXCEEDED: {
    code: "CAMPAIGN_BANNER_LIMIT_EXCEEDED",
    status: 400,
    message: {
      fr: "Limite maximale de bannières dépassée pour cette campagne",
      en: "Maximum banner limit exceeded for this campaign",
      ar: "تم تجاوز الحد الأقصى للافتات لهذه الحملة",
    },
  },
  SECTION_LIMIT_EXCEEDED: {
    code: "CAMPAIGN_SECTION_LIMIT_EXCEEDED",
    status: 400,
    message: {
      fr: "Limite maximale de sections dépassée pour cette campagne",
      en: "Maximum section limit exceeded for this campaign",
      ar: "تم تجاوز الحد الأقصى للأقسام لهذه الحملة",
    },
  },
  INVALID_PAGE_SLUG: {
    code: "CAMPAIGN_INVALID_PAGE_SLUG",
    status: 400,
    message: {
      fr: "Slug de page invalide pour la section de campagne",
      en: "Invalid page slug for campaign section",
      ar: "معرف الصفحة غير صالح لقسم الحملة",
    },
  },
  ANALYTICS_FAILED: {
    code: "CAMPAIGN_ANALYTICS_FAILED",
    status: 500,
    message: {
      fr: "Échec de la récupération des analytiques de campagne",
      en: "Failed to retrieve campaign analytics",
      ar: "فشل استرداد تحليلات الحملة",
    },
  },
  SCHEDULER_NOT_FOUND: {
    code: "CAMPAIGN_SCHEDULER_NOT_FOUND",
    status: 404,
    message: {
      fr: "Campagne introuvable pour la planification",
      en: "Campaign not found for scheduling",
      ar: "الحملة غير موجودة للجدولة",
    },
  },
  SCHEDULER_CANCEL_FAILED: {
    code: "CAMPAIGN_SCHEDULER_CANCEL_FAILED",
    status: 500,
    message: {
      fr: "Échec de l'annulation des planifications en attente",
      en: "Failed to cancel pending schedules",
      ar: "فشل إلغاء الجدولات المعلقة",
    },
  },
  CACHE_GET_FAILED: {
    code: "CAMPAIGN_CACHE_GET_FAILED",
    status: 500,
    message: {
      fr: "Échec de la lecture du cache de campagne",
      en: "Failed to read campaign cache",
      ar: "فشل قراءة ذاكرة التخزين المؤقت للحملة",
    },
  },
  CACHE_SET_FAILED: {
    code: "CAMPAIGN_CACHE_SET_FAILED",
    status: 500,
    message: {
      fr: "Échec de l'écriture du cache de campagne",
      en: "Failed to write campaign cache",
      ar: "فشل كتابة ذاكرة التخزين المؤقت للحملة",
    },
  },
  CACHE_INVALIDATION_FAILED: {
    code: "CAMPAIGN_CACHE_INVALIDATION_FAILED",
    status: 500,
    message: {
      fr: "Échec de l'invalidation du cache de campagne",
      en: "Failed to invalidate campaign cache",
      ar: "فشل إبطال ذاكرة التخزين المؤقت للحملة",
    },
  },
} as const satisfies Record<string, ErrorDef>;
