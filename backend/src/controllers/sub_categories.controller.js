const pool = require("../config/db");

async function getSubCategories(req, res) {
  try {
    const result = await pool.query(`
      SELECT sc.*, c.name AS category_name, c.slug AS category_slug
      FROM sub_categories sc
      JOIN categories c ON sc.categories_id = c.id
      ORDER BY sc.id ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function createSubCategory(req, res) {
  const { name, categories_id } = req.body;
  if (!name || !categories_id) return res.status(400).json({ error: "name et categories_id requis" });
  try {
    const result = await pool.query(
      "INSERT INTO sub_categories (name, categories_id) VALUES ($1, $2) RETURNING *",
      [name, categories_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function updateSubCategory(req, res) {
  const { id } = req.params;
  const { name, categories_id } = req.body;
  try {
    const result = await pool.query(
      "UPDATE sub_categories SET name = $1, categories_id = $2 WHERE id = $3 RETURNING *",
      [name, categories_id, id]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Sous-catégorie introuvable" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function deleteSubCategory(req, res) {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM sub_categories WHERE id = $1", [id]);
    res.status(204).end();
  } catch (err) {
    if (err.code === "23503") {
      return res.status(409).json({ error: "Cette sous-catégorie contient des produits. Supprimez-les d'abord." });
    }
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

module.exports = { getSubCategories, createSubCategory, updateSubCategory, deleteSubCategory };
