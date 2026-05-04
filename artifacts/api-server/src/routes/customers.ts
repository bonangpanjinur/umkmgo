import { Router, type IRouter } from "express";
import { db, customersTable, storesTable, ordersTable } from "@workspace/db";
import { eq, desc, and, or, ilike, sql } from "drizzle-orm";
import { requireAuth, JwtPayload } from "../lib/auth.js";

const router: IRouter = Router();

async function getStoreForUser(userId: string) {
  const [store] = await db.select().from(storesTable).where(eq(storesTable.userId, userId)).limit(1);
  return store;
}

router.get("/customers", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as any).user as JwtPayload;
    const store = await getStoreForUser(userId);
    if (!store) { res.status(404).json({ error: "Store not found" }); return; }

    const page = parseInt(String(req.query.page || "1"));
    const limit = parseInt(String(req.query.limit || "20"));
    const search = req.query.search as string | undefined;
    const sort = (req.query.sort as string) || "recent";
    const offset = (page - 1) * limit;

    let baseQuery = db.select().from(customersTable)
      .where(
        search
          ? and(
              eq(customersTable.storeId, store.id),
              or(
                ilike(customersTable.name, `%${search}%`),
                ilike(customersTable.phone, `%${search}%`)
              )
            )
          : eq(customersTable.storeId, store.id)
      )
      .$dynamic();

    if (sort === "spent") baseQuery = baseQuery.orderBy(desc(customersTable.totalSpent));
    else if (sort === "orders") baseQuery = baseQuery.orderBy(desc(customersTable.orderCount));
    else baseQuery = baseQuery.orderBy(desc(customersTable.lastOrderAt));

    const customers = await baseQuery.limit(limit).offset(offset);

    const [{ total }] = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(customersTable)
      .where(
        search
          ? and(
              eq(customersTable.storeId, store.id),
              or(
                ilike(customersTable.name, `%${search}%`),
                ilike(customersTable.phone, `%${search}%`)
              )
            )
          : eq(customersTable.storeId, store.id)
      );

    // Summary stats
    const [stats] = await db
      .select({
        totalCustomers: sql<number>`count(*)::int`,
        totalRevenue: sql<number>`sum(total_spent)`,
        avgSpent: sql<number>`avg(total_spent)`,
      })
      .from(customersTable)
      .where(eq(customersTable.storeId, store.id));

    res.json({ data: customers, total, page, limit, stats });
  } catch (err) {
    req.log.error({ err }, "List customers error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get single customer with order history
router.get("/customers/:id", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as any).user as JwtPayload;
    const store = await getStoreForUser(userId);
    if (!store) { res.status(404).json({ error: "Store not found" }); return; }

    const [customer] = await db
      .select()
      .from(customersTable)
      .where(and(eq(customersTable.id, req.params.id), eq(customersTable.storeId, store.id)));
    if (!customer) { res.status(404).json({ error: "Customer not found" }); return; }

    // Fetch all orders matching this customer's phone
    const orders = await db
      .select()
      .from(ordersTable)
      .where(
        and(
          eq(ordersTable.storeId, store.id),
          eq(ordersTable.buyerPhone, customer.phone)
        )
      )
      .orderBy(desc(ordersTable.createdAt))
      .limit(50);

    // Parse items and compute favorite product
    const productCount: Record<string, { name: string; count: number }> = {};
    const ordersWithItems = orders.map((o) => {
      let items: any[] = [];
      try { items = JSON.parse(o.items); } catch {}
      for (const item of items) {
        const name = item.name ?? "Produk";
        if (!productCount[name]) productCount[name] = { name, count: 0 };
        productCount[name].count += Number(item.quantity ?? 1);
      }
      return { ...o, items };
    });

    const favoriteProduct = Object.values(productCount).sort((a, b) => b.count - a.count)[0] ?? null;

    res.json({ customer, orders: ordersWithItems, favoriteProduct });
  } catch (err) {
    req.log.error({ err }, "Get customer error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/customers", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as any).user as JwtPayload;
    const store = await getStoreForUser(userId);
    if (!store) { res.status(404).json({ error: "Store not found" }); return; }

    const { name, phone, email, address, notes } = req.body;
    if (!name || !phone) {
      res.status(400).json({ error: "Validation error", message: "Name and phone are required" });
      return;
    }
    const [customer] = await db.insert(customersTable).values({ storeId: store.id, name, phone, email, address, notes }).returning();
    res.status(201).json(customer);
  } catch (err) {
    req.log.error({ err }, "Create customer error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/customers/:id", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as any).user as JwtPayload;
    const store = await getStoreForUser(userId);
    if (!store) { res.status(404).json({ error: "Store not found" }); return; }

    const { name, phone, email, address, notes } = req.body;
    const [updated] = await db
      .update(customersTable)
      .set({ name, phone, email, address, notes, updatedAt: new Date() })
      .where(and(eq(customersTable.id, req.params.id), eq(customersTable.storeId, store.id)))
      .returning();
    if (!updated) { res.status(404).json({ error: "Customer not found" }); return; }
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Update customer error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/customers/:id", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as any).user as JwtPayload;
    const store = await getStoreForUser(userId);
    if (!store) { res.status(404).json({ error: "Store not found" }); return; }

    await db.delete(customersTable)
      .where(and(eq(customersTable.id, req.params.id), eq(customersTable.storeId, store.id)));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Delete customer error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
