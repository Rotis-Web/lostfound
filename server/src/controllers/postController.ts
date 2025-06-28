import { Response, Request } from "express";
import mongoose from "mongoose";
import Post from "../models/Post";
import {
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
} from "../utils/cloudinary";

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
      postID: savedPost.lostfoundID,
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

export async function getUserPosts(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        code: "UNAUTHORIZED",
        message: "User not authenticated",
      });
      return;
    }

    const posts = await Post.find({
      author: new mongoose.Types.ObjectId(userId),
    })
      .select("-__v")
      .lean();

    res.status(200).json({
      code: "USER_POSTS",
      posts,
      count: posts.length,
    });
  } catch (error) {
    console.error("Error fetching user posts:", error);
    res.status(500).json({
      code: "INTERNAL_SERVER_ERROR",
      message: "Eroare internă de server",
    });
  }
}

export async function deletePost(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const { postId } = req.params;

    if (!userId) {
      res.status(401).json({
        code: "UNAUTHORIZED",
        message: "User not authenticated",
      });
      return;
    }

    if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
      res.status(400).json({
        code: "INVALID_POST_ID",
        message: "ID-ul postării nu este valid",
      });
      return;
    }

    const post = await Post.findOne({
      _id: new mongoose.Types.ObjectId(postId),
      author: new mongoose.Types.ObjectId(userId),
    });

    if (!post) {
      res.status(404).json({
        code: "POST_NOT_FOUND",
        message:
          "Postarea nu a fost găsită sau nu aveți permisiunea să o ștergeți",
      });
      return;
    }

    if (post.images && post.images.length > 0) {
      try {
        const deletePromises = post.images.map((imageUrl: string) =>
          deleteImageFromCloudinary(imageUrl)
        );

        await Promise.allSettled(deletePromises);
        console.log(
          `Deleted ${post.images.length} images from Cloudinary for post ${postId}`
        );
      } catch (cloudinaryError) {
        console.error(
          "Error deleting images from Cloudinary:",
          cloudinaryError
        );
      }
    }

    await Post.findByIdAndDelete(postId);

    res.status(200).json({
      code: "POST_DELETED",
      message: "Postarea a fost ștearsă cu succes",
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({
      code: "INTERNAL_SERVER_ERROR",
      message: "Eroare internă de server",
    });
  }
}

export async function getPostByID(req: Request, res: Response): Promise<void> {
  try {
    const { postId } = req.params;

    if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
      res.status(400).json({
        code: "INVALID_POST_ID",
        message: "ID-ul postării nu este valid",
      });
      return;
    }

    const post = await Post.findById(postId);

    if (!post) {
      res.status(404).json({
        code: "POST_NOT_FOUND",
        message: "Postarea nu a fost găsită",
      });
      return;
    }

    res.status(200).json({
      code: "POST_FOUND",
      post,
    });
  } catch (error) {
    console.error("Error fetching post by ID:", error);
    res.status(500).json({
      code: "INTERNAL_SERVER_ERROR",
      message: "Eroare internă de server",
    });
  }
}

