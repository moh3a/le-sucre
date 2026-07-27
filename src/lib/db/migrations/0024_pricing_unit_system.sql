-- Migration 0024: Enhance pricing engine with retail/wholesale unit system
-- This migration:
-- 1. Creates product_units table
-- 2. Adds wholesale price fields to product_skus
-- 3. Migrates existing data to the new unit system
-- 4. Drops wholesale_rules table
-- 5. Drops pieces_per_unit from products
-- 6. Drops unit_name from product_translations

-- Step 1: Create product_units table
CREATE TABLE `product_units` (
  `id` varchar(255) NOT NULL,
  `product_id` varchar(255) NOT NULL,
  `channel` varchar(32) NOT NULL,
  `unit_name` varchar(128) NOT NULL,
  `pieces_per_unit` int NOT NULL DEFAULT 1,
  `base_price` decimal(12,2) NOT NULL,
  `offer_price` decimal(12,2),
  `currency` varchar(3) NOT NULL DEFAULT 'DZD',
  `is_active` boolean NOT NULL DEFAULT true,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `product_units_product_channel_uidx` (`product_id`, `channel`),
  INDEX `product_units_product_idx` (`product_id`),
  CONSTRAINT `product_units_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;--> statement-breakpoint

-- Step 2: Add wholesale price fields to product_skus
ALTER TABLE `product_skus` ADD `wholesale_base_price` decimal(12,2);--> statement-breakpoint
ALTER TABLE `product_skus` ADD `wholesale_offer_price` decimal(12,2);--> statement-breakpoint

-- Step 3: Migrate existing product data to product_units (retail)
INSERT INTO `product_units` (`id`, `product_id`, `channel`, `unit_name`, `pieces_per_unit`, `base_price`, `offer_price`, `currency`, `is_active`, `created_at`, `updated_at`)
SELECT
  CONCAT('pu_retail_', p.id),
  p.id,
  'retail',
  COALESCE(pt.unit_name, 'pièce'),
  COALESCE(p.pieces_per_unit, 1),
  p.base_price,
  p.offer_price,
  p.currency,
  true,
  NOW(),
  NOW()
FROM `products` p
LEFT JOIN `product_translations` pt ON pt.product_id = p.id AND pt.locale = 'fr';--> statement-breakpoint

-- Step 4: Migrate existing product data to product_units (wholesale)
-- Default wholesale unit uses same prices as retail initially
INSERT INTO `product_units` (`id`, `product_id`, `channel`, `unit_name`, `pieces_per_unit`, `base_price`, `offer_price`, `currency`, `is_active`, `created_at`, `updated_at`)
SELECT
  CONCAT('pu_wholesale_', p.id),
  p.id,
  'wholesale',
  'carton',
  COALESCE(p.pieces_per_unit, 1),
  p.base_price,
  p.offer_price,
  p.currency,
  true,
  NOW(),
  NOW()
FROM `products` p
WHERE NOT EXISTS (
  SELECT 1 FROM `product_units` pu
  WHERE pu.product_id = p.id AND pu.channel = 'wholesale'
);--> statement-breakpoint

-- Step 5: Migrate wholesale_rules to sku_prices (where channel='wholesale')
-- First, insert any wholesale rules that have a fixed price as sku_prices tiers
INSERT INTO `sku_prices` (`id`, `sku_id`, `channel`, `min_quantity`, `price`, `currency`, `valid_from`, `valid_to`)
SELECT
  CONCAT('sp_from_wr_', wr.id),
  wr.sku_id,
  'wholesale',
  wr.min_quantity,
  wr.price,
  wr.currency,
  NULL,
  NULL
FROM `wholesale_rules` wr
WHERE wr.sku_id IS NOT NULL
  AND wr.price IS NOT NULL
  AND wr.is_active = true;--> statement-breakpoint

-- Step 6: Migrate wholesale rules with discount_percent to sku_prices
-- Calculate the effective price based on SKU base price
INSERT INTO `sku_prices` (`id`, `sku_id`, `channel`, `min_quantity`, `price`, `currency`, `valid_from`, `valid_to`)
SELECT
  CONCAT('sp_from_wrd_', wr.id),
  wr.sku_id,
  'wholesale',
  wr.min_quantity,
  ROUND(
    COALESCE(sku.base_price, p.base_price) * (1 - wr.discount_percent / 100),
    2
  ),
  wr.currency,
  NULL,
  NULL
FROM `wholesale_rules` wr
INNER JOIN `product_skus` sku ON sku.id = wr.sku_id
INNER JOIN `products` p ON p.id = sku.product_id
WHERE wr.sku_id IS NOT NULL
  AND wr.discount_percent IS NOT NULL
  AND wr.is_active = true;--> statement-breakpoint

-- Step 7: Drop wholesale_rules table
DROP TABLE IF EXISTS `wholesale_rules`;--> statement-breakpoint

-- Step 8: Drop pieces_per_unit from products
ALTER TABLE `products` DROP COLUMN `pieces_per_unit`;--> statement-breakpoint

-- Step 9: Drop unit_name from product_translations
ALTER TABLE `product_translations` DROP COLUMN `unit_name`;--> statement-breakpoint
