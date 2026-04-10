import { Router, Request, Response, NextFunction } from "express";
import pool from "../db/pool";
import { requireAuth, requirePermission } from "../middleware/auth";
import { success, paginated } from "../utils/response";

const router = Router();

router.get("/", requireAuth, requirePermission("audit.read"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Number(req.query.limit) || 50);
    const offset = (page - 1) * limit;
    const action = req.query.action as string;
    const userId = req.query.user_id as string;

    const conditions: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (action) { conditions.push(`a.action ILIKE $${idx++}`); params.push(`%${action}%`); }
    if (userId) { conditions.push(`a.actor_user_id = $${idx++}`); params.push(userId); }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const countResult = await pool.query(`SELECT COUNT(*) FROM audit_logs a ${where}`, params);
    const result = await pool.query(
      `SELECT a.*, u.username AS actor_username, r.role_name FROM audit_logs a
       LEFT JOIN users u ON a.actor_user_id = u.user_id
       LEFT JOIN roles r ON a.role_id = r.role_id
       ${where}
       ORDER BY a.created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset]
    );
    return paginated(res, result.rows, Number(countResult.rows[0].count), page, limit);
  } catch (err) { next(err); }
});

export default router;
