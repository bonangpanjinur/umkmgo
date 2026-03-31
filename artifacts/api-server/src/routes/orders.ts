import { Router, type IRouter } from "express";
import { db, ordersTable, customersTable, storesTable } from "@workspace/db";
import { eq, desc, and, sql } from "drizzle-orm";
import { requireAuth, JwtPayload } from "../lib/auth.js";

const router: IRouter = Router();

async function getStoreForUser(userId: string) {
  const [store] = await db.select().from(storesTable).where(eq(storesTable.userId, userId)).limit(1);
  return store;
}

async function upsertCustomer(storeId: string, name: string, phone: string, amount: number) {
  const [existing] = await db.select().from(customersTable)
    .where(and(eq(customersTable.storeId, storeId), eq(customersTable.phone, phone)))
    .limit(1);
  if (existing) {
    await db.update(customersTable).set({
      orderCount: sql`${customersTable.orderCount} + 1`,
      totalSpent: sql`${customersTable.totalSpent} + ${amount}`,
      lastOrderAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(customersTable.id, existing.id));
  } else {
    await db.insert(customersTable).values({ storeId, name, phone, orderCount: 1, totalSpent: amount, lastOrderAt: new Date() });
  }
}

router.get("/orders", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as any).user as JwtPayload;
    const store = await getStoreForUser(userId);
    if (!store) { res.status(404).json({ error: "Store not found" }); return; }

    const page = parseInt(String(req.query.page || "1"));
    const limit = parseInt(String(req.query.limit || "20"));
    const status = req.query.status as string | undefined;
    const offset = (page - 1) * limit;

    let query = db.select().from(ordersTable).where(eq(ordersTable.storeId, store.id)).$dynamic();
    if (status) query = query.where(and(eq(ordersTable.storeId, store.id), eq(ordersTable.status, status)));

    const orders = await query.orderBy(desc(ordersTable.createdAt)).limit(limit).offset(offset);
    const [{ total }] = await db.select({ total: sql<number>`count(*)::int` }).from(ordersTable).where(eq(ordersTable.storeId, store.id));

    res.json({ data: orders.map(o => ({ ...o, items: JSON.parse(o.items) })), total, page, limit });
  } catch (err) {
    req.log.error({ err }, "List orders error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/orders", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as any).user as JwtPayload;
    const store = await getStoreForUser(userId);
    if (!store) { res.status(404).json({ error: "Store not found" }); return; }

    const { buyerName, buyerPhone, buyerAddress, items, totalAmount, notes, source } = req.body;
    if (!buyerName || !buyerPhone || !items || totalAmount === undefined) {
      res.status(400).json({ error: "Validation error", message: "Required: buyerName, buyerPhone, items, totalAmount" });
      return;
    }

    const [order] = await db.insert(ordersTable).values({
      storeId: store.id,
      buyerName,
      buyerPhone,
      buyerAddress,
      items: JSON.stringify(items),
      totalAmount,
      notes,
      source: source || "manual",
      status: "pending",
      paymentStatus: "pending",
    }).returning();

    await upsertCustomer(store.id, buyerName, buyerPhone, totalAmount);
    await db.update(storesTable).set({ orderCount: sql`${storesTable.orderCount} + 1`, revenue: sql`${storesTable.revenue} + ${Math.round(totalAmount)}` }).where(eq(storesTable.id, store.id));

    res.status(201).json({ ...order, items: JSON.parse(order.items) });
  } catch (err) {
    req.log.error({ err }, "Create order error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/orders/:id", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as any).user as JwtPayload;
    const store = await getStoreForUser(userId);
    if (!store) { res.status(404).json({ error: "Store not found" }); return; }

    const [order] = await db.select().from(ordersTable)
      .where(and(eq(ordersTable.id, req.params.id), eq(ordersTable.storeId, store.id)))
      .limit(1);
    if (!order) { res.status(404).json({ error: "Order not found" }); return; }

    res.json({ ...order, items: JSON.parse(order.items) });
  } catch (err) {
    req.log.error({ err }, "Get order error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/orders/:id", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as any).user as JwtPayload;
    const store = await getStoreForUser(userId);
    if (!store) { res.status(404).json({ error: "Store not found" }); return; }

    const { status, paymentStatus, notes } = req.body;
    const [updated] = await db.update(ordersTable).set({ status, paymentStatus, notes, updatedAt: new Date() })
      .where(and(eq(ordersTable.id, req.params.id), eq(ordersTable.storeId, store.id)))
      .returning();
    if (!updated) { res.status(404).json({ error: "Order not found" }); return; }

    res.json({ ...updated, items: JSON.parse(updated.items) });
  } catch (err) {
    req.log.error({ err }, "Update order error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
