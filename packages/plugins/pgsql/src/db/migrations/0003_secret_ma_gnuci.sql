ALTER TABLE "pages" ADD COLUMN "type" text DEFAULT 'page' NOT NULL;--> statement-breakpoint
CREATE INDEX "fragments_type_idx" ON "pages" USING btree ("type");