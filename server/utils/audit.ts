import pool from "../db/pool";
import { Request } from "express";

interface AuditParams {
  req: Request;
  actorId?: number | null;
  roleId?: number | null;
  action: string;
  entityType?: string;
  entityId?: number | string | null;
  beforeJson?: unknown;
  afterJson?: unknown;
}

export async function auditLog({
  req,
  actorId,
  roleId,
  action,
  entityType,
  entityId,
  beforeJson,
  afterJson,
}: AuditParams) {
  try {
    const ip =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      null;

    await pool.query(
      `INSERT INTO audit_logs
        (actor_user_id, role_id, action, entity_type, entity_id, before_json, after_json, ip_address, request_path)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        actorId ?? null,
        roleId ?? null,
        action,
        entityType ?? null,
        entityId ?? null,
        beforeJson ? JSON.stringify(beforeJson) : null,
        afterJson ? JSON.stringify(afterJson) : null,
        ip,
        req.originalUrl,
      ]
    );
  } catch (err) {
    console.error("Audit log error:", err);
  }
}
