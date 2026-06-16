# Error Codes Reference

## Architecture

Every service in every feature domain defines its own error codes following a strict pattern. Errors are:

1. Defined as `ErrorDef` constants in a `constants/error-codes.ts` file per feature
2. Thrown via `throw_error(def, details)` from `src/features/inventory_management_system/shared/error-codes.ts`
3. Transported through both **tRPC** and **Next.js API routes** using the same envelope

---

## Conventions

### Naming

```
{SCOPE}_{ERROR_NAME}
```

All uppercase, snake_case. Each error code is globally unique across the entire platform by prefixing with the feature scope.

### Schema

```typescript
type ErrorDef = {
  code: string;            // e.g. "PRODUCT_NOT_FOUND"
  status: number;          // HTTP status code
  message: {
    fr: string;            // French (admin default)
    en: string;            // English (storefront default)
    ar: string;            // Arabic
  };
};
```

### How errors flow

#### tRPC

Service throws → `AppError` with `details._messages` → `app_error_formatter` extracts `messages` → returned in tRPC error shape as `data.messages`.

#### Next.js API (REST)

Service throws → `AppError` caught in route handler → `normalize_error()` → `ApiResponse.error()` → JSON response with `error.code`, `error.message`, `error.details`.

---

## Error Codes by Feature

---

### 1. Authentication & Authorization

**Scope prefix:** `AUTH_`

#### AuthService

| Code | HTTP | EN | FR | AR |
|------|------|----|----|----|
| `AUTH_SESSION_REQUIRED` | 401 | Authentication required | Authentification requise | المصادقة مطلوبة |
| `AUTH_SESSION_EXPIRED` | 401 | Session has expired | Session expirée | انتهت الجلسة |
| `AUTH_INVALID_CREDENTIALS` | 401 | Invalid email or password | Email ou mot de passe invalide | البريد الإلكتروني أو كلمة المرور غير صالحة |
| `AUTH_ACCOUNT_LOCKED` | 423 | Account locked after too many attempts | Compte verrouillé après trop de tentatives | تم قفل الحساب بعد محاولات كثيرة |
| `AUTH_EMAIL_NOT_VERIFIED` | 403 | Email not verified | Email non vérifié | البريد الإلكتروني غير موثق |
| `AUTH_USER_NOT_FOUND` | 404 | User not found | Utilisateur introuvable | المستخدم غير موجود |
| `AUTH_LOGIN_FAILED` | 401 | Login failed | Échec de connexion | فشل تسجيل الدخول |

#### AuthorizationService

| Code | HTTP | EN | FR | AR |
|------|------|----|----|----|
| `AUTH_FORBIDDEN` | 403 | You do not have permission to perform this action | Vous n'avez pas la permission d'effectuer cette action | ليس لديك الإذن للقيام بهذا الإجراء |
| `AUTH_STAFF_REQUIRED` | 403 | Staff access required | Accès personnel requis | مطلوب وصول الموظفين |
| `AUTH_CONSOLE_ACCESS_REQUIRED` | 403 | Console access required | Accès à la console requis | مطلوب الوصول إلى لوحة التحكم |
| `AUTH_PERMISSION_MISSING` | 403 | Required permission: {permission} | Permission requise : {permission} | الإذن المطلوب: {permission} |
| `AUTH_CUSTOMER_REQUIRED` | 403 | Customer account required | Compte client requis | حساب العميل مطلوب |
| `AUTH_ROLE_NOT_FOUND` | 404 | Role not found | Rôle introuvable | الدور غير موجود |
| `AUTH_ROLE_ALREADY_ASSIGNED` | 409 | Role already assigned to user | Rôle déjà attribué à l'utilisateur | الدور مُخصص بالفعل للمستخدم |

#### AuditService

| Code | HTTP | EN | FR | AR |
|------|------|----|----|----|
| `AUTH_AUDIT_LOG_FAILED` | 500 | Failed to record audit log | Échec de l'enregistrement du journal d'audit | فشل تسجيل سجل التدقيق |

---

### 2. Product Information Management

#### ProductService

**Scope prefix:** `PRODUCT_`

| Code | HTTP | EN | FR | AR |
|------|------|----|----|----|
| `PRODUCT_NOT_FOUND` | 404 | Product not found | Produit introuvable | المنتج غير موجود |
| `PRODUCT_SLUG_CONFLICT` | 409 | A product with this slug already exists | Un produit avec ce slug existe déjà | يوجد منتج بهذا المعرف بالفعل |
| `PRODUCT_CATEGORY_NOT_FOUND` | 404 | Category not found | Catégorie introuvable | الفئة غير موجودة |
| `PRODUCT_BRAND_NOT_FOUND` | 404 | Brand not found | Marque introuvable | العلامة التجارية غير موجودة |
| `PRODUCT_INVALID_STATUS` | 400 | Invalid product status | Statut du produit invalide | حالة المنتج غير صالحة |
| `PRODUCT_INVALID_PRICE` | 400 | Invalid product price | Prix du produit invalide | سعر المنتج غير صالح |
| `PRODUCT_TRANSLATION_NOT_FOUND` | 404 | Translation not found for this locale | Traduction introuvable pour cette langue | الترجمة غير موجودة لهذه اللغة |
| `PRODUCT_MEDIA_NOT_FOUND` | 404 | Media not found | Média introuvable | الوسائط غير موجودة |
| `PRODUCT_MEDIA_LIMIT_EXCEEDED` | 400 | Maximum media limit exceeded for this product | Limite maximale de médias dépassée pour ce produit | تم تجاوز الحد الأقصى للوسائط لهذا المنتج |

#### ProductAdminService

**Scope prefix:** `PRODUCT_ADMIN_`

| Code | HTTP | EN | FR | AR |
|------|------|----|----|----|
| `PRODUCT_ADMIN_BULK_EMPTY` | 400 | No products selected for bulk operation | Aucun produit sélectionné pour l'opération groupée | لم يتم تحديد أي منتجات للعملية الجماعية |
| `PRODUCT_ADMIN_BULK_INVALID_ACTION` | 400 | Invalid bulk action | Action groupée invalide | إجراء جماعي غير صالح |
| `PRODUCT_ADMIN_EXPORT_FAILED` | 500 | Product export failed | Échec de l'exportation des produits | فشل تصدير المنتجات |

#### ProductMediaService

**Scope prefix:** `PRODUCT_MEDIA_`

| Code | HTTP | EN | FR | AR |
|------|------|----|----|----|
| `PRODUCT_MEDIA_UPLOAD_FAILED` | 500 | File upload failed | Échec du téléchargement du fichier | فشل رفع الملف |
| `PRODUCT_MEDIA_INVALID_TYPE` | 400 | Invalid media type | Type de média invalide | نوع الوسائط غير صالح |
| `PRODUCT_MEDIA_FILE_TOO_LARGE` | 400 | File exceeds maximum size | Fichier dépasse la taille maximale | الملف يتجاوز الحجم الأقصى |
| `PRODUCT_MEDIA_NOT_ATTACHED` | 404 | Media not attached to product | Média non attaché au produit | الوسائط غير مرتبطة بالمنتج |

#### BrandService

**Scope prefix:** `BRAND_`

| Code | HTTP | EN | FR | AR |
|------|------|----|----|----|
| `BRAND_NOT_FOUND` | 404 | Brand not found | Marque introuvable | العلامة التجارية غير موجودة |
| `BRAND_SLUG_CONFLICT` | 409 | A brand with this slug already exists | Une marque avec ce slug existe déjà | توجد علامة تجارية بهذا المعرف بالفعل |
| `BRAND_HAS_PRODUCTS` | 409 | Cannot delete brand with associated products | Impossible de supprimer la marque avec des produits associés | لا يمكن حذف العلامة التجارية مع المنتجات المرتبطة |

#### CategoryService

**Scope prefix:** `CATEGORY_`

