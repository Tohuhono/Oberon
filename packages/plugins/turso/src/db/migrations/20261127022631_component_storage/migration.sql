ALTER TABLE `pages` RENAME TO `components`;--> statement-breakpoint
ALTER TABLE `components` ADD `type` text DEFAULT 'page' NOT NULL;--> statement-breakpoint
CREATE INDEX `components_type_idx` ON `components` (`type`);