import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"

export const assets = sqliteTable("assets", {
  key: text("key").notNull().primaryKey(),
  url: text("url").notNull(),
  name: text("name").notNull(),
  size: integer("size").notNull(),
})
