const request = require("supertest");
const bcrypt = require("bcrypt");
const app = require("../src/app");
const pool = require("../config/db");
const { loginAs, signToken } = require("./helpers");

describe("POST /api/auth/signup", () => {
  const body = {
    first_name: "Jean",
    last_name: "Dupont",
    email: "jean@test.fr",
    password: "secret123",
  };

  it("crée le compte, renvoie un token et ne stocke pas le mot de passe en clair", async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [] }) // aucun compte avec cet email
      .mockResolvedValueOnce({
        rows: [{ id: 7, email: body.email, role: "user", first_name: "Jean", last_name: "Dupont" }],
      });

    const res = await request(app).post("/api/auth/signup").send(body);

    expect(res.status).toBe(201);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user).toMatchObject({ id: 7, role: "user" });

    const insertParams = pool.query.mock.calls[1][1];
    expect(insertParams[3]).not.toBe(body.password);
    expect(await bcrypt.compare(body.password, insertParams[3])).toBe(true);
  });

  it("refuse un email déjà utilisé (400)", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

    const res = await request(app).post("/api/auth/signup").send(body);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Email déjà utilisé");
  });

  it("renvoie 500 si la base est indisponible", async () => {
    pool.query.mockRejectedValueOnce(new Error("db down"));

    const res = await request(app).post("/api/auth/signup").send(body);

    expect(res.status).toBe(500);
  });
});

describe("POST /api/auth/login", () => {
  const hash = bcrypt.hashSync("secret123", 4);
  const userRow = { id: 3, email: "jean@test.fr", role: "user", password: hash };

  it("connecte l'utilisateur et ne renvoie jamais le hash du mot de passe", async () => {
    pool.query.mockResolvedValueOnce({ rows: [userRow] });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "jean@test.fr", password: "secret123" });

    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user).toEqual({ id: 3, email: "jean@test.fr", role: "user" });
    expect(res.body.user.password).toBeUndefined();
  });

  it("refuse un email inconnu (401)", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "inconnu@test.fr", password: "x" });

    expect(res.status).toBe(401);
  });

  it("refuse un mauvais mot de passe (401) avec le même message qu'un email inconnu", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const unknown = await request(app)
      .post("/api/auth/login")
      .send({ email: "inconnu@test.fr", password: "x" });

    pool.query.mockResolvedValueOnce({ rows: [userRow] });
    const wrong = await request(app)
      .post("/api/auth/login")
      .send({ email: "jean@test.fr", password: "mauvais" });

    expect(wrong.status).toBe(401);
    // un attaquant ne doit pas pouvoir deviner quels emails ont un compte
    expect(wrong.body.message).toBe(unknown.body.message);
  });

  it("renvoie 500 si la base est indisponible", async () => {
    pool.query.mockRejectedValueOnce(new Error("db down"));

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "jean@test.fr", password: "secret123" });

    expect(res.status).toBe(500);
  });
});

describe("GET /api/auth/me (middleware d'authentification)", () => {
  it("refuse une requête sans token (401)", async () => {
    const res = await request(app).get("/api/auth/me");

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Token manquant");
  });

  it("refuse un token invalide (401)", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer pas-un-jwt");

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Token invalide");
  });

  it("refuse un token valide dont l'utilisateur n'existe plus (401)", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${signToken(42)}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Utilisateur invalide");
  });

  it("renvoie l'utilisateur connecté (200)", async () => {
    const auth = loginAs("user", 5);

    const res = await request(app).get("/api/auth/me").set("Authorization", auth);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: 5, role: "user" });
  });
});
