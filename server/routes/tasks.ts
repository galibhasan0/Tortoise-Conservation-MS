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
  priority: z.enum(["low","medium","high"]).default("medium"),
  due_date: z.string().optional(),
  assigned_to_user_id: z.number().int().positive().optional(),
  category: z.string().optional(),
  tortoise_id: z.number().int().positive().optional(),
});

const statusSchema = z.object({
  status: z.enum(["pending","in_progress","completed","verified","overdue","cancelled"]),
  notes: z.string().optional(),
});

router.get("/", requireAuth, requirePermission("task.read"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Number(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const status = req.query.status as string;
    const assignedTo = req.query.assigned_to as string;
    const roleName = req.session.roleName ?? "";
    const isStaff = roleName === "Staff";

    const conditions: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (status) { conditions.push(`t.status = $${idx++}`); params.push(status); }
    if (assignedTo) { conditions.push(`t.assigned_to_user_id = $${idx++}`); params.push(assignedTo); }
    if (isStaff) { conditions.push(`t.assigned_to_user_id = $${idx++}`); params.push(req.session.userId); }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const countResult = await pool.query(`SELECT COUNT(*) FROM tasks t ${where}`, params);
    const result = await pool.query(
      `SELECT t.*, u.username AS assignee_username, c.username AS created_by_username
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to_user_id = u.user_id
       LEFT JOIN users c ON t.created_by_user_id = c.user_id
       ${where}
       ORDER BY t.due_date ASC NULLS LAST, t.priority DESC LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset]
    );
    return paginated(res, result.rows, Number(countResult.rows[0].count), page, limit);
  } catch (err) { next(err); }
});

router.get("/overdue", requireAuth, requirePermission("task.read"), async (_req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT t.*, u.username AS assignee_username FROM tasks t LEFT JOIN users u ON t.assigned_to_user_id = u.user_id WHERE t.due_date < NOW() AND t.status NOT IN ('completed','verified','cancelled') ORDER BY t.due_date ASC`
    );
    return success(res, result.rows);
  } catch (err) { next(err); }
});

router.get("/:id", requireAuth, requirePermission("task.read"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query(`SELECT t.*, u.username AS assignee_username FROM tasks t LEFT JOIN users u ON t.assigned_to_user_id = u.user_id WHERE t.task_id = $1`, [req.params.id]);
    if (!result.rows[0]) return fail(res, 404, "Task not found");
    const history = await pool.query(`SELECT * FROM task_status_history WHERE task_id = $1 ORDER BY changed_at DESC`, [req.params.id]);
    return success(res, { ...result.rows[0], status_history: history.rows });
  } catch (err) { next(err); }
});

router.post("/", requireAuth, requirePermission("task.create"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return fail(res, 400, "Validation failed", parsed.error.flatten());
    const d = parsed.data;
    const result = await pool.query(
      `INSERT INTO tasks (title, description, priority, due_date, assigned_to_user_id, created_by_user_id, category, tortoise_id, status)
       VALUES ($1,$2,$3,$4::date,$5,$6,$7,$8,'pending') RETURNING *`,
      [d.title, d.description ?? null, d.priority, d.due_date ?? null, d.assigned_to_user_id ?? null, req.session.userId, d.category ?? null, d.tortoise_id ?? null]
    );
    await pool.query(`INSERT INTO task_status_history (task_id, status, changed_by_user_id, notes) VALUES ($1,'pending',$2,'Task created')`, [result.rows[0].task_id, req.session.userId]);
    await auditLog({ req, actorId: req.session.userId, roleId: req.session.roleId, action: "task.create", entityType: "task", entityId: result.rows[0].task_id, afterJson: d });
    return success(res, result.rows[0], 201);
  } catch (err) { next(err); }
});

router.patch("/:id/status", requireAuth, requireAnyPermission(["task.update","task.resolve"]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = statusSchema.safeParse(req.body);
    if (!parsed.success) return fail(res, 400, "Validation failed", parsed.error.flatten());
    const id = Number(req.params.id);
    const before = await pool.query(`SELECT * FROM tasks WHERE task_id = $1`, [id]);
    if (!before.rows[0]) return fail(res, 404, "Task not found");
    const isStaff = req.session.roleName === "Staff";
    if (isStaff && before.rows[0].assigned_to_user_id !== req.session.userId) {
      return fail(res, 403, "You can only update tasks assigned to you");
    }
    await pool.query(`UPDATE tasks SET status = $1, updated_at = NOW() WHERE task_id = $2`, [parsed.data.status, id]);
    await pool.query(`INSERT INTO task_status_history (task_id, status, changed_by_user_id, notes) VALUES ($1,$2,$3,$4)`, [id, parsed.data.status, req.session.userId, parsed.data.notes ?? null]);
    await auditLog({ req, actorId: req.session.userId, roleId: req.session.roleId, action: `task.status.${parsed.data.status}`, entityType: "task", entityId: id, beforeJson: { status: before.rows[0].status }, afterJson: { status: parsed.data.status } });
    return success(res, null, 200, "Status updated");
  } catch (err) { next(err); }
});

router.put("/:id", requireAuth, requirePermission("task.update"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = createSchema.partial().safeParse(req.body);
    if (!parsed.success) return fail(res, 400, "Validation failed", parsed.error.flatten());
    const id = Number(req.params.id);
    const before = await pool.query(`SELECT * FROM tasks WHERE task_id = $1`, [id]);
    if (!before.rows[0]) return fail(res, 404, "Not found");
    const d = parsed.data;
    await pool.query(
      `UPDATE tasks SET title = COALESCE($1, title), description = COALESCE($2, description), priority = COALESCE($3, priority), due_date = COALESCE($4::date, due_date), assigned_to_user_id = COALESCE($5, assigned_to_user_id), category = COALESCE($6, category), updated_at = NOW() WHERE task_id = $7`,
      [d.title ?? null, d.description ?? null, d.priority ?? null, d.due_date ?? null, d.assigned_to_user_id ?? null, d.category ?? null, id]
    );
    if (d.assigned_to_user_id && d.assigned_to_user_id !== before.rows[0].assigned_to_user_id) {
      await auditLog({ req, actorId: req.session.userId, roleId: req.session.roleId, action: "task.assign", entityType: "task", entityId: id, beforeJson: { assigned_to: before.rows[0].assigned_to_user_id }, afterJson: { assigned_to: d.assigned_to_user_id } });
    }
    return success(res, null, 200, "Updated");
  } catch (err) { next(err); }
});

router.delete("/:id", requireAuth, requirePermission("task.delete"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const before = await pool.query(`SELECT * FROM tasks WHERE task_id = $1`, [id]);
    if (!before.rows[0]) return fail(res, 404, "Not found");
    await pool.query(`DELETE FROM task_status_history WHERE task_id = $1`, [id]);
    await pool.query(`DELETE FROM tasks WHERE task_id = $1`, [id]);
    await auditLog({ req, actorId: req.session.userId, roleId: req.session.roleId, action: "task.delete", entityType: "task", entityId: id, beforeJson: before.rows[0] });
    return success(res, null, 200, "Deleted");
  } catch (err) { next(err); }
});

export default router;
