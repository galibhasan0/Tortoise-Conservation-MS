import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import pool from "../db/pool";
import { requireAuth, requirePermission } from "../middleware/auth";
import { auditLog } from "../utils/audit";
import { success, fail, paginated } from "../utils/response";

const router = Router();

const createSchema = z.object({
  tortoise_id: z.number().int().positive(),
  food_type: z.string().min(1).max(200),
  quantity_grams: z.number().positive().optional(),
  fed_by_user_id: z.number().int().positive().optional(),
  fed_at: z.string().optional(),
  notes: z.string().optional(),
});

router.get("/", requireAuth, requirePermission("feeding.read"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const tortoiseId = req.query.tortoise_id;

    const conditions = tortoiseId ? [`f.tortoise_id = $1`] : [];
    const params: unknown[] = tortoiseId ? [tortoiseId, limit, offset] : [limit, offset];
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const idxOffset = tortoiseId ? 1 : 0;

    const countResult = await pool.query(`SELECT COUNT(*) FROM feeding_logs f ${where}`, tortoiseId ? [tortoiseId] : []);
    const result = await pool.query(
      `SELECT f.*, t.name AS tortoise_name, u.username AS fed_by_username
       FROM feeding_logs f
       JOIN tortoise_profiles t ON f.tortoise_id = t.tortoise_id
       LEFT JOIN users u ON f.fed_by_user_id = u.user_id
       ${where}
       ORDER BY f.fed_at DESC LIMIT $${idxOffset + 1} OFFSET $${idxOffset + 2}`,
      params
    );

    return paginated(res, result.rows, Number(countResult.rows[0].count), page, limit);
  } catch (err) { next(err); }
});

router.get("/:id", requireAuth, requirePermission("feeding.read"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query(
      `SELECT f.*, t.name AS tortoise_name FROM feeding_logs f JOIN tortoise_profiles t ON f.tortoise_id = t.tortoise_id WHERE f.log_id = $1`,
      [req.params.id]
    );
    if (!result.rows[0]) return fail(res, 404, "Feeding log not found");
    return success(res, result.rows[0]);
  } catch (err) { next(err); }
});

router.post("/", requireAuth, requirePermission("feeding.create"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return fail(res, 400, "Validation failed", parsed.error.flatten());
    const d = parsed.data;
    const result = await pool.query(
      `INSERT INTO feeding_logs (tortoise_id, food_type, quantity_grams, fed_by_user_id, fed_at, notes)
       VALUES ($1,$2,$3,$4,COALESCE($5::timestamptz, NOW()),$6) RETURNING *`,
      [d.tortoise_id, d.food_type, d.quantity_grams ?? null, d.fed_by_user_id ?? req.session.userId, d.fed_at ?? null, d.notes ?? null]
    );
    await auditLog({ req, actorId: req.session.userId, roleId: req.session.roleId, action: "feeding.create", entityType: "feeding_log", entityId: result.rows[0].log_id, afterJson: d });
    return success(res, result.rows[0], 201, "Feeding log created");
  } catch (err) { next(err); }
});

router.put("/:id", requireAuth, requirePermission("feeding.update"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schema = createSchema.partial();
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return fail(res, 400, "Validation failed", parsed.error.flatten());
    const id = Number(req.params.id);
    const before = await pool.query(`SELECT * FROM feeding_logs WHERE log_id = $1`, [id]);
    if (!before.rows[0]) return fail(res, 404, "Not found");
    const d = parsed.data;
    await pool.query(
      `UPDATE feeding_logs SET food_type = COALESCE($1, food_type), quantity_grams = COALESCE($2, quantity_grams), notes = COALESCE($3, notes) WHERE log_id = $4`,
      [d.food_type ?? null, d.quantity_grams ?? null, d.notes ?? null, id]
    );
    await auditLog({ req, actorId: req.session.userId, roleId: req.session.roleId, action: "feeding.update", entityType: "feeding_log", entityId: id, beforeJson: before.rows[0], afterJson: d });
    return success(res, null, 200, "Updated");
  } catch (err) { next(err); }
});

router.delete("/:id", requireAuth, requirePermission("feeding.delete"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const before = await pool.query(`SELECT * FROM feeding_logs WHERE log_id = $1`, [id]);
    if (!before.rows[0]) return fail(res, 404, "Not found");
    await pool.query(`DELETE FROM feeding_logs WHERE log_id = $1`, [id]);
    await auditLog({ req, actorId: req.session.userId, roleId: req.session.roleId, action: "feeding.delete", entityType: "feeding_log", entityId: id, beforeJson: before.rows[0] });
    return success(res, null, 200, "Deleted");
  } catch (err) { next(err); }
});

export default router;
