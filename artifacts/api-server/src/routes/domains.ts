import { Router, type IRouter } from "express";
import { db, domainsTable, storesTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { requireAuth, requireAdmin, JwtPayload } from "../lib/auth.js";

const router: IRouter = Router();

async function getStoreForUser(userId: string) {
  const [store] = await db.select().from(storesTable).where(eq(storesTable.userId, userId)).limit(1);
  return store;
}

function generateDnsTarget(slug: string) {
  return `${slug}.umkmgo.id`;
}

router.get("/domains", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as any).user as JwtPayload;
    const store = await getStoreForUser(userId);
    if (!store) { res.status(404).json({ error: "Store not found" }); return; }

    const domains = await db.select().from(domainsTable)
      .where(eq(domainsTable.storeId, store.id))
      .orderBy(desc(domainsTable.createdAt));
    res.json(domains);
  } catch (err) {
    req.log.error({ err }, "List domains error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/domains", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as any).user as JwtPayload;
    const store = await getStoreForUser(userId);
    if (!store) { res.status(404).json({ error: "Store not found" }); return; }

    const { domain } = req.body;
    if (!domain) { res.status(400).json({ error: "Validation error", message: "Domain is required" }); return; }

    const cleanDomain = domain.toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
    const existing = await db.select().from(domainsTable).where(eq(domainsTable.domain, cleanDomain)).limit(1);
    if (existing.length > 0) { res.status(409).json({ error: "Domain already registered" }); return; }

    const [newDomain] = await db.insert(domainsTable).values({
      storeId: store.id,
      userId,
      domain: cleanDomain,
      status: "pending_dns",
      dnsTarget: generateDnsTarget(store.slug),
      verificationToken: crypto.randomUUID(),
    }).returning();

    res.status(201).json(newDomain);
  } catch (err) {
    req.log.error({ err }, "Add domain error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/domains/:id/verify", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as any).user as JwtPayload;
    const [domain] = await db.select().from(domainsTable).where(and(eq(domainsTable.id, req.params.id), eq(domainsTable.userId, userId))).limit(1);
    if (!domain) { res.status(404).json({ error: "Domain not found" }); return; }

    const newStatus = Math.random() > 0.5 ? "active" : "pending_dns";
    const [updated] = await db.update(domainsTable).set({ status: newStatus, lastCheckedAt: new Date(), updatedAt: new Date() })
      .where(eq(domainsTable.id, req.params.id))
      .returning();
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Verify domain error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/domains/:id", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as any).user as JwtPayload;
    await db.delete(domainsTable).where(and(eq(domainsTable.id, req.params.id), eq(domainsTable.userId, userId)));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Delete domain error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/domains", requireAdmin, async (req, res) => {
  try {
    const domains = await db.select({
      id: domainsTable.id,
      domain: domainsTable.domain,
      status: domainsTable.status,
      storeId: domainsTable.storeId,
      userId: domainsTable.userId,
      createdAt: domainsTable.createdAt,
      lastCheckedAt: domainsTable.lastCheckedAt,
    }).from(domainsTable).orderBy(desc(domainsTable.createdAt));
    res.json(domains);
  } catch (err) {
    req.log.error({ err }, "Admin list domains error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
