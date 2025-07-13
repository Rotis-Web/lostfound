import { Response, Request } from "express";
import mongoose from "mongoose";
import Post from "../models/Post";
import User from "../models/User";
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

// Updated editPost function in your backend

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

    // Get original standard image from existing post
    const originalStandardImage = existingPost.standardImage;

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

    // Handle standard image changes
    if (hasStandardImage) {
      // If we're switching to a new standard image and there was an old one
      if (
        originalStandardImage &&
        originalStandardImage !== req.body.standardImage.trim()
      ) {
        // Remove old standard image from images array if it exists
        const oldStandardIndex = finalImageUrls.indexOf(originalStandardImage);
        if (oldStandardIndex > -1) {
          finalImageUrls.splice(oldStandardIndex, 1);
          imagesToDelete.push(originalStandardImage);
        }
      }

      // Clear any existing regular images when using standard image
      if (finalImageUrls.length > 0) {
        imagesToDelete.push(...finalImageUrls);
        finalImageUrls = [];
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

    // Key logic: If we have standard image, use it; otherwise use uploaded/existing images
    const shouldUseStandardImage =
      hasStandardImage && finalImageUrls.length === 0;

    // If we're using standard image, add it to the images array
    if (shouldUseStandardImage) {
      finalImageUrls.push(req.body.standardImage.trim());
    }

    // Check if we have at least one image (either uploaded or standard)
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

    // Delete old images from Cloudinary (if needed)
    if (imagesToDelete.length > 0) {
      try {
        const deletePromises = imagesToDelete
          .filter((imgUrl) => imgUrl !== req.body.standardImage?.trim()) // Don't delete the new standard image
          .map((imgUrl) => deleteImageFromCloudinary(imgUrl));
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
    const { memberId } = req.body;

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

    if (memberId && memberId.trim()) {
      const trimmedMemberId = memberId.trim();
      if (!/^#[a-zA-Z0-9]+$/.test(trimmedMemberId)) {
        res.status(400).json({
          code: "INVALID_MEMBER_ID",
          message:
            "ID-ul membrului nu este valid. Trebuie să înceapă cu # urmat de litere și cifre (ex: #12aHG).",
        });
        return;
      }
    }

    let badgeUpdateResult = null;
    if (memberId && memberId.trim()) {
      try {
        const member = await User.findOne({ lostfoundID: memberId.trim() });

        if (!member || !member._id) {
          res.status(400).json({
            code: "MEMBER_NOT_FOUND",
            message: `Membrul cu ID-ul ${memberId} nu a fost găsit.`,
          });
          return;
        }

        if (member._id.toString() === userId) {
          res.status(400).json({
            code: "SELF_BADGE_NOT_ALLOWED",
            message: "Nu vă puteți acorda insignă propriului cont.",
          });
          return;
        }

        const badgeUrl = "https://lostfound.ro/badgero";

        if (member.badges && member.badges.includes(badgeUrl)) {
          badgeUpdateResult = {
            success: true,
            message: `Membrul ${memberId} are deja insignă.`,
          };
        } else {
          await User.findByIdAndUpdate(
            member._id,
            {
              $push: { badges: badgeUrl },
            },
            { new: true }
          );

          badgeUpdateResult = {
            success: true,
            message: `Insignă acordată cu succes membrului ${memberId}.`,
          };
        }
      } catch (badgeError) {
        console.error("Error updating member badges:", badgeError);
        res.status(500).json({
          code: "BADGE_UPDATE_ERROR",
          message: "Eroare la acordarea insignei. Încercați din nou.",
        });
        return;
      }
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

    const response = {
      code: "POST_STATUS_UPDATED",
      message: "Postarea a fost marcată ca rezolvată",
      post: updatedPost,
      ...(badgeUpdateResult && { badgeUpdate: badgeUpdateResult }),
    };

    res.status(200).json(response);
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
    const skip = parseInt(req.query.skip as string) || 0;

    const getPostsByStatus = async (
      status: string,
      limit: number,
      skipCount: number
    ) => {
      const promotedPosts = await Post.find({
        status: status,
        "promoted.isActive": true,
        "promoted.expiresAt": { $gt: new Date() },
      })
        .select(
          "title content images status category location createdAt lostfoundID promoted views lastSeen reward"
        )
        .sort({ createdAt: -1 })
        .skip(skipCount)
        .limit(limit)
        .lean();

      const promotedPostIds = promotedPosts.map((post) => post._id);
      const remainingLimit = limit - promotedPosts.length;
      const remainingSkip = Math.max(0, skipCount - promotedPosts.length);

      let regularPosts: any[] = [];

      if (remainingLimit > 0) {
        regularPosts = await Post.find({
          status: status,
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
          .skip(remainingSkip)
          .limit(remainingLimit)
          .lean();
      }

      return [...promotedPosts, ...regularPosts];
    };

    const postsPerStatus = 10;
    const lostSkip = Math.floor(skip / 2);
    const foundSkip = Math.floor(skip / 2);

    const [lostPosts, foundPosts] = await Promise.all([
      getPostsByStatus("lost", postsPerStatus, lostSkip),
      getPostsByStatus("found", postsPerStatus, foundSkip),
    ]);

    const allPosts = [...lostPosts, ...foundPosts];

    const [totalLostCount, totalFoundCount] = await Promise.all([
      Post.countDocuments({ status: "lost" }),
      Post.countDocuments({ status: "found" }),
    ]);

    const totalCount = totalLostCount + totalFoundCount;

    const promotedCount = allPosts.filter(
      (post) => post.promoted?.isActive && post.promoted?.expiresAt > new Date()
    ).length;

    res.status(200).json({
      code: "LATEST_POSTS",
      posts: allPosts,
      count: allPosts.length,
      totalCount,
      hasMore: skip + allPosts.length < totalCount,
      promotedCount,
      lostCount: lostPosts.length,
      foundCount: foundPosts.length,
    });
  } catch (error) {
    console.error("Error fetching latest posts:", error);
    res.status(500).json({
      code: "INTERNAL_SERVER_ERROR",
      message: "Eroare internă de server",
    });
  }
}
