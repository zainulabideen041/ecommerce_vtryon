const express = require("express");

const {
  addClothImage,
  getClothImages,
  deleteClothImage,
} = require("../../controllers/common/tryon-cloths-controller");

const {
  addModelImage,
  getModelImages,
  deleteModelImage,
} = require("../../controllers/common/tryon-model-controller");

const router = express.Router();

router.post("/addcloth", addClothImage);
router.get("/getcloth", getClothImages);
router.delete("/deletecloth/:id", deleteClothImage);

router.post("/addmodel", addModelImage);
router.get("/getmodel", getModelImages);
router.delete("/deletemodel/:id", deleteModelImage);

module.exports = router;
