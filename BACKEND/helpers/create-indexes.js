const mongoose = require("mongoose");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const User = require("../models/User");

/**
 * Create database indexes for optimal query performance
 * Run this once during deployment or database setup
 */
async function createIndexes() {
  try {
    console.log("Creating database indexes...");

    // Product indexes
    await Product.collection.createIndex({ category: 1 });
    await Product.collection.createIndex({ brand: 1 });
    await Product.collection.createIndex({
      title: "text",
      description: "text",
    });
    await Product.collection.createIndex({ price: 1 });
    await Product.collection.createIndex({ salePrice: 1 });
    console.log("✓ Product indexes created");

    // Order indexes
    await Order.collection.createIndex({ userId: 1 });
    await Order.collection.createIndex({ orderStatus: 1 });
    await Order.collection.createIndex({ orderDate: -1 }); // Descending for recent first
    await Order.collection.createIndex({ userId: 1, orderDate: -1 }); // Compound index
    console.log("✓ Order indexes created");

    // Cart indexes
    await Cart.collection.createIndex({ userId: 1 }, { unique: true });
    console.log("✓ Cart indexes created");

    // User indexes (email already indexed via unique constraint)
    await User.collection.createIndex({ role: 1 });
    console.log("✓ User indexes created");

    console.log("All indexes created successfully!");
  } catch (error) {
    console.error("Error creating indexes:", error);
    throw error;
  }
}

module.exports = { createIndexes };
