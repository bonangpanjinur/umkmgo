import { Router, type IRouter } from "express";
import { db, storesTable, categoriesTable, productsTable } from "@workspace/db";
import { eq, ilike, sql } from "drizzle-orm";
import { requireAuth, requireAdmin, JwtPayload } from "../lib/auth.js";

const router: IRouter = Router();

router.get("/stores/my", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as any).user as JwtPayload;
    const [store] = await db
      .select({
        id: storesTable.id,
        name: storesTable.name,
        slug: storesTable.slug,
        description: storesTable.description,
        categoryId: storesTable.categoryId,
        whatsapp: storesTable.whatsapp,
        logoUrl: storesTable.logoUrl,
        theme: storesTable.theme,
        userId: storesTable.userId,
        status: storesTable.status,
        visitCount: storesTable.visitCount,
        orderCount: storesTable.orderCount,
        revenue: storesTable.revenue,
        createdAt: storesTable.createdAt,
        categoryName: categoriesTable.name,
      })
      .from(storesTable)
      .leftJoin(categoriesTable, eq(storesTable.categoryId, categoriesTable.id))
      .where(eq(storesTable.userId, userId))
      .limit(1);

    if (!store) {
      res.status(404).json({ error: "Not found", message: "No store found" });
      return;
    }

    const products = await db.select().from(productsTable).where(eq(productsTable.storeId, store.id));
    res.json({ ...store, productCount: products.length });
  } catch (err) {
    req.log.error({ err }, "Get my store error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/stores/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const [store] = await db
      .select({
        id: storesTable.id,
        name: storesTable.name,
        slug: storesTable.slug,
        description: storesTable.description,
        categoryId: storesTable.categoryId,
        whatsapp: storesTable.whatsapp,
        logoUrl: storesTable.logoUrl,
        theme: storesTable.theme,
        userId: storesTable.userId,
        status: storesTable.status,
        visitCount: storesTable.visitCount,
        orderCount: storesTable.orderCount,
        revenue: storesTable.revenue,
        createdAt: storesTable.createdAt,
        categoryName: categoriesTable.name,
      })
      .from(storesTable)
      .leftJoin(categoriesTable, eq(storesTable.categoryId, categoriesTable.id))
      .where(eq(storesTable.slug, slug))
      .limit(1);

    if (!store) {
      res.status(404).json({ error: "Not found", message: "Store not found" });
      return;
    }

    const products = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.storeId, store.id))
      .orderBy(productsTable.sortOrder);

    res.json({ ...store, products });
  } catch (err) {
    req.log.error({ err }, "Get store by slug error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/stores", requireAuth, async (req, res) => {
  try {
    const { role, userId } = (req as any).user as JwtPayload;
    const page = parseInt(String(req.query.page || "1"));
    const limit = parseInt(String(req.query.limit || "20"));
    const search = req.query.search as string | undefined;
    const offset = (page - 1) * limit;

    let query = db
      .select({
        id: storesTable.id,
        name: storesTable.name,
        slug: storesTable.slug,
        description: storesTable.description,
        categoryId: storesTable.categoryId,
        categoryName: categoriesTable.name,
        whatsapp: storesTable.whatsapp,
        logoUrl: storesTable.logoUrl,
        theme: storesTable.theme,
        userId: storesTable.userId,
        status: storesTable.status,
        visitCount: storesTable.visitCount,
        orderCount: storesTable.orderCount,
        revenue: storesTable.revenue,
        createdAt: storesTable.createdAt,
      })
      .from(storesTable)
      .leftJoin(categoriesTable, eq(storesTable.categoryId, categoriesTable.id))
      .$dynamic();

    if (role !== "admin" && role !== "super_admin") {
      query = query.where(eq(storesTable.userId, userId));
    } else if (search) {
      query = query.where(ilike(storesTable.name, `%${search}%`));
    }

    const stores = await query.limit(limit).offset(offset);
    const productsCount = await db.select({
      storeId: productsTable.storeId,
      count: sql<number>`count(*)::int`,
    }).from(productsTable).groupBy(productsTable.storeId);

    const countMap = new Map(productsCount.map(p => [p.storeId, p.count]));
    const storesWithCount = stores.map(s => ({ ...s, productCount: countMap.get(s.id) || 0 }));

    res.json({ data: storesWithCount, total: stores.length, page, limit });
  } catch (err) {
    req.log.error({ err }, "List stores error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/stores", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as any).user as JwtPayload;
    const { name, slug, description, categoryId, whatsapp, logoUrl, theme } = req.body;

    if (!name || !slug || !categoryId) {
      res.status(400).json({ error: "Validation error", message: "Name, slug, and category are required" });
      return;
    }

    const existing = await db.select({ id: storesTable.id }).from(storesTable).where(eq(storesTable.slug, slug)).limit(1);
    if (existing.length > 0) {
      res.status(409).json({ error: "Conflict", message: "Slug already taken, please choose another" });
      return;
    }

    const [store] = await db.insert(storesTable).values({
      userId,
      name,
      slug,
      description,
      categoryId,
      whatsapp,
      logoUrl,
      theme: theme || "modern",
    }).returning();

    res.status(201).json({ ...store, productCount: 0, categoryName: null });
  } catch (err) {
    req.log.error({ err }, "Create store error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/stores/:slug", requireAuth, async (req, res) => {
  try {
    const { userId, role } = (req as any).user as JwtPayload;
    const { slug } = req.params;

    const [store] = await db.select().from(storesTable).where(eq(storesTable.slug, slug)).limit(1);
    if (!store) {
      res.status(404).json({ error: "Not found", message: "Store not found" });
      return;
    }

    if (store.userId !== userId && role !== "admin" && role !== "super_admin") {
      res.status(403).json({ error: "Forbidden", message: "Not authorized" });
      return;
    }

    const { name, description, categoryId, whatsapp, logoUrl, theme } = req.body;
    const [updated] = await db.update(storesTable)
      .set({ name, description, categoryId, whatsapp, logoUrl, theme, updatedAt: new Date() })
      .where(eq(storesTable.slug, slug))
      .returning();

    const products = await db.select().from(productsTable).where(eq(productsTable.storeId, store.id));
    res.json({ ...updated, productCount: products.length });
  } catch (err) {
    req.log.error({ err }, "Update store error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
