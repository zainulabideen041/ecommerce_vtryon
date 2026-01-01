const mongoose = require("mongoose");

const TryOnCloth = new mongoose.Schema({
  image: String,
});

module.exports = mongoose.model("TryonClothImgs", TryOnCloth);
