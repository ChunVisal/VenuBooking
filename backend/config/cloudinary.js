import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import pkg from "multer-storage-cloudinary";
import dotenv from "dotenv";

dotenv.config();

// FAIL-SAFE: Look for the constructor in all possible hiding spots
const CloudinaryStorage =
  pkg.CloudinaryStorage || pkg.default?.CloudinaryStorage || pkg;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "VenuBooking_Events",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
  public_id: (req, file) => `event-${Date.now()}`,
});

if (storage.cloudinary && !storage.cloudinary.v2) {
  storage.cloudinary.v2 = cloudinary;
}

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export { cloudinary, upload };