| Code | HTTP | EN | FR | AR |
|------|------|----|----|----|
| `CATEGORY_NOT_FOUND` | 404 | Category not found | Catégorie introuvable | الفئة غير موجودة |
| `CATEGORY_SLUG_CONFLICT` | 409 | A category with this slug already exists | Une catégorie avec ce slug existe déjà | توجد فئة بهذا المعرف بالفعل |
| `CATEGORY_HAS_CHILDREN` | 409 | Delete or move sub-categories first | Supprimez ou déplacez les sous-catégories d'abord | قم بحذف أو نقل الفئات الفرعية أولاً |
| `CATEGORY_INVALID_PARENT` | 400 | Cannot move category to its own descendant | Impossible de déplacer une catégorie vers son propre descendant | لا يمكن نقل الفئة إلى فرعها الخاص |
| `CATEGORY_CIRCULAR_REFERENCE` | 400 | Circular reference detected | Référence circulaire détectée | تم اكتشاف مرجع دائري |
| `CATEGORY_DEPTH_EXCEEDED` | 400 | Maximum category depth exceeded | Profondeur maximale de catégorie dépassée | تم تجاوز الحد الأقصى لعمق الفئة |

#### CategoryCacheService

**Scope prefix:** `CATEGORY_CACHE_`

| Code | HTTP | EN | FR | AR |
|------|------|----|----|----|
| `CATEGORY_CACHE_SET_FAILED` | 500 | Failed to cache category data | Échec de la mise en cache des catégories | فشل تخزين بيانات الفئة مؤقتاً |
| `CATEGORY_CACHE_GET_FAILED` | 500 | Failed to read category cache | Échec de la lecture du cache des catégories | فشل قراءة ذاكرة التخزين المؤقت للفئة |

#### VariantService

**Scope prefix:** `VARIANT_`

| Code | HTTP | EN | FR | AR |
|------|------|----|----|----|
| `VARIANT_NOT_FOUND` | 404 | Property not found | Propriété introuvable | الخاصية غير موجودة |
| `VARIANT_VALUE_NOT_FOUND` | 404 | Property value not found | Valeur de propriété introuvable | قيمة الخاصية غير موجودة |
| `VARIANT_SLUG_CONFLICT` | 409 | A property with this slug already exists | Une propriété avec ce slug existe déjà | توجد خاصية بهذا المعرف بالفعل |
| `VARIANT_VALUE_SLUG_CONFLICT` | 409 | A property value with this slug already exists | Une valeur de propriété avec ce slug existe déjà | توجد قيمة خاصية بهذا المعرف بالفعل |
| `VARIANT_PRODUCT_NOT_FOUND` | 404 | Product not found for variant configuration | Produit introuvable pour la configuration de variantes | المنتج غير موجود لتكوين المتغيرات |
| `VARIANT_ALREADY_ENABLED` | 409 | Variant mode is already enabled for this product | Le mode variantes est déjà activé pour ce produit | وضع المتغيرات مفعل بالفعل لهذا المنتج |

#### SkuService

**Scope prefix:** `SKU_`

| Code | HTTP | EN | FR | AR |
|------|------|----|----|----|
| `SKU_NOT_FOUND` | 404 | SKU not found | SKU introuvable | SKU غير موجود |
| `SKU_CODE_CONFLICT` | 409 | A SKU with this code already exists | Un SKU avec ce code existe déjà | يوجد SKU بهذا الرمز بالفعل |
| `SKU_INVALID_PRICE` | 400 | Invalid SKU price | Prix SKU invalide | سعر SKU غير صالح |
| `SKU_PRICE_TIER_NOT_FOUND` | 404 | Price tier not found | Palier de prix introuvable | مستوى السعر غير موجود |
| `SKU_PRICE_TIER_CONFLICT` | 409 | Price tier already exists for this customer group | Palier de prix existe déjà pour ce groupe de clients | مستوى السعر موجود بالفعل لهذه المجموعة |
| `SKU_WHOLESALE_RULE_NOT_FOUND` | 404 | Wholesale rule not found | Règle de gros introuvable | قاعدة الجملة غير موجودة |
| `SKU_WHOLESALE_RULE_CONFLICT` | 409 | Wholesale rule conflicts with existing rule | La règle de gros entre en conflit avec une règle existante | تتعارض قاعدة الجملة مع قاعدة موجودة |
| `SKU_PRODUCT_HAS_NO_VARIANTS` | 400 | Product does not have variant mode enabled | Le produit n'a pas le mode variantes activé | المنتج ليس لديه وضع المتغيرات مفعلًا |
| `SKU_GENERATION_FAILED` | 500 | SKU generation failed | Échec de la génération des SKUs | فشل توليد SKUs |
| `SKU_BULK_DELETE_FAILED` | 500 | Bulk SKU deletion failed | Échec de la suppression groupée des SKUs | فشل الحذف الجماعي لـ SKUs |
| `SKU_BULK_UPDATE_FAILED` | 500 | Bulk SKU update failed | Échec de la mise à jour groupée des SKUs | فشل التحديث الجماعي لـ SKUs |

#### SearchService

**Scope prefix:** `SEARCH_`

| Code | HTTP | EN | FR | AR |
|------|------|----|----|----|
| `SEARCH_QUERY_TOO_SHORT` | 400 | Search query must be at least 2 characters | La recherche doit contenir au moins 2 caractères | يجب أن يحتوي البحث على حرفين على الأقل |
| `SEARCH_QUERY_TOO_LONG` | 400 | Search query exceeds maximum length | La recherche dépasse la longueur maximale | يتجاوز البحث الحد الأقصى للطول |
| `SEARCH_FACET_NOT_FOUND` | 404 | Facet not found | Facette introuvable | الجانب غير موجود |
| `SEARCH_INVALID_FILTER` | 400 | Invalid search filter | Filtre de recherche invalide | عامل تصفية البحث غير صالح |
| `SEARCH_CACHE_MISS` | 500 | Search cache unavailable | Cache de recherche indisponible | ذاكرة التخزين المؤقت للبحث غير متاحة |

#### SearchCacheService

**Scope prefix:** `SEARCH_CACHE_`

| Code | HTTP | EN | FR | AR |
|------|------|----|----|----|
| `SEARCH_CACHE_SET_FAILED` | 500 | Failed to cache search results | Échec de la mise en cache des résultats | فشل تخزين نتائج البحث مؤقتاً |
| `SEARCH_CACHE_INVALIDATION_FAILED` | 500 | Failed to invalidate search cache | Échec de l'invalidation du cache de recherche | فشل إبطال ذاكرة التخزين المؤقت للبحث |

#### RecommendationService

**Scope prefix:** `RECOMMENDATION_`

| Code | HTTP | EN | FR | AR |
|------|------|----|----|----|
| `RECOMMENDATION_PRODUCT_NOT_FOUND` | 404 | Base product not found for recommendations | Produit de base introuvable pour les recommandations | المنتج الأساسي غير موجود للتوصيات |
| `RECOMMENDATION_INVALID_TYPE` | 400 | Invalid recommendation type | Type de recommandation invalide | نوع التوصية غير صالح |
| `RECOMMENDATION_LIMIT_EXCEEDED` | 400 | Recommendation limit exceeds maximum allowed | La limite de recommandations dépasse le maximum autorisé | حد التوصيات يتجاوز الحد الأقصى المسموح به |
| `RECOMMENDATION_NO_DATA` | 404 | No recommendation data available | Aucune donnée de recommandation disponible | لا توجد بيانات توصية متاحة |

#### ViewTrackingService

**Scope prefix:** `VIEW_TRACKING_`

| Code | HTTP | EN | FR | AR |
|------|------|----|----|----|
| `VIEW_TRACKING_PRODUCT_NOT_FOUND` | 404 | Product not found for view tracking | Produit introuvable pour le suivi des vues | المنتج غير موجود لتتبع المشاهدات |
| `VIEW_TRACKING_REDIS_FAILED` | 500 | View tracking cache error | Erreur de cache de suivi des vues | خطأ في ذاكرة التخزين المؤقت لتتبع المشاهدات |

#### TrendingIndexService

**Scope prefix:** `TRENDING_INDEX_`

| Code | HTTP | EN | FR | AR |
|------|------|----|----|----|
| `TRENDING_INDEX_PERSIST_FAILED` | 500 | Failed to persist trending scores | Échec de la persistance des scores tendances | فشل حفظ درجات الترند |
| `TRENDING_INDEX_INVALID_PERIOD` | 400 | Invalid trending period | Période de tendance invalide | فترة الترند غير صالحة |

