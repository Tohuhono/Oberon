CREATE TABLE IF NOT EXISTS "site" (
	"id" integer PRIMARY KEY NOT NULL,
	"version" integer NOT NULL,
	"components" json NOT NULL,
	"updated_at" timestamp NOT NULL,
	"updated_by" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pages" ALTER COLUMN "data" SET JSON USING to_json("data");--> statement-breakpoint
ALTER TABLE "pages" ALTER COLUMN "data" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "site_id_idx" ON "site" ("id");