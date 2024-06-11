import type { PageData } from "@oberoncms/core"
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const pages = sqliteTable("pages", {
  key: text("key").notNull().primaryKey(),
  data: text("data", { mode: "json" }).$type<PageData>().notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  updatedBy: text("updated_by").notNull(),
})