#### IndexingService / IndexJobRunnerService

**Scope prefix:** `RECOMMENDATION_INDEX_`

| Code | HTTP | EN | FR | AR |
|------|------|----|----|----|
| `RECOMMENDATION_INDEX_ENQUEUE_FAILED` | 500 | Failed to enqueue index job | Échec de l'ajout à la file d'indexation | فشل إضافة مهمة الفهرسة إلى قائمة الانتظار |
| `RECOMMENDATION_INDEX_JOB_NOT_FOUND` | 404 | Index job not found | Tâche d'indexation introuvable | مهمة الفهرسة غير موجودة |
| `RECOMMENDATION_INDEX_REINDEX_FAILED` | 500 | Product reindexing failed | Échec de la réindexation du produit | فشل إعادة فهرسة المنتج |

#### RecommendationCacheService

**Scope prefix:** `RECOMMENDATION_CACHE_`

| Code | HTTP | EN | FR | AR |
|------|------|----|----|----|
| `RECOMMENDATION_CACHE_SET_FAILED` | 500 | Failed to cache recommendations | Échec de la mise en cache des recommandations | فشل تخزين التوصيات مؤقتاً |
| `RECOMMENDATION_CACHE_INVALIDATION_FAILED` | 500 | Failed to invalidate recommendation cache | Échec de l'invalidation du cache de recommandations | فشل إبطال ذاكرة التخزين المؤقت للتوصيات |

---

### 3. Order Management System

#### CartService

**Scope prefix:** `CART_`

| Code | HTTP | EN | FR | AR |
|------|------|----|----|----|
| `CART_NOT_FOUND` | 404 | Cart not found | Panier introuvable | العربة غير موجودة |
| `CART_ITEM_NOT_FOUND` | 404 | Cart item not found | Article du panier introuvable | عنصر العربة غير موجود |
| `CART_SKU_NOT_FOUND` | 404 | SKU not found | SKU introuvable | SKU غير موجود |
| `CART_SKU_INACTIVE` | 400 | SKU is no longer active | SKU n'est plus actif | SKU لم يعد نشطاً |
| `CART_SKU_OUT_OF_STOCK` | 409 | SKU is out of stock | SKU en rupture de stock | SKU نفد من المخزون |
| `CART_QUANTITY_EXCEEDS_STOCK` | 409 | Requested quantity exceeds available stock | La quantité demandée dépasse le stock disponible | الكمية المطلوبة تتجاوز المخزون المتاح |
| `CART_QUANTITY_INVALID` | 400 | Quantity must be greater than zero | La quantité doit être supérieure à zéro | يجب أن تكون الكمية أكبر من الصفر |
| `CART_QUANTITY_EXCEEDS_LIMIT` | 400 | Quantity exceeds maximum allowed per item | La quantité dépasse le maximum autorisé par article | الكمية تتجاوز الحد الأقصى المسموح به لكل عنصر |
| `CART_MERGE_FAILED` | 500 | Failed to merge guest cart with user cart | Échec de la fusion du panier invité avec le panier utilisateur | فشل دمج عربة الضيف مع عربة المستخدم |
| `CART_PREORDER_NOT_AVAILABLE` | 400 | Preorder is not available for this SKU | La précommande n'est pas disponible pour ce SKU | الطلب المسبق غير متاح لـ SKU هذا |

#### CheckoutService

**Scope prefix:** `CHECKOUT_`

| Code | HTTP | EN | FR | AR |
|------|------|----|----|----|
| `CHECKOUT_CART_EMPTY` | 400 | Cannot checkout with an empty cart | Impossible de commander avec un panier vide | لا يمكن إتمام الشراء بعربة فارغة |
| `CHECKOUT_CART_NOT_FOUND` | 404 | Cart not found | Panier introuvable | العربة غير موجودة |
| `CHECKOUT_INVALID_SHIPPING_ADDRESS` | 400 | Invalid shipping address | Adresse de livraison invalide | عنوان الشحن غير صالح |
| `CHECKOUT_INVALID_BILLING_ADDRESS` | 400 | Invalid billing address | Adresse de facturation invalide | عنوان الفوترة غير صالح |
| `CHECKOUT_SHIPPING_METHOD_UNAVAILABLE` | 400 | Shipping method is not available for this address | Mode de livraison indisponible pour cette adresse | طريقة الشحن غير متاحة لهذا العنوان |
| `CHECKOUT_PAYMENT_METHOD_UNAVAILABLE` | 400 | Payment method is not available | Mode de paiement indisponible | طريقة الدفع غير متاحة |
| `CHECKOUT_ITEMS_UNVAILABLE` | 409 | Some items in the cart are no longer available | Certains articles du panier ne sont plus disponibles | بعض العناصر في العربة لم تعد متاحة |
| `CHECKOUT_PRICES_CHANGED` | 409 | Some prices have changed since the cart was created | Certains prix ont changé depuis la création du panier | تغيرت بعض الأسعار منذ إنشاء العربة |
| `CHECKOUT_PROMO_CODE_INVALID` | 400 | Invalid or expired promo code | Code promo invalide ou expiré | رمز ترويجي غير صالح أو منتهي الصلاحية |

#### OrderService

**Scope prefix:** `ORDER_`

| Code | HTTP | EN | FR | AR |
|------|------|----|----|----|
| `ORDER_NOT_FOUND` | 404 | Order not found | Commande introuvable | الطلب غير موجود |
| `ORDER_CART_NOT_FOUND` | 404 | Cart not found for order placement | Panier introuvable pour la commande | العربة غير موجودة للطلب |
| `ORDER_INVALID_STATUS_TRANSITION` | 409 | Invalid order status transition | Transition de statut de commande invalide | انتقال حالة الطلب غير صالح |
| `ORDER_ALREADY_CANCELLED` | 409 | Order is already cancelled | La commande est déjà annulée | الطلب ملغي بالفعل |
| `ORDER_ALREADY_COMPLETED` | 409 | Order is already completed | La commande est déjà terminée | الطلب مكتمل بالفعل |
| `ORDER_CANNOT_CANCEL` | 409 | Order cannot be cancelled in its current status | La commande ne peut pas être annulée dans son statut actuel | لا يمكن إلغاء الطلب في حالته الحالية |
| `ORDER_PAYMENT_ALREADY_PAID` | 409 | Order is already paid | La commande est déjà payée | الطلب مدفوع بالفعل |
| `ORDER_PAYMENT_FAILED` | 500 | Order payment processing failed | Échec du traitement du paiement de la commande | فشل معالجة دفع الطلب |
| `ORDER_INSUFFICIENT_STOCK` | 409 | Insufficient stock to place the order | Stock insuffisant pour passer la commande | مخزون غير كافٍ لتقديم الطلب |
| `ORDER_NOTES_UPDATE_FAILED` | 400 | Failed to update order notes | Échec de la mise à jour des notes de commande | فشل تحديث ملاحظات الطلب |
| `ORDER_ASSIGNMENT_FAILED` | 400 | Failed to assign user to order | Échec de l'attribution à la commande | فشل تعيين المستخدم للطلب |
| `ORDER_OPERATOR_ALREADY_ASSIGNED` | 409 | Operator already assigned to this order | Opérateur déjà attribué à cette commande | المشغل مُخصص بالفعل لهذا الطلب |
| `ORDER_DELIVERY_PERSON_ALREADY_ASSIGNED` | 409 | Delivery person already assigned to this order | Livreur déjà attribué à cette commande | عامل التوصيل مُخصص بالفعل لهذا الطلب |
| `ORDER_GUEST_ACCESS_DENIED` | 403 | Invalid phone number for guest order access | Numéro de téléphone invalide pour l'accès à la commande invitée | رقم الهاتف غير صالح للوصول إلى طلب الضيف |

#### OrderAdminService

**Scope prefix:** `ORDER_ADMIN_`

| Code | HTTP | EN | FR | AR |
|------|------|----|----|----|
| `ORDER_ADMIN_STATS_FAILED` | 500 | Failed to retrieve order statistics | Échec de la récupération des statistiques de commandes | فشل استرداد إحصائيات الطلبات |
| `ORDER_ADMIN_CHART_FAILED` | 500 | Failed to retrieve order chart data | Échec de la récupération des données graphiques | فشل استرداد بيانات الرسم البياني للطلبات |

