const pool = require("../config/db");

const SHIPPING_FEE_CENTS = 590;           // 5,90 €
const FREE_SHIPPING_THRESHOLD_CENTS = 6000; // 60,00 €

// ✅ GET toutes les commandes utilisateur
exports.getUserOrders = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM orders WHERE users_id = $1 ORDER BY id DESC",
            [req.user.id]
        );

        res.json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// ✅ GET commande par ID (avec items)
exports.getOrderById = async (req, res) => {
    try {
        const orderId = Number(req.params.id);

        const { rows: orders } = await pool.query(
            "SELECT * FROM orders WHERE id = $1 AND users_id = $2",
            [orderId, req.user.id]
        );

        if (orders.length === 0) {
            return res.status(404).json({ message: "Commande introuvable" });
        }

        const order = orders[0];

        const { rows: items } = await pool.query(
            `SELECT 
                oi.*, 
                p.name, 
                p.img_url,
                pv.size,
                pv.color
             FROM order_items oi
             JOIN product_variants pv ON pv.id = oi.product_variants_id
             JOIN products p ON p.id = pv.products_id
             WHERE oi.orders_id = $1`,
            [orderId]
        );

        res.json({
            ...order,
            items
        });

    } catch (err) {
        console.error(err); // ← regarde ce que ça affiche dans ton terminal backend
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// ✅ CREATE ORDER
exports.createOrder = async (req, res) => {
    const client = await pool.connect();

    try {
        const { items, address } = req.body;

        if (!items || !address) {
            return res.status(400).json({ message: "Données manquantes" });
        }

        await client.query("BEGIN");

        // ✅ Récupération du prix, du stock et des infos produit depuis la DB
        const enrichedItems = await Promise.all(
            items.map(async (item) => {
                const { rows } = await client.query(
                    `SELECT p.price_in_cents, p.name, pv.stock, pv.size, pv.color
                     FROM product_variants pv
                     JOIN products p ON p.id = pv.products_id
                     WHERE pv.id = $1`,
                    [item.product_variants_id]
                );

                if (rows.length === 0) {
                    throw new Error(`Variant introuvable : ${item.product_variants_id}`);
                }

                return {
                    ...item,
                    unit_price_in_cents: rows[0].price_in_cents,
                    stock: rows[0].stock,
                    name: rows[0].name,
                    size: rows[0].size,
                    color: rows[0].color,
                };
            })
        );

        // ✅ Vérification du stock AVANT d'insérer la commande — collecte tous les articles en rupture
        const stockErrors = [];
        for (const item of enrichedItems) {
            if (item.stock < item.quantity) {
                stockErrors.push({
                    name: item.name,
                    color: item.color,
                    size: item.size,
                    requested: item.quantity,
                    available: item.stock,
                });
            }
        }
        if (stockErrors.length > 0) {
            await client.query("ROLLBACK");
            return res.status(409).json({ type: "STOCK_ERROR", items: stockErrors });
        }

        // ✅ Total calculé uniquement depuis la DB
        const subtotal = enrichedItems.reduce((sum, item) => {
            return sum + item.unit_price_in_cents * item.quantity;
        }, 0);

        const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : SHIPPING_FEE_CENTS;
        const total = subtotal + shippingFee;

        const { rows: orderRows } = await client.query(
            `INSERT INTO orders
            (users_id, status, total_amount_in_cents, shipping_fee_in_cents, street, city, postal_code)
            VALUES ($1, 'pending', $2, $3, $4, $5, $6)
            RETURNING *`,
            [req.user.id, total, shippingFee, address.street, address.city, address.postal_code]
        );

        const order = orderRows[0];

        // ✅ Insertion des order_items + décrémentation du stock
        for (const item of enrichedItems) {
            await client.query(
                `INSERT INTO order_items
                (orders_id, product_variants_id, quantity, unit_price_in_cents)
                VALUES ($1, $2, $3, $4)`,
                [order.id, item.product_variants_id, item.quantity, item.unit_price_in_cents]
            );

            await client.query(
                `UPDATE product_variants 
                 SET stock = stock - $1 
                 WHERE id = $2`,
                [item.quantity, item.product_variants_id]
            );
        }

        await client.query("COMMIT");
        res.status(201).json(order);

    } catch (err) {
        await client.query("ROLLBACK");
        console.error("ORDER ERROR:", err);
        res.status(500).json({ message: "Erreur création commande", error: err.message });
    } finally {
        client.release();
    }
};