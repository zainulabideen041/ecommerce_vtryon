const TryonModel = require("../../models/TryOnExampleModel");

const addModelImage = async (req, res) => {
  try {
    const { image } = req.body;

    const modelImages = new TryonModel({
      image,
    });

    await modelImages.save();

    res.status(201).json({
      success: true,
      data: modelImages,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getModelImages = async (req, res) => {
  try {
    const images = await TryonModel.find({});

    res.status(200).json({
      success: true,
      data: images,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

module.exports = { addModelImage, getModelImages };
