CREATE TABLE IF NOT EXISTS "kv" (
	"namespace" text NOT NULL,
	"key" text NOT NULL,
	"value" jsonb NOT NULL,
	CONSTRAINT "kv_namespace_key_pk" PRIMARY KEY("namespace","key")
);