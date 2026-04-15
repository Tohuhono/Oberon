import { sqliteTable, text } from "drizzle-orm/sqlite-core"

export const users = sqliteTable("user", {
  id: text("id").notNull().primaryKey(),
  email: text("email").notNull(),
  role: text("role", { enum: ["admin", "user"] })
    .notNull()
    .default("user"),
})
