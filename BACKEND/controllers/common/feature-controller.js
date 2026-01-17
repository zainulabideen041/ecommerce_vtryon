const Feature = require("../../models/Feature");
const { deleteImageFromCloudinary } = require("../../helpers/cloudinary");

const addFeatureImage = async (req, res) => {
  try {
    const { image } = req.body;

    const featureImages = new Feature({
      image,
    });

    await featureImages.save();

    res.status(201).json({
      success: true,
      data: featureImages,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getFeatureImages = async (req, res) => {
  try {
    const images = await Feature.find({});

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

const deleteFeatureImage = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the feature image
    const featureImage = await Feature.findById(id);

    if (!featureImage) {
      return res.status(404).json({
        success: false,
        message: "Feature image not found!",
      });
    }

    // Delete from Cloudinary
    try {
      await deleteImageFromCloudinary(featureImage.image);
    } catch (cloudinaryError) {
      console.error("Cloudinary deletion error:", cloudinaryError);
      // Continue with DB deletion even if Cloudinary fails
    }

    // Delete from database
    await Feature.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Feature image deleted successfully!",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error deleting feature image!",
    });
  }
};

module.exports = { addFeatureImage, getFeatureImages, deleteFeatureImage };
