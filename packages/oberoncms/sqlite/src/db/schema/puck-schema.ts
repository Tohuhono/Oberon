import type { FragmentType, OberonFragment } from "@oberoncms/core"
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const fragments = sqliteTable(
  "fragments",
  {
    key: text("key").notNull().primaryKey(),
    type: text("type").$type<FragmentType>().notNull().default("page"),
    data: text("data", { mode: "json" }).$type<OberonFragment["data"]>().notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
    updatedBy: text("updated_by").notNull(),
  },
  (table) => ({
    fragmentsTypeIdx: index("fragments_type_idx").on(table.type),
  }),
)
