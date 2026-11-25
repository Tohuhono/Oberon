ALTER TABLE "pages" RENAME TO "fragments";--> statement-breakpoint
ALTER INDEX "pages_key_idx" RENAME TO "fragments_key_idx";--> statement-breakpoint
ALTER TABLE "fragments" ADD COLUMN "type" text DEFAULT 'page' NOT NULL;--> statement-breakpoint
CREATE INDEX "fragments_type_idx" ON "fragments" ("type");