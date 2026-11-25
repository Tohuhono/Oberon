ALTER TABLE `pages` RENAME TO `fragments`;--> statement-breakpoint
ALTER TABLE `fragments` ADD `type` text DEFAULT 'page' NOT NULL;--> statement-breakpoint
CREATE INDEX `fragments_type_idx` ON `fragments` (`type`);--> statement-breakpoint
UPDATE `fragments` SET `updated_at` = `updated_at` * 1000;
