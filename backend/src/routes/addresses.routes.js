const express = require("express");
const router = express.Router();
const controller = require("../controllers/addresses.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.get("/", authMiddleware, controller.getUserAddresses);
router.post("/", authMiddleware, controller.createAddress);
router.patch("/:id", authMiddleware, controller.updateAddress);
router.delete("/:id", authMiddleware, controller.deleteAddress);

module.exports = router;