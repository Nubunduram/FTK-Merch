const request = require("supertest");
const app = require("../src/app");
const pool = require("../config/db");
const { loginAs } = require("./helpers");

describe("Accès aux routes /api/admin", () => {
  it("refuse sans token (401)", async () => {
    const res = await request(app).get("/api/admin/orders");
    expect(res.status).toBe(401);
  });

  it("refuse un client non administrateur (403)", async () => {
    const auth = loginAs("user");

    const res = await request(app).get("/api/admin/orders").set("Authorization", auth);

    expect(res.status).toBe(403);
  });

  it("liste toutes les commandes pour un administrateur", async () => {
    const auth = loginAs("admin");
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }, { id: 2 }] });

    const res = await request(app).get("/api/admin/orders").set("Authorization", auth);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});

describe("GET /api/admin/stats", () => {
  it("renvoie les statistiques commandes, produits et stock faible", async () => {
    const auth = loginAs("admin");
    pool.query
      .mockResolvedValueOnce({ rows: [{ total_orders: "3", total_revenue: "12000" }] })
      .mockResolvedValueOnce({ rows: [{ total_products: "2" }] })
      .mockResolvedValueOnce({ rows: [{ id: 1, name: "Tee", stock: 2 }] });

    const res = await request(app).get("/api/admin/stats").set("Authorization", auth);

    expect(res.status).toBe(200);
    expect(res.body.orders.total_orders).toBe("3");
    expect(res.body.products.total_products).toBe("2");
    expect(res.body.low_stock).toHaveLength(1);
  });
});

describe("PATCH /api/admin/orders/:id", () => {
  it("refuse un statut invalide (400) sans toucher à la base", async () => {
    const auth = loginAs("admin");

    const res = await request(app)
      .patch("/api/admin/orders/1")
      .set("Authorization", auth)
      .send({ status: "inconnu" });

    expect(res.status).toBe(400);
    expect(pool.query).toHaveBeenCalledTimes(1); // seulement la requête du middleware d'auth
  });

  it("renvoie 404 si la commande n'existe pas", async () => {
    const auth = loginAs("admin");
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .patch("/api/admin/orders/99")
      .set("Authorization", auth)
      .send({ status: "shipped" });

    expect(res.status).toBe(404);
  });

  it("met à jour le statut (200)", async () => {
    const auth = loginAs("admin");
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: 1 }] })
      .mockResolvedValueOnce({ rows: [{ id: 1, status: "shipped" }] });

    const res = await request(app)
      .patch("/api/admin/orders/1")
      .set("Authorization", auth)
      .send({ status: "shipped" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("shipped");
  });
});
