import type { PageData } from "@oberoncms/core"
import {
  pgTable,
  jsonb,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core"

export const pages = pgTable(
  "pages",
  {
    key: text("key").notNull().primaryKey(),
    data: jsonb("data").notNull().$type<PageData>(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull(),
    updatedBy: text("updated_by").notNull(),
  },
  (pages) => {
    return {
      pagesKeyIdx: uniqueIndex("pages_key_idx").on(pages.key),
    }
  },
)
