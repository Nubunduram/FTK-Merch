// Remplace config/db.js pendant les tests.
module.exports = {
  query: jest.fn(),
  connect: jest.fn(),
};
