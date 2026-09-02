const express = require("express");
const router = express.Router();
const controller = require("../controllers/orders.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.get("/", authMiddleware, controller.getUserOrders);
router.get("/:id", authMiddleware, controller.getOrderById);
router.post("/", authMiddleware, controller.createOrder);

module.exports = router;