import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

// TODO schema version
export const pages = sqliteTable("pages", {
  key: text("key").notNull().primaryKey(),
  data: text("data"),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  updatedBy: text("updated_by").notNull(),
})
