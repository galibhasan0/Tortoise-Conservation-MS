import "dotenv/config";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import pool from "./pool";
import bcrypt from "bcryptjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function runMigrations() {
  const client = await pool.connect();
  try {
    console.log("[DB] Running migrations...");
    const schema = readFileSync(join(__dirname, "schema.sql"), "utf-8");
    await client.query(schema);
    console.log("[DB] Schema applied");

    const seed = readFileSync(join(__dirname, "seed.sql"), "utf-8");
    await client.query(seed);
    console.log("[DB] Seeds applied");

    // Create default admin user if none exists
    const existing = await client.query(`SELECT user_id FROM users WHERE username = 'admin'`);
    if (!existing.rows[0]) {
      const hash = await bcrypt.hash("admin123", 12);
      const adminRole = await client.query(`SELECT role_id FROM roles WHERE role_code = 'admin'`);
      const user = await client.query(
        `INSERT INTO users (username, password_hash, role_id) VALUES ('admin', $1, $2) RETURNING user_id`,
        [hash, adminRole.rows[0].role_id]
      );
      await client.query(
        `INSERT INTO user_profiles (user_id, full_name, email) VALUES ($1, 'System Administrator', 'admin@tortoisecare.local')`,
        [user.rows[0].user_id]
      );
      console.log("[DB] Default admin user created (admin / admin123)");
    }

    // Create one user per role for testing
    const demoUsers = [
      { username: "supervisor1", role: "supervisor", name: "Sam Supervisor" },
      { username: "vet1", role: "vet", name: "Dr. Victoria Vet" },
      { username: "caretaker1", role: "caretaker", name: "Carl Caretaker" },
      { username: "breeder1", role: "breeding_officer", name: "Brian Breeder" },
      { username: "envtech1", role: "env_tech", name: "Emma EnvTech" },
      { username: "collector1", role: "collection_officer", name: "Colin Collector" },
      { username: "staff1", role: "staff", name: "Steve Staff" },
    ];

    for (const demo of demoUsers) {
      const exists = await client.query(`SELECT user_id FROM users WHERE username = $1`, [demo.username]);
      if (!exists.rows[0]) {
        const hash = await bcrypt.hash("demo123", 12);
        const role = await client.query(`SELECT role_id FROM roles WHERE role_code = $1`, [demo.role]);
        if (!role.rows[0]) continue;
        const user = await client.query(
          `INSERT INTO users (username, password_hash, role_id) VALUES ($1,$2,$3) RETURNING user_id`,
          [demo.username, hash, role.rows[0].role_id]
        );
        await client.query(
          `INSERT INTO user_profiles (user_id, full_name, email) VALUES ($1,$2,$3)`,
          [user.rows[0].user_id, demo.name, `${demo.username}@tortoisecare.local`]
        );
      }
    }

    // Seed some tortoises
    const tortoiseCount = await client.query(`SELECT COUNT(*) FROM tortoise_profiles`);
    if (Number(tortoiseCount.rows[0].count) === 0) {
      const sulcata = await client.query(`SELECT species_id FROM species WHERE species_name = 'Sulcata Tortoise'`);
      const encA = await client.query(`SELECT enclosure_id FROM enclosures WHERE enclosure_name = 'Enclosure A'`);
      const encB = await client.query(`SELECT enclosure_id FROM enclosures WHERE enclosure_name = 'Enclosure B'`);
      const sId = sulcata.rows[0]?.species_id;
      const eA = encA.rows[0]?.enclosure_id;
      const eB = encB.rows[0]?.enclosure_id;

      await client.query(
        `INSERT INTO tortoise_profiles (tortoise_code, name, species_id, date_of_birth, gender, weight, health_status, enclosure_id) VALUES
         ('TC-001', 'Shelly', $1, '2008-05-20', 'Female', 45.5, 'Healthy', $2),
         ('TC-002', 'Rocky', $1, '2001-03-10', 'Male', 68.2, 'Healthy', $3),
         ('TC-003', 'Luna', $1, '2015-07-14', 'Female', 28.1, 'Healthy', $2),
         ('TC-004', 'Titan', $1, '1998-11-22', 'Male', 82.4, 'Under Treatment', $3)`,
        [sId, eA, eB]
      );
      console.log("[DB] Sample tortoises seeded");
    }

    console.log("[DB] Migrations complete");
  } catch (err) {
    console.error("[DB] Migration error:", err);
    throw err;
  } finally {
    client.release();
  }
}
