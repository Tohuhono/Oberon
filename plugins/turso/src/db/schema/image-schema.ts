import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"

export const images = sqliteTable("images", {
  key: text("key").notNull().primaryKey(),
  url: text("url").notNull(),
  alt: text("alt").notNull(),
  size: integer("size").notNull(),
  height: integer("height").notNull(),
  width: integer("width").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  updatedBy: text("updated_by").notNull(),
})
