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

const upload = multer({ storage });

module.exports = { upload, UploadImage };
