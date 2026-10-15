const request = require("supertest");
const app = require("../src/app");
const pool = require("../config/db");
const { loginAs } = require("./helpers");

describe("/api/product_variants", () => {
  const variant = { products_id: 1, color: "Noir", color_hex: "#000000", size: "M", sku: "TEE-N-M", stock: 5 };

  it("refuse la création à un non-admin (403)", async () => {
    const auth = loginAs("user");

    const res = await request(app)
      .post("/api/product_variants")
      .set("Authorization", auth)
      .send(variant);

    expect(res.status).toBe(403);
  });

  it("crée une variante (201)", async () => {
    const auth = loginAs("admin");
    pool.query.mockResolvedValueOnce({ rows: [{ id: 10, ...variant }] });

    const res = await request(app)
      .post("/api/product_variants")
      .set("Authorization", auth)
      .send(variant);

    expect(res.status).toBe(201);
    expect(res.body.sku).toBe("TEE-N-M");
  });

  it("modifie le stock d'une variante (200)", async () => {
    const auth = loginAs("admin");
    pool.query.mockResolvedValueOnce({ rows: [{ id: 10, stock: 8 }] });

    const res = await request(app)
      .patch("/api/product_variants/10")
      .set("Authorization", auth)
      .send({ stock: 8 });

    expect(res.status).toBe(200);
    expect(res.body.stock).toBe(8);
    expect(pool.query.mock.calls[1][1][0]).toBe(8);
  });

  it("supprime une variante (200)", async () => {
    const auth = loginAs("admin");
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).delete("/api/product_variants/10").set("Authorization", auth);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Variante supprimée");
  });

  it("refuse de supprimer une variante liée à des commandes (409)", async () => {
    const auth = loginAs("admin");
    pool.query.mockRejectedValueOnce(Object.assign(new Error("fk"), { code: "23503" }));

    const res = await request(app).delete("/api/product_variants/10").set("Authorization", auth);

    expect(res.status).toBe(409);
  });
});