#### CustomerService

**Scope prefix:** `CUSTOMER_`

| Code | HTTP | EN | FR | AR |
|------|------|----|----|----|
| `CUSTOMER_NOT_FOUND` | 404 | Customer not found | Client introuvable | العميل غير موجود |
| `CUSTOMER_SEGMENTATION_FAILED` | 500 | Customer segmentation calculation failed | Échec du calcul de la segmentation client | فشل حساب تقسيم العملاء |

#### PromotionService

**Scope prefix:** `PROMOTION_`

| Code | HTTP | EN | FR | AR |
|------|------|----|----|----|
| `PROMOTION_NOT_FOUND` | 404 | Promotion not found | Promotion introuvable | الترويج غير موجود |
| `PROMOTION_SLUG_CONFLICT` | 409 | A promotion with this slug already exists | Une promotion avec ce slug existe déjà | يوجد ترويج بهذا المعرف بالفعل |
| `PROMOTION_DATE_RANGE_INVALID` | 400 | Start date must be before end date | La date de début doit être antérieure à la date de fin | يجب أن يكون تاريخ البدء قبل تاريخ الانتهاء |
| `PROMOTION_ALREADY_ACTIVE` | 409 | Promotion is already active | La promotion est déjà active | الترويج نشط بالفعل |
| `PROMOTION_ALREADY_INACTIVE` | 409 | Promotion is already inactive | La promotion est déjà inactive | الترويج غير نشط بالفعل |
| `PROMOTION_CANNOT_DELETE_ACTIVE` | 409 | Cannot delete an active promotion | Impossible de supprimer une promotion active | لا يمكن حذف ترويج نشط |
| `PROMOTION_DISCOUNT_EXCEEDS_MAXIMUM` | 400 | Discount exceeds maximum allowed amount | La remise dépasse le montant maximum autorisé | الخصم يتجاوز الحد الأقصى المسموح به |
| `PROMOTION_RULE_INVALID` | 400 | Invalid promotion rule | Règle de promotion invalide | قاعدة الترويج غير صالحة |

#### PromotionSchedulerService / PromotionJobRunnerService

**Scope prefix:** `PROMOTION_SCHEDULER_`

| Code | HTTP | EN | FR | AR |
|------|------|----|----|----|
| `PROMOTION_SCHEDULER_FLASH_NOT_FOUND` | 404 | Flash sale not found for scheduling | Vente flash introuvable pour la planification | البيع السريع غير موجود للجدولة |
| `PROMOTION_SCHEDULER_JOB_FAILED` | 500 | Scheduled promotion job execution failed | Échec de l'exécution de la tâche programmée | فشل تنفيذ مهمة الترويج المجدولة |

#### FlashSaleService

**Scope prefix:** `FLASH_SALE_`

| Code | HTTP | EN | FR | AR |
|------|------|----|----|----|
| `FLASH_SALE_NOT_FOUND` | 404 | Flash sale not found | Vente flash introuvable | البيع السريع غير موجود |
| `FLASH_SALE_EXPIRED` | 410 | Flash sale has expired | La vente flash a expiré | انتهى البيع السريع |
| `FLASH_SALE_NOT_STARTED` | 400 | Flash sale has not started yet | La vente flash n'a pas encore commencé | لم يبدأ البيع السريع بعد |

#### CartDiscountService

**Scope prefix:** `CART_DISCOUNT_`

| Code | HTTP | EN | FR | AR |
|------|------|----|----|----|
| `CART_DISCOUNT_PROMO_CODE_NOT_FOUND` | 404 | Promo code not found | Code promo introuvable | الرمز الترويجي غير موجود |
| `CART_DISCOUNT_PROMO_CODE_EXPIRED` | 410 | Promo code has expired | Le code promo a expiré | انتهت صلاحية الرمز الترويجي |
| `CART_DISCOUNT_PROMO_CODE_USAGE_EXCEEDED` | 409 | Promo code usage limit exceeded | Limite d'utilisation du code promo dépassée | تم تجاوز حد استخدام الرمز الترويجي |
| `CART_DISCOUNT_MINIMUM_NOT_MET` | 400 | Minimum order amount not met for this promo code | Montant minimum de commande non atteint pour ce code promo | لم يتم استيفاء الحد الأدنى لمبلغ الطلب لهذا الرمز الترويجي |
| `CART_DISCOUNT_CUSTOMER_EXCLUDED` | 403 | Customer is not eligible for this promo code | Le client n'est pas éligible à ce code promo | العميل غير مؤهل لهذا الرمز الترويجي |
| `CART_DISCOUNT_CATEGORY_EXCLUDED` | 400 | Promo code does not apply to items in this category | Le code promo ne s'applique pas aux articles de cette catégorie | لا ينطبق الرمز الترويجي على عناصر هذه الفئة |

#### PreorderFulfillmentService

**Scope prefix:** `PREORDER_FULFILLMENT_`

| Code | HTTP | EN | FR | AR |
|------|------|----|----|----|
| `PREORDER_FULFILLMENT_INVENTORY_NOT_FOUND` | 404 | Inventory level not found for this SKU and warehouse | Niveau de stock introuvable pour ce SKU et entrepôt | مستوى المخزون غير موجود لـ SKU والمستودع هذا |
| `PREORDER_FULFILLMENT_NO_ALLOCATIONS` | 404 | No confirmed preorder allocations to fulfill | Aucune allocation de précommande confirmée à traiter | لا توجد تخصيصات طلب مسبق مؤكدة للتنفيذ |

#### PreorderAllocationService

**Scope prefix:** `PREORDER_ALLOCATION_`

| Code | HTTP | EN | FR | AR |
|------|------|----|----|----|
| `PREORDER_ALLOCATION_NOT_FOUND` | 404 | Preorder allocation not found | Allocation de précommande introuvable | تخصيص الطلب المسبق غير موجود |
| `PREORDER_ALLOCATION_ALREADY_CONFIRMED` | 409 | Allocation already confirmed | Allocation déjà confirmée | التخصيص مؤكد بالفعل |
| `PREORDER_ALLOCATION_CANCELLED` | 410 | Allocation has been cancelled | L'allocation a été annulée | تم إلغاء التخصيص |
| `PREORDER_ALLOCATION_EXPIRED` | 410 | Allocation has expired | L'allocation a expiré | انتهت صلاحية التخصيص |

#### AvailabilityService

**Scope prefix:** `AVAILABILITY_`

| Code | HTTP | EN | FR | AR |
|------|------|----|----|----|
| `AVAILABILITY_SKU_NOT_FOUND` | 404 | SKU not found for availability check | SKU introuvable pour la vérification de disponibilité | SKU غير موجود للتحقق من التوفر |
| `AVAILABILITY_WAREHOUSE_NOT_FOUND` | 404 | Warehouse not found for availability check | Entrepôt introuvable pour la vérification de disponibilité | المستودع غير موجود للتحقق من التوفر |

---

### 4. Inventory Management System

#### InventoryService

**Scope prefix:** `INVENTORY_`

All errors defined in `src/features/inventory_management_system/inventory/constants/error-codes.ts`:

| Code | HTTP | EN | FR | AR |
|------|------|----|----|----|
| `SKU_NOT_FOUND` | 404 | SKU not found | SKU introuvable | SKU غير موجود |
| `LEVEL_NOT_FOUND` | 404 | Stock level not found | Niveau de stock introuvable | مستوى المخزون غير موجود |
| `STOCK_INSUFFICIENT` | 409 | Insufficient stock | Stock insuffisant | المخزون غير كاف |
| `STOCK_BELOW_RESERVED` | 409 | Stock cannot be less than reserved quantity | Le stock ne peut pas être inférieur aux réservations | لا يمكن أن يكون المخزون أقل من الكمية المحجوزة |
| `VERSION_CONFLICT` | 409 | Version conflict – please retry | Conflit de version – veuillez réessayer | تعارض في الإصدار – يرجى إعادة المحاولة |
| `NEGATIVE_STOCK` | 409 | Stock cannot become negative | Le stock ne peut pas devenir négatif | لا يمكن أن يصبح المخزون سالباً |
| `RESERVATION_NOT_FOUND` | 404 | Reservation not found | Réservation introuvable | الحجز غير موجود |
| `RESERVATION_NOT_ACTIVE` | 409 | Reservation is no longer active | La réservation n'est plus active | الحجز لم يعد نشطاً |
| `RESERVATION_COMMIT_FAILED` | 409 | Insufficient stock to commit the order | Stock insuffisant pour valider la commande | مخزون غير كافٍ لتأكيد الطلب |
| `PRODUCT_NOT_FOUND` | 404 | Product not found | Produit introuvable | المنتج غير موجود |

