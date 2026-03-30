import { jsonb, pgTable, primaryKey, text } from "drizzle-orm/pg-core"

export const kv = pgTable(
  "kv",
  {
    namespace: text("namespace").notNull(),
    key: text("key").notNull(),
    value: jsonb("value").notNull(),
  },
  (table) => ({
    compoundKey: primaryKey({ columns: [table.namespace, table.key] }),
  }),
)
