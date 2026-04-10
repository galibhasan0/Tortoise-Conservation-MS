import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import pool from "../db/pool";
import { requireAuth, requirePermission, requireAnyPermission } from "../middleware/auth";
import { auditLog } from "../utils/audit";
import { success, fail, paginated } from "../utils/response";

const router = Router();

const createSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  severity: z.enum(["info","warning","high","critical"]).default("info"),
  alert_type: z.enum(["medical","environmental","operational","security"]).default("operational"),
  tortoise_id: z.number().int().positive().optional(),
  enclosure_id: z.number().int().positive().optional(),
  assigned_to_role_id: z.number().int().positive().optional(),
});

const resolveSchema = z.object({
  resolution_notes: z.string().optional(),
});

router.get("/", requireAuth, requirePermission("alert.read"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Number(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const severity = req.query.severity as string;
    const resolved = req.query.resolved;

    const conditions: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (severity) { conditions.push(`a.severity = $${idx++}`); params.push(severity); }
    if (resolved === "false" || resolved === undefined) { conditions.push(`a.resolved_at IS NULL`); }
    else if (resolved === "true") { conditions.push(`a.resolved_at IS NOT NULL`); }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const countResult = await pool.query(`SELECT COUNT(*) FROM alerts a ${where}`, params);
    const result = await pool.query(
      `SELECT a.*, u.username AS created_by_username, t.name AS tortoise_name
       FROM alerts a
       LEFT JOIN users u ON a.created_by_user_id = u.user_id
       LEFT JOIN tortoise_profiles t ON a.tortoise_id = t.tortoise_id
       ${where}
       ORDER BY CASE a.severity WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'warning' THEN 3 ELSE 4 END, a.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset]
    );
    return paginated(res, result.rows, Number(countResult.rows[0].count), page, limit);
  } catch (err) { next(err); }
});

router.get("/:id", requireAuth, requirePermission("alert.read"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query(`SELECT a.*, u.username AS created_by_username FROM alerts a LEFT JOIN users u ON a.created_by_user_id = u.user_id WHERE a.alert_id = $1`, [req.params.id]);
    if (!result.rows[0]) return fail(res, 404, "Alert not found");
    const history = await pool.query(`SELECT * FROM alert_action_history WHERE alert_id = $1 ORDER BY action_at DESC`, [req.params.id]);
    return success(res, { ...result.rows[0], action_history: history.rows });
  } catch (err) { next(err); }
});

router.post("/", requireAuth, requirePermission("alert.create"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return fail(res, 400, "Validation failed", parsed.error.flatten());
    const d = parsed.data;
    const result = await pool.query(
      `INSERT INTO alerts (title, description, severity, alert_type, tortoise_id, enclosure_id, assigned_to_role_id, created_by_user_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [d.title, d.description ?? null, d.severity, d.alert_type, d.tortoise_id ?? null, d.enclosure_id ?? null, d.assigned_to_role_id ?? null, req.session.userId]
    );
    await pool.query(`INSERT INTO alert_action_history (alert_id, action, performed_by_user_id, notes) VALUES ($1,'created',$2,$3)`, [result.rows[0].alert_id, req.session.userId, d.description ?? null]);
    await auditLog({ req, actorId: req.session.userId, roleId: req.session.roleId, action: "alert.create", entityType: "alert", entityId: result.rows[0].alert_id, afterJson: d });
    return success(res, result.rows[0], 201);
  } catch (err) { next(err); }
});

router.patch("/:id/assign", requireAuth, requirePermission("alert.assign"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({ assigned_to_user_id: z.number().int().positive().optional(), assigned_to_role_id: z.number().int().positive().optional() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return fail(res, 400, "Validation failed", parsed.error.flatten());
    const id = Number(req.params.id);
    await pool.query(`UPDATE alerts SET assigned_to_user_id = COALESCE($1, assigned_to_user_id), assigned_to_role_id = COALESCE($2, assigned_to_role_id) WHERE alert_id = $3`, [parsed.data.assigned_to_user_id ?? null, parsed.data.assigned_to_role_id ?? null, id]);
    await pool.query(`INSERT INTO alert_action_history (alert_id, action, performed_by_user_id) VALUES ($1,'assigned',$2)`, [id, req.session.userId]);
    await auditLog({ req, actorId: req.session.userId, roleId: req.session.roleId, action: "alert.assign", entityType: "alert", entityId: id, afterJson: parsed.data });
    return success(res, null, 200, "Alert assigned");
  } catch (err) { next(err); }
});

router.patch("/:id/resolve", requireAuth, requireAnyPermission(["alert.resolve","alert.update"]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = resolveSchema.safeParse(req.body);
    if (!parsed.success) return fail(res, 400, "Validation failed", parsed.error.flatten());
    const id = Number(req.params.id);
    const before = await pool.query(`SELECT * FROM alerts WHERE alert_id = $1`, [id]);
    if (!before.rows[0]) return fail(res, 404, "Alert not found");
    if (before.rows[0].resolved_at) return fail(res, 409, "Alert already resolved");
    await pool.query(`UPDATE alerts SET resolved_at = NOW(), resolved_by_user_id = $1, resolution_notes = $2 WHERE alert_id = $3`, [req.session.userId, parsed.data.resolution_notes ?? null, id]);
    await pool.query(`INSERT INTO alert_action_history (alert_id, action, performed_by_user_id, notes) VALUES ($1,'resolved',$2,$3)`, [id, req.session.userId, parsed.data.resolution_notes ?? null]);
    await auditLog({ req, actorId: req.session.userId, roleId: req.session.roleId, action: "alert.resolve", entityType: "alert", entityId: id });
    return success(res, null, 200, "Alert resolved");
  } catch (err) { next(err); }
});

export default router;