#### InventoryAdminService

**Scope prefix:** `INVENTORY_ADMIN_`

| Code | HTTP | EN | FR | AR |
|------|------|----|----|----|
| `INVENTORY_ADMIN_STATS_FAILED` | 500 | Failed to retrieve inventory statistics | Échec de la récupération des statistiques d'inventaire | فشل استرداد إحصائيات المخزون |
| `INVENTORY_ADMIN_CHART_FAILED` | 500 | Failed to retrieve inventory chart data | Échec de la récupération des données graphiques d'inventaire | فشل استرداد بيانات الرسم البياني للمخزون |
| `INVENTORY_ADMIN_MOVEMENT_NOT_FOUND` | 404 | Inventory movement not found | Mouvement de stock introuvable | حركة المخزون غير موجودة |

#### ReservationService

**Scope prefix:** `RESERVATION_`

| Code | HTTP | EN | FR | AR |
|------|------|----|----|----|
| `RESERVATION_SKU_NOT_FOUND` | 404 | SKU not found for reservation | SKU introuvable pour la réservation | SKU غير موجود للحجز |
| `RESERVATION_INSUFFICIENT_STOCK` | 409 | Insufficient stock to reserve | Stock insuffisant pour réserver | مخزون غير كافٍ للحجز |
| `RESERVATION_EXPIRED` | 410 | Reservation has expired | La réservation a expiré | انتهت صلاحية الحجز |
| `RESERVATION_CART_NOT_FOUND` | 404 | Cart not found for reservation | Panier introuvable pour la réservation | العربة غير موجودة للحجز |
| `RESERVATION_RELEASE_FAILED` | 500 | Failed to release reservation | Échec de la libération de la réservation | فشل تحرير الحجز |

#### WarehouseService

**Scope prefix:** `WAREHOUSE_`

All errors defined in `src/features/inventory_management_system/warehouses/constants/error-codes.ts`:

| Code | HTTP | EN | FR | AR |
|------|------|----|----|----|
| `WAREHOUSE_NOT_FOUND` | 404 | Warehouse not found | Entrepôt introuvable | المستودع غير موجود |
| `WAREHOUSE_SLUG_CONFLICT` | 409 | A warehouse with this slug already exists | Un entrepôt avec ce slug existe déjà | يوجد مستودع بهذا المعرف بالفعل |
| `WAREHOUSE_INVALID_SLUG` | 400 | Slug must contain only lowercase letters, numbers, hyphens and underscores | Le slug doit contenir uniquement des lettres minuscules, chiffres, tirets et underscores | يجب أن يحتوي المعرف على أحرف صغيرة وأرقام وشرطات وشرطات سفلية فقط |

#### DemandForecastService (Forecasting)

**Scope prefix:** `FORECAST_`

All errors defined in `src/features/inventory_management_system/forecasting/constants/error-codes.ts`:

| Code | HTTP | EN | FR | AR |
|------|------|----|----|----|
| `FORECAST_SKU_NOT_FOUND` | 404 | SKU not found for forecasting | SKU introuvable pour les prévisions | SKU غير موجود للتنبؤ |
| `FORECAST_PROVIDER_UNAVAILABLE` | 503 | Forecast provider is unavailable | Le fournisseur de prévisions est indisponible | موفر التنبؤ غير متاح |
| `FORECAST_JOB_NOT_FOUND` | 404 | Forecast job not found | Tâche de prévision introuvable | مهمة التنبؤ غير موجودة |
| `FORECAST_RULE_NOT_FOUND` | 404 | Alert rule not found | Règle d'alerte introuvable | قاعدة التنبيه غير موجودة |

#### AlertService (Forecasting)

**Scope prefix:** `FORECAST_ALERT_`

| Code | HTTP | EN | FR | AR |
|------|------|----|----|----|
| `FORECAST_ALERT_EVALUATION_FAILED` | 500 | Failed to evaluate SKU alerts | Échec de l'évaluation des alertes SKU | فشل تقييم تنبيهات SKU |
| `FORECAST_ALERT_NOT_FOUND` | 404 | Alert not found | Alerte introuvable | التنبيه غير موجود |
| `FORECAST_ALERT_RULE_INVALID` | 400 | Invalid alert rule configuration | Configuration de règle d'alerte invalide | تكوين قاعدة التنبيه غير صالح |

#### ForecastCacheService

**Scope prefix:** `FORECAST_CACHE_`

| Code | HTTP | EN | FR | AR |
|------|------|----|----|----|
| `FORECAST_CACHE_GET_FAILED` | 500 | Failed to read forecast cache | Échec de la lecture du cache de prévisions | فشل قراءة ذاكرة التخزين المؤقت للتنبؤ |
| `FORECAST_CACHE_SET_FAILED` | 500 | Failed to write forecast cache | Échec de l'écriture du cache de prévisions | فشل كتابة ذاكرة التخزين المؤقت للتنبؤ |

#### ForecastIndexService / ForecastJobRunnerService

**Scope prefix:** `FORECAST_JOB_`

| Code | HTTP | EN | FR | AR |
|------|------|----|----|----|
| `FORECAST_JOB_ENQUEUE_FAILED` | 500 | Failed to enqueue forecast job | Échec de l'ajout à la file de prévision | فشل إضافة مهمة التنبؤ إلى قائمة الانتظار |
| `FORECAST_JOB_RUNNER_FAILED` | 500 | Forecast job runner execution failed | Échec de l'exécution du planificateur de prévision | فشل تنفيذ مشغل مهمة التنبؤ |

---

### 5. Shipping Management System

#### ShippingService

**Scope prefix:** `SHIPPING_`

| Code | HTTP | EN | FR | AR |
|------|------|----|----|----|
| `SHIPPING_ORDER_NOT_FOUND` | 404 | Order not found | Commande introuvable | الطلب غير موجود |
| `SHIPPING_SHIPMENT_NOT_FOUND` | 404 | Shipment not found | Expédition introuvable | الشحنة غير موجودة |
| `SHIPPING_ALREADY_EXISTS` | 409 | Shipment already exists for this order | Expédition déjà existante pour cette commande | الشحنة موجودة بالفعل لهذا الطلب |
| `SHIPPING_TRACKING_MISSING` | 400 | Tracking number is missing | Numéro de suivi manquant | رقم التتبع مفقود |
| `SHIPPING_PROVIDER_NOT_FOUND` | 404 | Shipping provider not found | Transporteur introuvable | شركة الشحن غير موجودة |
| `SHIPPING_PROVIDER_ERROR` | 502 | Shipping provider returned an error | Le transporteur a retourné une erreur | أرجعت شركة الشحن خطأً |
| `SHIPPING_PROVIDER_TIMEOUT` | 504 | Shipping provider request timed out | La requête au transporteur a expiré | انتهت مهلة طلب شركة الشحن |
| `SHIPPING_QUOTE_FAILED` | 502 | Failed to get shipping quote from provider | Échec de l'obtention du devis de livraison | فشل الحصول على عرض أسعار الشحن |
| `SHIPPING_CREATION_FAILED` | 502 | Failed to create shipment with provider | Échec de la création de l'expédition chez le transporteur | فشل إنشاء الشحنة لدى شركة الشحن |
| `SHIPPING_TRACKING_SYNC_FAILED` | 502 | Failed to sync tracking from provider | Échec de la synchronisation du suivi depuis le transporteur | فشل مزامنة التتبع من شركة الشحن |
| `SHIPPING_NO_SHIPMENT_FOR_ORDER` | 404 | No shipment found for this order | Aucune expédition trouvée pour cette commande | لا توجد شحنة لهذا الطلب |
| `SHIPPING_INVALID_PROVIDER_NAME` | 400 | Invalid shipping provider name | Nom du transporteur invalide | اسم شركة الشحن غير صالح |

