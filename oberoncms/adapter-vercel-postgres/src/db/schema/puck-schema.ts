import { pgTable, text, uniqueIndex } from "drizzle-orm/pg-core"

// TODO schema version
export const pages = pgTable(
  "pages",
  {
    key: text("key").notNull().primaryKey(),
    data: text("data"),
  },
  (pages) => {
    return {
      pagesKeyIdx: uniqueIndex("pages_key_idx").on(pages.key),
    }
  },
)
