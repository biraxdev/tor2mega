import { runMigrations } from "./migrate";
import { pool } from "./index";
import bcrypt from "bcryptjs";

async function seed() {
  await runMigrations();

  const email = "admin@tor2mega.local";
  const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
  if (existing.rows.length === 0) {
    const hash = await bcrypt.hash("admin", 10);
    await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2)",
      [email, hash]
    );
    console.log("[seed] Created default user: admin@tor2mega.local / admin");
  } else {
    console.log("[seed] Default user already exists");
  }

  await pool.end();
}

seed().catch((err) => {
  console.error("[seed] Error:", err);
  process.exit(1);
});
