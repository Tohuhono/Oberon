import { sqliteTable, text } from "drizzle-orm/sqlite-core"

// TODO schema version
export const pages = sqliteTable("pages", {
  key: text("key").notNull().primaryKey(),
  data: text("data"),
})
