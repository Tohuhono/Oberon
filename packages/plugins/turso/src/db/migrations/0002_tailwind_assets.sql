CREATE TABLE `tailwind_assets` (
	`hash` text PRIMARY KEY NOT NULL,
	`class_list` text NOT NULL,
	`css` text NOT NULL
) WITHOUT ROWID;
--> statement-breakpoint
ALTER TABLE `site` ADD `active_tailwind_hash` text;