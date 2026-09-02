const pool = require("../config/db");

async function getCategories(req, res) {
  try {
    const result = await pool.query("SELECT * FROM categories ORDER BY position ASC, id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function createCategory(req, res) {
  const { name, slug } = req.body;
  if (!name || !slug) return res.status(400).json({ error: "name et slug requis" });
  try {
    const posRes = await pool.query("SELECT COALESCE(MAX(position), 0) + 1 AS pos FROM categories");
    const position = posRes.rows[0].pos;
    const result = await pool.query(
      "INSERT INTO categories (name, slug, position) VALUES ($1, $2, $3) RETURNING *",
      [name, slug, position]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function updateCategory(req, res) {
  const { id } = req.params;
  const { name, slug, position } = req.body;
  try {
    const result = await pool.query(
      `UPDATE categories SET
        name     = COALESCE($1, name),
        slug     = COALESCE($2, slug),
        position = COALESCE($3, position)
       WHERE id = $4 RETURNING *`,
      [name ?? null, slug ?? null, position ?? null, id]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Catégorie introuvable" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function deleteCategory(req, res) {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM categories WHERE id = $1", [id]);
    res.status(204).end();
  } catch (err) {
    if (err.code === "23503") {
      return res.status(409).json({ error: "Cette catégorie contient des sous-catégories. Supprimez-les d'abord." });
    }
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
