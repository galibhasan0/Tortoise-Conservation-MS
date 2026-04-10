import pool from "../db/pool";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { createError } from "../middleware/errorHandler";
import { loadPermissions } from "../middleware/auth";

export async function loginUser(username: string, password: string) {
  const result = await pool.query(
    `SELECT u.user_id, u.username, u.password_hash, u.role_id, u.status,
            r.role_name, r.role_code,
            p.full_name, p.email, p.phone, p.avatar, p.bio
     FROM users u
     JOIN roles r ON u.role_id = r.role_id
     LEFT JOIN user_profiles p ON u.user_id = p.user_id
     WHERE u.username = $1`,
    [username]
  );

  const user = result.rows[0];
  if (!user) throw createError("Invalid credentials", 401);
  if (user.status !== "active") throw createError("Account is not active", 403);

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw createError("Invalid credentials", 401);

  const permissions = await loadPermissions(user.user_id, user.role_id);

  return {
    user: {
      user_id: user.user_id,
      username: user.username,
      role_id: user.role_id,
      role_name: user.role_name,
      role_code: user.role_code,
      full_name: user.full_name ?? user.username,
      email: user.email ?? `${user.username}@tortoisecare.local`,
      phone: user.phone,
      avatar: user.avatar,
      bio: user.bio,
    },
    permissions,
  };
}

export async function createPasswordResetToken(email: string) {
  const profileResult = await pool.query(
    `SELECT up.user_id, u.username FROM user_profiles up
     JOIN users u ON up.user_id = u.user_id
     WHERE up.email = $1 AND u.status = 'active'`,
    [email]
  );

  if (!profileResult.rows[0]) {
    return null;
  }

  const userId = profileResult.rows[0].user_id;
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await pool.query(
    `INSERT INTO password_reset_tokens (user_id, token, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, token, expiresAt]
  );

  return { token, email, username: profileResult.rows[0].username };
}

export async function resetPasswordWithToken(token: string, newPassword: string) {
  const result = await pool.query(
    `SELECT * FROM password_reset_tokens WHERE token = $1 AND used = false AND expires_at > NOW()`,
    [token]
  );

  if (!result.rows[0]) throw createError("Invalid or expired token", 400);

  const hash = await bcrypt.hash(newPassword, 12);
  const userId = result.rows[0].user_id;

  await pool.query(`UPDATE users SET password_hash = $1, updated_at = NOW() WHERE user_id = $2`, [
    hash,
    userId,
  ]);

  await pool.query(
    `UPDATE password_reset_tokens SET used = true WHERE token = $1`,
    [token]
  );

  return userId;
}

export async function changePassword(
  userId: number,
  currentPassword: string,
  newPassword: string
) {
  const result = await pool.query(`SELECT password_hash FROM users WHERE user_id = $1`, [userId]);
  if (!result.rows[0]) throw createError("User not found", 404);

  const valid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
  if (!valid) throw createError("Current password is incorrect", 400);

  const hash = await bcrypt.hash(newPassword, 12);
  await pool.query(
    `UPDATE users SET password_hash = $1, updated_at = NOW() WHERE user_id = $2`,
    [hash, userId]
  );
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}
