const pool = require("../config/db");

async function getProductVariants(req, res) {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM product_variants ORDER BY id ASC"
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function createVariant(req, res) {
  try {
    const { products_id, color, color_hex, size, sku, stock } = req.body; // ✅

    const { rows } = await pool.query(
      `INSERT INTO product_variants (products_id, color, color_hex, size, sku, stock, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING *`,
      [products_id, color, color_hex, size, sku, stock] // ✅
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function updateVariant(req, res) {
  try {
    const variantId = Number(req.params.id);
    const { stock, color, color_hex } = req.body; // ✅

    const { rows } = await pool.query(
      `UPDATE product_variants 
       SET stock = $1, color = COALESCE($2, color), color_hex = COALESCE($3, color_hex)
       WHERE id = $4 RETURNING *`,
      [stock, color, color_hex, variantId]
    );

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function deleteVariant(req, res) {
  try {
    const variantId = Number(req.params.id);

    await pool.query(`DELETE FROM product_variants WHERE id = $1`, [variantId]);

    res.json({ message: "Variante supprimée" });
  } catch (err) {
    if (err.code === "23503") {
      return res.status(409).json({ message: "Cette variante est liée à des commandes existantes et ne peut pas être supprimée." });
    }
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
}

module.exports = { createVariant, updateVariant, deleteVariant };