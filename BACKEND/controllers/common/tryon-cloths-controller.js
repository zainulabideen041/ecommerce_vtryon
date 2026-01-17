const TryonCloth = require("../../models/TryOnExampleCloth");
const { deleteImageFromCloudinary } = require("../../helpers/cloudinary");

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

const deleteClothImage = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the cloth image
    const clothImage = await TryonCloth.findById(id);

    if (!clothImage) {
      return res.status(404).json({
        success: false,
        message: "Cloth image not found!",
      });
    }

    // Delete from Cloudinary
    try {
      await deleteImageFromCloudinary(clothImage.image);
    } catch (cloudinaryError) {
      console.error("Cloudinary deletion error:", cloudinaryError);
      // Continue with DB deletion even if Cloudinary fails
    }

    // Delete from database
    await TryonCloth.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Cloth image deleted successfully!",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error deleting cloth image!",
    });
  }
};

module.exports = { addClothImage, getClothImages, deleteClothImage };
