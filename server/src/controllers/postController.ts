import { Response, Request } from "express";
import mongoose from "mongoose";
import Post from "../models/Post";
import Comment from "../models/Comment";
import {
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
} from "../utils/cloudinary";

export async function createPost(req: Request, res: Response): Promise<void> {
  try {
    const validatedData = req.body;

    const hasFileUploads =
      req.files && Array.isArray(req.files) && req.files.length > 0;
    const hasStandardImage =
      typeof req.body.standardImage === "string" &&
      req.body.standardImage.trim() !== "";

    if (!hasFileUploads && !hasStandardImage) {
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

    if (hasFileUploads && req.files) {
      try {
        const files = req.files as Express.Multer.File[];
        const uploadPromises = files.map(async (file, index) => {
          return uploadImageToCloudinary(
            file.buffer,
            file.originalname || `image-${index}`
          );
        });
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
    } else if (hasStandardImage) {
      uploadedImageUrls.push(req.body.standardImage.trim());
    }

    const post = new Post({
      ...validatedData,
      images: uploadedImageUrls || [],
      standardImage: hasStandardImage
        ? req.body.standardImage.trim()
        : undefined,
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

    if (post.comments && post.comments.length > 0) {
      try {
        await Comment.deleteMany({ _id: { $in: post.comments } });
        console.log(
          `Deleted ${post.comments.length} comments associated with post ${postId}`
        );
      } catch (commentError) {
        console.error("Error deleting comments:", commentError);
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

    const post = await Post.findByIdAndUpdate(
      postId,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate("author", "name profileImage")
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "name profileImage",
        },
        select: "content createdAt",
      });

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

    // Determine if there's a standard image string
    const hasStandardImage =
      typeof req.body.standardImage === "string" &&
      req.body.standardImage.trim() !== "";

    // Check if we have new file uploads
    const hasNewUploads =
      req.files && Array.isArray(req.files) && req.files.length > 0;

    let finalImageUrls: string[] = [...(existingPost.images || [])];
    const imagesToDelete: string[] = [];

    // Handle deletion of existing images
    if (req.body.imageOperations) {
      const { imagesToRemove = [], replaceAllImages = false } =
        req.body.imageOperations;

      if (replaceAllImages) {
        imagesToDelete.push(...finalImageUrls);
        finalImageUrls = [];
      } else if (Array.isArray(imagesToRemove)) {
        imagesToRemove.forEach((imageUrl: string) => {
          const index = finalImageUrls.indexOf(imageUrl);
          if (index > -1) {
            finalImageUrls.splice(index, 1);
            imagesToDelete.push(imageUrl);
          }
        });
      }
    }

    // Upload new images (if files provided)
    if (hasNewUploads) {
      try {
        const files = req.files as Express.Multer.File[];
        const uploadPromises = files.map((file, index) =>
          uploadImageToCloudinary(
            file.buffer,
            file.originalname || `image-${index}`
          )
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

    // Key logic: If we have uploaded images OR existing images, we shouldn't use standard image
    const shouldUseStandardImage =
      hasStandardImage && finalImageUrls.length === 0;

    // If we're using standard image, add it to the images array
    if (shouldUseStandardImage) {
      finalImageUrls.push(req.body.standardImage.trim());
    }

    // Check if we have at least one image (either uploaded or standard)
    if (finalImageUrls.length === 0 && !shouldUseStandardImage) {
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

    // Delete old images from Cloudinary (if needed)
    if (imagesToDelete.length > 0) {
      try {
        const deletePromises = imagesToDelete.map((imgUrl) =>
          deleteImageFromCloudinary(imgUrl)
        );
        await Promise.allSettled(deletePromises);
      } catch (cloudinaryError) {
        console.error(
          "Error deleting images from Cloudinary:",
          cloudinaryError
        );
      }
    }

    // Prepare update data
    const updateData: any = {
      ...validatedData,
      images: finalImageUrls,
    };

    // Prepare unset operations
    const unsetOperations: any = {};

    // Handle standard image properly
    if (shouldUseStandardImage) {
      updateData.standardImage = req.body.standardImage.trim();
    } else {
      // Remove standardImage if we're not using it
      unsetOperations.standardImage = "";
    }

    // Build the update query
    const updateQuery: any = { $set: updateData };
    if (Object.keys(unsetOperations).length > 0) {
      updateQuery.$unset = unsetOperations;
    }

    // Update post using findOneAndUpdate
    const updatedPost = await Post.findOneAndUpdate(
      { _id: postId, author: userId },
      updateQuery,
      { new: true, runValidators: true }
    );

    if (!updatedPost) {
      res.status(404).json({
        code: "POST_NOT_FOUND",
        message:
          "Postarea nu a fost găsită sau nu aveți permisiunea să o editați",
      });
      return;
    }

    res.status(200).json({
      code: "POST_UPDATED",
      message: "Postarea a fost actualizată cu succes",
      post: updatedPost,
      updatedImages: finalImageUrls.length,
    });
  } catch (error: any) {
    console.error("Eroare la actualizarea postării:", error);

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
        errors,
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
      {
        status: "solved",
        updatedAt: new Date(),
        lastSeen: new Date(),
        $unset: { reward: "" },
      },
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

export async function getLatestPosts(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = parseInt(req.query.skip as string) || 0;

    const promotedPosts = await Post.find({
      status: { $ne: "solved" },
      "promoted.isActive": true,
      "promoted.expiresAt": { $gt: new Date() },
    })
      .select(
        "title content images status category location createdAt lostfoundID promoted views lastSeen reward"
      )
      .sort({ createdAt: -1 })
      .lean();

    const promotedPostIds = promotedPosts.map((post) => post._id);

    const regularPosts = await Post.find({
      status: { $ne: "solved" },
      _id: { $nin: promotedPostIds },
      $or: [
        { "promoted.isActive": { $ne: true } },
        { "promoted.expiresAt": { $lte: new Date() } },
        { promoted: { $exists: false } },
      ],
    })
      .select(
        "title content images status category location createdAt lostfoundID promoted views lastSeen reward"
      )
      .sort({ createdAt: -1 })
      .lean();

    const allPosts = [...promotedPosts, ...regularPosts];

    const paginatedPosts = allPosts.slice(skip, skip + limit);

    const totalCount = await Post.countDocuments({
      status: { $ne: "solved" },
    });

    res.status(200).json({
      code: "LATEST_POSTS",
      posts: paginatedPosts,
      count: paginatedPosts.length,
      totalCount,
      hasMore: skip + paginatedPosts.length < totalCount,
      promotedCount: promotedPosts.length,
    });
  } catch (error) {
    console.error("Error fetching latest posts:", error);
    res.status(500).json({
      code: "INTERNAL_SERVER_ERROR",
      message: "Eroare internă de server",
    });
  }
}
