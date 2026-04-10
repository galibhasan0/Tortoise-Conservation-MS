import { Router, Request, Response, NextFunction } from "express";
import pool from "../db/pool";
import { requireAuth } from "../middleware/auth";
import { success } from "../utils/response";

const router = Router();

router.get("/diagnostics", requireAuth, async (_req, res, next) => {
  try {
    const [healthSummary, feedingStats, breedingStats, alertStats] = await Promise.all([
      pool.query(`SELECT health_status, COUNT(*) AS count FROM tortoise_profiles WHERE deleted_at IS NULL GROUP BY health_status`),
      pool.query(`SELECT COUNT(*) AS total, AVG(quantity_grams) AS avg_grams, COUNT(DISTINCT tortoise_id) AS tortoises_fed FROM feeding_logs WHERE fed_at >= NOW() - INTERVAL '7 days'`),
      pool.query(`SELECT outcome, COUNT(*) AS count FROM breeding_records WHERE mating_date >= NOW() - INTERVAL '90 days' GROUP BY outcome`),
      pool.query(`SELECT severity, COUNT(*) AS count FROM alerts WHERE resolved_at IS NULL GROUP BY severity`),
    ]);

    return success(res, {
      health_summary: healthSummary.rows,
      feeding_last_7_days: feedingStats.rows[0],
      breeding_last_90_days: breedingStats.rows,
      active_alerts: alertStats.rows,
      generated_at: new Date().toISOString(),
    });
  } catch (err) { next(err); }
});

router.get("/network-graph-state", requireAuth, async (_req, res, next) => {
  try {
    const tortoises = await pool.query(
      `SELECT t.tortoise_id, t.name, t.gender, t.health_status, s.species_name, e.enclosure_name
       FROM tortoise_profiles t
       LEFT JOIN species s ON t.species_id = s.species_id
       LEFT JOIN enclosures e ON t.enclosure_id = e.enclosure_id
       WHERE t.deleted_at IS NULL`
    );
    const breeding = await pool.query(
      `SELECT male_tortoise_id, female_tortoise_id, outcome FROM breeding_records WHERE outcome = 'Successful'`
    );
    return success(res, {
      nodes: tortoises.rows.map((t: any) => ({ id: t.tortoise_id, label: t.name, gender: t.gender, health: t.health_status, species: t.species_name, enclosure: t.enclosure_name })),
      edges: breeding.rows.map((b: any) => ({ source: b.male_tortoise_id, target: b.female_tortoise_id, type: "breeding" })),
    });
  } catch (err) { next(err); }
});

router.get("/anomalies", requireAuth, async (_req, res, next) => {
  try {
    const tempAnomalies = await pool.query(
      `SELECT e.enclosure_id, enc.enclosure_name, e.temperature_celsius, e.recorded_at,
              AVG(e2.temperature_celsius) OVER (PARTITION BY e.enclosure_id ORDER BY e.recorded_at ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS rolling_avg
       FROM environment_logs e
       LEFT JOIN enclosures enc ON e.enclosure_id = enc.enclosure_id
       JOIN environment_logs e2 ON e.enclosure_id = e2.enclosure_id
       WHERE e.temperature_celsius IS NOT NULL AND e.recorded_at >= NOW() - INTERVAL '7 days'
       ORDER BY e.recorded_at DESC LIMIT 100`
    );

    const anomalies = tempAnomalies.rows.filter((row: any) => {
      const deviation = Math.abs(row.temperature_celsius - row.rolling_avg);
      return deviation > 5;
    });

    const weightAnomalies = await pool.query(
      `SELECT t.tortoise_id, t.name, t.weight, AVG(h.weight_at_exam) AS avg_exam_weight
       FROM tortoise_profiles t
       LEFT JOIN health_records h ON t.tortoise_id = h.tortoise_id
       WHERE t.deleted_at IS NULL AND t.weight IS NOT NULL
       GROUP BY t.tortoise_id, t.name, t.weight
       HAVING ABS(t.weight - AVG(COALESCE(h.weight_at_exam, t.weight))) > 5`
    );

    return success(res, {
      temperature_anomalies: anomalies,
      weight_anomalies: weightAnomalies.rows,
      generated_at: new Date().toISOString(),
    });
  } catch (err) { next(err); }
});

