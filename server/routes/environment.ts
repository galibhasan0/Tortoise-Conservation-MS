import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import pool from "../db/pool";
import { requireAuth, requirePermission } from "../middleware/auth";
import { auditLog } from "../utils/audit";
import { success, fail, paginated } from "../utils/response";

const router = Router();

const logSchema = z.object({
  enclosure_id: z.number().int().positive(),
  temperature_celsius: z.number().optional(),
  humidity_percent: z.number().min(0).max(100).optional(),
  uv_index: z.number().nonnegative().optional(),
  light_hours: z.number().nonnegative().optional(),
  recorded_at: z.string().optional(),
  source: z.string().optional(),
  notes: z.string().optional(),
});

router.get("/logs", requireAuth, requirePermission("environment.read"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(200, Number(req.query.limit) || 50);
    const offset = (page - 1) * limit;
    const enclosureId = req.query.enclosure_id;
    const conditions = enclosureId ? [`e.enclosure_id = $1`] : [];
    const baseParams: unknown[] = enclosureId ? [enclosureId] : [];
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const countResult = await pool.query(`SELECT COUNT(*) FROM environment_logs e ${where}`, baseParams);
    const result = await pool.query(
      `SELECT e.*, enc.enclosure_name FROM environment_logs e
       LEFT JOIN enclosures enc ON e.enclosure_id = enc.enclosure_id
       ${where} ORDER BY e.recorded_at DESC LIMIT $${baseParams.length + 1} OFFSET $${baseParams.length + 2}`,
      [...baseParams, limit, offset]
    );
    return paginated(res, result.rows, Number(countResult.rows[0].count), page, limit);
  } catch (err) { next(err); }
});

router.post("/logs", requireAuth, requirePermission("environment.create"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = logSchema.safeParse(req.body);
    if (!parsed.success) return fail(res, 400, "Validation failed", parsed.error.flatten());
    const d = parsed.data;
    const result = await pool.query(
      `INSERT INTO environment_logs (enclosure_id, temperature_celsius, humidity_percent, uv_index, light_hours, recorded_at, source, notes)
       VALUES ($1,$2,$3,$4,$5,COALESCE($6::timestamptz, NOW()),$7,$8) RETURNING *`,
      [d.enclosure_id, d.temperature_celsius ?? null, d.humidity_percent ?? null, d.uv_index ?? null, d.light_hours ?? null, d.recorded_at ?? null, d.source ?? "manual", d.notes ?? null]
    );
    await auditLog({ req, actorId: req.session.userId, roleId: req.session.roleId, action: "environment.create", entityType: "environment_log", entityId: result.rows[0].log_id, afterJson: d });
    return success(res, result.rows[0], 201);
  } catch (err) { next(err); }
});

router.get("/enclosures", requireAuth, async (_req, res, next) => {
  try {
    const result = await pool.query(`SELECT * FROM enclosures ORDER BY enclosure_name`);
    return success(res, result.rows);
  } catch (err) { next(err); }
});

router.post("/enclosures", requireAuth, requirePermission("environment.create"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({ enclosure_name: z.string().min(1), location: z.string().optional(), capacity: z.number().int().positive().optional(), notes: z.string().optional() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return fail(res, 400, "Validation failed", parsed.error.flatten());
    const d = parsed.data;
    const result = await pool.query(`INSERT INTO enclosures (enclosure_name, location, capacity, notes) VALUES ($1,$2,$3,$4) RETURNING *`, [d.enclosure_name, d.location ?? null, d.capacity ?? null, d.notes ?? null]);
    return success(res, result.rows[0], 201);
  } catch (err) { next(err); }
});

router.get("/logs/latest", requireAuth, requirePermission("environment.read"), async (_req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT ON (e.enclosure_id) e.*, enc.enclosure_name
       FROM environment_logs e
       LEFT JOIN enclosures enc ON e.enclosure_id = enc.enclosure_id
       ORDER BY e.enclosure_id, e.recorded_at DESC`
    );
    return success(res, result.rows);
  } catch (err) { next(err); }
});

export default router;