#### ShippingWebhookService

**Scope prefix:** `SHIPPING_WEBHOOK_`

| Code | HTTP | EN | FR | AR |
|------|------|----|----|----|
| `SHIPPING_WEBHOOK_INVALID_SIGNATURE` | 401 | Invalid webhook signature | Signature webhook invalide | توقيع webhook غير صالح |
| `SHIPPING_WEBHOOK_UNKNOWN_PROVIDER` | 400 | Unknown webhook provider | Fournisseur webhook inconnu | موفر webhook غير معروف |
| `SHIPPING_WEBHOOK_SHIPMENT_NOT_FOUND` | 404 | Shipment not found for webhook event | Expédition introuvable pour l'événement webhook | الشحنة غير موجودة لحدث webhook |
| `SHIPPING_WEBHOOK_PROCESSING_FAILED` | 500 | Failed to process webhook payload | Échec du traitement de la charge utile webhook | فشل معالجة حمولة webhook |

#### ShippingJobRunnerService

**Scope prefix:** `SHIPPING_JOB_`

| Code | HTTP | EN | FR | AR |
|------|------|----|----|----|
| `SHIPPING_JOB_ENQUEUE_FAILED` | 500 | Failed to enqueue tracking sync job | Échec de l'ajout à la file de synchronisation | فشل إضافة مهمة مزامنة التتبع |
| `SHIPPING_JOB_RUNNER_FAILED` | 500 | Shipping job runner execution failed | Échec de l'exécution du planificateur d'expédition | فشل تنفيذ مشغل مهام الشحن |

---

### 6. Billing & Finance System

#### InvoiceService

**Scope prefix:** `INVOICE_`

| Code | HTTP | EN | FR | AR |
|------|------|----|----|----|
| `INVOICE_NOT_FOUND` | 404 | Invoice not found | Facture introuvable | الفاتورة غير موجودة |
| `INVOICE_ORDER_NOT_FOUND` | 404 | Order not found for invoice generation | Commande introuvable pour la génération de facture | الطلب غير موجود لإنشاء الفاتورة |
| `INVOICE_ALREADY_EXISTS` | 409 | Invoice already exists for this order | La facture existe déjà pour cette commande | الفاتورة موجودة بالفعل لهذا الطلب |
| `INVOICE_ALREADY_PAID` | 409 | Invoice is already paid | La facture est déjà payée | الفاتورة مدفوعة بالفعل |
| `INVOICE_ALREADY_VOID` | 409 | Invoice is already void | La facture est déjà annulée | الفاتورة ملغاة بالفعل |
| `INVOICE_CANNOT_VOID_PAID` | 409 | Cannot void a paid invoice | Impossible d'annuler une facture payée | لا يمكن إلغاء فاتورة مدفوعة |
| `INVOICE_ITEM_NOT_IN_ORDER` | 400 | Item SKU is not part of this order | L'article SKU ne fait pas partie de cette commande | عنصر SKU ليس جزءاً من هذا الطلب |
| `INVOICE_NUMBER_GENERATION_FAILED` | 500 | Failed to generate invoice number | Échec de la génération du numéro de facture | فشل توليد رقم الفاتورة |
| `INVOICE_PDF_GENERATION_FAILED` | 500 | PDF generation failed | Échec de la génération du PDF | فشل إنشاء PDF |
| `INVOICE_EMAIL_DELIVERY_FAILED` | 500 | Invoice email delivery failed | Échec de l'envoi de la facture par email | فشل إرسال الفاتورة عبر البريد الإلكتروني |

#### TaxCalculationService

**Scope prefix:** `TAX_`

| Code | HTTP | EN | FR | AR |
|------|------|----|----|----|
| `TAX_INVALID_RATE` | 400 | Invalid tax rate provided | Taux de taxe invalide | معدل الضريبة غير صالح |
| `TAX_CALCULATION_FAILED` | 500 | Tax calculation failed | Échec du calcul de la taxe | فشل حساب الضريبة |
| `TAX_ITEM_MISMATCH` | 400 | Item count mismatch in tax calculation | Incohérence du nombre d'articles dans le calcul de la taxe | عدم تطابق عدد العناصر في حساب الضريبة |

#### PdfGenerationService

**Scope prefix:** `PDF_`

| Code | HTTP | EN | FR | AR |
|------|------|----|----|----|
| `PDF_GENERATION_FAILED` | 500 | PDF document generation failed | Échec de la génération du document PDF | فشل إنشاء مستند PDF |
| `PDF_INVALID_TEMPLATE_DATA` | 400 | Invalid invoice data for PDF template | Données de facture invalides pour le modèle PDF | بيانات الفاتورة غير صالحة لقالب PDF |

#### EmailService

**Scope prefix:** `EMAIL_`

| Code | HTTP | EN | FR | AR |
|------|------|----|----|----|
| `EMAIL_SEND_FAILED` | 500 | Failed to send email | Échec de l'envoi de l'email | فشل إرسال البريد الإلكتروني |
| `EMAIL_INVALID_ADDRESS` | 400 | Invalid email address | Adresse email invalide | عنوان البريد الإلكتروني غير صالح |
| `EMAIL_QUEUE_FAILED` | 500 | Failed to queue email for delivery | Échec de la mise en file d'attente de l'email | فشل وضع البريد الإلكتروني في قائمة الانتظار |

---

### 7. Product Reviews Management

#### ReviewService

**Scope prefix:** `REVIEW_`

| Code | HTTP | EN | FR | AR |
|------|------|----|----|----|
| `REVIEW_NOT_FOUND` | 404 | Review not found | Avis introuvable | المراجعة غير موجودة |
| `REVIEW_PRODUCT_NOT_FOUND` | 404 | Product not found for review | Produit introuvable pour l'avis | المنتج غير موجود للمراجعة |
| `REVIEW_ALREADY_EXISTS` | 409 | You have already reviewed this product | Vous avez déjà évalué ce produit | لقد قمت بتقييم هذا المنتج بالفعل |
| `REVIEW_RATING_INVALID` | 400 | Rating must be between 1 and 5 | La note doit être comprise entre 1 et 5 | يجب أن يكون التقييم بين 1 و 5 |
| `REVIEW_CONTENT_TOO_SHORT` | 400 | Review content is too short | Le contenu de l'avis est trop court | محتوى المراجعة قصير جداً |
| `REVIEW_CONTENT_TOO_LONG` | 400 | Review content exceeds maximum length | Le contenu de l'avis dépasse la longueur maximale | محتوى المراجعة يتجاوز الحد الأقصى للطول |
| `REVIEW_SPAM_DETECTED` | 429 | Review flagged as spam, please try later | Avis signalé comme spam, veuillez réessayer plus tard | تم وضع علامة على المراجعة كبريد عشوائي |
| `REVIEW_PURCHASE_REQUIRED` | 403 | Only verified purchasers can review this product | Seuls les acheteurs vérifiés peuvent évaluer ce produit | يمكن للمشترين الموثقين فقط تقييم هذا المنتج |
| `REVIEW_NOT_PURCHASED` | 403 | You have not purchased this product | Vous n'avez pas acheté ce produit | لم تقم بشراء هذا المنتج |

#### ReviewCacheService

**Scope prefix:** `REVIEW_CACHE_`

| Code | HTTP | EN | FR | AR |
|------|------|----|----|----|
| `REVIEW_CACHE_GET_FAILED` | 500 | Failed to read review cache | Échec de la lecture du cache des avis | فشل قراءة ذاكرة التخزين المؤقت للمراجعات |
| `REVIEW_CACHE_SET_FAILED` | 500 | Failed to write review cache | Échec de l'écriture du cache des avis | فشل كتابة ذاكرة التخزين المؤقت للمراجعات |
| `REVIEW_CACHE_INVALIDATION_FAILED` | 500 | Failed to invalidate review cache | Échec de l'invalidation du cache des avis | فشل إبطال ذاكرة التخزين المؤقت للمراجعات |

