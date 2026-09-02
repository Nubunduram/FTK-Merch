const express = require("express");
const router = express.Router();
const { createVariant, updateVariant, deleteVariant } = require("../controllers/product_variants.controller");
const authMiddleware = require("../middleware/auth.middleware");
const isAdmin = require("../middleware/admin.middleware");

router.post("/", authMiddleware, isAdmin, createVariant);
router.patch("/:id", authMiddleware, isAdmin, updateVariant);
router.delete("/:id", authMiddleware, isAdmin, deleteVariant);

module.exports = router;