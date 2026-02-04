const TryonModel = require("../../models/TryOnExampleModel");
const { deleteImageFromCloudinary } = require("../../helpers/cloudinary");

// Utility function to ensure HTTPS for Cloudinary URLs
const ensureHttps = (url) => {
  if (!url) return url;
  // Convert HTTP Cloudinary URLs to HTTPS to prevent mixed content errors
  if (url.startsWith("http://res.cloudinary.com")) {
    return url.replace("http://", "https://");
  }
  return url;
};

const addModelImage = async (req, res) => {
  try {
    const { image } = req.body;

    const modelImages = new TryonModel({
      image: ensureHttps(image),
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

    // Ensure all image URLs use HTTPS
    const imagesWithHttps = images.map((img) => ({
      ...img.toObject(),
      image: ensureHttps(img.image),
    }));

    res.status(200).json({
      success: true,
      data: imagesWithHttps,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const deleteModelImage = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the model image
    const modelImage = await TryonModel.findById(id);

    if (!modelImage) {
      return res.status(404).json({
        success: false,
        message: "Model image not found!",
      });
    }

    // Delete from Cloudinary
    try {
      await deleteImageFromCloudinary(modelImage.image);
    } catch (cloudinaryError) {
      console.error("Cloudinary deletion error:", cloudinaryError);
      // Continue with DB deletion even if Cloudinary fails
    }

    // Delete from database
    await TryonModel.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Model image deleted successfully!",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error deleting model image!",
    });
  }
};

module.exports = { addModelImage, getModelImages, deleteModelImage };
