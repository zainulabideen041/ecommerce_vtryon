const cloudinary = require("cloudinary").v2;
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME || "dnoi1telk",
  api_key: process.env.API_KEY || "546623679463593",
  api_secret: process.env.API_SECRET || "HgFi6uxDPoqQKdkEaozTvmgVsTQ",
});

const storage = new multer.memoryStorage();

async function UploadImage(file) {
  const result = await cloudinary.uploader.upload(file, {
    resource_type: "auto",
  });
  return result;
}

// Function to delete image from Cloudinary
async function deleteImageFromCloudinary(imageUrl) {
  try {
    // Extract public_id from Cloudinary URL
    // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}.{format}
    const urlParts = imageUrl.split("/");
    const uploadIndex = urlParts.indexOf("upload");

    if (uploadIndex === -1) {
      throw new Error("Invalid Cloudinary URL");
    }

    // Get the part after 'upload/v{version}/'
    const publicIdWithExtension = urlParts.slice(uploadIndex + 2).join("/");

    // Remove file extension
    const publicId =
      publicIdWithExtension.substring(
        0,
        publicIdWithExtension.lastIndexOf(".")
      ) || publicIdWithExtension;

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw error;
  }
}

const upload = multer({ storage });

module.exports = { upload, UploadImage, deleteImageFromCloudinary };
