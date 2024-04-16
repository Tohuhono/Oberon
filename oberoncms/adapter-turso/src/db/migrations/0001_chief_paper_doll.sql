ALTER TABLE `assets` RENAME TO `images`;--> statement-breakpoint
ALTER TABLE `images` RENAME COLUMN `name` TO `alt`;--> statement-breakpoint
ALTER TABLE images ADD `height` integer NOT NULL;--> statement-breakpoint
ALTER TABLE images ADD `width` integer NOT NULL;