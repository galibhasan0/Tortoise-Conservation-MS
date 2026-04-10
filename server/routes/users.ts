import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import pool from "../db/pool";
import { requireAuth, requirePermission, requireAnyPermission } from "../middleware/auth";
import { auditLog } from "../utils/audit";
import { success, fail, paginated } from "../utils/response";
import { hashPassword } from "../services/authService";

const router = Router();

const createUserSchema = z.object({
  username: z.string().min(2).max(100),
  password: z.string().min(8),
  role_id: z.number().int().positive(),
  full_name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

const updateUserSchema = z.object({
  full_name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  status: z.enum(["active", "inactive", "suspended"]).optional(),
  role_id: z.number().int().positive().optional(),
});

router.get("/", requireAuth, requirePermission("user.read"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const search = (req.query.search as string) || "";

    const whereClause = search ? `WHERE u.username ILIKE $3 OR p.full_name ILIKE $3 OR p.email ILIKE $3` : "";
    const params: unknown[] = [limit, offset];
    if (search) params.push(`%${search}%`);

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM users u LEFT JOIN user_profiles p ON u.user_id = p.user_id ${whereClause}`,
      search ? [`%${search}%`] : []
    );

    const result = await pool.query(
      `SELECT u.user_id, u.username, u.role_id, u.status, u.created_at,
              r.role_name, r.role_code,
              p.full_name, p.email, p.phone, p.avatar
       FROM users u
       JOIN roles r ON u.role_id = r.role_id
       LEFT JOIN user_profiles p ON u.user_id = p.user_id
       ${whereClause}
       ORDER BY u.created_at DESC LIMIT $1 OFFSET $2`,
      params
    );

    return paginated(res, result.rows, Number(countResult.rows[0].count), page, limit);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", requireAuth, requirePermission("user.read"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query(
      `SELECT u.user_id, u.username, u.role_id, u.status, u.created_at, u.updated_at,
              r.role_name, r.role_code,
              p.full_name, p.email, p.phone, p.avatar, p.bio, p.address
       FROM users u
       JOIN roles r ON u.role_id = r.role_id
       LEFT JOIN user_profiles p ON u.user_id = p.user_id
       WHERE u.user_id = $1`,
      [req.params.id]
    );
    if (!result.rows[0]) return fail(res, 404, "User not found");
    return success(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post("/", requireAuth, requirePermission("user.create"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) return fail(res, 400, "Validation failed", parsed.error.flatten());

    const { username, password, role_id, full_name, email, phone } = parsed.data;
    const hash = await hashPassword(password);

    const userResult = await pool.query(
      `INSERT INTO users (username, password_hash, role_id) VALUES ($1, $2, $3) RETURNING user_id, username, role_id, status, created_at`,
      [username, hash, role_id]
    );

    const newUser = userResult.rows[0];

    await pool.query(
      `INSERT INTO user_profiles (user_id, full_name, email, phone) VALUES ($1, $2, $3, $4)`,
      [newUser.user_id, full_name ?? username, email ?? null, phone ?? null]
    );

    await auditLog({
      req,
      actorId: req.session.userId,
      roleId: req.session.roleId,
      action: "user.create",
      entityType: "user",
      entityId: newUser.user_id,
      afterJson: { username, role_id },
    });

    return success(res, newUser, 201, "User created successfully");
  } catch (err) {
    next(err);
  }
});

router.put("/:id", requireAuth, requirePermission("user.update"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = updateUserSchema.safeParse(req.body);
    if (!parsed.success) return fail(res, 400, "Validation failed", parsed.error.flatten());

    const userId = Number(req.params.id);
    const before = await pool.query(`SELECT u.*, p.full_name, p.email FROM users u LEFT JOIN user_profiles p ON u.user_id = p.user_id WHERE u.user_id = $1`, [userId]);
    if (!before.rows[0]) return fail(res, 404, "User not found");

    const { full_name, email, phone, bio, status, role_id } = parsed.data;

    if (status || role_id) {
      const fields: string[] = [];
      const vals: unknown[] = [];
      let idx = 1;
      if (status) { fields.push(`status = $${idx++}`); vals.push(status); }
      if (role_id) { fields.push(`role_id = $${idx++}`); vals.push(role_id); }
      fields.push(`updated_at = NOW()`);
      vals.push(userId);
      await pool.query(`UPDATE users SET ${fields.join(", ")} WHERE user_id = $${idx}`, vals);
    }

    if (full_name || email || phone || bio !== undefined) {
      await pool.query(
        `INSERT INTO user_profiles (user_id, full_name, email, phone, bio)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (user_id) DO UPDATE SET
           full_name = COALESCE($2, user_profiles.full_name),
           email = COALESCE($3, user_profiles.email),
           phone = COALESCE($4, user_profiles.phone),
           bio = COALESCE($5, user_profiles.bio)`,
        [userId, full_name ?? null, email ?? null, phone ?? null, bio ?? null]
      );
    }

    await auditLog({
      req, actorId: req.session.userId, roleId: req.session.roleId,
      action: "user.update", entityType: "user", entityId: userId,
      beforeJson: before.rows[0], afterJson: parsed.data,
    });

    return success(res, null, 200, "User updated");
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireAuth, requirePermission("user.delete"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = Number(req.params.id);
    if (userId === req.session.userId) return fail(res, 400, "Cannot delete yourself");

    const before = await pool.query(`SELECT * FROM users WHERE user_id = $1`, [userId]);
    if (!before.rows[0]) return fail(res, 404, "User not found");

    await pool.query(`UPDATE users SET status = 'inactive', updated_at = NOW() WHERE user_id = $1`, [userId]);

    await auditLog({
      req, actorId: req.session.userId, roleId: req.session.roleId,
      action: "user.delete", entityType: "user", entityId: userId,
      beforeJson: before.rows[0],
    });

    return success(res, null, 200, "User deactivated");
  } catch (err) {
    next(err);
  }
});

router.get("/me/profile", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query(
      `SELECT u.user_id, u.username, u.role_id, u.status, r.role_name,
              p.full_name, p.email, p.phone, p.avatar, p.bio, p.address
       FROM users u JOIN roles r ON u.role_id = r.role_id
       LEFT JOIN user_profiles p ON u.user_id = p.user_id
       WHERE u.user_id = $1`,
      [req.session.userId]
    );
    if (!result.rows[0]) return fail(res, 404, "User not found");
    return success(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.put("/me/profile", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({
      full_name: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      bio: z.string().optional(),
      address: z.string().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return fail(res, 400, "Validation failed", parsed.error.flatten());

    const { full_name, email, phone, bio, address } = parsed.data;
    const userId = req.session.userId!;

    await pool.query(
      `INSERT INTO user_profiles (user_id, full_name, email, phone, bio, address)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id) DO UPDATE SET
         full_name = COALESCE($2, user_profiles.full_name),
         email = COALESCE($3, user_profiles.email),
         phone = COALESCE($4, user_profiles.phone),
         bio = COALESCE($5, user_profiles.bio),
         address = COALESCE($6, user_profiles.address)`,
      [userId, full_name ?? null, email ?? null, phone ?? null, bio ?? null, address ?? null]
    );

    await auditLog({
      req, actorId: userId, roleId: req.session.roleId,
      action: "profile.update", entityType: "user", entityId: userId, afterJson: parsed.data,
    });

    return success(res, null, 200, "Profile updated");
  } catch (err) {
    next(err);
  }
});

router.get("/roles/all", requireAuth, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query(`SELECT role_id, role_name, role_code FROM roles ORDER BY role_name`);
    return success(res, result.rows);
  } catch (err) {
    next(err);
  }
});

export default router;
