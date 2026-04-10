import path from "node:path";
import * as express from "express";
import { createServer } from "./index";
import { runMigrations } from "./db/migrate";

const port = process.env.PORT || 5000;
const __dirname = import.meta.dirname;
const distPath = path.join(__dirname, "../spa");

async function main() {
  await runMigrations();

  const app = createServer();

  app.use(express.static(distPath));

  app.get("*", (req, res) => {
    if (req.path.startsWith("/api/")) {
      return res.status(404).json({ error: "API endpoint not found" });
    }
    res.sendFile(path.join(distPath, "index.html"));
  });

  app.listen(port, () => {
    console.log(`AURA Shell server running on port ${port}`);
  });
}

main().catch((err) => {
  console.error("Startup error:", err);
  process.exit(1);
});

process.on("SIGTERM", () => process.exit(0));
process.on("SIGINT", () => process.exit(0));
