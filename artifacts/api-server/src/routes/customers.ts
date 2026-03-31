import { Router, type IRouter } from "express";
import { db, customersTable, storesTable } from "@workspace/db";
import { eq, desc, and, ilike, sql } from "drizzle-orm";
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
    const offset = (page - 1) * limit;

    let query = db.select().from(customersTable).where(eq(customersTable.storeId, store.id)).$dynamic();
    if (search) {
      query = query.where(and(
        eq(customersTable.storeId, store.id),
        ilike(customersTable.name, `%${search}%`)
      ));
    }

    const customers = await query.orderBy(desc(customersTable.lastOrderAt)).limit(limit).offset(offset);
    const [{ total }] = await db.select({ total: sql<number>`count(*)::int` }).from(customersTable).where(eq(customersTable.storeId, store.id));

    res.json({ data: customers, total, page, limit });
  } catch (err) {
    req.log.error({ err }, "List customers error");
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
    const [updated] = await db.update(customersTable).set({ name, phone, email, address, notes, updatedAt: new Date() })
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
