const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h" });

/**
 * Prépare une requête authentifiée.
 * Le middleware d'auth fait un SELECT sur users : on met donc en file la réponse
 * correspondante (1re requête SQL de la route), puis on renvoie l'en-tête Authorization.
 * À appeler AVANT de mettre en file les réponses SQL du contrôleur.
 */
function loginAs(role = "user", id = 1) {
  pool.query.mockResolvedValueOnce({
    rows: [{ id, email: `user${id}@test.fr`, role, first_name: "Test", last_name: "User" }],
  });
  return `Bearer ${signToken(id)}`;
}

/** Faux client de transaction renvoyé par pool.connect() */
function mockClient() {
  const client = { query: jest.fn(), release: jest.fn() };
  pool.connect.mockResolvedValue(client);
  return client;
}

/** Retrouve les appels SQL dont le texte correspond à une regex */
const callsMatching = (fn, regex) =>
  fn.mock.calls.filter(([sql]) => typeof sql === "string" && regex.test(sql));

module.exports = { signToken, loginAs, mockClient, callsMatching };
