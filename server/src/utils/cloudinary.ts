import { v2 as cloudinary } from "cloudinary";
import { config } from "../config/app.config";

cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
});

interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  [key: string]: any;
}

async function uploadImageToCloudinary(
  imageBuffer: Buffer,
  fileName: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: "image",
          folder: "lost-found-posts",
          public_id: `${Date.now()}-${fileName}`,
          transformation: [
            { width: 1200, height: 1200, crop: "limit" },
            { quality: "auto:good" },
            { fetch_format: "auto" },
          ],
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve((result as CloudinaryUploadResult).secure_url);
          }
        }
      )
      .end(imageBuffer);
  });
}

async function uploadBase64ToCloudinary(
  base64String: string,
  fileName: string
): Promise<string> {
  try {
    const result = await cloudinary.uploader.upload(base64String, {
      resource_type: "image",
      folder: "lost-found-posts",
      public_id: `${Date.now()}-${fileName}`,
      transformation: [
        { width: 1200, height: 1200, crop: "limit" },
        { quality: "auto:good" },
        { fetch_format: "auto" },
      ],
    });
    return result.secure_url;
  } catch (error) {
    throw error;
  }
}

export { uploadImageToCloudinary, uploadBase64ToCloudinary };
