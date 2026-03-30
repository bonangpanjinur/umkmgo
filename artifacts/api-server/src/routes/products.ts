import { Router, type IRouter } from "express";
import { db, productsTable, storesTable } from "@workspace/db";
import { eq, and, ilike, sql } from "drizzle-orm";
import { requireAuth, JwtPayload } from "../lib/auth.js";

const router: IRouter = Router();

async function getUserStore(userId: string) {
  const [store] = await db.select({ id: storesTable.id }).from(storesTable).where(eq(storesTable.userId, userId)).limit(1);
  return store;
}

router.get("/products", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as any).user as JwtPayload;
    const page = parseInt(String(req.query.page || "1"));
    const limit = parseInt(String(req.query.limit || "20"));
    const search = req.query.search as string | undefined;
    const offset = (page - 1) * limit;

    const store = await getUserStore(userId);
    if (!store) {
      res.json({ data: [], total: 0, page, limit });
      return;
    }

    let where = eq(productsTable.storeId, store.id);
    if (search) {
      where = and(where, ilike(productsTable.name, `%${search}%`)) as any;
    }

    const products = await db.select().from(productsTable).where(where).limit(limit).offset(offset).orderBy(productsTable.sortOrder);
    const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(productsTable).where(where);

    res.json({ data: products, total: count, page, limit });
  } catch (err) {
    req.log.error({ err }, "List products error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/products", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as any).user as JwtPayload;
    const store = await getUserStore(userId);
    if (!store) {
      res.status(400).json({ error: "Bad request", message: "You need to create a store first" });
      return;
    }

    const { name, description, price, imageUrl, isAvailable } = req.body;
    if (!name || price === undefined) {
      res.status(400).json({ error: "Validation error", message: "Name and price are required" });
      return;
    }

    const [{ maxOrder }] = await db.select({ maxOrder: sql<number>`coalesce(max(sort_order), 0)` }).from(productsTable).where(eq(productsTable.storeId, store.id));
    const [product] = await db.insert(productsTable).values({
      storeId: store.id,
      name,
      description,
      price: Number(price),
      imageUrl,
      isAvailable: isAvailable !== false,
      sortOrder: (maxOrder || 0) + 1,
    }).returning();

    res.status(201).json(product);
  } catch (err) {
    req.log.error({ err }, "Create product error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/products/:id", requireAuth, async (req, res) => {
  try {
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, req.params.id)).limit(1);
    if (!product) {
      res.status(404).json({ error: "Not found", message: "Product not found" });
      return;
    }
    res.json(product);
  } catch (err) {
    req.log.error({ err }, "Get product error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/products/:id", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as any).user as JwtPayload;
    const store = await getUserStore(userId);

    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, req.params.id)).limit(1);
    if (!product || (store && product.storeId !== store.id)) {
      res.status(404).json({ error: "Not found", message: "Product not found" });
      return;
    }

    const { name, description, price, imageUrl, isAvailable, sortOrder } = req.body;
    const [updated] = await db.update(productsTable)
      .set({ name, description, price: price !== undefined ? Number(price) : undefined, imageUrl, isAvailable, sortOrder, updatedAt: new Date() })
      .where(eq(productsTable.id, req.params.id))
      .returning();

    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Update product error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/products/:id", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as any).user as JwtPayload;
    const store = await getUserStore(userId);

    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, req.params.id)).limit(1);
    if (!product || (store && product.storeId !== store.id)) {
      res.status(404).json({ error: "Not found", message: "Product not found" });
      return;
    }

    await db.delete(productsTable).where(eq(productsTable.id, req.params.id));
    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    req.log.error({ err }, "Delete product error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
