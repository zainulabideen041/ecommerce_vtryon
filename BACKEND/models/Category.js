const mongoose = require("mongoose");

// Canonical taxonomy, separate from merchandising collections. Defining this
// schema does not create or seed any category records.
const CategorySchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    fullPath: String,
    parentSlug: String,
    department: String,
    source: { provider: String, externalId: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Category", CategorySchema);
