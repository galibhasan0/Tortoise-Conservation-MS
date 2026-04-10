import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import pool from "../db/pool";
import { requireAuth, requirePermission } from "../middleware/auth";
import { auditLog } from "../utils/audit";
import { success, fail, paginated } from "../utils/response";

const router = Router();

const createSchema = z.object({
  male_tortoise_id: z.number().int().positive(),
  female_tortoise_id: z.number().int().positive(),
  mating_date: z.string().optional(),
  egg_count: z.number().int().nonnegative().optional(),
  hatch_count: z.number().int().nonnegative().optional(),
  hatch_date: z.string().optional(),
  outcome: z.enum(["Pending","Successful","Failed","Cancelled"]).default("Pending"),
  officer_user_id: z.number().int().positive().optional(),
  notes: z.string().optional(),
});

router.get("/", requireAuth, requirePermission("breeding.read"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Number(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const countResult = await pool.query(`SELECT COUNT(*) FROM breeding_records`);
    const result = await pool.query(
      `SELECT br.*, m.name AS male_name, f.name AS female_name, u.username AS officer_username
       FROM breeding_records br
       JOIN tortoise_profiles m ON br.male_tortoise_id = m.tortoise_id
       JOIN tortoise_profiles f ON br.female_tortoise_id = f.tortoise_id
       LEFT JOIN users u ON br.officer_user_id = u.user_id
       ORDER BY br.mating_date DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return paginated(res, result.rows, Number(countResult.rows[0].count), page, limit);
  } catch (err) { next(err); }
});

router.get("/:id", requireAuth, requirePermission("breeding.read"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query(
      `SELECT br.*, m.name AS male_name, f.name AS female_name FROM breeding_records br JOIN tortoise_profiles m ON br.male_tortoise_id = m.tortoise_id JOIN tortoise_profiles f ON br.female_tortoise_id = f.tortoise_id WHERE br.record_id = $1`,
      [req.params.id]
    );
    if (!result.rows[0]) return fail(res, 404, "Breeding record not found");
    return success(res, result.rows[0]);
  } catch (err) { next(err); }
});

router.post("/", requireAuth, requirePermission("breeding.create"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return fail(res, 400, "Validation failed", parsed.error.flatten());
    const d = parsed.data;
    const result = await pool.query(
      `INSERT INTO breeding_records (male_tortoise_id, female_tortoise_id, mating_date, egg_count, hatch_count, hatch_date, outcome, officer_user_id, notes)
       VALUES ($1,$2,COALESCE($3::date, CURRENT_DATE),$4,$5,$6::date,$7,$8,$9) RETURNING *`,
      [d.male_tortoise_id, d.female_tortoise_id, d.mating_date ?? null, d.egg_count ?? null, d.hatch_count ?? null, d.hatch_date ?? null, d.outcome, d.officer_user_id ?? req.session.userId, d.notes ?? null]
    );
    await auditLog({ req, actorId: req.session.userId, roleId: req.session.roleId, action: "breeding.create", entityType: "breeding_record", entityId: result.rows[0].record_id, afterJson: d });
    return success(res, result.rows[0], 201);
  } catch (err) { next(err); }
});

router.put("/:id", requireAuth, requirePermission("breeding.update"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = createSchema.partial().safeParse(req.body);
    if (!parsed.success) return fail(res, 400, "Validation failed", parsed.error.flatten());
    const id = Number(req.params.id);
    const before = await pool.query(`SELECT * FROM breeding_records WHERE record_id = $1`, [id]);
    if (!before.rows[0]) return fail(res, 404, "Not found");
    const d = parsed.data;
    await pool.query(
      `UPDATE breeding_records SET egg_count = COALESCE($1, egg_count), hatch_count = COALESCE($2, hatch_count), hatch_date = COALESCE($3::date, hatch_date), outcome = COALESCE($4, outcome), notes = COALESCE($5, notes), updated_at = NOW() WHERE record_id = $6`,
      [d.egg_count ?? null, d.hatch_count ?? null, d.hatch_date ?? null, d.outcome ?? null, d.notes ?? null, id]
    );
    await auditLog({ req, actorId: req.session.userId, roleId: req.session.roleId, action: "breeding.update", entityType: "breeding_record", entityId: id, beforeJson: before.rows[0], afterJson: d });
    return success(res, null, 200, "Updated");
  } catch (err) { next(err); }
});

router.delete("/:id", requireAuth, requirePermission("breeding.delete"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const before = await pool.query(`SELECT * FROM breeding_records WHERE record_id = $1`, [id]);
    if (!before.rows[0]) return fail(res, 404, "Not found");
    await pool.query(`DELETE FROM breeding_records WHERE record_id = $1`, [id]);
    await auditLog({ req, actorId: req.session.userId, roleId: req.session.roleId, action: "breeding.delete", entityType: "breeding_record", entityId: id, beforeJson: before.rows[0] });
    return success(res, null, 200, "Deleted");
  } catch (err) { next(err); }
});

export default router;
