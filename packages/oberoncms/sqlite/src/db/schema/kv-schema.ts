import { primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const kv = sqliteTable(
  "kv",
  {
    namespace: text("namespace").notNull(),
    key: text("key").notNull(),
    value: text("value", { mode: "json" }).notNull(),
  },
  (table) => ({
    compoundKey: primaryKey({ columns: [table.namespace, table.key] }),
  }),
)
