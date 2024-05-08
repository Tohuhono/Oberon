ALTER TABLE "images" ADD COLUMN "updated_at" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "images" ADD COLUMN "updated_by" text NOT NULL;