router.get("/population-analytics", requireAuth, async (_req, res, next) => {
  try {
    const [speciesCount, genderDist, healthDist, ageDist, enclosureDist] = await Promise.all([
      pool.query(`SELECT s.species_name, COUNT(*) AS count FROM tortoise_profiles t LEFT JOIN species s ON t.species_id = s.species_id WHERE t.deleted_at IS NULL GROUP BY s.species_name ORDER BY count DESC`),
      pool.query(`SELECT gender, COUNT(*) AS count FROM tortoise_profiles WHERE deleted_at IS NULL GROUP BY gender`),
      pool.query(`SELECT health_status, COUNT(*) AS count FROM tortoise_profiles WHERE deleted_at IS NULL GROUP BY health_status`),
      pool.query(`SELECT CASE WHEN EXTRACT(YEAR FROM AGE(date_of_birth)) < 5 THEN 'Juvenile' WHEN EXTRACT(YEAR FROM AGE(date_of_birth)) < 20 THEN 'Adult' ELSE 'Senior' END AS age_group, COUNT(*) AS count FROM tortoise_profiles WHERE deleted_at IS NULL AND date_of_birth IS NOT NULL GROUP BY age_group`),
      pool.query(`SELECT enc.enclosure_name, COUNT(t.tortoise_id) AS tortoise_count FROM enclosures enc LEFT JOIN tortoise_profiles t ON enc.enclosure_id = t.enclosure_id AND t.deleted_at IS NULL GROUP BY enc.enclosure_name ORDER BY tortoise_count DESC`),
    ]);
    return success(res, { species_distribution: speciesCount.rows, gender_distribution: genderDist.rows, health_distribution: healthDist.rows, age_distribution: ageDist.rows, enclosure_distribution: enclosureDist.rows });
  } catch (err) { next(err); }
});

router.get("/alert-summary", requireAuth, async (_req, res, next) => {
  try {
    const [bySeverity, byType, recentResolved, mttr] = await Promise.all([
      pool.query(`SELECT severity, COUNT(*) AS total, COUNT(*) FILTER (WHERE resolved_at IS NULL) AS active FROM alerts GROUP BY severity`),
      pool.query(`SELECT alert_type, COUNT(*) AS total FROM alerts GROUP BY alert_type`),
      pool.query(`SELECT * FROM alerts WHERE resolved_at IS NOT NULL ORDER BY resolved_at DESC LIMIT 10`),
      pool.query(`SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600)::numeric(10,2) AS avg_hours_to_resolve FROM alerts WHERE resolved_at IS NOT NULL`),
    ]);
    return success(res, { by_severity: bySeverity.rows, by_type: byType.rows, recently_resolved: recentResolved.rows, mean_time_to_resolve_hours: mttr.rows[0]?.avg_hours_to_resolve });
  } catch (err) { next(err); }
});

router.get("/habitat-metrics", requireAuth, async (_req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT enc.enclosure_id, enc.enclosure_name, enc.capacity,
              COUNT(DISTINCT t.tortoise_id) AS current_occupancy,
              AVG(e.temperature_celsius) AS avg_temp, AVG(e.humidity_percent) AS avg_humidity,
              MAX(e.recorded_at) AS last_reading
       FROM enclosures enc
       LEFT JOIN tortoise_profiles t ON enc.enclosure_id = t.enclosure_id AND t.deleted_at IS NULL
       LEFT JOIN environment_logs e ON enc.enclosure_id = e.enclosure_id AND e.recorded_at >= NOW() - INTERVAL '24 hours'
       GROUP BY enc.enclosure_id, enc.enclosure_name, enc.capacity
       ORDER BY enc.enclosure_name`
    );
    return success(res, result.rows);
  } catch (err) { next(err); }
});

export default router;
