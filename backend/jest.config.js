module.exports = {
  testEnvironment: "node",
  silent: true, // masque les console.error/log des contrôleurs pendant les tests
  resetMocks: true, // chaque test repart de mocks vierges
  setupFiles: ["<rootDir>/tests/setup.js"],
  // Remplace config/db.js par un faux pool : aucune connexion PostgreSQL réelle
  moduleNameMapper: {
    "^.*/config/db$": "<rootDir>/tests/mocks/db.js",
  },
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/config/**",
    "!src/server.js",
  ],
  // Le build échoue si la couverture passe sous 50 %
  coverageThreshold: {
    global: { statements: 50, branches: 50, functions: 50, lines: 50 },
  },
};