#### ReportService

**Scope prefix:** `REPORT_`

| Code | HTTP | EN | FR | AR |
|------|------|----|----|----|
| `REPORT_NOT_FOUND` | 404 | Report not found | Signalement introuvable | البلاغ غير موجود |
| `REPORT_ALREADY_EXISTS` | 409 | You have already reported this review | Vous avez déjà signalé cet avis | لقد أبلغت عن هذه المراجعة بالفعل |
| `REPORT_REASON_INVALID` | 400 | Invalid report reason | Motif de signalement invalide | سبب البلاغ غير صالح |
| `REPORT_REVIEW_NOT_FOUND` | 404 | Review not found for reporting | Avis introuvable pour le signalement | المراجعة غير موجودة للتبليغ |

#### ModerationService

**Scope prefix:** `MODERATION_`

| Code | HTTP | EN | FR | AR |
|------|------|----|----|----|
| `MODERATION_REVIEW_NOT_FOUND` | 404 | Review not found for moderation | Avis introuvable pour la modération | المراجعة غير موجودة للمراجعة |
| `MODERATION_ALREADY_APPROVED` | 409 | Review is already approved | L'avis est déjà approuvé | المراجعة معتمدة بالفعل |
| `MODERATION_ALREADY_REJECTED` | 409 | Review is already rejected | L'avis est déjà rejeté | المراجعة مرفوضة بالفعل |
| `MODERATION_ACTION_INVALID` | 400 | Invalid moderation action | Action de modération invalide | إجراء المراجعة غير صالح |
| `MODERATION_STATS_FAILED` | 500 | Failed to retrieve moderation statistics | Échec de la récupération des statistiques de modération | فشل استرداد إحصائيات المراجعة |
| `MODERATION_TRENDS_FAILED` | 500 | Failed to retrieve rating trends | Échec de la récupération des tendances d'évaluation | فشل استرداد اتجاهات التقييم |

#### HelpfulService

**Scope prefix:** `HELPFUL_`

| Code | HTTP | EN | FR | AR |
|------|------|----|----|----|
| `HELPFUL_REVIEW_NOT_FOUND` | 404 | Review not found | Avis introuvable | المراجعة غير موجودة |
| `HELPFUL_ALREADY_VOTED` | 409 | You have already voted this review as helpful | Vous avez déjà voté cet avis comme utile | لقد صوتت بالفعل على هذه المراجعة كمفيدة |

---

### 8. Analytics Management System

#### EventIngestionService

**Scope prefix:** `ANALYTICS_EVENT_`

| Code | HTTP | EN | FR | AR |
|------|------|----|----|----|
| `ANALYTICS_EVENT_INVALID_TYPE` | 400 | Invalid analytics event type | Type d'événement analytique invalide | نوع حدث التحليلات غير صالح |
| `ANALYTICS_EVENT_INVALID_PAYLOAD` | 400 | Invalid event payload | Charge utile d'événement invalide | حمولة الحدث غير صالحة |
| `ANALYTICS_EVENT_INGESTION_FAILED` | 500 | Failed to ingest analytics event | Échec de l'ingestion de l'événement analytique | فشل استيعاب حدث التحليلات |
| `ANALYTICS_EVENT_BATCH_FAILED` | 500 | Batch event ingestion failed | Échec de l'ingestion par lots | فشل استيعاب الأحداث المجمعة |
| `ANALYTICS_EVENT_REDIS_FAILED` | 500 | Redis event queue unavailable | File d'attente Redis indisponible | قائمة انتظار Redis غير متاحة |

#### AnalyticsQueryService

**Scope prefix:** `ANALYTICS_QUERY_`

| Code | HTTP | EN | FR | AR |
|------|------|----|----|----|
| `ANALYTICS_QUERY_OVERVIEW_FAILED` | 500 | Failed to compute analytics overview | Échec du calcul de l'aperçu analytique | فشل حساب نظرة عامة التحليلات |
| `ANALYTICS_QUERY_PRODUCT_FAILED` | 500 | Failed to compute product analytics | Échec du calcul des analytiques produit | فشل حساب تحليلات المنتج |
| `ANALYTICS_QUERY_SEARCH_FAILED` | 500 | Failed to compute search analytics | Échec du calcul des analytiques de recherche | فشل حساب تحليلات البحث |
| `ANALYTICS_QUERY_REALTIME_FAILED` | 500 | Failed to fetch realtime analytics | Échec de la récupération des analytiques en temps réel | فشل جلب التحليلات في الوقت الفعلي |
| `ANALYTICS_QUERY_DATE_RANGE_INVALID` | 400 | Invalid date range for analytics query | Plage de dates invalide pour la requête analytique | نطاق تاريخ غير صالح لاستعلام التحليلات |
| `ANALYTICS_QUERY_PRODUCT_NOT_FOUND` | 404 | Product not found for analytics | Produit introuvable pour les analytiques | المنتج غير موجود للتحليلات |

#### AnalyticsCacheService

**Scope prefix:** `ANALYTICS_CACHE_`

| Code | HTTP | EN | FR | AR |
|------|------|----|----|----|
| `ANALYTICS_CACHE_GET_FAILED` | 500 | Failed to read analytics cache | Échec de la lecture du cache analytique | فشل قراءة ذاكرة التخزين المؤقت للتحليلات |
| `ANALYTICS_CACHE_SET_FAILED` | 500 | Failed to write analytics cache | Échec de l'écriture du cache analytique | فشل كتابة ذاكرة التخزين المؤقت للتحليلات |

#### AggregationService

**Scope prefix:** `ANALYTICS_AGGREGATION_`

| Code | HTTP | EN | FR | AR |
|------|------|----|----|----|
| `ANALYTICS_AGGREGATION_ROLLUP_FAILED` | 500 | Daily data rollup failed | Échec de l'agrégation quotidienne des données | فشل تجميع البيانات اليومية |
| `ANALYTICS_AGGREGATION_PRODUCT_ROLLUP_FAILED` | 500 | Product daily rollup failed | Échec de l'agrégation quotidienne des produits | فشل التجميع اليومي للمنتج |
| `ANALYTICS_AGGREGATION_FUNNEL_ROLLUP_FAILED` | 500 | Funnel daily rollup failed | Échec de l'agrégation quotidienne de l'entonnoir | فشل التجميع اليومي للقمع |
| `ANALYTICS_AGGREGATION_SEARCH_ROLLUP_FAILED` | 500 | Search daily rollup failed | Échec de l'agrégation quotidienne des recherches | فشل التجميع اليومي للبحث |
| `ANALYTICS_AGGREGATION_INVALID_DATE` | 400 | Invalid date for aggregation rollup | Date invalide pour l'agrégation | تاريخ غير صالح للتجميع |

#### RetentionService

**Scope prefix:** `ANALYTICS_RETENTION_`

| Code | HTTP | EN | FR | AR |
|------|------|----|----|----|
| `ANALYTICS_RETENTION_PURGE_FAILED` | 500 | Failed to purge old analytics data | Échec de la purge des données analytiques anciennes | فشل تنظيف بيانات التحليلات القديمة |

#### AggregationJobRunnerService

**Scope prefix:** `ANALYTICS_JOB_`

| Code | HTTP | EN | FR | AR |
|------|------|----|----|----|
| `ANALYTICS_JOB_RUNNER_FAILED` | 500 | Analytics job runner execution failed | Échec de l'exécution du planificateur analytique | فشل تنفيذ مشغل مهام التحليلات |

---

### 9. Campaign Management System

#### CampaignService

**Scope prefix:** `CAMPAIGN_`

