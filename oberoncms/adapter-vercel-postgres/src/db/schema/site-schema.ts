import type { TransformVersions } from "@oberoncms/core"
import {
  pgTable,
  json,
  text,
  timestamp,
  uniqueIndex,
  integer,
} from "drizzle-orm/pg-core"

export const site = pgTable(
  "site",
  {
    id: integer("id").notNull().primaryKey(),
    version: integer("version").notNull(),
    components: json("components").notNull().$type<TransformVersions>(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull(),
    updatedBy: text("updated_by").notNull(),
  },
  (pages) => {
    return {
      pagesKeyIdx: uniqueIndex("site_id_idx").on(pages.id),
    }
  },
)
