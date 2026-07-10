-- Fulltext index on brands for brand-aware product search
ALTER TABLE `brands` ADD FULLTEXT INDEX `ft_brands_name` (`name`);
--> statement-breakpoint

-- Fulltext index on categories for category-aware product search
ALTER TABLE `categories` ADD FULLTEXT INDEX `ft_categories_name` (`name`);
--> statement-breakpoint

-- Indexes for fast prefix suggestions (type-ahead)
CREATE INDEX `brands_name_idx` ON `brands` (`name`);
--> statement-breakpoint
CREATE INDEX `categories_name_idx` ON `categories` (`name`);
--> statement-breakpoint
CREATE INDEX `pt_name_locale_idx` ON `product_translations` (`name`, `locale`);
--> statement-breakpoint

-- Search queries analytics table
CREATE TABLE `search_queries` (
  `id` varchar(255) NOT NULL,
  `query` varchar(200) NOT NULL,
  `locale` varchar(5) NOT NULL DEFAULT 'fr',
  `results_count` int NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `search_queries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `search_queries_query_idx` ON `search_queries` (`query`);
--> statement-breakpoint
CREATE INDEX `search_queries_created_idx` ON `search_queries` (`created_at`);
