import { pgTable, text, timestamp, varchar, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const storesTable = pgTable("stores", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  categoryId: text("category_id").notNull(),
  whatsapp: varchar("whatsapp", { length: 50 }),
  logoUrl: text("logo_url"),
  theme: varchar("theme", { length: 50 }).notNull().default("modern"),
  status: varchar("status", { length: 50 }).notNull().default("active"),
  visitCount: integer("visit_count").notNull().default(0),
  orderCount: integer("order_count").notNull().default(0),
  revenue: integer("revenue").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertStoreSchema = createInsertSchema(storesTable).omit({ id: true, createdAt: true, updatedAt: true, visitCount: true, orderCount: true, revenue: true });
export type InsertStore = z.infer<typeof insertStoreSchema>;
export type Store = typeof storesTable.$inferSelect;
