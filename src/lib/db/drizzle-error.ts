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
