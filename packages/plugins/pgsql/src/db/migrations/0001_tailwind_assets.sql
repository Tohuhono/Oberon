CREATE TABLE IF NOT EXISTS "tailwind_assets" (
	"hash" text PRIMARY KEY NOT NULL,
	"class_list" jsonb NOT NULL,
	"css" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "site" ADD COLUMN IF NOT EXISTS "active_tailwind_hash" text;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "tailwind_assets_hash_idx" ON "tailwind_assets" ("hash");