| Code | HTTP | EN | FR | AR |
|------|------|----|----|----|
| `CAMPAIGN_NOT_FOUND` | 404 | Campaign not found | Campagne introuvable | الحملة غير موجودة |
| `CAMPAIGN_SLUG_CONFLICT` | 409 | A campaign with this slug already exists | Une campagne avec ce slug existe déjà | توجد حملة بهذا المعرف بالفعل |
| `CAMPAIGN_DATE_RANGE_INVALID` | 400 | Start date must be before end date | La date de début doit être antérieure à la date de fin | يجب أن يكون تاريخ البدء قبل تاريخ الانتهاء |
| `CAMPAIGN_ALREADY_ACTIVE` | 409 | Campaign is already active | La campagne est déjà active | الحملة نشطة بالفعل |
| `CAMPAIGN_ALREADY_INACTIVE` | 409 | Campaign is already inactive | La campagne est déjà inactive | الحملة غير نشطة بالفعل |
| `CAMPAIGN_CANNOT_DELETE_ACTIVE` | 409 | Cannot delete an active campaign | Impossible de supprimer une campagne active | لا يمكن حذف حملة نشطة |
| `CAMPAIGN_BANNER_NOT_FOUND` | 404 | Campaign banner not found | Bannière de campagne introuvable | لافتة الحملة غير موجودة |
| `CAMPAIGN_SECTION_NOT_FOUND` | 404 | Campaign section not found | Section de campagne introuvable | قسم الحملة غير موجود |
| `CAMPAIGN_BANNER_LIMIT_EXCEEDED` | 400 | Maximum banner limit exceeded for this campaign | Limite maximale de bannières dépassée pour cette campagne | تم تجاوز الحد الأقصى للافتات لهذه الحملة |
| `CAMPAIGN_SECTION_LIMIT_EXCEEDED` | 400 | Maximum section limit exceeded for this campaign | Limite maximale de sections dépassée pour cette campagne | تم تجاوز الحد الأقصى للأقسام لهذه الحملة |
| `CAMPAIGN_INVALID_PAGE_SLUG` | 400 | Invalid page slug for campaign section | Slug de page invalide pour la section de campagne | معرف الصفحة غير صالح لقسم الحملة |
| `CAMPAIGN_ANALYTICS_FAILED` | 500 | Failed to retrieve campaign analytics | Échec de la récupération des analytiques de campagne | فشل استرداد تحليلات الحملة |

#### CampaignSchedulerService

**Scope prefix:** `CAMPAIGN_SCHEDULER_`

| Code | HTTP | EN | FR | AR |
|------|------|----|----|----|
| `CAMPAIGN_SCHEDULER_NOT_FOUND` | 404 | Campaign not found for scheduling | Campagne introuvable pour la planification | الحملة غير موجودة للجدولة |
| `CAMPAIGN_SCHEDULER_CANCEL_FAILED` | 500 | Failed to cancel pending schedules | Échec de l'annulation des planifications en attente | فشل إلغاء الجدولات المعلقة |

#### CampaignCacheService

**Scope prefix:** `CAMPAIGN_CACHE_`

| Code | HTTP | EN | FR | AR |
|------|------|----|----|----|
| `CAMPAIGN_CACHE_GET_FAILED` | 500 | Failed to read campaign cache | Échec de la lecture du cache de campagne | فشل قراءة ذاكرة التخزين المؤقت للحملة |
| `CAMPAIGN_CACHE_SET_FAILED` | 500 | Failed to write campaign cache | Échec de l'écriture du cache de campagne | فشل كتابة ذاكرة التخزين المؤقت للحملة |
| `CAMPAIGN_CACHE_INVALIDATION_FAILED` | 500 | Failed to invalidate campaign cache | Échec de l'invalidation du cache de campagne | فشل إبطال ذاكرة التخزين المؤقت للحملة |

---

## Error Response Format

### tRPC

```json
{
  "error": {
    "message": "Product not found",
    "code": "NOT_FOUND",
    "data": {
      "code": "NOT_FOUND",
      "httpStatus": 404,
      "appCode": "PRODUCT_NOT_FOUND",
      "details": {
        "product_id": "abc123",
        "_messages": {
          "fr": "Produit introuvable",
          "en": "Product not found",
          "ar": "المنتج غير موجود"
        }
      },
      "messages": {
        "fr": "Produit introuvable",
        "en": "Product not found",
        "ar": "المنتج غير موجود"
      }
    }
  }
}
```

### REST (Next.js API Route)

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Product not found",
    "details": {
      "product_id": "abc123",
      "_messages": {
        "fr": "Produit introuvable",
        "en": "Product not found",
        "ar": "المنتج غير موجود"
      }
    }
  },
  "meta": {
    "timestamp": "2026-06-16 12:00:00"
  }
}
```

---

## Error Code Index

| # | Scope Prefix | Feature |
|---|-------------|---------|
| 1 | `AUTH_` | Authentication & Authorization |
| 2 | `PRODUCT_` | Product Service |
| 3 | `PRODUCT_ADMIN_` | Product Admin Service |
| 4 | `PRODUCT_MEDIA_` | Product Media Service |
| 5 | `BRAND_` | Brand Service |
| 6 | `CATEGORY_` | Category Service |
| 7 | `CATEGORY_CACHE_` | Category Cache Service |
| 8 | `VARIANT_` | Variant Service |
| 9 | `SKU_` | SKU Service |
| 10 | `SEARCH_` | Search Service |
| 11 | `SEARCH_CACHE_` | Search Cache Service |
| 12 | `RECOMMENDATION_` | Recommendation Service |
| 13 | `VIEW_TRACKING_` | View Tracking Service |
| 14 | `TRENDING_INDEX_` | Trending Index Service |
| 15 | `RECOMMENDATION_INDEX_` | Indexing Service / IndexJobRunner |
| 16 | `RECOMMENDATION_CACHE_` | Recommendation Cache Service |
| 17 | `CART_` | Cart Service |
| 18 | `CHECKOUT_` | Checkout Service |
| 19 | `ORDER_` | Order Service |
| 20 | `ORDER_ADMIN_` | Order Admin Service |
| 21 | `CUSTOMER_` | Customer Service |
| 22 | `PROMOTION_` | Promotion Service |
| 23 | `PROMOTION_SCHEDULER_` | Promotion Scheduler / JobRunner |
| 24 | `FLASH_SALE_` | Flash Sale Service |
| 25 | `CART_DISCOUNT_` | Cart Discount Service |
| 26 | `PREORDER_FULFILLMENT_` | Preorder Fulfillment Service |
| 27 | `PREORDER_ALLOCATION_` | Preorder Allocation Service |
| 28 | `AVAILABILITY_` | Availability Service |
| 29 | `INVENTORY_` | Inventory Service |
| 30 | `INVENTORY_ADMIN_` | Inventory Admin Service |
| 31 | `RESERVATION_` | Reservation Service |
| 32 | `WAREHOUSE_` | Warehouse Service |
| 33 | `FORECAST_` | Demand Forecast Service |
| 34 | `FORECAST_ALERT_` | Alert Service |
| 35 | `FORECAST_CACHE_` | Forecast Cache Service |
| 36 | `FORECAST_JOB_` | Forecast Index / JobRunner |
| 37 | `SHIPPING_` | Shipping Service |
| 38 | `SHIPPING_WEBHOOK_` | Shipping Webhook Service |
| 39 | `SHIPPING_JOB_` | Shipping JobRunner Service |
| 40 | `INVOICE_` | Invoice Service |
| 41 | `TAX_` | Tax Calculation Service |
| 42 | `PDF_` | PDF Generation Service |
| 43 | `EMAIL_` | Email Service |
| 44 | `REVIEW_` | Review Service |
| 45 | `REVIEW_CACHE_` | Review Cache Service |
| 46 | `REPORT_` | Report Service |
| 47 | `MODERATION_` | Moderation Service |
| 48 | `HELPFUL_` | Helpful Service |
| 49 | `ANALYTICS_EVENT_` | Event Ingestion Service |
| 50 | `ANALYTICS_QUERY_` | Analytics Query Service |
| 51 | `ANALYTICS_CACHE_` | Analytics Cache Service |
| 52 | `ANALYTICS_AGGREGATION_` | Aggregation Service |
| 53 | `ANALYTICS_RETENTION_` | Retention Service |
| 54 | `ANALYTICS_JOB_` | Aggregation JobRunner |
| 55 | `CAMPAIGN_` | Campaign Service |
| 56 | `CAMPAIGN_SCHEDULER_` | Campaign Scheduler Service |
| 57 | `CAMPAIGN_CACHE_` | Campaign Cache Service |
