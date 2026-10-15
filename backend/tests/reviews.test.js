const request = require("supertest");
const app = require("../src/app");
const pool = require("../config/db");
const { loginAs } = require("./helpers");

describe("POST /api/reviews/:productId", () => {
  it("refuse sans token", async () => {
    const res = await request(app).post("/api/reviews/12").send({ comment: "Top" });
    expect(res.status).toBe(401);
  });

  it("refuse un second avis du même utilisateur sur le même produit (400)", async () => {
    const auth = loginAs("user", 4);
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

    const res = await request(app)
      .post("/api/reviews/12")
      .set("Authorization", auth)
      .send({ comment: "Encore" });

    expect(res.status).toBe(400);
  });

  it("publie un avis et renvoie le prénom de l'auteur (201)", async () => {
    const auth = loginAs("user", 4);
    pool.query
      .mockResolvedValueOnce({ rows: [] }) // pas d'avis existant
      .mockResolvedValueOnce({ rows: [{ id: 5, comment: "Top" }] }) // insertion
      .mockResolvedValueOnce({ rows: [{ first_name: "Jean" }] }); // prénom

    const res = await request(app)
      .post("/api/reviews/12")
      .set("Authorization", auth)
      .send({ comment: "Top" });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: 5, comment: "Top", first_name: "Jean" });
  });
});

describe("DELETE /api/reviews/:reviewId (auteur ou admin)", () => {
  it("renvoie 404 si l'avis n'existe pas", async () => {
    const auth = loginAs("user", 4);
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).delete("/api/reviews/5").set("Authorization", auth);

    expect(res.status).toBe(404);
  });

  it("refuse la suppression de l'avis d'un autre utilisateur (403)", async () => {
    const auth = loginAs("user", 4);
    pool.query.mockResolvedValueOnce({ rows: [{ id: 5, users_id: 99 }] });

    const res = await request(app).delete("/api/reviews/5").set("Authorization", auth);

    expect(res.status).toBe(403);
    expect(pool.query).toHaveBeenCalledTimes(2); // auth + lecture, aucun DELETE
  });

  it("autorise l'auteur à supprimer son avis", async () => {
    const auth = loginAs("user", 4);
    pool.query.mockResolvedValueOnce({ rows: [{ id: 5, users_id: 4 }] });

    const res = await request(app).delete("/api/reviews/5").set("Authorization", auth);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Commentaire supprimé");
  });

  it("autorise un administrateur à supprimer l'avis d'un autre", async () => {
    const auth = loginAs("admin", 1);
    pool.query.mockResolvedValueOnce({ rows: [{ id: 5, users_id: 99 }] });

    const res = await request(app).delete("/api/reviews/5").set("Authorization", auth);

    expect(res.status).toBe(200);
  });
});
