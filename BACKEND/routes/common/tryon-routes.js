const express = require("express");

const {
  addClothImage,
  getClothImages,
} = require("../../controllers/common/tryon-cloths-controller");

const {
  addModelImage,
  getModelImages,
} = require("../../controllers/common/tryon-model-controller");

const router = express.Router();

router.post("/addcloth", addClothImage);
router.get("/getcloth", getClothImages);

router.post("/addmodel", addModelImage);
router.get("/getmodel", getModelImages);

module.exports = router;
