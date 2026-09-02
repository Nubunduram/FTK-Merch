const express = require("express");
const router = express.Router();
const { createCheckoutSession, handleWebhook } = require("../controllers/payments.controller");
const authMiddleware = require("../middleware/auth.middleware");

// Le body brut est déjà géré dans app.js avant express.json()
router.post("/webhook", handleWebhook);

// Création de la session de paiement (requiert authentification)
router.post("/create-checkout-session", authMiddleware, createCheckoutSession);

module.exports = router;
