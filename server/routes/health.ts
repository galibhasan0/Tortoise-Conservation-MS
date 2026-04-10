import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import pool from "../db/pool";
import { requireAuth, requirePermission } from "../middleware/auth";
import { auditLog } from "../utils/audit";
import { success, fail, paginated } from "../utils/response";

const router = Router();

const createSchema = z.object({
  tortoise_id: z.number().int().positive(),
  condition: z.string().min(1).max(200),
  symptoms: z.string().optional(),
  diagnosis: z.string().optional(),
  treatment: z.string().optional(),
  vet_user_id: z.number().int().positive().optional(),
  examined_at: z.string().optional(),
  resolved_at: z.string().optional(),
  notes: z.string().optional(),
  severity: z.enum(["low","medium","high","critical"]).default("low"),
});

router.get("/", requireAuth, requirePermission("health.read"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Number(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const tortoiseId = req.query.tortoise_id;
    const conditions = tortoiseId ? [`h.tortoise_id = $1`] : [];
    const baseParams: unknown[] = tortoiseId ? [tortoiseId] : [];
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const countResult = await pool.query(`SELECT COUNT(*) FROM health_records h ${where}`, baseParams);
    const result = await pool.query(
      `SELECT h.*, t.name AS tortoise_name, u.username AS vet_username
       FROM health_records h
       JOIN tortoise_profiles t ON h.tortoise_id = t.tortoise_id
       LEFT JOIN users u ON h.vet_user_id = u.user_id
       ${where}
       ORDER BY h.examined_at DESC LIMIT $${baseParams.length + 1} OFFSET $${baseParams.length + 2}`,
      [...baseParams, limit, offset]
    );
    return paginated(res, result.rows, Number(countResult.rows[0].count), page, limit);
  } catch (err) { next(err); }
});

router.get("/:id", requireAuth, requirePermission("health.read"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query(`SELECT h.*, t.name AS tortoise_name FROM health_records h JOIN tortoise_profiles t ON h.tortoise_id = t.tortoise_id WHERE h.record_id = $1`, [req.params.id]);
    if (!result.rows[0]) return fail(res, 404, "Health record not found");
    return success(res, result.rows[0]);
  } catch (err) { next(err); }
});

router.post("/", requireAuth, requirePermission("health.create"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return fail(res, 400, "Validation failed", parsed.error.flatten());
    const d = parsed.data;
    const result = await pool.query(
      `INSERT INTO health_records (tortoise_id, condition, symptoms, diagnosis, treatment, vet_user_id, examined_at, resolved_at, notes, severity)
       VALUES ($1,$2,$3,$4,$5,$6,COALESCE($7::timestamptz, NOW()),$8,$9,$10) RETURNING *`,
      [d.tortoise_id, d.condition, d.symptoms ?? null, d.diagnosis ?? null, d.treatment ?? null, d.vet_user_id ?? req.session.userId, d.examined_at ?? null, d.resolved_at ?? null, d.notes ?? null, d.severity]
    );
    await pool.query(`UPDATE tortoise_profiles SET health_status = CASE WHEN $1 = 'critical' OR $1 = 'high' THEN 'Ill' ELSE health_status END WHERE tortoise_id = $2`, [d.severity, d.tortoise_id]);
    await auditLog({ req, actorId: req.session.userId, roleId: req.session.roleId, action: "health.create", entityType: "health_record", entityId: result.rows[0].record_id, afterJson: d });
    return success(res, result.rows[0], 201);
  } catch (err) { next(err); }
});

router.put("/:id", requireAuth, requirePermission("health.update"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = createSchema.partial().safeParse(req.body);
    if (!parsed.success) return fail(res, 400, "Validation failed", parsed.error.flatten());
    const id = Number(req.params.id);
    const before = await pool.query(`SELECT * FROM health_records WHERE record_id = $1`, [id]);
    if (!before.rows[0]) return fail(res, 404, "Not found");
    const d = parsed.data;
    await pool.query(
      `UPDATE health_records SET condition = COALESCE($1, condition), symptoms = COALESCE($2, symptoms), diagnosis = COALESCE($3, diagnosis), treatment = COALESCE($4, treatment), resolved_at = COALESCE($5::timestamptz, resolved_at), notes = COALESCE($6, notes), severity = COALESCE($7, severity), updated_at = NOW() WHERE record_id = $8`,
      [d.condition ?? null, d.symptoms ?? null, d.diagnosis ?? null, d.treatment ?? null, d.resolved_at ?? null, d.notes ?? null, d.severity ?? null, id]
    );
    await auditLog({ req, actorId: req.session.userId, roleId: req.session.roleId, action: "health.update", entityType: "health_record", entityId: id, beforeJson: before.rows[0], afterJson: d });
    return success(res, null, 200, "Updated");
  } catch (err) { next(err); }
});

router.delete("/:id", requireAuth, requirePermission("health.delete"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const before = await pool.query(`SELECT * FROM health_records WHERE record_id = $1`, [id]);
    if (!before.rows[0]) return fail(res, 404, "Not found");
    await pool.query(`DELETE FROM health_records WHERE record_id = $1`, [id]);
    await auditLog({ req, actorId: req.session.userId, roleId: req.session.roleId, action: "health.delete", entityType: "health_record", entityId: id, beforeJson: before.rows[0] });
    return success(res, null, 200, "Deleted");
  } catch (err) { next(err); }
});

export default router;
