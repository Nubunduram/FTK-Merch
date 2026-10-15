// Faux client Stripe : aucun appel réseau
jest.mock("stripe", () => {
  const stripeMock = {
    checkout: { sessions: { create: jest.fn() } },
    webhooks: { constructEvent: jest.fn() },
  };
  const factory = () => stripeMock;
  factory.stripeMock = stripeMock;
  return factory;
});

const request = require("supertest");
const stripe = require("stripe").stripeMock;
const app = require("../src/app");
const pool = require("../config/db");
const { loginAs, mockClient, callsMatching } = require("./helpers");

const address = { street: "1 rue de la Paix", city: "Paris", postal_code: "75001" };
const variantRow = (stock = 10) => ({
  price_in_cents: 2000,
  name: "Tee",
  img_url: null,
  stock,
  size: "M",
  color: "Noir",
});

describe("POST /api/payments/create-checkout-session", () => {
  it("refuse sans token", async () => {
    const res = await request(app).post("/api/payments/create-checkout-session").send({});
    expect(res.status).toBe(401);
  });

  it("refuse un panier vide (400)", async () => {
    const auth = loginAs("user", 4);

    const res = await request(app)
      .post("/api/payments/create-checkout-session")
      .set("Authorization", auth)
      .send({ items: [], address });

    expect(res.status).toBe(400);
  });

  it("renvoie 409 STOCK_ERROR si le stock est insuffisant", async () => {
    const auth = loginAs("user", 4);
    pool.query.mockResolvedValueOnce({ rows: [variantRow(1)] });

    const res = await request(app)
      .post("/api/payments/create-checkout-session")
      .set("Authorization", auth)
      .send({ items: [{ product_variants_id: 10, quantity: 5 }], address });

    expect(res.status).toBe(409);
    expect(res.body.type).toBe("STOCK_ERROR");
    expect(stripe.checkout.sessions.create).not.toHaveBeenCalled();
  });

  it("crée la session Stripe, ajoute les frais de livraison et mémorise le panier", async () => {
    const auth = loginAs("user", 4);
    pool.query.mockResolvedValueOnce({ rows: [variantRow()] });
    stripe.checkout.sessions.create.mockResolvedValue({
      id: "cs_test_1",
      url: "https://checkout.stripe.com/pay/cs_test_1",
    });

    const res = await request(app)
      .post("/api/payments/create-checkout-session")
      .set("Authorization", auth)
      .send({ items: [{ product_variants_id: 10, quantity: 1 }], address });

    expect(res.status).toBe(200);
    expect(res.body.url).toBe("https://checkout.stripe.com/pay/cs_test_1");

    const payload = stripe.checkout.sessions.create.mock.calls[0][0];
    expect(payload.mode).toBe("payment");
    expect(payload.success_url).toContain("http://localhost:5173/success");
    // 1 article + 1 ligne de livraison (2000 < 6000)
    expect(payload.line_items).toHaveLength(2);
    expect(payload.line_items[1].price_data.unit_amount).toBe(590);

    const [, insertParams] = callsMatching(pool.query, /INSERT INTO checkout_sessions/)[0];
    expect(insertParams[0]).toBe("cs_test_1");
    expect(insertParams[1]).toBe(4);
  });

  it("n'ajoute pas de frais de livraison à partir de 60 €", async () => {
    const auth = loginAs("user", 4);
    pool.query.mockResolvedValueOnce({ rows: [variantRow()] });
    stripe.checkout.sessions.create.mockResolvedValue({ id: "cs_test_2", url: "https://x" });

    await request(app)
      .post("/api/payments/create-checkout-session")
      .set("Authorization", auth)
      .send({ items: [{ product_variants_id: 10, quantity: 3 }], address });

    const payload = stripe.checkout.sessions.create.mock.calls[0][0];
    expect(payload.line_items).toHaveLength(1);
  });

  it("renvoie 500 si la variante est introuvable", async () => {
    const auth = loginAs("user", 4);
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .post("/api/payments/create-checkout-session")
      .set("Authorization", auth)
      .send({ items: [{ product_variants_id: 404, quantity: 1 }], address });

    expect(res.status).toBe(500);
  });
});

