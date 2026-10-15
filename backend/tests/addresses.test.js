const request = require("supertest");
const app = require("../src/app");
const pool = require("../config/db");
const { loginAs } = require("./helpers");

const addr = { label: "Maison", street: "12 rue des Fleurs", city: "Paris", postal_code: "75001" };

describe("/api/addresses", () => {
  it("refuse sans token", async () => {
    const res = await request(app).get("/api/addresses");
    expect(res.status).toBe(401);
  });

  it("liste uniquement les adresses de l'utilisateur connecté", async () => {
    const auth = loginAs("user", 4);
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1, ...addr }] });

    const res = await request(app).get("/api/addresses").set("Authorization", auth);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(pool.query.mock.calls[1][1]).toEqual([4]);
  });

  it("crée une adresse rattachée à l'utilisateur connecté (201)", async () => {
    const auth = loginAs("user", 4);
    pool.query.mockResolvedValueOnce({ rows: [{ id: 2, ...addr }] });

    const res = await request(app)
      .post("/api/addresses")
      .set("Authorization", auth)
      .send(addr);

    expect(res.status).toBe(201);
    expect(pool.query.mock.calls[1][1][0]).toBe(4);
  });

  it("ne modifie que les adresses de l'utilisateur connecté", async () => {
    const auth = loginAs("user", 4);
    pool.query.mockResolvedValueOnce({ rows: [{ id: 2, ...addr }] });

    const res = await request(app)
      .patch("/api/addresses/2")
      .set("Authorization", auth)
      .send(addr);

    expect(res.status).toBe(200);
    const [sql, params] = pool.query.mock.calls[1];
    expect(sql).toContain("users_id");
    expect(params.slice(-2)).toEqual([2, 4]); // id de l'adresse, puis id de l'utilisateur
  });

  it("ne supprime que les adresses de l'utilisateur connecté", async () => {
    const auth = loginAs("user", 4);
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).delete("/api/addresses/2").set("Authorization", auth);

    expect(res.status).toBe(200);
    expect(pool.query.mock.calls[1][1]).toEqual([2, 4]);
  });

  it("renvoie 500 si la base est indisponible", async () => {
    const auth = loginAs("user", 4);
    pool.query.mockRejectedValueOnce(new Error("db down"));

    const res = await request(app).get("/api/addresses").set("Authorization", auth);

    expect(res.status).toBe(500);
  });
});
