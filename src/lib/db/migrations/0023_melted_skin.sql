ALTER TABLE `product_translations` ADD `unit_name` varchar(128);--> statement-breakpoint
ALTER TABLE `products` ADD `pieces_per_unit` int DEFAULT 1 NOT NULL;