describe("POST /api/payments/webhook", () => {
  const sendWebhook = () =>
    request(app)
      .post("/api/payments/webhook")
      .set("stripe-signature", "t=1,v1=abc")
      .set("Content-Type", "application/json")
      .send("{}");

  const completedEvent = (overrides = {}) => ({
    type: "checkout.session.completed",
    data: {
      object: {
        id: "cs_test_1",
        payment_status: "paid",
        payment_intent: "pi_123",
        amount_total: 4590,
        ...overrides,
      },
    },
  });

  /** Faux client : la session de paiement mémorisée (2 x 2000 = 4000 + 590 de livraison) */
  function setupClient({ sessionFound = true, failOnOrderInsert = false } = {}) {
    const client = mockClient();
    client.query.mockImplementation(async (sql) => {
      if (/DELETE FROM checkout_sessions/.test(sql)) {
        return sessionFound
          ? {
              rows: [
                {
                  user_id: 4,
                  items: [{ product_variants_id: 10, quantity: 2, unit_price_in_cents: 2000 }],
                  address,
                },
              ],
            }
          : { rows: [] };
      }
      if (/INSERT INTO orders/.test(sql)) {
        if (failOnOrderInsert) throw new Error("insert failed");
        return { rows: [{ id: 99 }] };
      }
      return { rows: [] };
    });
    return client;
  }

  it("refuse une signature invalide (400)", async () => {
    stripe.webhooks.constructEvent.mockImplementation(() => {
      throw new Error("bad signature");
    });

    const res = await sendWebhook();

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("bad signature");
    expect(pool.connect).not.toHaveBeenCalled();
  });

  it("crée la commande, enregistre le paiement et décrémente le stock", async () => {
    stripe.webhooks.constructEvent.mockReturnValue(completedEvent());
    const client = setupClient();

    const res = await sendWebhook();

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ received: true });

    const [, orderParams] = callsMatching(client.query, /INSERT INTO orders/)[0];
    expect(orderParams[1]).toBe(4590);

    const [, paymentParams] = callsMatching(client.query, /INSERT INTO payments/)[0];
    expect(paymentParams).toEqual([99, "pi_123", 4590]);

    const [, stockParams] = callsMatching(client.query, /UPDATE product_variants/)[0];
    expect(stockParams).toEqual([2, 10]);

    expect(client.query).toHaveBeenCalledWith("COMMIT");
    expect(client.release).toHaveBeenCalled();
  });

  it("est idempotent : un événement déjà traité ne crée pas de seconde commande", async () => {
    stripe.webhooks.constructEvent.mockReturnValue(completedEvent());
    const client = setupClient({ sessionFound: false });

    const res = await sendWebhook();

    expect(res.status).toBe(200);
    expect(callsMatching(client.query, /INSERT INTO orders/)).toHaveLength(0);
    expect(callsMatching(client.query, /INSERT INTO payments/)).toHaveLength(0);
    expect(client.query).toHaveBeenCalledWith("ROLLBACK");
  });

  it("ignore une session non payée", async () => {
    stripe.webhooks.constructEvent.mockReturnValue(completedEvent({ payment_status: "unpaid" }));

    const res = await sendWebhook();

    expect(res.status).toBe(200);
    expect(pool.connect).not.toHaveBeenCalled();
  });

  it("ignore les autres types d'événements", async () => {
    stripe.webhooks.constructEvent.mockReturnValue({ type: "payment_intent.created", data: {} });

    const res = await sendWebhook();

    expect(res.status).toBe(200);
    expect(pool.connect).not.toHaveBeenCalled();
  });

  it("annule tout et renvoie 500 si l'écriture en base échoue", async () => {
    stripe.webhooks.constructEvent.mockReturnValue(completedEvent());
    const client = setupClient({ failOnOrderInsert: true });

    const res = await sendWebhook();

    expect(res.status).toBe(500);
    expect(client.query).toHaveBeenCalledWith("ROLLBACK");
    expect(client.release).toHaveBeenCalled();
  });
});
