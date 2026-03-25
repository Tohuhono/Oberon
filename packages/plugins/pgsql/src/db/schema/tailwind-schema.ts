import type { OberonTailwindAsset } from "@oberoncms/core"
import { jsonb, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core"

export const tailwindAssets = pgTable(
  "tailwind_assets",
  {
    hash: text("hash").notNull().primaryKey(),
    classList: jsonb("class_list")
      .notNull()
      .$type<OberonTailwindAsset["classList"]>(),
    css: text("css").notNull(),
  },
  (table) => {
    return {
      tailwindAssetHashIdx: uniqueIndex("tailwind_assets_hash_idx").on(
        table.hash,
      ),
    }
  },
)
