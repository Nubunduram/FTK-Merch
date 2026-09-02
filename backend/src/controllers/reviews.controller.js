const pool = require("../config/db");

// ✅ POST un commentaire
async function createReview(req, res) {
  try {
    const { comment } = req.body;
    const productId = Number(req.params.productId);
    const userId = req.user.id;

    // 🔒 Vérifier que l'user n'a pas déjà commenté ce produit
    const { rows: existing } = await pool.query(
      `SELECT id FROM reviews WHERE users_id = $1 AND products_id = $2`,
      [userId, productId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Vous avez déjà commenté ce produit." });
    }

    const { rows } = await pool.query(
      `INSERT INTO reviews (users_id, products_id, comment, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [userId, productId, comment]
    );

    // Récupérer le prénom pour le renvoyer au front
    const { rows: userRows } = await pool.query(
      `SELECT first_name FROM users WHERE id = $1`,
      [userId]
    );

    res.status(201).json({ ...rows[0], first_name: userRows[0].first_name });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

// ✅ DELETE un commentaire (admin)
async function deleteReview(req, res) {
  try {
    const reviewId = Number(req.params.reviewId);

    // 🔎 Récupérer le commentaire
    const { rows } = await pool.query(
      `SELECT * FROM reviews WHERE id = $1`,
      [reviewId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Commentaire introuvable" });
    }

    const review = rows[0];

    // Vérifier que c'est l'auteur ou un admin
    if (review.users_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Non autorisé" });
    }

    await pool.query(`DELETE FROM reviews WHERE id = $1`, [reviewId]);

    res.json({ message: "Commentaire supprimé" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

module.exports = { createReview, deleteReview };