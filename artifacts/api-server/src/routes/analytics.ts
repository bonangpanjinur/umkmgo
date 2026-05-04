import { Router, type IRouter } from "express";
import { db, storesTable, ordersTable } from "@workspace/db";
import { eq, and, gte, lte, ne } from "drizzle-orm";
import { requireAuth, JwtPayload } from "../lib/auth.js";

const router: IRouter = Router();

// Legacy dashboard stats (kept for compatibility)
router.get("/analytics/dashboard", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as any).user as JwtPayload;
    const [store] = await db.select().from(storesTable).where(eq(storesTable.userId, userId)).limit(1);
    if (!store) { res.json({ visitors: 0, orders: 0, revenue: 0, conversionRate: 0, recentOrders: [] }); return; }

    const orders = await db.select().from(ordersTable)
      .where(and(eq(ordersTable.storeId, store.id), ne(ordersTable.status, "cancelled")))
      .orderBy(ordersTable.createdAt);

    const revenue = orders.reduce((s, o) => s + Number(o.totalAmount ?? 0), 0);
    const visitors = store.visitCount || orders.length * 3;
    const conversionRate = visitors > 0 ? Math.round((orders.length / visitors) * 100 * 10) / 10 : 0;

    res.json({ visitors, orders: orders.length, revenue, conversionRate, recentOrders: [] });
  } catch (err) {
    req.log.error({ err }, "Dashboard stats error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// New: store analytics with real data
// GET /api/analytics/store-stats?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get("/analytics/store-stats", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as any).user as JwtPayload;
    const [store] = await db.select().from(storesTable).where(eq(storesTable.userId, userId)).limit(1);
    if (!store) { res.json(emptyStats()); return; }

    const { from, to } = req.query as { from?: string; to?: string };
    const toDate = to ? new Date(to + "T23:59:59.999Z") : new Date();
    const fromDate = from ? new Date(from + "T00:00:00.000Z") : (() => {
      const d = new Date(toDate);
      d.setDate(d.getDate() - 6);
      d.setHours(0, 0, 0, 0);
      return d;
    })();

    // Previous period for comparison
    const periodMs = toDate.getTime() - fromDate.getTime();
    const prevTo = new Date(fromDate.getTime() - 1);
    const prevFrom = new Date(prevTo.getTime() - periodMs);

    // Fetch current + previous period orders in parallel
    const [currentOrders, prevOrders] = await Promise.all([
      db.select().from(ordersTable).where(
        and(
          eq(ordersTable.storeId, store.id),
          ne(ordersTable.status, "cancelled"),
          gte(ordersTable.createdAt, fromDate),
          lte(ordersTable.createdAt, toDate)
        )
      ),
      db.select().from(ordersTable).where(
        and(
          eq(ordersTable.storeId, store.id),
          ne(ordersTable.status, "cancelled"),
          gte(ordersTable.createdAt, prevFrom),
          lte(ordersTable.createdAt, prevTo)
        )
      ),
    ]);

    // Build daily data
    const dailyMap: Record<string, { date: string; label: string; revenue: number; orders: number }> = {};
    let cursor = new Date(fromDate);
    while (cursor <= toDate) {
      const key = cursor.toISOString().slice(0, 10);
      dailyMap[key] = {
        date: key,
        label: cursor.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
        revenue: 0,
        orders: 0,
      };
      cursor.setDate(cursor.getDate() + 1);
    }
    for (const o of currentOrders) {
      const key = new Date(o.createdAt).toISOString().slice(0, 10);
      if (dailyMap[key]) {
        dailyMap[key].revenue += Number(o.totalAmount ?? 0);
        dailyMap[key].orders += 1;
      }
    }

    // Top products
    const productMap: Record<string, { name: string; revenue: number; sold: number }> = {};
    for (const o of currentOrders) {
      let items: any[] = [];
      try { items = JSON.parse(o.items); } catch {}
      for (const item of items) {
        const name = item.name ?? item.productName ?? "Produk";
        if (!productMap[name]) productMap[name] = { name, revenue: 0, sold: 0 };
        productMap[name].revenue += Number(item.price ?? 0) * Number(item.quantity ?? 1);
        productMap[name].sold += Number(item.quantity ?? 1);
      }
    }
    const topProducts = Object.values(productMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Peak hours (0–23)
    const hourMap: Record<number, { hour: number; label: string; orders: number; revenue: number }> = {};
    for (let h = 0; h < 24; h++) {
      hourMap[h] = { hour: h, label: `${String(h).padStart(2, "0")}:00`, orders: 0, revenue: 0 };
    }
    for (const o of currentOrders) {
      const h = new Date(o.createdAt).getHours();
      hourMap[h].orders += 1;
      hourMap[h].revenue += Number(o.totalAmount ?? 0);
    }
    const peakHours = Object.values(hourMap).filter(h => h.hour >= 6 && h.hour <= 23);

    // Source breakdown
    const sourceMap: Record<string, { source: string; orders: number; revenue: number }> = {};
    for (const o of currentOrders) {
      const src = o.source ?? "manual";
      if (!sourceMap[src]) sourceMap[src] = { source: src, orders: 0, revenue: 0 };
      sourceMap[src].orders += 1;
      sourceMap[src].revenue += Number(o.totalAmount ?? 0);
    }

    // Totals
    const totalRevenue = currentOrders.reduce((s, o) => s + Number(o.totalAmount ?? 0), 0);
    const totalOrders = currentOrders.length;
    const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const prevRevenue = prevOrders.reduce((s, o) => s + Number(o.totalAmount ?? 0), 0);
    const prevOrderCount = prevOrders.length;

    const revenueTrend = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : null;
    const orderTrend = prevOrderCount > 0 ? ((totalOrders - prevOrderCount) / prevOrderCount) * 100 : null;

    res.json({
      period: { from: fromDate.toISOString(), to: toDate.toISOString() },
      totals: { revenue: totalRevenue, orders: totalOrders, avgOrder },
      trends: { revenue: revenueTrend, orders: orderTrend },
      prevTotals: { revenue: prevRevenue, orders: prevOrderCount },
      daily: Object.values(dailyMap),
      topProducts,
      peakHours,
      sourceBreakdown: Object.values(sourceMap),
    });
  } catch (err) {
    req.log.error({ err }, "Store stats error");
    res.status(500).json({ error: "Internal server error" });
  }
});

function emptyStats() {
  return {
    period: { from: new Date().toISOString(), to: new Date().toISOString() },
    totals: { revenue: 0, orders: 0, avgOrder: 0 },
    trends: { revenue: null, orders: null },
    prevTotals: { revenue: 0, orders: 0 },
    daily: [],
    topProducts: [],
    peakHours: [],
    sourceBreakdown: [],
  };
}

export default router;
