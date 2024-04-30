import { pgTable, text, integer, uniqueIndex } from "drizzle-orm/pg-core"

export const images = pgTable(
  "images",
  {
    key: text("key").notNull().primaryKey(),
    url: text("url").notNull(),
    alt: text("alt").notNull(),
    size: integer("size").notNull(),
    height: integer("height").notNull(),
    width: integer("width").notNull(),
  },
  (images) => {
    return {
      imagesKeyIdx: uniqueIndex("images_key_idx").on(images.key),
    }
  },
)
