CREATE TABLE `site` (
	`id` integer PRIMARY KEY NOT NULL,
	`version` integer NOT NULL,
	`components` text NOT NULL,
	`updated_at` integer NOT NULL,
	`updated_by` text NOT NULL
);
