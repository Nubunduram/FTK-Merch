const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const pool = require("../config/db");

const SHIPPING_FEE_CENTS = 590;
const FREE_SHIPPING_THRESHOLD_CENTS = 6000;

exports.createCheckoutSession = async (req, res) => {
  try {
    const { items, address } = req.body;

    if (!items?.length || !address) {
      return res.status(400).json({ message: "Données manquantes" });
    }

    // Récupère prix et stock depuis la DB (ne jamais faire confiance au client)
    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        const { rows } = await pool.query(
          `SELECT p.price_in_cents, p.name, p.img_url, pv.stock, pv.size, pv.color
           FROM product_variants pv
           JOIN products p ON p.id = pv.products_id
           WHERE pv.id = $1`,
          [item.product_variants_id]
        );
        if (rows.length === 0) throw new Error(`Variant introuvable : ${item.product_variants_id}`);
        return {
          product_variants_id: item.product_variants_id,
          quantity: item.quantity,
          unit_price_in_cents: rows[0].price_in_cents,
          stock: rows[0].stock,
          name: rows[0].name,
          img_url: rows[0].img_url,
          size: rows[0].size,
          color: rows[0].color,
        };
      })
    );

    // Vérification du stock avant de lancer le paiement
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
      return res.status(409).json({ type: "STOCK_ERROR", items: stockErrors });
    }

    // Calcul du total
    const subtotal = enrichedItems.reduce(
      (sum, item) => sum + item.unit_price_in_cents * item.quantity, 0
    );
    const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : SHIPPING_FEE_CENTS;

    // Construction des line_items Stripe
    const lineItems = enrichedItems.map((item) => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: `${item.name} — ${item.color} / ${item.size}`,
          ...(item.img_url && { images: [item.img_url] }),
        },
        unit_amount: item.unit_price_in_cents,
      },
      quantity: item.quantity,
    }));

    if (shippingFee > 0) {
      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: { name: "Frais de livraison" },
          unit_amount: shippingFee,
        },
        quantity: 1,
      });
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      success_url: `${frontendUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/cart`,
    });

    // Stocke les données du panier en DB liées à la session Stripe
    // La commande ne sera créée qu'à la confirmation du paiement (webhook)
    await pool.query(
      `INSERT INTO checkout_sessions (stripe_session_id, user_id, items, address)
       VALUES ($1, $2, $3, $4)`,
      [session.id, req.user.id, JSON.stringify(enrichedItems), JSON.stringify(address)]
    );

    res.json({ url: session.url });

  } catch (err) {
    console.error("CHECKOUT ERROR:", err);
    res.status(500).json({ message: "Erreur création session de paiement" });
  }
};

exports.handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  console.log("[Webhook] Reçu — body type:", typeof req.body, "| Buffer:", Buffer.isBuffer(req.body));

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("[Webhook] Signature invalide:", err.message);
    return res.status(400).json({ message: `Webhook Error: ${err.message}` });
  }

  console.log("[Webhook] Événement vérifié:", event.type);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log("[Webhook] Session complétée:", session.id);
    const client = await pool.connect();

    try {
      const { rows } = await client.query(
        "SELECT * FROM checkout_sessions WHERE stripe_session_id = $1",
        [session.id]
      );

      if (rows.length === 0) {
        console.error("[Webhook] Session introuvable en DB:", session.id);
        return res.json({ received: true });
      }

      const { user_id, items, address } = rows[0];
      console.log("[Webhook] Session trouvée pour user_id:", user_id, "— articles:", items.length);

      await client.query("BEGIN");

      const subtotal = items.reduce(
        (sum, item) => sum + item.unit_price_in_cents * item.quantity, 0
      );
      const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : SHIPPING_FEE_CENTS;
      const total = subtotal + shippingFee;

      const { rows: orderRows } = await client.query(
        `INSERT INTO orders
         (users_id, status, total_amount_in_cents, shipping_fee_in_cents, street, city, postal_code)
         VALUES ($1, 'paid', $2, $3, $4, $5, $6)
         RETURNING id`,
        [user_id, total, shippingFee, address.street, address.city, address.postal_code]
      );
      const orderId = orderRows[0].id;
      console.log("[Webhook] Commande créée:", orderId);

      for (const item of items) {
        await client.query(
          `INSERT INTO order_items (orders_id, product_variants_id, quantity, unit_price_in_cents)
           VALUES ($1, $2, $3, $4)`,
          [orderId, item.product_variants_id, item.quantity, item.unit_price_in_cents]
        );
        await client.query(
          `UPDATE product_variants SET stock = stock - $1 WHERE id = $2`,
          [item.quantity, item.product_variants_id]
        );
      }

      await client.query(
        "DELETE FROM checkout_sessions WHERE stripe_session_id = $1",
        [session.id]
      );

      await client.query("COMMIT");
      console.log("[Webhook] Commande", orderId, "finalisée avec succès");

    } catch (err) {
      await client.query("ROLLBACK");
      console.error("[Webhook] Erreur DB:", err.message, err.detail || "");
      return res.status(500).json({ message: "Erreur traitement commande" });
    } finally {
      client.release();
    }
  }

  res.json({ received: true });
};
