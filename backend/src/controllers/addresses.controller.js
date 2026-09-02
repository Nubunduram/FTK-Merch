const pool = require("../config/db");

exports.getUserAddresses = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM addresses WHERE users_id = $1 ORDER BY id ASC",
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.createAddress = async (req, res) => {
  try {
    const { label, street, city, postal_code } = req.body;

    const result = await pool.query(
      `INSERT INTO addresses (users_id, label, street, city, postal_code)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user.id, label, street, city, postal_code]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { label, street, city, postal_code } = req.body;

    const result = await pool.query(
      `UPDATE addresses
       SET label = $1, street = $2, city = $3, postal_code = $4
       WHERE id = $5 AND users_id = $6
       RETURNING *`,
      [label, street, city, postal_code, id, req.user.id]
    );

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const id = Number(req.params.id);

    await pool.query(
      "DELETE FROM addresses WHERE id = $1 AND users_id = $2",
      [id, req.user.id]
    );

    res.json({ message: "Adresse supprimée" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};