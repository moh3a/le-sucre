ALTER TABLE `users` MODIFY COLUMN `phone` varchar(50);--> statement-breakpoint
ALTER TABLE `users` ADD `is_anonymous` boolean DEFAULT false NOT NULL;