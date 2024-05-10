import { pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core"

// TODO schema version
export const pages = pgTable(
  "pages",
  {
    key: text("key").notNull().primaryKey(),
    data: text("data"),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull(),
    updatedBy: text("updated_by").notNull(),
  },
  (pages) => {
    return {
      pagesKeyIdx: uniqueIndex("pages_key_idx").on(pages.key),
    }
  },
)
