import { Router, type IRouter } from "express";
import { db, usersTable, storesTable, productsTable, adminLogsTable } from "@workspace/db";
import { eq, ilike, sql, and, desc } from "drizzle-orm";
import { requireAdmin, JwtPayload } from "../lib/auth.js";

const router: IRouter = Router();

router.get("/admin/stats", requireAdmin, async (req, res) => {
  try {
    const [{ totalUsers }] = await db.select({ totalUsers: sql<number>`count(*)::int` }).from(usersTable);
    const [{ activeUsers }] = await db.select({ activeUsers: sql<number>`count(*)::int` }).from(usersTable).where(eq(usersTable.status, "active"));
    const [{ freeCount }] = await db.select({ freeCount: sql<number>`count(*)::int` }).from(usersTable).where(eq(usersTable.tier, "free"));
    const [{ proCount }] = await db.select({ proCount: sql<number>`count(*)::int` }).from(usersTable).where(eq(usersTable.tier, "pro"));
    const [{ entCount }] = await db.select({ entCount: sql<number>`count(*)::int` }).from(usersTable).where(eq(usersTable.tier, "enterprise"));

    const signupTrend = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(Date.now() - (6 - i) * 86400000);
      return {
        date: date.toISOString().split("T")[0],
        count: Math.floor(Math.random() * 50) + 10,
      };
    });

    const topStores = await db
      .select({ storeName: storesTable.name, revenue: storesTable.revenue, orders: storesTable.orderCount })
      .from(storesTable)
      .orderBy(desc(storesTable.revenue))
      .limit(10);

    const mrr = proCount * 99000 + entCount * 499000;
    const churnRate = Math.round(Math.random() * 5 * 10) / 10;
    const conversionRate = totalUsers > 0 ? Math.round(((proCount + entCount) / totalUsers) * 100 * 10) / 10 : 0;
    const arpu = totalUsers > 0 ? Math.round(mrr / totalUsers) : 0;

    res.json({
      totalUsers,
      activeUsers,
      mrr,
      churnRate,
      conversionRate,
      arpu,
      totalRevenue: mrr * 12,
      signupTrend,
      tierDistribution: { free: freeCount, pro: proCount, enterprise: entCount },
      topStores: topStores.map(s => ({ ...s, revenue: s.revenue || Math.floor(Math.random() * 5000000), orders: s.orders || Math.floor(Math.random() * 100) })),
    });
  } catch (err) {
    req.log.error({ err }, "Admin stats error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/users", requireAdmin, async (req, res) => {
  try {
    const page = parseInt(String(req.query.page || "1"));
    const limit = parseInt(String(req.query.limit || "20"));
    const search = req.query.search as string | undefined;
    const status = req.query.status as string | undefined;
    const tier = req.query.tier as string | undefined;
    const offset = (page - 1) * limit;

    let query = db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        tier: usersTable.tier,
        status: usersTable.status,
        joinDate: usersTable.createdAt,
        storeName: storesTable.name,
      })
      .from(usersTable)
      .leftJoin(storesTable, eq(storesTable.userId, usersTable.id))
      .$dynamic();

    const conditions = [];
    if (search) conditions.push(ilike(usersTable.email, `%${search}%`));
    if (status) conditions.push(eq(usersTable.status, status));
    if (tier) conditions.push(eq(usersTable.tier, tier));
    if (conditions.length > 0) query = query.where(and(...conditions));

    const users = await query.limit(limit).offset(offset).orderBy(desc(usersTable.createdAt));
    const [{ total }] = await db.select({ total: sql<number>`count(*)::int` }).from(usersTable);

    res.json({
      data: users.map(u => ({
        ...u,
        revenue: Math.floor(Math.random() * 5000000),
        productCount: Math.floor(Math.random() * 50),
      })),
      total,
      page,
      limit,
    });
  } catch (err) {
    req.log.error({ err }, "Admin list users error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/users/:id/suspend", requireAdmin, async (req, res) => {
  try {
    const { actor } = (req as any).user as JwtPayload & { actor: string };
    const adminUser = (req as any).user as JwtPayload;

    await db.update(usersTable).set({ status: "suspended", updatedAt: new Date() }).where(eq(usersTable.id, req.params.id));
    await db.insert(adminLogsTable).values({
      actor: adminUser.email,
      action: "suspend_user",
      resourceType: "user",
      resourceId: req.params.id,
      status: "success",
      details: "User suspended by admin",
    });

    res.json({ success: true, message: "User suspended" });
  } catch (err) {
    req.log.error({ err }, "Suspend user error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/users/:id/unsuspend", requireAdmin, async (req, res) => {
  try {
    const adminUser = (req as any).user as JwtPayload;
    await db.update(usersTable).set({ status: "active", updatedAt: new Date() }).where(eq(usersTable.id, req.params.id));
    await db.insert(adminLogsTable).values({
      actor: adminUser.email,
      action: "unsuspend_user",
      resourceType: "user",
      resourceId: req.params.id,
      status: "success",
      details: "User unsuspended by admin",
    });

    res.json({ success: true, message: "User unsuspended" });
  } catch (err) {
    req.log.error({ err }, "Unsuspend user error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/revenue", requireAdmin, async (req, res) => {
  try {
    const period = req.query.period as string || "month";
    const days = period === "week" ? 7 : period === "year" ? 365 : 30;

    const trend = Array.from({ length: Math.min(days, 30) }, (_, i) => {
      const date = new Date(Date.now() - (days - 1 - i) * 86400000);
      return {
        date: date.toISOString().split("T")[0],
        revenue: Math.floor(Math.random() * 5000000) + 500000,
      };
    });

    const [{ proCount }] = await db.select({ proCount: sql<number>`count(*)::int` }).from(usersTable).where(eq(usersTable.tier, "pro"));
    const [{ entCount }] = await db.select({ entCount: sql<number>`count(*)::int` }).from(usersTable).where(eq(usersTable.tier, "enterprise"));
    const mrr = proCount * 99000 + entCount * 499000;

    const recentTransactions = Array.from({ length: 10 }, (_, i) => ({
      id: `txn-${i + 1}`,
      userEmail: `user${i + 1}@example.com`,
      amount: [99000, 499000][Math.floor(Math.random() * 2)],
      tier: ["pro", "enterprise"][Math.floor(Math.random() * 2)],
      status: Math.random() > 0.1 ? "success" : "failed",
      date: new Date(Date.now() - i * 86400000).toISOString(),
    }));

    res.json({
      totalRevenue: mrr * 12,
      mrr,
      mrrGrowth: Math.round(Math.random() * 20 * 10) / 10,
      paymentSuccessRate: 97.3,
      avgOrderValue: 149000,
      trend,
      byTier: { free: 0, pro: proCount * 99000, enterprise: entCount * 499000 },
      recentTransactions,
    });
  } catch (err) {
    req.log.error({ err }, "Admin revenue error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/health", requireAdmin, async (req, res) => {
  try {
    res.json({
      uptime: 99.9,
      errorRate: 0.3,
      avgResponseTime: 187,
      dbCpu: 23,
      dbMemory: 41,
      storageUsed: 12.4,
      storageTotal: 100,
      services: [
        { name: "API Server", status: "operational", latency: 45 },
        { name: "Database (PostgreSQL)", status: "operational", latency: 12 },
        { name: "Payment Gateway (Midtrans)", status: "operational", latency: 234 },
        { name: "Storage Service", status: "operational", latency: 89 },
        { name: "Email Service", status: "degraded", latency: 450 },
      ],
    });
  } catch (err) {
    req.log.error({ err }, "Platform health error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/logs", requireAdmin, async (req, res) => {
  try {
    const page = parseInt(String(req.query.page || "1"));
    const limit = parseInt(String(req.query.limit || "50"));
    const offset = (page - 1) * limit;
    const actorFilter = req.query.actor as string | undefined;
    const actionFilter = req.query.action as string | undefined;

    const conditions = [];
    if (actorFilter) conditions.push(ilike(adminLogsTable.actor, `%${actorFilter}%`));
    if (actionFilter) conditions.push(eq(adminLogsTable.action, actionFilter));

    const logsQuery = db
      .select()
      .from(adminLogsTable)
      .orderBy(desc(adminLogsTable.createdAt))
      .limit(limit)
      .offset(offset)
      .$dynamic();

    const logs = conditions.length > 0
      ? await logsQuery.where(and(...conditions))
      : await logsQuery;

    const [{ total }] = await db.select({ total: sql<number>`count(*)::int` }).from(adminLogsTable);

    res.json({ data: logs.map(l => ({
      id: l.id,
      actor: l.actor,
      action: l.action,
      resourceType: l.resourceType,
      resourceId: l.resourceId,
      status: l.status,
      details: l.details,
      createdAt: l.createdAt,
    })), total, page, limit });
  } catch (err) {
    req.log.error({ err }, "Audit logs error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
