const express = require("express");
const router = express.Router();

const { getAllOrders, updateOrderStatus, getStats } = require("../controllers/admin.controller");


const authMiddleware = require("../middleware/auth.middleware");
const isAdmin = require("../middleware/admin.middleware");


// 🔐 Toutes les routes admin protégées
router.use(authMiddleware);
router.use(isAdmin);


// ✅ GET toutes les commandes
router.get("/orders", getAllOrders);

// GET stats
router.get("/stats", getStats);


// ✅ PATCH statut commande
router.patch("/orders/:id", updateOrderStatus);



module.exports = router;