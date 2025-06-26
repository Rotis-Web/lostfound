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

async function deleteImageFromCloudinary(imageUrl: string): Promise<void> {
  try {
    const publicId = extractPublicIdFromUrl(imageUrl);

    if (!publicId) {
      throw new Error(`Could not extract public_id from URL: ${imageUrl}`);
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });

    if (result.result !== "ok" && result.result !== "not found") {
      throw new Error(`Failed to delete image: ${result.result}`);
    }

    console.log(`Successfully deleted image with public_id: ${publicId}`);
  } catch (error) {
    console.error(`Error deleting image from Cloudinary:`, error);
    throw error;
  }
}

function extractPublicIdFromUrl(url: string): string | null {
  try {
    const urlParts = url.split("/");

    const uploadIndex = urlParts.findIndex((part) => part === "upload");

    if (uploadIndex === -1) {
      return null;
    }

    let pathAfterUpload = urlParts.slice(uploadIndex + 1);

    if (pathAfterUpload[0] && pathAfterUpload[0].match(/^v\d+$/)) {
      pathAfterUpload = pathAfterUpload.slice(1);
    }

    const publicIdWithExtension = pathAfterUpload.join("/");
    const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, "");

    return publicId;
  } catch (error) {
    console.error("Error extracting public_id from URL:", error);
    return null;
  }
}

async function deleteMultipleImagesFromCloudinary(
  imageUrls: string[]
): Promise<void> {
  const deletePromises = imageUrls.map((url) => deleteImageFromCloudinary(url));
  await Promise.allSettled(deletePromises);
}

export {
  uploadImageToCloudinary,
  uploadBase64ToCloudinary,
  deleteImageFromCloudinary,
  deleteMultipleImagesFromCloudinary,
};
