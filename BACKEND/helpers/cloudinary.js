const cloudinary = require("cloudinary").v2;
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME || "dnoi1telk",
  api_key: process.env.API_KEY || "546623679463593",
  api_secret: process.env.API_SECRET || "HgFi6uxDPoqQKdkEaozTvmgVsTQ",
  // Performance optimizations
  secure: true,
  timeout: 60000, // 60 seconds timeout
});

const storage = new multer.memoryStorage();

// Optimized upload function with performance enhancements
async function UploadImage(file, options = {}) {
  const uploadOptions = {
    resource_type: "auto",
    // Quality optimization - reduces file size while maintaining visual quality
    quality: options.quality || "auto:good",
    // Auto format - serves best format for browser (WebP for modern browsers)
    fetch_format: "auto",
    // Compression
    flags: "lossy",
    // Eager transformations for common sizes (optional)
    eager: options.eager || [
      { width: 500, height: 500, crop: "limit", quality: "auto:good" },
      { width: 1000, height: 1000, crop: "limit", quality: "auto:good" },
    ],
    eager_async: true, // Don't wait for eager transformations
    // Timeout
    timeout: 60000,
    ...options,
  };

  try {
    const result = await cloudinary.uploader.upload(file, uploadOptions);
    return result;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
}

// Parallel upload function for multiple images
async function UploadMultipleImages(files, options = {}) {
  try {
    const uploadPromises = files.map((file) => UploadImage(file, options));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error("Cloudinary multiple upload error:", error);
    throw error;
  }
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
        publicIdWithExtension.lastIndexOf("."),
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

module.exports = {
  upload,
  UploadImage,
  UploadMultipleImages,
  deleteImageFromCloudinary,
};
