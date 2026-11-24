import type { FragmentData } from "@oberoncms/core"
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const fragments = sqliteTable(
  "pages",
  {
    key: text("key").notNull().primaryKey(),
    type: text("type").notNull().default("page"),
    data: text("data", { mode: "json" }).$type<FragmentData>().notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
    updatedBy: text("updated_by").notNull(),
  },
  (table) => [index("fragments_type_idx").on(table.type)],
)
