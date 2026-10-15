const request = require("supertest");
const app = require("../src/app");
const pool = require("../config/db");
const { loginAs } = require("./helpers");

const fkError = () => Object.assign(new Error("fk violation"), { code: "23503" });

describe("/api/categories", () => {
  it("liste les catégories sans authentification", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1, name: "Vêtements", slug: "vetements" }] });

    const res = await request(app).get("/api/categories");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it("refuse la création à un non-admin (403)", async () => {
    const auth = loginAs("user");

    const res = await request(app)
      .post("/api/categories")
      .set("Authorization", auth)
      .send({ name: "X", slug: "x" });

    expect(res.status).toBe(403);
  });

  it("exige name et slug (400)", async () => {
    const auth = loginAs("admin");

    const res = await request(app)
      .post("/api/categories")
      .set("Authorization", auth)
      .send({ name: "X" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("name et slug requis");
  });

  it("crée une catégorie avec la position suivante (201)", async () => {
    const auth = loginAs("admin");
    pool.query
      .mockResolvedValueOnce({ rows: [{ pos: 3 }] })
      .mockResolvedValueOnce({ rows: [{ id: 9, name: "X", slug: "x", position: 3 }] });

    const res = await request(app)
      .post("/api/categories")
      .set("Authorization", auth)
      .send({ name: "X", slug: "x" });

    expect(res.status).toBe(201);
    expect(pool.query.mock.calls[2][1]).toEqual(["X", "x", 3]);
  });

  it("renvoie 404 en modifiant une catégorie inexistante", async () => {
    const auth = loginAs("admin");
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .patch("/api/categories/99")
      .set("Authorization", auth)
      .send({ name: "Y" });

    expect(res.status).toBe(404);
  });

  it("modifie une catégorie (200)", async () => {
    const auth = loginAs("admin");
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1, name: "Y" }] });

    const res = await request(app)
      .patch("/api/categories/1")
      .set("Authorization", auth)
      .send({ name: "Y" });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Y");
  });

  it("supprime une catégorie vide (204)", async () => {
    const auth = loginAs("admin");
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).delete("/api/categories/1").set("Authorization", auth);

    expect(res.status).toBe(204);
  });

  it("refuse de supprimer une catégorie qui contient des sous-catégories (409)", async () => {
    const auth = loginAs("admin");
    pool.query.mockRejectedValueOnce(fkError());

    const res = await request(app).delete("/api/categories/1").set("Authorization", auth);

    expect(res.status).toBe(409);
  });
});

describe("/api/sub_categories", () => {
  it("liste les sous-catégories sans authentification", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1, name: "T-shirts", category_slug: "vetements" }] });

    const res = await request(app).get("/api/sub_categories");

    expect(res.status).toBe(200);
    expect(res.body[0].category_slug).toBe("vetements");
  });

  it("exige name et categories_id (400)", async () => {
    const auth = loginAs("admin");

    const res = await request(app)
      .post("/api/sub_categories")
      .set("Authorization", auth)
      .send({ name: "T-shirts" });

    expect(res.status).toBe(400);
  });

  it("crée une sous-catégorie (201)", async () => {
    const auth = loginAs("admin");
    pool.query.mockResolvedValueOnce({ rows: [{ id: 2, name: "T-shirts", categories_id: 1 }] });

    const res = await request(app)
      .post("/api/sub_categories")
      .set("Authorization", auth)
      .send({ name: "T-shirts", categories_id: 1 });

    expect(res.status).toBe(201);
  });

  it("renvoie 404 en modifiant une sous-catégorie inexistante", async () => {
    const auth = loginAs("admin");
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .patch("/api/sub_categories/99")
      .set("Authorization", auth)
      .send({ name: "Z", categories_id: 1 });

    expect(res.status).toBe(404);
  });

  it("refuse de supprimer une sous-catégorie qui contient des produits (409)", async () => {
    const auth = loginAs("admin");
    pool.query.mockRejectedValueOnce(fkError());

    const res = await request(app).delete("/api/sub_categories/1").set("Authorization", auth);

    expect(res.status).toBe(409);
  });
});
