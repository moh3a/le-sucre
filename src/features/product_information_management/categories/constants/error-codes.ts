import type { ErrorDef } from "@/features/inventory_management_system/shared/error-codes";

export const CATEGORY_ERROR = {
  NOT_FOUND: {
    code: "CATEGORY_NOT_FOUND",
    status: 404,
    message: {
      fr: "La catégorie demandée n'existe pas ou a été supprimée",
      en: "The requested category does not exist or has been deleted",
      ar: "التصنيف المطلوب غير موجود أو تم حذفه",
    },
  },
  SLUG_CONFLICT: {
    code: "CATEGORY_SLUG_CONFLICT",
    status: 409,
    message: {
      fr: "Une autre catégorie utilise déjà ce slug. Veuillez choisir un slug unique",
      en: "Another category already uses this slug. Please choose a unique slug",
      ar: "يستخدم تصنيف آخر هذا الرابط بالفعل. يرجى اختيار رابط فريد",
    },
  },
  HAS_CHILDREN: {
    code: "CATEGORY_HAS_CHILDREN",
    status: 409,
    message: {
      fr: "Impossible de supprimer cette catégorie car elle contient des sous-catégories. Déplacez ou supprimez les sous-catégories d'abord",
      en: "Cannot delete this category because it contains sub-categories. Move or delete sub-categories first",
      ar: "لا يمكن حذف هذا التصنيف لأنه يحتوي على فئات فرعية. انقل أو احذف الفئات الفرعية أولاً",
    },
  },
  INVALID_PARENT: {
    code: "CATEGORY_INVALID_PARENT",
    status: 400,
    message: {
      fr: "Impossible de déplacer une catégorie vers son propre descendant. Cela créerait une référence circulaire",
      en: "Cannot move a category under its own descendant. This would create a circular reference",
      ar: "لا يمكن نقل تصنيف إلى تفرعه الخاص. سيؤدي هذا إلى إنشاء مرجع دائري",
    },
  },
  CIRCULAR_REFERENCE: {
    code: "CATEGORY_CIRCULAR_REFERENCE",
    status: 400,
    message: {
      fr: "Détection d'une référence circulaire dans la hiérarchie des catégories. Vérifiez les parents de la catégorie",
      en: "Circular reference detected in the category hierarchy. Check the category parents",
      ar: "تم اكتشاف مرجع دائري في تسلسل الفئات. تحقق من الفئات الأب",
    },
  },
  DEPTH_EXCEEDED: {
    code: "CATEGORY_DEPTH_EXCEEDED",
    status: 400,
    message: {
      fr: "La profondeur maximale de l'arborescence (50 niveaux) est atteinte. Placez cette catégorie plus haut dans la hiérarchie",
      en: "The maximum tree depth (50 levels) has been reached. Place this category higher in the hierarchy",
      ar: "تم الوصول الحد الأقصى لعمق الشجرة (50 مستوى). ضع هذا التصنيف أعلى في التسلسل",
    },
  },
  CACHE_SET_FAILED: {
    code: "CATEGORY_CACHE_SET_FAILED",
    status: 500,
    message: {
      fr: "Impossible de mettre en cache les données des catégories. Les performances peuvent être affectées temporairement",
      en: "Unable to cache category data. Performance may be temporarily affected",
      ar: "تعذر تخزين بيانات التصنيفات مؤقتاً. قد تتأثر الأداء مؤقتاً",
    },
  },
  CACHE_GET_FAILED: {
    code: "CATEGORY_CACHE_GET_FAILED",
    status: 500,
    message: {
      fr: "Impossible de lire le cache des catégories. Le système recharge les données depuis la base de données",
      en: "Unable to read category cache. The system is reloading data from the database",
      ar: "تعذر قراءة ذاكرة التخزين المؤقت للتصنيفات. يعيد النظام تحميل البيانات من قاعدة البيانات",
    },
  },
  LIST_FAILED: {
    code: "CATEGORY_LIST_FAILED",
    status: 500,
    message: {
      fr: "La requête base de données a échoué lors de la récupération de la liste des catégories",
      en: "The database query failed while fetching the category list",
      ar: "فشلت استعلام قاعدة البيانات أثناء جلب قائمة التصنيفات",
    },
  },
  FETCH_FAILED: {
    code: "CATEGORY_FETCH_FAILED",
    status: 500,
    message: {
      fr: "La requête base de données a échoué lors de la lecture de la catégorie. Vérifiez que la connexion est active",
      en: "The database query failed while reading the category. Check that the connection is active",
      ar: "فشلت استعلام قاعدة البيانات أثناء قراءة التصنيف. تحقق من أن الاتصال نشط",
    },
  },
  TREE_BUILD_FAILED: {
    code: "CATEGORY_TREE_BUILD_FAILED",
    status: 500,
    message: {
      fr: "La requête base de données a échoué lors du chargement des catégories pour la construction de l'arborescence",
      en: "The database query failed while loading categories for tree construction",
      ar: "فشلت استعلام قاعدة البيانات أثناء تحميل التصنيفات لبناء الشجرة",
    },
  },
  CREATE_FAILED: {
    code: "CATEGORY_CREATE_FAILED",
    status: 500,
    message: {
      fr: "L'enregistrement en base de données a échoué lors de la création de la catégorie. Réessayez ou contactez le support",
      en: "The database write failed while creating the category. Try again or contact support",
      ar: "فشلت الكتابة في قاعدة البيانات أثناء إنشاء التصنيف. حاول مرة أخرى أو اتصل بالدعم",
    },
  },
  UPDATE_FAILED: {
    code: "CATEGORY_UPDATE_FAILED",
    status: 500,
    message: {
      fr: "L'enregistrement en base de données a échoué lors de la mise à jour de la catégorie. Vos modifications n'ont pas été sauvegardées",
      en: "The database write failed while updating the category. Your changes were not saved",
      ar: "فشلت الكتابة في قاعدة البيانات أثناء تحديث التصنيف. لم يتم حفظ تغييراتك",
    },
  },
  MOVE_FAILED: {
    code: "CATEGORY_MOVE_FAILED",
    status: 500,
    message: {
      fr: "Le déplacement de la catégorie a échoué dans la base de données. La hiérarchie n'a pas été modifiée",
      en: "Moving the category failed in the database. The hierarchy was not changed",
      ar: "فشل نقل التصنيف في قاعدة البيانات. لم يتم تغيير التسلسل الهرمي",
    },
  },
  DELETE_FAILED: {
    code: "CATEGORY_DELETE_FAILED",
    status: 500,
    message: {
      fr: "La suppression en base de données a échoué. La catégorie n'a pas été supprimée",
      en: "The database deletion failed. The category was not deleted",
      ar: "فشل الحذف من قاعدة البيانات. لم يتم حذف التصنيف",
    },
  },
  HAS_PRODUCTS: {
    code: "CATEGORY_HAS_PRODUCTS",
    status: 409,
    message: {
      fr: "Impossible de désactiver cette catégorie car des produits lui sont encore assignés. Réassignez ou supprimez les produits d'abord",
      en: "Cannot deactivate this category because products are still assigned to it. Reassign or delete the products first",
      ar: "لا يمكن تعطيل هذا التصنيف لأنه لا تزال منتجات مرتبطة به. قم بإعادة تعيين المنتجات أو حذفها أولاً",
    },
  },
  HAS_PRODUCTS_DELETE: {
    code: "CATEGORY_HAS_PRODUCTS_DELETE",
    status: 409,
    message: {
      fr: "Impossible de supprimer cette catégorie car des produits lui sont assignés. Réassignez ou supprimez les produits d'abord",
      en: "Cannot delete this category because products are assigned to it. Reassign or delete the products first",
      ar: "لا يمكن حذف هذا التصنيف لأنه توجد منتجات مرتبطة به. قم بإعادة تعيين المنتجات أو حذفها أولاً",
    },
  },
  STATS_FAILED: {
    code: "CATEGORY_STATS_FAILED",
    status: 500,
    message: {
      fr: "La requête base de données a échoué lors du calcul des statistiques des catégories",
      en: "The database query failed while computing category statistics",
      ar: "فشلت استعلام قاعدة البيانات أثناء حساب إحصائيات التصنيفات",
    },
  },
} as const satisfies Record<string, ErrorDef>;
