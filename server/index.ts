import "dotenv/config";
import express from "express";
import cors from "cors";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import pool from "./db/pool";
import { runMigrations } from "./db/migrate";
import { errorHandler } from "./middleware/errorHandler";
import { apiRateLimiter } from "./middleware/rateLimiter";

import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import tortoiseRoutes from "./routes/tortoises";
import feedingRoutes from "./routes/feeding";
import healthRoutes from "./routes/health";
import breedingRoutes from "./routes/breeding";
import environmentRoutes from "./routes/environment";
import taskRoutes from "./routes/tasks";
import alertRoutes from "./routes/alerts";
import notificationRoutes from "./routes/notifications";
import auditRoutes from "./routes/audit";
import aiRoutes from "./routes/ai";

const PgSession = connectPgSimple(session);

export function createServer() {
  const app = express();

  app.set("trust proxy", 1);

  app.use(cors({
    origin: true,
    credentials: true,
  }));

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));

  app.use(
    session({
      store: new PgSession({
        pool,
        tableName: "sessions",
        createTableIfMissing: true,
      }),
      name: "aura.sid",
      secret: process.env.SESSION_SECRET ?? "aura-shell-secret-change-in-production",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 8 * 60 * 60 * 1000,
      },
    })
  );

  app.use("/api/v1", apiRateLimiter);

  app.get("/api/ping", (_req, res) => res.json({ message: process.env.PING_MESSAGE ?? "pong" }));

  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/users", userRoutes);
  app.use("/api/v1/tortoises", tortoiseRoutes);
  app.use("/api/v1/feeding", feedingRoutes);
  app.use("/api/v1/health", healthRoutes);
  app.use("/api/v1/breeding", breedingRoutes);
  app.use("/api/v1/environment", environmentRoutes);
  app.use("/api/v1/tasks", taskRoutes);
  app.use("/api/v1/alerts", alertRoutes);
  app.use("/api/v1/notifications", notificationRoutes);
  app.use("/api/v1/audit", auditRoutes);
  app.use("/api/v1/ai", aiRoutes);

  app.use(errorHandler);

  return app;
}

export async function startServer() {
  await runMigrations();
  const app = createServer();
  const port = Number(process.env.PORT ?? 3001);
  app.listen(port, "localhost", () => {
    console.log(`[Server] AURA Shell API running on port ${port}`);
  });
}
