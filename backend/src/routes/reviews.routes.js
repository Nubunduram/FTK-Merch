const express = require("express");
const router = express.Router();
const { createReview, deleteReview } = require("../controllers/reviews.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.post("/:productId", authMiddleware, createReview);
router.delete("/:reviewId", authMiddleware, deleteReview);

module.exports = router;