const TryonCloth = require("../../models/TryOnExampleCloth");

const addClothImage = async (req, res) => {
  try {
    const { image } = req.body;

    const clothImages = new TryonCloth({
      image,
    });

    await clothImages.save();

    res.status(201).json({
      success: true,
      data: clothImages,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getClothImages = async (req, res) => {
  try {
    const images = await TryonCloth.find({});

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

module.exports = { addClothImage, getClothImages };
