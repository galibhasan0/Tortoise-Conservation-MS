import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import pool from "../db/pool";
import { requireAuth, requirePermission, requireAnyPermission } from "../middleware/auth";
import { auditLog } from "../utils/audit";
import { success, fail, paginated } from "../utils/response";

const router = Router();

const createSchema = z.object({
  tortoise_code: z.string().min(1).max(50),
  name: z.string().min(1).max(100),
  species_id: z.number().int().positive().optional(),
  species_name: z.string().optional(),
  date_of_birth: z.string().optional(),
  gender: z.enum(["Male", "Female", "Unknown"]).default("Unknown"),
  weight: z.number().positive().optional(),
  carapace_length: z.number().positive().optional(),
  enclosure_id: z.number().int().positive().optional(),
  health_status: z.enum(["Healthy", "Injured", "Ill", "Under Treatment", "Deceased"]).default("Healthy"),
  notes: z.string().optional(),
});

const updateSchema = createSchema.partial().omit({ tortoise_code: true });

router.get("/", requireAuth, requirePermission("tortoise.read"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const search = (req.query.search as string) || "";
    const healthStatus = req.query.health_status as string;

    const conditions: string[] = ["t.deleted_at IS NULL"];
    const params: unknown[] = [];
    let idx = 1;

    if (search) {
      conditions.push(`(t.name ILIKE $${idx} OR t.tortoise_code ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }
    if (healthStatus) {
      conditions.push(`t.health_status = $${idx++}`);
      params.push(healthStatus);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const countResult = await pool.query(`SELECT COUNT(*) FROM tortoise_profiles t ${where}`, params);

    const result = await pool.query(
      `SELECT t.*, s.species_name, e.enclosure_name
       FROM tortoise_profiles t
       LEFT JOIN species s ON t.species_id = s.species_id
       LEFT JOIN enclosures e ON t.enclosure_id = e.enclosure_id
       ${where}
       ORDER BY t.name ASC LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset]
    );

    return paginated(res, result.rows, Number(countResult.rows[0].count), page, limit);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", requireAuth, requirePermission("tortoise.read"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query(
      `SELECT t.*, s.species_name, e.enclosure_name
       FROM tortoise_profiles t
       LEFT JOIN species s ON t.species_id = s.species_id
       LEFT JOIN enclosures e ON t.enclosure_id = e.enclosure_id
       WHERE t.tortoise_id = $1 AND t.deleted_at IS NULL`,
      [req.params.id]
    );
    if (!result.rows[0]) return fail(res, 404, "Tortoise not found");
    return success(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post("/", requireAuth, requirePermission("tortoise.create"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return fail(res, 400, "Validation failed", parsed.error.flatten());

    const d = parsed.data;

    let speciesId = d.species_id ?? null;
    if (!speciesId && d.species_name) {
      const sp = await pool.query(
        `INSERT INTO species (species_name) VALUES ($1) ON CONFLICT (species_name) DO UPDATE SET species_name = EXCLUDED.species_name RETURNING species_id`,
        [d.species_name]
      );
      speciesId = sp.rows[0].species_id;
    }

    const result = await pool.query(
      `INSERT INTO tortoise_profiles
        (tortoise_code, name, species_id, date_of_birth, gender, weight, carapace_length, enclosure_id, health_status, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [d.tortoise_code, d.name, speciesId, d.date_of_birth ?? null, d.gender, d.weight ?? null, d.carapace_length ?? null, d.enclosure_id ?? null, d.health_status, d.notes ?? null]
    );

    await auditLog({
      req, actorId: req.session.userId, roleId: req.session.roleId,
      action: "tortoise.create", entityType: "tortoise", entityId: result.rows[0].tortoise_id,
      afterJson: d,
    });

    return success(res, result.rows[0], 201, "Tortoise created");
  } catch (err) {
    next(err);
  }
});

router.put("/:id", requireAuth, requirePermission("tortoise.update"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) return fail(res, 400, "Validation failed", parsed.error.flatten());

    const id = Number(req.params.id);
    const before = await pool.query(`SELECT * FROM tortoise_profiles WHERE tortoise_id = $1 AND deleted_at IS NULL`, [id]);
    if (!before.rows[0]) return fail(res, 404, "Tortoise not found");

    const d = parsed.data;
    const fields: string[] = [];
    const vals: unknown[] = [];
    let idx = 1;

    const allowed = ["name","species_id","date_of_birth","gender","weight","carapace_length","enclosure_id","health_status","notes"];
    for (const key of allowed) {
      if ((d as any)[key] !== undefined) {
        fields.push(`${key} = $${idx++}`);
        vals.push((d as any)[key]);
      }
    }
    if (!fields.length) return fail(res, 400, "No fields to update");
    fields.push("updated_at = NOW()");
    vals.push(id);

    const result = await pool.query(
      `UPDATE tortoise_profiles SET ${fields.join(", ")} WHERE tortoise_id = $${idx} RETURNING *`,
      vals
    );

    await auditLog({
      req, actorId: req.session.userId, roleId: req.session.roleId,
      action: "tortoise.update", entityType: "tortoise", entityId: id,
      beforeJson: before.rows[0], afterJson: d,
    });

    return success(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireAuth, requirePermission("tortoise.delete"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const before = await pool.query(`SELECT * FROM tortoise_profiles WHERE tortoise_id = $1 AND deleted_at IS NULL`, [id]);
    if (!before.rows[0]) return fail(res, 404, "Tortoise not found");

    await pool.query(`UPDATE tortoise_profiles SET deleted_at = NOW() WHERE tortoise_id = $1`, [id]);

    await auditLog({
      req, actorId: req.session.userId, roleId: req.session.roleId,
      action: "tortoise.delete", entityType: "tortoise", entityId: id, beforeJson: before.rows[0],
    });

    return success(res, null, 200, "Tortoise archived");
  } catch (err) {
    next(err);
  }
});

router.get("/meta/species", requireAuth, async (_req, res, next) => {
  try {
    const result = await pool.query(`SELECT species_id, species_name FROM species ORDER BY species_name`);
    return success(res, result.rows);
  } catch (err) { next(err); }
});

router.get("/meta/enclosures", requireAuth, async (_req, res, next) => {
  try {
    const result = await pool.query(`SELECT enclosure_id, enclosure_name, location, capacity FROM enclosures ORDER BY enclosure_name`);
    return success(res, result.rows);
  } catch (err) { next(err); }
});

export default router;
