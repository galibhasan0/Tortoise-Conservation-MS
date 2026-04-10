import { Router, Request, Response, NextFunction } from "express";
import pool from "../db/pool";
import { requireAuth } from "../middleware/auth";
import { success, fail } from "../utils/response";

const router = Router();

router.get("/", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = Math.min(50, Number(req.query.limit) || 20);
    const unreadOnly = req.query.unread === "true";
    const conditions = [`n.user_id = $1`];
    if (unreadOnly) conditions.push(`n.read_at IS NULL`);
    const result = await pool.query(
      `SELECT * FROM notifications WHERE ${conditions.join(" AND ")} ORDER BY created_at DESC LIMIT $2`,
      [req.session.userId, limit]
    );
    const unreadCount = await pool.query(`SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND read_at IS NULL`, [req.session.userId]);
    return success(res, { notifications: result.rows, unread_count: Number(unreadCount.rows[0].count) });
  } catch (err) { next(err); }
});

router.patch("/:id/read", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query(
      `UPDATE notifications SET read_at = NOW() WHERE notification_id = $1 AND user_id = $2 RETURNING *`,
      [req.params.id, req.session.userId]
    );
    if (!result.rows[0]) return fail(res, 404, "Notification not found");
    return success(res, null, 200, "Marked as read");
  } catch (err) { next(err); }
});

router.patch("/read-all", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await pool.query(`UPDATE notifications SET read_at = NOW() WHERE user_id = $1 AND read_at IS NULL`, [req.session.userId]);
    return success(res, null, 200, "All notifications marked as read");
  } catch (err) { next(err); }
});

export default router;
