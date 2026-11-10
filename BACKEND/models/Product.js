const mongoose = require("mongoose");

const ImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    alt: String,
    width: { type: Number, min: 1 },
    height: { type: Number, min: 1 },
  },
  { _id: false },
);

const VariantSchema = new mongoose.Schema(
  {
    id: String,
    sku: String,
    title: String,
    price: { type: Number, min: 0 },
    compareAtPrice: { type: Number, min: 0, default: null },
    available: Boolean,
    options: { type: Map, of: String },
    // Missing quantity stays unknown; in_stock must never become a fake count.
    stockQuantity: { type: Number, min: 0 },
    imageUrl: String,
  },
  { _id: false },
);

const ProductSchema = new mongoose.Schema(
  {
    // Legacy fields stay compatible with the existing store and its records.
    image: String,
    title: String,
    description: String,
    category: String,
    brand: String,
    price: Number,
    salePrice: Number,
    totalStock: Number,
    averageReview: Number,
    handle: String,
    productType: String,
    categoryLabel: String,
    brandLabel: String,
    taxonomy: {
      externalId: String,
      name: String,
      slug: String,
      fullPath: String,
    },
    categoryIds: { type: [String], default: undefined },
    collectionHandles: { type: [String], default: undefined },
    tags: { type: [String], default: undefined },
    images: { type: [ImageSchema], default: undefined },
    variants: { type: [VariantSchema], default: undefined },
    pricing: {
      min: { type: Number, min: 0 },
      max: { type: Number, min: 0 },
      currency: { type: String, uppercase: true, match: /^[A-Z]{3}$/ },
    },
    availability: { type: String, enum: ["available", "sold-out", "unknown"] },
    attributes: { type: Map, of: String },
    reviewSummary: {
      rating: { type: Number, min: 0, max: 5 },
      count: { type: Number, min: 0 },
    },
    source: {
      provider: String,
      externalId: String,
      url: String,
      updatedAt: Date,
      importedAt: Date,
    },
  },
  { timestamps: true },
);

ProductSchema.index({ category: 1 });
ProductSchema.index({ brand: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ title: "text" });
ProductSchema.index({ "taxonomy.slug": 1 });
ProductSchema.index({ handle: 1 }, { sparse: true });
ProductSchema.index(
  { "source.provider": 1, "source.externalId": 1 },
  { sparse: true },
);

module.exports = mongoose.model("Product", ProductSchema);
