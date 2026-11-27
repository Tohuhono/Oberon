import type { ComponentType, OberonComponentRecord } from "@oberoncms/core"
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const components = sqliteTable(
  "components",
  {
    key: text("key").notNull().primaryKey(),
    type: text("type").$type<ComponentType>().notNull().default("page"),
    data: text("data", { mode: "json" }).$type<OberonComponentRecord["data"]>().notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
    updatedBy: text("updated_by").notNull(),
  },
  (table) => ({
    componentsTypeIdx: index("components_type_idx").on(table.type),
  }),
)