export async function editPost(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const { postId } = req.params;
    const validatedData = req.body;

    if (!userId) {
      res.status(401).json({
        code: "UNAUTHORIZED",
        message: "User not authenticated",
      });
      return;
    }

    if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
      res.status(400).json({
        code: "INVALID_POST_ID",
        message: "ID-ul postării nu este valid",
      });
      return;
    }

    const existingPost = await Post.findOne({
      _id: new mongoose.Types.ObjectId(postId),
      author: new mongoose.Types.ObjectId(userId),
    });

    if (!existingPost) {
      res.status(404).json({
        code: "POST_NOT_FOUND",
        message:
          "Postarea nu a fost găsită sau nu aveți permisiunea să o editați",
      });
      return;
    }

    let finalImageUrls: string[] = [...(existingPost.images || [])];
    const imagesToDelete: string[] = [];

    if (req.body.imageOperations) {
      const { imagesToRemove = [], replaceAllImages = false } =
        req.body.imageOperations;

      if (replaceAllImages) {
        imagesToDelete.push(...finalImageUrls);
        finalImageUrls = [];
      } else if (imagesToRemove && Array.isArray(imagesToRemove)) {
        imagesToRemove.forEach((imageUrl: string) => {
          const index = finalImageUrls.indexOf(imageUrl);
          if (index > -1) {
            finalImageUrls.splice(index, 1);
            imagesToDelete.push(imageUrl);
          }
        });
      }
    }

    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      try {
        const uploadPromises = req.files.map(
          async (file: Express.Multer.File, index: number) => {
            return uploadImageToCloudinary(
              file.buffer,
              file.originalname || `image-${index}`
            );
          }
        );

        const newImageUrls = await Promise.all(uploadPromises);
        finalImageUrls.push(...newImageUrls);
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        res.status(500).json({
          code: "IMAGE_UPLOAD_ERROR",
          message: "Eroare la încărcarea imaginilor noi",
          errors: [
            {
              field: "images",
              message: "Nu s-au putut încărca imaginile noi",
            },
          ],
        });
        return;
      }
    }

    if (finalImageUrls.length === 0) {
      res.status(400).json({
        code: "MISSING_IMAGES",
        message: "Cel puțin o imagine este obligatorie",
        errors: [
          {
            field: "images",
            message:
              "Nu puteți șterge toate imaginile. Cel puțin o imagine este obligatorie",
          },
        ],
      });
      return;
    }

    const updateData = {
      ...validatedData,
      images: finalImageUrls,
      updatedAt: new Date(),
    };

    delete updateData.imageOperations;

    const updatedPost = await Post.findByIdAndUpdate(postId, updateData, {
      new: true,
      runValidators: true,
      select: "-__v",
    }).lean();

    if (!updatedPost) {
      res.status(404).json({
        code: "POST_NOT_FOUND",
        message: "Postarea nu a fost găsită",
      });
      return;
    }

    if (imagesToDelete.length > 0) {
      try {
        const deletePromises = imagesToDelete.map((imageUrl: string) =>
          deleteImageFromCloudinary(imageUrl)
        );

        await Promise.allSettled(deletePromises);
        console.log(
          `Deleted ${imagesToDelete.length} old images from Cloudinary for post ${postId}`
        );
      } catch (cloudinaryError) {
        console.error(
          "Error deleting old images from Cloudinary:",
          cloudinaryError
        );
      }
    }

    res.status(200).json({
      code: "POST_UPDATED",
      message: "Postarea a fost actualizată cu succes",
      post: updatedPost,
      imagesAdded: req.files ? req.files.length : 0,
      imagesRemoved: imagesToDelete.length,
    });
  } catch (error: any) {
    console.error("Error updating post:", error);

    if (error.name === "ValidationError") {
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
        message: "Valorile introduse există deja",
        errors: [
          {
            field: Object.keys(error.keyPattern || {})[0] || "unknown",
            message: "Această valoare există deja",
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

export async function markPostSolved(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const userId = req.user?.id;
    const { postId } = req.params;

    if (!userId) {
      res.status(401).json({
        code: "UNAUTHORIZED",
        message: "User not authenticated",
      });
      return;
    }

    if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
      res.status(400).json({
        code: "INVALID_POST_ID",
        message: "ID‑ul postării nu este valid",
      });
      return;
    }

    const updatedPost = await Post.findOneAndUpdate(
      { _id: postId, author: userId },
      { status: "solved", updatedAt: new Date() },
      { new: true, select: "-__v" }
    ).lean();

    if (!updatedPost) {
      res.status(404).json({
        code: "POST_NOT_FOUND",
        message:
          "Postarea nu a fost găsită sau nu aveți permisiunea să o editați",
      });
      return;
    }

    res.status(200).json({
      code: "POST_STATUS_UPDATED",
      message: "Postarea a fost marcată ca rezolvată",
      post: updatedPost,
    });
  } catch (error) {
    console.error("Error marking post as solved:", error);
    res.status(500).json({
      code: "INTERNAL_SERVER_ERROR",
      message: "Eroare internă de server",
    });
  }
}
