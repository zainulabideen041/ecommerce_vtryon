const mongoose = require("mongoose");

const CollectionSchema = new mongoose.Schema(
  {
    handle: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: String,
    image: { url: String, alt: String },
    // Membership must be supplied explicitly; source counts are not membership.
    productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    source: {
      provider: String,
      externalId: String,
      url: String,
      productCount: Number,
      updatedAt: Date,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Collection", CollectionSchema);
