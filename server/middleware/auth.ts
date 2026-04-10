import { Request, Response, NextFunction } from "express";
import pool from "../db/pool";
import { auditLog } from "../utils/audit";
import { fail } from "../utils/response";

declare module "express-session" {
  interface SessionData {
    userId: number;
    roleId: number;
    roleName: string;
    roleCode: string;
    permissions: string[];
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return fail(res, 401, "Authentication required");
  }

  try {
    const result = await pool.query(
      `SELECT u.user_id, u.username, u.role_id, u.status, r.role_name, r.role_code
       FROM users u JOIN roles r ON u.role_id = r.role_id
       WHERE u.user_id = $1`,
      [req.session.userId]
    );

    if (!result.rows[0] || result.rows[0].status !== "active") {
      req.session.destroy(() => {});
      return fail(res, 401, "Session invalid or account inactive");
    }

    (req as any).currentUser = result.rows[0];
    next();
  } catch (err) {
    next(err);
  }
}

export function requirePermission(permission: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.session?.userId) return fail(res, 401, "Authentication required");

    try {
      const perms = req.session.permissions ?? [];
      if (!perms.includes(permission)) {
        await auditLog({
          req,
          actorId: req.session.userId,
          roleId: req.session.roleId,
          action: `denied:${permission}`,
        });
        return fail(res, 403, `Permission denied: ${permission}`);
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}

export function requireAnyPermission(permissions: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.session?.userId) return fail(res, 401, "Authentication required");

    const perms = req.session.permissions ?? [];
    const hasAny = permissions.some((p) => perms.includes(p));
    if (!hasAny) {
      await auditLog({
        req,
        actorId: req.session.userId,
        roleId: req.session.roleId,
        action: `denied:any_of:${permissions.join(",")}`,
      });
      return fail(res, 403, "Insufficient permissions");
    }
    next();
  };
}

export function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.session?.userId) return fail(res, 401, "Authentication required");
    const roleName = req.session.roleName ?? "";
    if (!roles.includes(roleName)) {
      return fail(res, 403, `Role '${roleName}' not authorized for this action`);
    }
    next();
  };
}

export async function loadPermissions(userId: number, roleId: number): Promise<string[]> {
  const result = await pool.query(
    `SELECT p.permission_key FROM permissions p
     JOIN role_permissions rp ON p.permission_id = rp.permission_id
     WHERE rp.role_id = $1`,
    [roleId]
  );
  return result.rows.map((r: any) => r.permission_key);
}
