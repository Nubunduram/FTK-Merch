require("dotenv").config();
const fs = require("fs");
const path = require("path");
const pool = require("./src/config/db");

async function migrate() {
  // Table de suivi des migrations déjà appliquées
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename   VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMP DEFAULT NOW()
    )
  `);

  const dir = path.join(__dirname, "migrations");
  const files = fs.readdirSync(dir)
    .filter(f => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const { rows } = await pool.query(
      "SELECT filename FROM schema_migrations WHERE filename = $1",
      [file]
    );

    if (rows.length > 0) {
      console.log(`[migrate] Skipping  ${file} (déjà appliquée)`);
      continue;
    }

    const sql = fs.readFileSync(path.join(dir, file), "utf8");
    await pool.query(sql);
    await pool.query("INSERT INTO schema_migrations (filename) VALUES ($1)", [file]);
    console.log(`[migrate] Applied    ${file}`);
  }

  console.log("[migrate] Terminé.");
  await pool.end();
}

migrate().catch(err => {
  console.error("[migrate] Erreur :", err.message);
  process.exit(1);
});
