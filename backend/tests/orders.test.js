const request = require("supertest");
const app = require("../src/app");
const pool = require("../config/db");
const { loginAs, mockClient, callsMatching } = require("./helpers");

const address = { street: "1 rue de la Paix", city: "Paris", postal_code: "75001" };

describe("GET /api/orders", () => {
  it("refuse sans token", async () => {
    const res = await request(app).get("/api/orders");
    expect(res.status).toBe(401);
  });

  it("ne renvoie que les commandes de l'utilisateur connecté", async () => {
    const auth = loginAs("user", 4);
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }, { id: 2 }] });

    const res = await request(app).get("/api/orders").set("Authorization", auth);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(pool.query.mock.calls[1][1]).toEqual([4]);
  });
});

describe("GET /api/orders/:id", () => {
  it("renvoie 404 pour une commande inexistante ou d'un autre utilisateur", async () => {
    const auth = loginAs("user", 4);
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get("/api/orders/9").set("Authorization", auth);

    expect(res.status).toBe(404);
    // la requête filtre bien sur l'utilisateur connecté
    expect(pool.query.mock.calls[1][1]).toEqual([9, 4]);
  });

  it("renvoie la commande avec ses articles", async () => {
    const auth = loginAs("user", 4);
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: 9, users_id: 4, status: "paid" }] })
      .mockResolvedValueOnce({ rows: [{ name: "Tee", size: "M", quantity: 2 }] });

    const res = await request(app).get("/api/orders/9").set("Authorization", auth);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("paid");
    expect(res.body.items).toHaveLength(1);
  });
});

describe("POST /api/orders", () => {
  /** Faux client : le prix et le stock viennent de la "base", pas du client */
  function setupClient({ stock = 10, variantFound = true } = {}) {
    const client = mockClient();
    client.query.mockImplementation(async (sql) => {
      if (/FROM product_variants pv/.test(sql)) {
        return variantFound
          ? { rows: [{ price_in_cents: 2000, name: "Tee", stock, size: "M", color: "Noir" }] }
          : { rows: [] };
      }
      if (/INSERT INTO orders/.test(sql)) return { rows: [{ id: 99, status: "pending" }] };
      return { rows: [] };
    });
    return client;
  }

  it("refuse des données manquantes (400)", async () => {
    const auth = loginAs("user", 4);
    setupClient();

    const res = await request(app).post("/api/orders").set("Authorization", auth).send({});

    expect(res.status).toBe(400);
  });

  it("renvoie 409 STOCK_ERROR si le stock est insuffisant et annule la transaction", async () => {
    const auth = loginAs("user", 4);
    const client = setupClient({ stock: 1 });

    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", auth)
      .send({ items: [{ product_variants_id: 10, quantity: 2 }], address });

    expect(res.status).toBe(409);
    expect(res.body.type).toBe("STOCK_ERROR");
    expect(res.body.items[0]).toMatchObject({ requested: 2, available: 1 });
    expect(client.query).toHaveBeenCalledWith("ROLLBACK");
    expect(client.release).toHaveBeenCalled();
  });

  it("calcule le total depuis la base (le prix envoyé par le client est ignoré) avec frais de port", async () => {
    const auth = loginAs("user", 4);
    const client = setupClient();

    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", auth)
      .send({
        items: [{ product_variants_id: 10, quantity: 2, unit_price_in_cents: 1 }],
        address,
      });

    expect(res.status).toBe(201);
    expect(res.body.id).toBe(99);

    // 2 x 2000 = 4000 + 590 de livraison (sous le seuil de 6000)
    const [, orderParams] = callsMatching(client.query, /INSERT INTO orders/)[0];
    expect(orderParams[1]).toBe(4590);
    expect(orderParams[2]).toBe(590);

    // stock décrémenté, transaction validée
    const [, stockParams] = callsMatching(client.query, /UPDATE product_variants/)[0];
    expect(stockParams).toEqual([2, 10]);
    expect(client.query).toHaveBeenCalledWith("COMMIT");
  });

  it("offre la livraison à partir de 60 €", async () => {
    const auth = loginAs("user", 4);
    const client = setupClient();

    await request(app)
      .post("/api/orders")
      .set("Authorization", auth)
      .send({ items: [{ product_variants_id: 10, quantity: 3 }], address });

    const [, orderParams] = callsMatching(client.query, /INSERT INTO orders/)[0];
    expect(orderParams[1]).toBe(6000);
    expect(orderParams[2]).toBe(0);
  });

  it("annule la transaction et renvoie 500 si une variante est introuvable", async () => {
    const auth = loginAs("user", 4);
    const client = setupClient({ variantFound: false });

    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", auth)
      .send({ items: [{ product_variants_id: 404, quantity: 1 }], address });

    expect(res.status).toBe(500);
    expect(client.query).toHaveBeenCalledWith("ROLLBACK");
    expect(client.release).toHaveBeenCalled();
  });
});
