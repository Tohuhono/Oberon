import type { FragmentData } from "@oberoncms/core"
import { pgTable, index, jsonb, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core"

export const fragments = pgTable(
  "pages",
  {
    key: text("key").notNull().primaryKey(),
    type: text("type").notNull().default("page"),
    data: jsonb("data").notNull().$type<FragmentData>(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull(),
    updatedBy: text("updated_by").notNull(),
  },
  (table) => {
    return {
      pagesKeyIdx: uniqueIndex("pages_key_idx").on(table.key),
      fragmentsTypeIdx: index("fragments_type_idx").on(table.type),
    }
  },
)
