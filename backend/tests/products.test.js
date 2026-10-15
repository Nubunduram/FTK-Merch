const request = require("supertest");
const app = require("../src/app");
const pool = require("../config/db");
const { loginAs } = require("./helpers");

describe("GET /api/products", () => {
  it("renvoie les produits avec leurs variantes", async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: 1, name: "Tee" }, { id: 2, name: "Hoodie" }] })
      .mockResolvedValueOnce({
        rows: [
          { id: 10, products_id: 1, size: "M" },
          { id: 11, products_id: 1, size: "L" },
          { id: 12, products_id: 2, size: "S" },
        ],
      });

    const res = await request(app).get("/api/products");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].variants).toHaveLength(2);
    expect(res.body[1].variants).toHaveLength(1);
    // la boutique masque les produits sans variante
    expect(pool.query.mock.calls[0][0]).toContain("EXISTS");
  });

  it("applique les filtres is_featured et sub_categories_id", async () => {
    pool.query.mockResolvedValue({ rows: [] });

    await request(app).get("/api/products?is_featured=true&sub_categories_id=3");

    const [sql, params] = pool.query.mock.calls[0];
    expect(sql).toContain("is_featured = $1");
    expect(sql).toContain("sub_categories_id = $2");
    expect(params).toEqual([true, 3]);
  });

  it("inclut les produits sans variante en mode admin", async () => {
    pool.query.mockResolvedValue({ rows: [] });

    await request(app).get("/api/products?admin=1");

    expect(pool.query.mock.calls[0][0]).not.toContain("EXISTS");
  });

  it("renvoie 500 si la base est indisponible", async () => {
    pool.query.mockRejectedValueOnce(new Error("db down"));

    const res = await request(app).get("/api/products");

    expect(res.status).toBe(500);
  });
});

describe("GET /api/products/:id", () => {
  it("renvoie le produit avec ses variantes et ses avis", async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: 1, name: "Tee" }] })
      .mockResolvedValueOnce({ rows: [{ id: 10, products_id: 1 }] })
      .mockResolvedValueOnce({ rows: [{ id: 1, comment: "Top", first_name: "Jean" }] });

    const res = await request(app).get("/api/products/1");

    expect(res.status).toBe(200);
    expect(res.body.variants).toHaveLength(1);
    expect(res.body.reviews).toHaveLength(1);
  });

  it("renvoie 404 si le produit n'existe pas", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get("/api/products/999");

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Produit non trouvé");
  });
});

describe("POST /api/products (règles d'accès)", () => {
  const newProduct = {
    name: "Tee",
    description: "Un t-shirt",
    price_in_cents: 2500,
    img_url: "http://img/tee.png",
    sub_categories_id: 2,
  };

  it("refuse une requête sans jeton (TB-05)", async () => {
    const res = await request(app).post("/api/products").send({ name: "Test" });

    expect(res.status).toBe(401);
  });

  it("refuse un client non administrateur (TB-06)", async () => {
    const auth = loginAs("user");

    const res = await request(app)
      .post("/api/products")
      .set("Authorization", auth)
      .send({ name: "Test" });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Accès interdit");
  });

  it("permet à un administrateur de créer un produit (201)", async () => {
    const auth = loginAs("admin");
    pool.query.mockResolvedValueOnce({ rows: [{ id: 5, name: "Tee" }] });

    const res = await request(app)
      .post("/api/products")
      .set("Authorization", auth)
      .send(newProduct);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: 5, variants: [] });
  });
});

describe("PATCH et DELETE /api/products/:id", () => {
  it("refuse la modification à un non-admin", async () => {
    const auth = loginAs("user");

    const res = await request(app)
      .patch("/api/products/1")
      .set("Authorization", auth)
      .send({ is_featured: true });

    expect(res.status).toBe(403);
  });

  it("met un produit à la une (admin)", async () => {
    const auth = loginAs("admin");
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1, is_featured: true }] });

    const res = await request(app)
      .patch("/api/products/1")
      .set("Authorization", auth)
      .send({ is_featured: true });

    expect(res.status).toBe(200);
    expect(res.body.is_featured).toBe(true);
  });

  it("supprime un produit (admin)", async () => {
    const auth = loginAs("admin");
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).delete("/api/products/1").set("Authorization", auth);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Produit supprimé");
  });
});
