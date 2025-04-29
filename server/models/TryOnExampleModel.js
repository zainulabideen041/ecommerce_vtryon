const mongoose = require("mongoose");

const TryOnModel = new mongoose.Schema({
  image: String,
});

module.exports = mongoose.model("TryonModelImgs", TryOnModel);
