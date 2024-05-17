import type { TransformVersions } from "@oberoncms/core"
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const site = sqliteTable("site", {
  id: integer("id").primaryKey(),
  version: integer("version").notNull(),
  components: text("components", { mode: "json" })
    .$type<TransformVersions>()
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  updatedBy: text("updated_by").notNull(),
})
