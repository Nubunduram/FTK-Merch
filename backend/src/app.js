// backend/app.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const categoriesRoutes = require("./routes/categories.routes");
const subCategoriesRoutes = require("./routes/sub_categories.routes");
const productsRoutes = require("./routes/products.routes");
const productVariantsRoutes = require("./routes/product_variants.routes");
const authRoutes = require("./routes/auth.routes");
const usersRoutes = require("./routes/users.routes");
const addressesRoutes = require("./routes/addresses.routes")
const ordersRoutes = require("./routes/orders.routes");
const adminRoutes = require("./routes/admin.routes");
const reviewsRoutes = require("./routes/reviews.routes");
const paymentsRoutes = require("./routes/payments.routes");

const app = express();

// Le webhook Stripe doit recevoir le body brut → enregistré AVANT express.json()
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json({ limit: "10kb" }));

// Routes
app.use("/api/categories", categoriesRoutes);
app.use("/api/sub_categories", subCategoriesRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/product_variants", productVariantsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/addresses", addressesRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentsRoutes);

app.use("/api/auth", authRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: "Erreur interne du serveur" });
});

module.exports = app;
