ALTER TABLE `pages` ADD `type` text DEFAULT 'page' NOT NULL;--> statement-breakpoint
CREATE INDEX `fragments_type_idx` ON `pages` (`type`);--> statement-breakpoint
UPDATE `pages` SET `updated_at` = `updated_at` * 1000;