const pool = require("../config/db");

async function getProducts(req, res) {
  try {
    let query = "SELECT * FROM products";
    const params = [];
    const conditions = [];

    if (req.query.is_featured) {
      params.push(req.query.is_featured === "true");
      conditions.push(`is_featured = $${params.length}`);
    }

    if (req.query.sub_categories_id) {
      params.push(Number(req.query.sub_categories_id));
      conditions.push(`sub_categories_id = $${params.length}`);
    }

    // Exclure les produits sans variantes de la boutique
    if (!req.query.admin) {
      conditions.push(`EXISTS (
    SELECT 1 FROM product_variants pv WHERE pv.products_id = products.id
  )`);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY id ASC";

    const { rows: products } = await pool.query(query, params);

    const { rows: variants } = await pool.query("SELECT * FROM product_variants");

    const enriched = products.map(p => ({
      ...p,
      variants: variants.filter(v => v.products_id === p.id)
    }));

    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function getProductById(req, res) {
  try {
    const productId = Number(req.params.id);

    const { rows: productRows } = await pool.query(
      "SELECT * FROM products WHERE id = $1",
      [productId]
    );

    if (productRows.length === 0) {
      return res.status(404).json({ error: "Produit non trouvé" });
    }

    const product = productRows[0];

    const { rows: variants } = await pool.query(
      "SELECT * FROM product_variants WHERE products_id = $1",
      [productId]
    );

    // 🔥 FIX IMPORTANT : JOIN users pour récupérer prénom + nom
    const { rows: reviews } = await pool.query(`
      SELECT 
        r.id,
        r.comment,
        r.created_at,
        r.users_id,
        u.first_name,
        u.last_name
      FROM reviews r
      JOIN users u ON u.id = r.users_id
      WHERE r.products_id = $1
      ORDER BY r.id ASC
    `, [productId]);

    res.json({
      ...product,
      variants,
      reviews
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function createProduct(req, res) {
  try {
    const { name, description, price_in_cents, img_url, sub_categories_id } = req.body;

    const { rows } = await pool.query(
      `INSERT INTO products (name, description, price_in_cents, img_url, sub_categories_id, is_featured, created_at)
       VALUES ($1, $2, $3, $4, $5, false, NOW())
       RETURNING *`,
      [name, description, price_in_cents, img_url, sub_categories_id]
    );

    res.status(201).json({ ...rows[0], variants: [] });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function updateProduct(req, res) {
  try {
    const productId = Number(req.params.id);
    const { is_featured } = req.body;

    const { rows } = await pool.query(
      `UPDATE products SET is_featured = $1 WHERE id = $2 RETURNING *`,
      [is_featured, productId]
    );

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function deleteProduct(req, res) {
  try {
    const productId = Number(req.params.id);

    await pool.query(`DELETE FROM products WHERE id = $1`, [productId]);

    res.json({ message: "Produit supprimé" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };