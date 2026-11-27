ALTER TABLE "pages" RENAME TO "components";--> statement-breakpoint
ALTER INDEX "pages_key_idx" RENAME TO "components_key_idx";--> statement-breakpoint
ALTER TABLE "components" ADD COLUMN "type" text DEFAULT 'page' NOT NULL;--> statement-breakpoint
CREATE INDEX "components_type_idx" ON "components" ("type");