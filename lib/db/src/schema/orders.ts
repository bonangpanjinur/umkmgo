import { pgTable, text, timestamp, varchar, integer, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ordersTable = pgTable("orders", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  storeId: text("store_id").notNull(),
  buyerName: varchar("buyer_name", { length: 255 }).notNull(),
  buyerPhone: varchar("buyer_phone", { length: 50 }).notNull(),
  buyerAddress: text("buyer_address"),
  tableNumber: varchar("table_number", { length: 50 }),
  items: text("items").notNull(),
  totalAmount: doublePrecision("total_amount").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  paymentStatus: varchar("payment_status", { length: 50 }).notNull().default("pending"),
  notes: text("notes"),
  source: varchar("source", { length: 50 }).notNull().default("whatsapp"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
