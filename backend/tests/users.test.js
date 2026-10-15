const request = require("supertest");
const bcrypt = require("bcrypt");
const app = require("../src/app");
const pool = require("../config/db");
const { loginAs, mockClient, callsMatching } = require("./helpers");

describe("PATCH /api/users/me", () => {
  it("refuse une requête sans donnée à mettre à jour (400)", async () => {
    const auth = loginAs("user", 4);

    const res = await request(app).patch("/api/users/me").set("Authorization", auth).send({});

    expect(res.status).toBe(400);
  });

  it("ne permet pas de modifier le rôle et ignore les valeurs vides", async () => {
    const auth = loginAs("user", 4);
    pool.query.mockResolvedValueOnce({ rows: [{ id: 4, first_name: "Zed", role: "user" }] });

    const res = await request(app)
      .patch("/api/users/me")
      .set("Authorization", auth)
      .send({ role: "admin", first_name: "Zed", last_name: "", email: null });

    expect(res.status).toBe(200);
    const [sql, params] = pool.query.mock.calls[1];
    expect(sql).not.toMatch(/role\s*=/);
    expect(sql).toContain("first_name = $1");
    expect(params).toEqual(["Zed", 4]);
  });

  it("renvoie 500 si la base est indisponible", async () => {
    const auth = loginAs("user", 4);
    pool.query.mockRejectedValueOnce(new Error("db down"));

    const res = await request(app)
      .patch("/api/users/me")
      .set("Authorization", auth)
      .send({ first_name: "Zed" });

    expect(res.status).toBe(500);
  });
});

describe("PATCH /api/users/change_password", () => {
  const oldHash = bcrypt.hashSync("ancien", 4);

  it("refuse un ancien mot de passe incorrect (400)", async () => {
    const auth = loginAs("user", 4);
    pool.query.mockResolvedValueOnce({ rows: [{ password: oldHash }] });

    const res = await request(app)
      .patch("/api/users/change_password")
      .set("Authorization", auth)
      .send({ old_password: "faux", new_password: "nouveau" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Ancien mot de passe incorrect");
  });

  it("enregistre le nouveau mot de passe hashé (200)", async () => {
    const auth = loginAs("user", 4);
    pool.query.mockResolvedValueOnce({ rows: [{ password: oldHash }] });

    const res = await request(app)
      .patch("/api/users/change_password")
      .set("Authorization", auth)
      .send({ old_password: "ancien", new_password: "nouveau" });

    expect(res.status).toBe(200);
    const [, params] = pool.query.mock.calls[2];
    expect(params[0]).not.toBe("nouveau");
    expect(bcrypt.compareSync("nouveau", params[0])).toBe(true);
    expect(params[1]).toBe(4);
  });
});

describe("DELETE /api/users/me (droit à l'effacement)", () => {
  it("supprime avis, lignes de commande, commandes, adresses puis le compte", async () => {
    const auth = loginAs("user", 4);
    const client = mockClient();
    client.query.mockImplementation(async (sql) => {
      if (/SELECT id FROM orders/.test(sql)) return { rows: [{ id: 1 }, { id: 2 }] };
      return { rows: [] };
    });

    const res = await request(app).delete("/api/users/me").set("Authorization", auth);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Compte supprimé");
    expect(callsMatching(client.query, /DELETE FROM order_items/)).toHaveLength(2);
    expect(callsMatching(client.query, /DELETE FROM users/)[0][1]).toEqual([4]);
    expect(client.query).toHaveBeenCalledWith("COMMIT");
  });

  it("annule la transaction en cas d'erreur (500)", async () => {
    const auth = loginAs("user", 4);
    const client = mockClient();
    client.query.mockImplementation(async (sql) => {
      if (/DELETE FROM reviews/.test(sql)) throw new Error("boom");
      return { rows: [] };
    });

    const res = await request(app).delete("/api/users/me").set("Authorization", auth);

    expect(res.status).toBe(500);
    expect(client.query).toHaveBeenCalledWith("ROLLBACK");
    expect(client.release).toHaveBeenCalled();
  });
});

describe("GET /api/users/me/export (portabilité)", () => {
  it("exporte le profil, les adresses, les commandes (avec articles) et les avis", async () => {
    const auth = loginAs("user", 4);
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: 4, email: "jean@test.fr", first_name: "Jean" }] }) // users
      .mockResolvedValueOnce({ rows: [{ label: "Maison" }] }) // addresses
      .mockResolvedValueOnce({ rows: [{ id: 1, status: "paid" }] }) // orders
      .mockResolvedValueOnce({ rows: [{ name: "Tee", quantity: 2 }] }) // items de la commande 1
      .mockResolvedValueOnce({ rows: [{ product: "Tee", comment: "Top" }] }); // reviews

    const res = await request(app).get("/api/users/me/export").set("Authorization", auth);

    expect(res.status).toBe(200);
    expect(res.body.exported_at).toEqual(expect.any(String));
    expect(res.body.profile.email).toBe("jean@test.fr");
    expect(res.body.profile.password).toBeUndefined();
    expect(res.body.addresses).toHaveLength(1);
    expect(res.body.orders[0].items).toHaveLength(1);
    expect(res.body.reviews).toHaveLength(1);
  });
});
