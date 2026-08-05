import { AppError } from "@/lib/error_handling";

export type DrizzleErrorDef = {
  code: string;
  status: number;
  message: {
    fr: string;
    en: string;
    ar: string;
  };
};

const DRIZZLE_ERROR_MAP: Record<number, DrizzleErrorDef> = {
  1062: {
    code: "DB_DUPLICATE_ENTRY",
    status: 409,
    message: {
      fr: "Un enregistrement avec les mêmes identifiants existe déjà",
      en: "A record with the same identifiers already exists",
      ar: "يوجد سجل بنفس المعرفات بالفعل",
    },
  },
  1452: {
    code: "DB_FOREIGN_KEY_CONSTRAINT",
    status: 400,
    message: {
      fr: "Impossible d'ajouter ou de modifier l'enregistrement : une ressource liée est introuvable",
      en: "Cannot add or update record: a related resource was not found",
      ar: "لا يمكن إضافة أو تحديث السجل: المورد المرتبط غير موجود",
    },
  },
  1451: {
    code: "DB_FOREIGN_KEY_PARENT",
    status: 409,
    message: {
      fr: "Impossible de supprimer : cet enregistrement est lié à d'autres données",
      en: "Cannot delete: this record is linked to other data",
      ar: "لا يمكن الحذف: هذا السجل مرتبط ببيانات أخرى",
    },
  },
  1406: {
    code: "DB_DATA_TOO_LONG",
    status: 400,
    message: {
      fr: "La valeur saisie est trop longue pour le champ correspondant",
      en: "The entered value is too long for the corresponding field",
      ar: "القيمة المدخلة طويلة جدًا للحقل المقابل",
    },
  },
  1048: {
    code: "DB_COLUMN_NOT_NULL",
    status: 400,
    message: {
      fr: "Un champ obligatoire n'a pas été renseigné",
      en: "A required field was not provided",
      ar: "لم يتم توفير حقل مطلوب",
    },
  },
  1045: {
    code: "DB_ACCESS_DENIED",
    status: 503,
    message: {
      fr: "Accès à la base de données refusé : vérifiez les identifiants configurés",
      en: "Database access denied: please check the configured credentials",
      ar: "تم رفض الوصول إلى قاعدة البيانات: يرجى التحقق من بيانات الاعتماد المكوّنة",
    },
  },
  1146: {
    code: "DB_TABLE_MISSING",
    status: 503,
    message: {
      fr: "Une table requise est absente de la base de données. Des migrations doivent être appliquées.",
      en: "A required table is missing from the database. Migrations need to be applied.",
      ar: "جدول مطلوب غير موجود في قاعدة البيانات. يجب تطبيق الترحيلات.",
    },
  },
  1054: {
    code: "DB_UNKNOWN_COLUMN",
    status: 503,
    message: {
      fr: "La structure de la base de données ne correspond pas à l'application. Des migrations doivent être appliquées.",
      en: "The database structure does not match the application. Migrations need to be applied.",
      ar: "بنية قاعدة البيانات لا تتطابق مع التطبيق. يجب تطبيق الترحيلات.",
    },
  },
  1142: {
    code: "DB_COMMAND_DENIED",
    status: 503,
    message: {
      fr: "Opération refusée sur la base de données : privilèges insuffisants",
      en: "Operation denied by the database: insufficient privileges",
      ar: "تم رفض العملية من قاعدة البيانات: صلاحيات غير كافية",
    },
  },
  1364: {
    code: "DB_NO_DEFAULT_VALUE",
    status: 400,
    message: {
      fr: "Un champ obligatoire ne possède pas de valeur",
      en: "A required field is missing a value",
      ar: "حقل مطلوب يفتقد إلى قيمة",
    },
  },
  1366: {
    code: "DB_INCORRECT_VALUE",
    status: 400,
    message: {
      fr: "La valeur saisie n'est pas valide pour le champ correspondant",
      en: "The entered value is not valid for the corresponding field",
      ar: "القيمة المدخلة غير صالحة للحقل المقابل",
    },
  },
  1292: {
    code: "DB_INVALID_DATETIME",
    status: 400,
    message: {
      fr: "La date saisie n'est pas valide ou utilise un format non pris en charge",
      en: "The entered date is not valid or uses an unsupported format",
      ar: "التاريخ المدخل غير صالح أو يستخدم صيغة غير مدعومة",
    },
  },
  1264: {
    code: "DB_VALUE_OUT_OF_RANGE",
    status: 400,
    message: {
      fr: "La valeur saisie est hors de la plage autorisée pour le champ correspondant",
      en: "The entered value is out of the allowed range for the corresponding field",
      ar: "القيمة المدخلة خارج النطاق المسموح به للحقل المقابل",
    },
  },
  1064: {
    code: "DB_QUERY_SYNTAX",
    status: 500,
    message: {
      fr: "Une requête interne a échoué. L'équipe technique a été alertée.",
      en: "An internal query failed. The technical team has been alerted.",
      ar: "فشل استعلام داخلي. تم تنبيه الفريق الفني.",
    },
  },
  2003: {
    code: "DB_CONNECTION_REFUSED",
    status: 503,
    message: {
      fr: "Impossible de se connecter à la base de données. Le service est peut-être indisponible.",
      en: "Unable to connect to the database. The service may be unavailable.",
      ar: "تعذر الاتصال بقاعدة البيانات. قد تكون الخدمة غير متاحة.",
    },
  },
  2013: {
    code: "DB_CONNECTION_LOST",
    status: 503,
    message: {
      fr: "La connexion à la base de données a été interrompue. Veuillez réessayer.",
      en: "The database connection was lost. Please try again.",
      ar: "انقطع الاتصال بقاعدة البيانات. يرجى المحاولة مرة أخرى.",
    },
  },
};

function extract_errno(error: unknown): number | null {
  if (
    error instanceof Error &&
    "errno" in error &&
    typeof (error as Record<string, unknown>).errno === "number"
  ) {
    return (error as Record<string, unknown>).errno as number;
  }

  const cause = error instanceof Error ? (error as Error & { cause?: unknown }).cause : undefined;
  if (
    cause &&
    typeof cause === "object" &&
    "errno" in cause &&
    typeof (cause as Record<string, unknown>).errno === "number"
  ) {
    return (cause as Record<string, unknown>).errno as number;
  }

  return null;
}

export async function catch_drizzle<T>(
  promise: Promise<T>,
  fallback?: DrizzleErrorDef,
): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    handle_drizzle_error(error, fallback);
  }
}

export function handle_drizzle_error(error: unknown, fallback?: DrizzleErrorDef): never {
  const errno = extract_errno(error);

  if (errno !== null) {
    const def = DRIZZLE_ERROR_MAP[errno];
    if (def) {
      throw new AppError(def.message.fr, def.code, def.status, { _messages: def.message }, true);
    }
  }

  if (fallback) {
    throw new AppError(
      fallback.message.fr,
      fallback.code,
      fallback.status,
      { _messages: fallback.message },
      true,
    );
  }

  throw new AppError(
    "Une erreur de base de données est survenue",
    "DB_ERROR",
    500,
    {
      _messages: {
        fr: "Une erreur de base de données est survenue",
        en: "A database error occurred",
        ar: "حدث خطأ في قاعدة البيانات",
      },
    },
    true,
  );
}
