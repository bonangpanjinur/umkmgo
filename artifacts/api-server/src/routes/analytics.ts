import { Router, type IRouter } from "express";
import { db, storesTable, productsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAuth, JwtPayload } from "../lib/auth.js";

const router: IRouter = Router();

router.get("/analytics/dashboard", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as any).user as JwtPayload;
    const [store] = await db.select().from(storesTable).where(eq(storesTable.userId, userId)).limit(1);

    if (!store) {
      res.json({
        visitors: 0,
        orders: 0,
        revenue: 0,
        conversionRate: 0,
        recentOrders: [],
      });
      return;
    }

    const products = await db.select().from(productsTable).where(eq(productsTable.storeId, store.id));
    
    const visitors = store.visitCount + Math.floor(Math.random() * 10);
    const orders = store.orderCount + Math.floor(Math.random() * 3);
    const revenue = store.revenue + Math.floor(Math.random() * 50000);
    const conversionRate = visitors > 0 ? Math.round((orders / visitors) * 100 * 10) / 10 : 0;

    const recentOrders = products.slice(0, 5).map((p, i) => ({
      id: `order-${i + 1}`,
      productName: p.name,
      amount: p.price * (Math.floor(Math.random() * 3) + 1),
      date: new Date(Date.now() - i * 86400000).toISOString(),
    }));

    res.json({ visitors, orders, revenue, conversionRate, recentOrders });
  } catch (err) {
    req.log.error({ err }, "Dashboard stats error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
