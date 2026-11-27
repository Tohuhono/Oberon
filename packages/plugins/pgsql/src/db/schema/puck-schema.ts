import type { ComponentType, OberonComponentRecord } from "@oberoncms/core"
import { index, pgTable, jsonb, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core"

export const components = pgTable(
  "components",
  {
    key: text("key").notNull().primaryKey(),
    type: text("type").$type<ComponentType>().notNull().default("page"),
    data: jsonb("data").notNull().$type<OberonComponentRecord["data"]>(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull(),
    updatedBy: text("updated_by").notNull(),
  },
  (table) => {
    return {
      componentsKeyIdx: uniqueIndex("components_key_idx").on(table.key),
      componentsTypeIdx: index("components_type_idx").on(table.type),
    }
  },
)
