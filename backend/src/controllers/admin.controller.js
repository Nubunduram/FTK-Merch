const pool = require("../config/db");

const VALID_STATUSES = [
  "pending",
  "paid",
  "shipped",
  "delivered",
  "canceled",
];


// ✅ GET toutes les commandes (admin)
exports.getAllOrders = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT *
      FROM orders
      ORDER BY created_at DESC
    `);

    res.json(rows);

  } catch (err) {
    console.error("GET ALL ORDERS ERROR:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// GET stats
exports.getStats = async (req, res) => {
  try {
    const { rows: orderStats } = await pool.query(`
      SELECT
        COUNT(*) AS total_orders,
        COUNT(*) FILTER (WHERE status = 'pending')   AS pending,
        COUNT(*) FILTER (WHERE status = 'paid')      AS paid,
        COUNT(*) FILTER (WHERE status = 'shipped')   AS shipped,
        COUNT(*) FILTER (WHERE status = 'delivered') AS delivered,
        COUNT(*) FILTER (WHERE status = 'canceled') AS canceled,
        COALESCE(SUM(total_amount_in_cents), 0)      AS total_revenue
      FROM orders
    `);

    const { rows: productStats } = await pool.query(`
      SELECT COUNT(*) AS total_products FROM products
    `);

    const { rows: lowStock } = await pool.query(`
      SELECT pv.id, pv.color, pv.size, pv.stock, p.name
      FROM product_variants pv
      JOIN products p ON p.id = pv.products_id
      WHERE pv.stock <= 5
      ORDER BY pv.stock ASC
      LIMIT 10
    `);

    res.json({ orders: orderStats[0], products: productStats[0], low_stock: lowStock });

  } catch (err) {
    console.error("STATS ERROR:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ✅ UPDATE statut commande
exports.updateOrderStatus = async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    const { status } = req.body;

    // 🔒 Vérification statut valide
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        message: "Statut invalide",
      });
    }

    // 🔎 Vérifie que la commande existe
    const { rows: existing } = await pool.query(
      "SELECT id FROM orders WHERE id = $1",
      [orderId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        message: "Commande introuvable",
      });
    }

    // 🔄 Update statut
    const { rows } = await pool.query(
      `UPDATE orders
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      [status, orderId]
    );

    res.json(rows[0]);

  } catch (err) {
    console.error("UPDATE ORDER STATUS ERROR:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};