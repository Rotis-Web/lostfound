import { Response, Request } from "express";
import Post from "../models/Post";
import { uploadImageToCloudinary } from "../utils/cloudinary";

export async function createPost(req: Request, res: Response): Promise<void> {
  try {
    const validatedData = req.body;

    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({
        code: "MISSING_IMAGES",
        message: "Cel puțin o imagine este obligatorie",
        errors: [
          {
            field: "images",
            message: "Cel puțin o imagine este obligatorie",
          },
        ],
      });
      return;
    }

    let uploadedImageUrls: string[] = [];

    try {
      const uploadPromises = req.files.map(
        async (file: Express.Multer.File, index: number) => {
          return uploadImageToCloudinary(
            file.buffer,
            file.originalname || `image-${index}`
          );
        }
      );

      uploadedImageUrls = await Promise.all(uploadPromises);
    } catch (uploadError) {
      console.error("Cloudinary upload error:", uploadError);
      res.status(500).json({
        code: "IMAGE_UPLOAD_ERROR",
        message: "Eroare la încărcarea imaginilor",
        errors: [
          {
            field: "images",
            message: "Nu s-au putut încărca imaginile",
          },
        ],
      });
      return;
    }

    const post = new Post({
      ...validatedData,
      images: uploadedImageUrls,
    });

    const savedPost = await post.save();

    res.status(201).json({
      code: "POST_CREATED",
      message: "Postarea a fost creată cu succes",
      post: savedPost,
      uploadedImages: uploadedImageUrls.length,
    });
  } catch (error: any) {
    console.error("Error creating post:", error);

    if (error.name === "ValidationError") {
      console.error("Validation error details:", error);

      const errors = Object.entries(error.errors || {}).map(
        ([field, err]: [string, any]) => ({
          field,
          message: err?.message || "Unknown validation error",
        })
      );

      res.status(400).json({
        code: "VALIDATION_ERROR",
        message: "Datele introduse nu sunt valide",
        errors: errors,
      });
      return;
    }

    if (error.code === 11000) {
      res.status(409).json({
        code: "DUPLICATE_ERROR",
        message: "Postarea există deja",
        errors: [
          {
            field: "lostfoundID",
            message: "ID-ul postării există deja",
          },
        ],
      });
      return;
    }

    res.status(500).json({
      code: "INTERNAL_SERVER_ERROR",
      message: "Eroare internă de server",
    });
  }
}
