import type { FragmentType, OberonFragment } from "@oberoncms/core"
import { index, pgTable, jsonb, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core"

export const fragments = pgTable(
  "fragments",
  {
    key: text("key").notNull().primaryKey(),
    type: text("type").$type<FragmentType>().notNull().default("page"),
    data: jsonb("data").notNull().$type<OberonFragment["data"]>(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull(),
    updatedBy: text("updated_by").notNull(),
  },
  (table) => {
    return {
      fragmentsKeyIdx: uniqueIndex("fragments_key_idx").on(table.key),
      fragmentsTypeIdx: index("fragments_type_idx").on(table.type),
    }
  },
)
