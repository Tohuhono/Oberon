CREATE TABLE `fragments` (
	`key` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`data` text NOT NULL,
	`updated_at` integer NOT NULL,
	`updated_by` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `fragments` (`key`, `type`, `data`, `updated_at`, `updated_by`)
SELECT `key`, 'page', `data`, `updated_at`, `updated_by` FROM `pages`;
--> statement-breakpoint
DROP TABLE `pages`;
--> statement-breakpoint
CREATE INDEX `fragments_type_idx` ON `fragments` (`type`);
