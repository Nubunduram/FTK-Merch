const express = require("express");
const router = express.Router();

const { updateMe, changePassword, deleteMe, exportMe } = require("../controllers/users.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.patch("/me", authMiddleware, updateMe);
router.patch("/change_password", authMiddleware, changePassword);
router.delete("/me", authMiddleware, deleteMe);
router.get("/me/export", authMiddleware, exportMe);

module.exports = router;