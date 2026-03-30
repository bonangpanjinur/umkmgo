import { Router, type IRouter } from "express";
import { db, featureFlagsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "../lib/auth.js";

const router: IRouter = Router();

const DEFAULT_FLAGS = [
  { name: "whatsapp_integration", status: true, rolloutPercent: 100, tier: "all", description: "WhatsApp order button on storefront" },
  { name: "product_analytics", status: true, rolloutPercent: 100, tier: "pro", description: "Detailed product analytics" },
  { name: "custom_domain", status: false, rolloutPercent: 0, tier: "enterprise", description: "Custom domain mapping" },
  { name: "bulk_import", status: false, rolloutPercent: 50, tier: "pro", description: "Bulk product import via CSV" },
  { name: "email_campaigns", status: false, rolloutPercent: 0, tier: "enterprise", description: "Email marketing campaigns" },
];

let seeded = false;
async function seedFlags() {
  if (seeded) return;
  seeded = true;
  const existing = await db.select().from(featureFlagsTable);
  if (existing.length === 0) {
    await db.insert(featureFlagsTable).values(DEFAULT_FLAGS);
  }
}

router.get("/flags", requireAdmin, async (req, res) => {
  try {
    await seedFlags();
    const flags = await db.select().from(featureFlagsTable).orderBy(desc(featureFlagsTable.createdAt));
    res.json(flags);
  } catch (err) {
    req.log.error({ err }, "List flags error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/flags", requireAdmin, async (req, res) => {
  try {
    const { name, status, rolloutPercent, tier, description } = req.body;
    if (!name) {
      res.status(400).json({ error: "Validation error", message: "Name is required" });
      return;
    }
    const [flag] = await db.insert(featureFlagsTable).values({
      name,
      status: status || false,
      rolloutPercent: rolloutPercent || 0,
      tier,
      description,
    }).returning();
    res.status(201).json(flag);
  } catch (err) {
    req.log.error({ err }, "Create flag error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/flags/:id", requireAdmin, async (req, res) => {
  try {
    const { status, rolloutPercent, tier, description } = req.body;
    const [updated] = await db
      .update(featureFlagsTable)
      .set({ status, rolloutPercent, tier, description, updatedAt: new Date() })
      .where(eq(featureFlagsTable.id, req.params.id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Not found", message: "Flag not found" });
      return;
    }
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Update flag error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
