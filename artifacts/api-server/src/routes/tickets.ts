import { Router, type IRouter } from "express";
import { db, ticketsTable, usersTable } from "@workspace/db";
import { eq, sql, and, desc } from "drizzle-orm";
import { requireAuth, JwtPayload } from "../lib/auth.js";

const router: IRouter = Router();

router.get("/tickets", requireAuth, async (req, res) => {
  try {
    const { userId, role } = (req as any).user as JwtPayload;
    const page = parseInt(String(req.query.page || "1"));
    const limit = parseInt(String(req.query.limit || "20"));
    const status = req.query.status as string | undefined;
    const priority = req.query.priority as string | undefined;
    const offset = (page - 1) * limit;

    let query = db
      .select({
        id: ticketsTable.id,
        userId: ticketsTable.userId,
        subject: ticketsTable.subject,
        description: ticketsTable.description,
        priority: ticketsTable.priority,
        status: ticketsTable.status,
        assignedTo: ticketsTable.assignedTo,
        response: ticketsTable.response,
        createdAt: ticketsTable.createdAt,
        resolvedAt: ticketsTable.resolvedAt,
        userEmail: usersTable.email,
      })
      .from(ticketsTable)
      .leftJoin(usersTable, eq(ticketsTable.userId, usersTable.id))
      .$dynamic();

    const conditions = [];
    if (role !== "admin" && role !== "super_admin") {
      conditions.push(eq(ticketsTable.userId, userId));
    }
    if (status) conditions.push(eq(ticketsTable.status, status));
    if (priority) conditions.push(eq(ticketsTable.priority, priority));
    if (conditions.length > 0) query = query.where(and(...conditions));

    const tickets = await query.limit(limit).offset(offset).orderBy(desc(ticketsTable.createdAt));
    const [{ total }] = await db.select({ total: sql<number>`count(*)::int` }).from(ticketsTable);

    res.json({
      data: tickets.map(t => ({ ...t, userEmail: t.userEmail || "unknown" })),
      total,
      page,
      limit,
    });
  } catch (err) {
    req.log.error({ err }, "List tickets error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/tickets", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as any).user as JwtPayload;
    const { subject, description, priority } = req.body;
    if (!subject || !description) {
      res.status(400).json({ error: "Validation error", message: "Subject and description are required" });
      return;
    }

    const [ticket] = await db.insert(ticketsTable).values({
      userId,
      subject,
      description,
      priority: priority || "low",
      status: "open",
    }).returning();

    const [user] = await db.select({ email: usersTable.email }).from(usersTable).where(eq(usersTable.id, userId)).limit(1);

    res.status(201).json({ ...ticket, userEmail: user?.email || "unknown" });
  } catch (err) {
    req.log.error({ err }, "Create ticket error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/tickets/:id", requireAuth, async (req, res) => {
  try {
    const [ticket] = await db
      .select({
        id: ticketsTable.id,
        userId: ticketsTable.userId,
        subject: ticketsTable.subject,
        description: ticketsTable.description,
        priority: ticketsTable.priority,
        status: ticketsTable.status,
        assignedTo: ticketsTable.assignedTo,
        response: ticketsTable.response,
        createdAt: ticketsTable.createdAt,
        resolvedAt: ticketsTable.resolvedAt,
        userEmail: usersTable.email,
      })
      .from(ticketsTable)
      .leftJoin(usersTable, eq(ticketsTable.userId, usersTable.id))
      .where(eq(ticketsTable.id, req.params.id))
      .limit(1);

    if (!ticket) {
      res.status(404).json({ error: "Not found", message: "Ticket not found" });
      return;
    }
    res.json({ ...ticket, userEmail: ticket.userEmail || "unknown" });
  } catch (err) {
    req.log.error({ err }, "Get ticket error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/tickets/:id", requireAuth, async (req, res) => {
  try {
    const { status, assignedTo, response, priority } = req.body;
    const resolvedAt = status === "resolved" ? new Date() : undefined;

    const [updated] = await db
      .update(ticketsTable)
      .set({ status, assignedTo, response, priority, resolvedAt, updatedAt: new Date() })
      .where(eq(ticketsTable.id, req.params.id))
      .returning();

    const [user] = await db.select({ email: usersTable.email }).from(usersTable).where(eq(usersTable.id, updated.userId)).limit(1);

    res.json({ ...updated, userEmail: user?.email || "unknown" });
  } catch (err) {
    req.log.error({ err }, "Update ticket error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
