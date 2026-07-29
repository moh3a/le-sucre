import { z } from "zod";

export const variant_channel_enum = z.enum(["retail", "wholesale"]);
export type VariantChannel = z.infer<typeof variant_channel_enum>;

const slug_regex = /^[a-z0-9]+(?:_[a-z0-9]+)*$/;

export const create_property_dto = z.object({
  product_id: z.string().min(1, "L'identifiant produit est requis").max(255, "L'identifiant produit est trop long"),
  code: z
    .string()
    .min(1, "Le code de la propriété est requis")
    .max(64, "Le code ne peut pas dépasser 64 caractères")
    .regex(slug_regex, "Le code doit être en minuscules, sans espaces ni accents (ex: taille, couleur)"),
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(255, "Le nom est trop long"),
  sort_order: z.number().int("L'ordre doit être un nombre entier").min(0, "L'ordre ne peut pas être négatif").default(0),
  is_required: z.boolean().default(true),
});

export const update_property_dto = create_property_dto.partial().extend({
  id: z.string().min(1, "L'identifiant de la propriété est requis").max(255),
});

export const color_hex_regex = /^#[0-9a-fA-F]{6}$/;

export const create_property_value_dto = z.object({
  property_id: z.string().min(1, "L'identifiant de la propriété est requis").max(255),
  code: z
    .string()
    .min(1, "Le code de la valeur est requis")
    .max(64, "Le code ne peut pas dépasser 64 caractères")
    .regex(slug_regex, "Le code doit être en minuscules, sans espaces ni accents (ex: petit, bleu)"),
  label: z.string().min(1, "Le libellé est requis").max(255, "Le libellé est trop long"),
  sort_order: z.number().int("L'ordre doit être un nombre entier").min(0, "L'ordre ne peut pas être négatif").default(0),
  thumbnail_image: z
    .string()
    .url("L'URL de l'image miniature n'est pas valide")
    .max(1024, "L'URL est trop longue")
    .optional()
    .nullable(),
  color_hex: z
    .string()
    .regex(color_hex_regex, "Le format de la couleur doit être #RRGGBB (ex: #ff0000)")
    .optional()
    .nullable(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const update_property_value_dto = create_property_value_dto.partial().extend({
  id: z.string().min(1, "L'identifiant de la valeur est requis").max(255),
});

export const generate_skus_dto = z.object({
  product_id: z.string().min(1, "L'identifiant produit est requis").max(255),
  max_combinations: z
    .number()
    .int("Le nombre maximum doit être un nombre entier")
    .min(1, "Le nombre minimum de combinaisons est 1")
    .max(5000, "Le nombre maximum de combinaisons est 5000")
    .default(500),
});

export const create_sku_dto = z.object({
  product_id: z.string().min(1, "L'identifiant produit est requis").max(255),
  sku_code: z.string().min(1, "Le code SKU est requis").max(128, "Le code SKU ne peut pas dépasser 128 caractères"),
  barcode: z.string().max(64, "Le code-barres est trop long").optional().nullable(),
  base_price: z.coerce.number("Le prix de base doit être un nombre").min(0, "Le prix ne peut pas être négatif").optional().nullable(),
  offer_price: z.coerce.number("Le prix promo doit être un nombre").min(0, "Le prix promo ne peut pas être négatif").optional().nullable(),
  wholesale_base_price: z.coerce.number("Le prix de gros doit être un nombre").min(0, "Le prix de gros ne peut pas être négatif").optional().nullable(),
  wholesale_offer_price: z.coerce.number("Le prix promo de gros doit être un nombre").min(0, "Le prix promo de gros ne peut pas être négatif").optional().nullable(),
  currency: z
    .string()
    .length(3, "Le code devise doit contenir exactement 3 caractères (ex: DZD, EUR)")
    .optional()
    .nullable(),
  is_active: z.boolean().default(true),
  metadata: z.record(z.string(), z.unknown()).optional(),
  property_value_ids: z
    .array(z.string().min(1, "Un identifiant de valeur est requis").max(255))
    .min(1, "Au moins une valeur de propriété est requise"),
});

export const update_sku_dto = create_sku_dto.partial().extend({
  id: z.string().min(1, "L'identifiant du SKU est requis").max(255),
});

export const set_sku_price_tier_dto = z.object({
  sku_id: z.string().min(1, "L'identifiant du SKU est requis").max(255),
  channel: variant_channel_enum.default("retail"),
  min_quantity: z
    .number()
    .int("La quantité minimale doit être un nombre entier")
    .min(1, "La quantité minimale doit être d'au moins 1"),
  price: z.coerce.number("Le prix doit être un nombre").min(0, "Le prix ne peut pas être négatif"),
  currency: z
    .string()
    .length(3, "Le code devise doit contenir exactement 3 caractères")
    .default("DZD"),
  valid_from: z.string().optional().nullable(),
  valid_to: z.string().optional().nullable(),
});

export const delete_sku_price_tier_dto = z.object({
  sku_id: z.string().min(1, "L'identifiant du SKU est requis").max(255),
  channel: variant_channel_enum,
  min_quantity: z
    .number()
    .int("La quantité minimale doit être un nombre entier")
    .min(1, "La quantité minimale doit être d'au moins 1"),
});

export const resolve_price_dto = z.object({
  product_id: z.string().min(1, "L'identifiant produit est requis").max(255),
  sku_id: z.string().min(1, "L'identifiant du SKU est requis").max(255),
  quantity: z
    .number()
    .int("La quantité doit être un nombre entier")
    .min(1, "La quantité doit être d'au moins 1")
    .default(1),
  channel: variant_channel_enum.default("retail"),
  currency: z
    .string()
    .length(3, "Le code devise doit contenir exactement 3 caractères")
    .optional(),
});
