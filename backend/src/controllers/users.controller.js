const pool = require("../config/db");
const bcrypt = require("bcrypt");

exports.updateMe = async (req, res) => {
    try {
        const userId = req.user.id;

        const { first_name, last_name, email } = req.body;

        // 🔒 on empêche modification du role
        const allowedFields = { first_name, last_name, email };

        // enlever null / undefined / vide
        const filtered = Object.fromEntries(
            Object.entries(allowedFields).filter(
                ([_, v]) => v !== undefined && v !== null && v !== ""
            )
        );

        // rien à update
        if (Object.keys(filtered).length === 0) {
            return res.status(400).json({ message: "Aucune donnée à mettre à jour" });
        }

        // construire query dynamique
        const setQuery = Object.keys(filtered)
            .map((key, index) => `${key} = $${index + 1}`)
            .join(", ");

        const values = Object.values(filtered);

        const result = await pool.query(
            `UPDATE users 
       SET ${setQuery}
       WHERE id = $${values.length + 1}
       RETURNING id, email, role, first_name, last_name`,
            [...values, userId]
        );

        res.json(result.rows[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

exports.deleteMe = async (req, res) => {
    const client = await pool.connect();
    try {
        const userId = req.user.id;
        await client.query("BEGIN");
        await client.query("DELETE FROM reviews WHERE users_id = $1", [userId]);
        const { rows: orders } = await client.query("SELECT id FROM orders WHERE users_id = $1", [userId]);
        for (const order of orders) {
            await client.query("DELETE FROM order_items WHERE orders_id = $1", [order.id]);
        }
        await client.query("DELETE FROM orders WHERE users_id = $1", [userId]);
        await client.query("DELETE FROM addresses WHERE users_id = $1", [userId]);
        await client.query("DELETE FROM users WHERE id = $1", [userId]);
        await client.query("COMMIT");
        res.json({ message: "Compte supprimé" });
    } catch (err) {
        await client.query("ROLLBACK");
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    } finally {
        client.release();
    }
};

exports.exportMe = async (req, res) => {
    try {
        const userId = req.user.id;

        const { rows: users } = await pool.query(
            "SELECT id, email, first_name, last_name, role, created_at FROM users WHERE id = $1",
            [userId]
        );

        const { rows: addresses } = await pool.query(
            "SELECT label, street, city, postal_code FROM addresses WHERE users_id = $1",
            [userId]
        );

        const { rows: orders } = await pool.query(
            "SELECT id, status, total_amount_in_cents, street, city, postal_code, created_at FROM orders WHERE users_id = $1 ORDER BY id DESC",
            [userId]
        );

        const ordersWithItems = await Promise.all(
            orders.map(async (order) => {
                const { rows: items } = await pool.query(
                    `SELECT p.name, pv.size, pv.color, oi.quantity, oi.unit_price_in_cents
                     FROM order_items oi
                     JOIN product_variants pv ON pv.id = oi.product_variants_id
                     JOIN products p ON p.id = pv.products_id
                     WHERE oi.orders_id = $1`,
                    [order.id]
                );
                return { ...order, items };
            })
        );

        const { rows: reviews } = await pool.query(
            `SELECT p.name AS product, r.comment, r.created_at
             FROM reviews r
             JOIN products p ON p.id = r.products_id
             WHERE r.users_id = $1`,
            [userId]
        );

        res.json({
            exported_at: new Date().toISOString(),
            profile: users[0],
            addresses,
            orders: ordersWithItems,
            reviews,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { old_password, new_password } = req.body;

        // récupérer utilisateur
        const result = await pool.query(
            "SELECT password FROM users WHERE id = $1",
            [userId]
        );

        const user = result.rows[0];

        // vérifier ancien mdp
        const isValid = await bcrypt.compare(old_password, user.password);

        if (!isValid) {
            return res.status(400).json({ message: "Ancien mot de passe incorrect" });
        }

        // hash nouveau
        const hashed = await bcrypt.hash(new_password, 10);

        // update
        await pool.query(
            "UPDATE users SET password = $1 WHERE id = $2",
            [hashed, userId]
        );

        res.json({ message: "Mot de passe mis à jour" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};