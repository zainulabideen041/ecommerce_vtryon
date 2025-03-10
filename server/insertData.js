const mongoose = require("mongoose");
const Product = require("./models/Product");

const MONGO_URI =
  "mongodb+srv://rdxrdx-1:rdx-mongo-121@cluster1.puoezbh.mongodb.net/ecom_tryon?retryWrites=true&w=majority&appName=Cluster1";

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("Connection error", err));

const updatedProducts = [
  {
    image: "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg",
    title: "Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops",
    description: "Your perfect pack for everyday use and walks in the forest.",
    category: "men",
    brand: "Fjallraven",
    price: 30786,
    salePrice: 29666,
    totalStock: 120,
    averageReview: 3.9,
  },
  {
    image:
      "https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg",
    title: "Mens Casual Premium Slim Fit T-Shirts",
    description: "Slim-fitting style, contrast raglan long sleeve.",
    category: "men",
    brand: "Premium",
    price: 6244,
    salePrice: 5684,
    totalStock: 259,
    averageReview: 4.1,
  },
  {
    image: "https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg",
    title: "Mens Cotton Jacket",
    description: "Great outerwear jackets for multiple seasons.",
    category: "men",
    brand: "Cotton",
    price: 15677,
    salePrice: 14837,
    totalStock: 500,
    averageReview: 4.7,
  },
  {
    image: "https://fakestoreapi.com/img/71YXzeOuslL._AC_UY879_.jpg",
    title: "Mens Casual Slim Fit",
    description: "The color could be slightly different in practice.",
    category: "men",
    brand: "Casual",
    price: 4477,
    salePrice: 4197,
    totalStock: 430,
    averageReview: 2.1,
  },
  {
    image: "https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_QL65_ML3_.jpg",
    title: "John Hardy Women's Legends Naga Gold & Silver Bracelet",
    description: "Inspired by the mythical water dragon.",
    category: "jewelry",
    brand: "John Hardy",
    price: 194600,
    salePrice: 189000,
    totalStock: 400,
    averageReview: 4.6,
  },
  {
    image: "https://fakestoreapi.com/img/61sbMiUnoGL._AC_UL640_QL65_ML3_.jpg",
    title: "Solid Gold Petite Micropave",
    description: "Satisfaction Guaranteed. Return within 30 days.",
    category: "jewelry",
    brand: "Hafeez Center",
    price: 47040,
    salePrice: 44800,
    totalStock: 70,
    averageReview: 3.9,
  },
  {
    image: "https://fakestoreapi.com/img/71HblAHs5xL._AC_UY879_-2.jpg",
    title: "Rain Jacket Women Windbreaker Striped Climbing Raincoats",
    description: "Lightweight, perfect for trips or casual wear.",
    category: "women",
    brand: "Windbreaker",
    price: 11197,
    salePrice: 10637,
    totalStock: 679,
    averageReview: 3.8,
  },
  {
    image: "https://fakestoreapi.com/img/81QpkIctqPL._AC_SX679_.jpg",
    title: "Acer SB220Q bi 21.5 inches Full HD IPS Ultra-Thin",
    description: "21.5 inches Full HD widescreen IPS display.",
    category: "electronics",
    brand: "Acer",
    price: 167720,
    salePrice: 162400,
    totalStock: 250,
    averageReview: 2.9,
  },
  {
    image: "https://fakestoreapi.com/img/61U7T1koQqL._AC_SX679_.jpg",
    title: "SanDisk SSD PLUS 1TB Internal SSD - SATA III 6 Gb/s",
    description: "Faster boot up and application load.",
    category: "electronics",
    brand: "SanDisk",
    price: 30520,
    salePrice: 29400,
    totalStock: 470,
    averageReview: 2.9,
  },
  {
    image: "https://fakestoreapi.com/img/71kWymZ+c+L._AC_SX679_.jpg",
    title: "Silicon Power 256GB SSD 3D NAND A55",
    description: "3D NAND flash delivers high transfer speeds.",
    category: "electronics",
    brand: "Silicon Power",
    price: 30520,
    salePrice: 28000,
    totalStock: 319,
    averageReview: 4.8,
  },
];

const updateProducts = async () => {
  try {
    for (let product of updatedProducts) {
      await Product.findOneAndUpdate(
        { title: product.title }, // Find by title
        {
          $set: {
            price: product.price,
            salePrice: product.salePrice,
          },
        },
        { new: true, upsert: false } // Update if found, do not insert new
      );
    }
    console.log("Products updated successfully");
    mongoose.connection.close();
  } catch (error) {
    console.error("Error updating products:", error);
  }
};

updateProducts();
