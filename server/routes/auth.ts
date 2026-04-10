import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { loginRateLimiter } from "../middleware/rateLimiter";
import { requireAuth } from "../middleware/auth";
import {
  loginUser,
  createPasswordResetToken,
  resetPasswordWithToken,
  changePassword,
} from "../services/authService";
import { auditLog } from "../utils/audit";
import { success, fail } from "../utils/response";

const router = Router();

const loginSchema = z.object({
  username: z.string().min(1).max(100),
  password: z.string().min(1),
});

const forgotSchema = z.object({ email: z.string().email() });
const resetSchema = z.object({ token: z.string().uuid(), password: z.string().min(8) });
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

router.post("/login", loginRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return fail(res, 400, "Validation failed", parsed.error.flatten());

    const { username, password } = parsed.data;
    const { user, permissions } = await loginUser(username, password);

    req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.userId = user.user_id;
      req.session.roleId = user.role_id;
      req.session.roleName = user.role_name;
      req.session.roleCode = user.role_code;
      req.session.permissions = permissions;

      req.session.save(async (saveErr) => {
        if (saveErr) return next(saveErr);
        await auditLog({
          req,
          actorId: user.user_id,
          roleId: user.role_id,
          action: "auth.login",
          entityType: "user",
          entityId: user.user_id,
        });
        return success(res, { user, permissions });
      });
    });
  } catch (err) {
    next(err);
  }
});

router.post("/logout", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.session.userId;
  const roleId = req.session.roleId;
  req.session.destroy(async (err) => {
    if (err) return next(err);
    await auditLog({ req, actorId: userId, roleId, action: "auth.logout", entityType: "user", entityId: userId });
    res.clearCookie("aura.sid");
    return success(res, null, 200, "Logged out successfully");
  });
});

router.get("/me", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { Pool } = await import("pg");
    const pool = (await import("../db/pool")).default;
    const result = await pool.query(
      `SELECT u.user_id, u.username, u.role_id, r.role_name, r.role_code,
              p.full_name, p.email, p.phone, p.avatar, p.bio
       FROM users u
       JOIN roles r ON u.role_id = r.role_id
       LEFT JOIN user_profiles p ON u.user_id = p.user_id
       WHERE u.user_id = $1`,
      [req.session.userId]
    );
    if (!result.rows[0]) return fail(res, 404, "User not found");
    return success(res, { user: result.rows[0], permissions: req.session.permissions });
  } catch (err) {
    next(err);
  }
});

router.post("/forgot-password", loginRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = forgotSchema.safeParse(req.body);
    if (!parsed.success) return fail(res, 400, "Validation failed", parsed.error.flatten());

    const result = await createPasswordResetToken(parsed.data.email);
    if (result) {
      console.log(`[Password Reset] Token for ${result.username}: ${result.token}`);
    }
    return success(res, null, 200, "If that email exists, a reset link has been sent.");
  } catch (err) {
    next(err);
  }
});

router.post("/reset-password", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = resetSchema.safeParse(req.body);
    if (!parsed.success) return fail(res, 400, "Validation failed", parsed.error.flatten());

    const userId = await resetPasswordWithToken(parsed.data.token, parsed.data.password);
    await auditLog({ req, actorId: userId, action: "auth.password_reset", entityType: "user", entityId: userId });
    return success(res, null, 200, "Password reset successfully");
  } catch (err) {
    next(err);
  }
});

router.post("/change-password", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) return fail(res, 400, "Validation failed", parsed.error.flatten());

    await changePassword(req.session.userId!, parsed.data.currentPassword, parsed.data.newPassword);
    await auditLog({
      req,
      actorId: req.session.userId,
      roleId: req.session.roleId,
      action: "auth.password_change",
      entityType: "user",
      entityId: req.session.userId,
    });
    return success(res, null, 200, "Password changed successfully");
  } catch (err) {
    next(err);
  }
});

export default router;
