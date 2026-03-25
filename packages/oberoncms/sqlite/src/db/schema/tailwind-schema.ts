import type { OberonTailwindAsset } from "@oberoncms/core"
import { sqliteTable, text } from "drizzle-orm/sqlite-core"

export const tailwindAssets = sqliteTable(
  "tailwind_assets",
  {
    hash: text("hash").primaryKey(),
    classList: text("class_list", { mode: "json" })
      .$type<OberonTailwindAsset["classList"]>()
      .notNull(),
    css: text("css").notNull(),
  },
  () => [],
)
