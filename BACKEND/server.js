const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const authRouter = require("./routes/auth/auth-routes");
const adminProductsRouter = require("./routes/admin/products-routes");
const adminOrderRouter = require("./routes/admin/order-routes");

const shopProductsRouter = require("./routes/shop/products-routes");
const shopCartRouter = require("./routes/shop/cart-routes");
const shopAddressRouter = require("./routes/shop/address-routes");
const shopOrderRouter = require("./routes/shop/order-routes");
const shopSearchRouter = require("./routes/shop/search-routes");
const shopReviewRouter = require("./routes/shop/review-routes");

const tryonRouter = require("./routes/common/tryon-routes");

const dotenv = require("dotenv");
dotenv.config();

mongoose
  .connect(process.env.MONGODB_URI, {
    // Connection pooling for better performance
    maxPoolSize: 10,
    minPoolSize: 2,
    socketTimeoutMS: 45000,
    serverSelectionTimeoutMS: 5000,
    // Optimize for performance
    autoIndex: false, // Don't build indexes in production
  })
  .then(async () => {
    console.log("MongoDB connected with optimized pool");

    // Create indexes on first run (optional - comment out after first run)
    if (process.env.CREATE_INDEXES === "true") {
      const { createIndexes } = require("./helpers/create-indexes");
      await createIndexes();
    }
  })
  .catch((error) => console.log(error));

const app = express();
const PORT = process.env.PORT;

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

// Compression middleware for faster responses
app.use(
  compression({
    level: 6, // Balanced compression level
    threshold: 1024, // Only compress responses > 1KB
  }),
);

// Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests, please try again later.",
});
app.use("/api/", limiter);

app.use(
  cors({
    origin: ["https://luxar-vtryon.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Expires",
      "Pragma",
    ],
    credentials: true,
  }),
);

app.use(cookieParser());
// Optimized JSON parsing with limits
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/api/auth", authRouter);
app.use("/api/admin/products", adminProductsRouter);
app.use("/api/admin/orders", adminOrderRouter);

app.use("/api/shop/products", shopProductsRouter);
app.use("/api/shop/cart", shopCartRouter);
app.use("/api/shop/address", shopAddressRouter);
app.use("/api/shop/order", shopOrderRouter);
app.use("/api/shop/search", shopSearchRouter);
app.use("/api/shop/review", shopReviewRouter);

app.use("/api/common/tryon", tryonRouter);

app.get("/", (req, res) => {
  res.json("hello");
});

app.listen(PORT, () => console.log(`Server is now running on port ${PORT}`));
