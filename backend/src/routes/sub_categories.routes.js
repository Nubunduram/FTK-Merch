const express = require("express");
const router = express.Router();
const { getSubCategories, createSubCategory, updateSubCategory, deleteSubCategory } = require("../controllers/sub_categories.controller");
const authMiddleware = require("../middleware/auth.middleware");
const isAdmin = require("../middleware/admin.middleware");

router.get("/", getSubCategories);
router.post("/", authMiddleware, isAdmin, createSubCategory);
router.patch("/:id", authMiddleware, isAdmin, updateSubCategory);
router.delete("/:id", authMiddleware, isAdmin, deleteSubCategory);

module.exports = router;
