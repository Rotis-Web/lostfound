import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcrypt";
import {
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
} from "../utils/cloudinary";

export const getProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const user = await User.findById(userId).select("-password -__v").lean();
    if (!user) {
      res.status(404).json({ code: "NOT_FOUND", message: "User not found" });
      return;
    }
    res.json({ user });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ code: "SERVER_ERROR", message: "Could not fetch profile" });
  }
};

export const changePassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        code: "NOT_FOUND",
        message: "User not found",
      });
      return;
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      res.status(400).json({
        code: "VALIDATION_ERROR",
        message: "Parola veche este incorectă",
        errors: [
          { field: "oldPassword", message: "Parola veche este incorectă" },
        ],
      });
      return;
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      res.status(400).json({
        code: "VALIDATION_ERROR",
        message: "Parola nouă trebuie să fie diferită de cea veche",
        errors: [
          {
            field: "newPassword",
            message: "Parola nouă trebuie să fie diferită de cea veche",
          },
        ],
      });
      return;
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(userId, {
      password: hashedNewPassword,
      updatedAt: new Date(),
    });

    res.json({
      code: "SUCCESS",
      message: "Parola a fost schimbată cu succes",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      code: "SERVER_ERROR",
      message: "Eroare la schimbarea parolei",
    });
  }
};

export const deleteAccount = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { password } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        code: "NOT_FOUND",
        message: "User not found",
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(400).json({
        code: "VALIDATION_ERROR",
        message: "Parola este incorectă",
        errors: [{ field: "password", message: "Parola este incorectă" }],
      });
      return;
    }

    if (user.profileImage && user.profileImage.includes("res.cloudinary.com")) {
      try {
        await deleteImageFromCloudinary(user.profileImage);
      } catch (cloudErr) {
        console.error("Cloudinary deletion error:", cloudErr);
      }
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    // await Post.deleteMany({ userId: userId });
    // await Comment.deleteMany({ userId: userId });

    await User.findByIdAndDelete(userId);

    res.json({
      code: "SUCCESS",
      message: "Contul a fost șters cu succes",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      code: "SERVER_ERROR",
      message: "Eroare la ștergerea contului",
    });
  }
};

export const changeProfileImage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;

    if (!req.file) {
      res.status(400).json({
        code: "MISSING_IMAGE",
        message: "Imaginea de profil este obligatorie",
        errors: [{ field: "image", message: "Trebuie să încarci o imagine" }],
      });
      return;
    }

    let newImageUrl: string;
    try {
      newImageUrl = await uploadImageToCloudinary(
        req.file.buffer,
        req.file.originalname || "profile-image"
      );
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      res.status(500).json({
        code: "IMAGE_UPLOAD_ERROR",
        message: "Eroare la încărcarea imaginii",
      });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ code: "NOT_FOUND", message: "User not found" });
      return;
    }

    const oldImageUrl = (user as any).profileImage as string | undefined;
    (user as any).profileImage = newImageUrl;
    user.updatedAt = new Date();
    await user.save();

    if (oldImageUrl) {
      try {
        await deleteImageFromCloudinary(oldImageUrl);
      } catch (cloudErr) {
        console.error(
          "Error deleting old profile image from Cloudinary:",
          cloudErr
        );
      }
    }

    res.json({
      code: "PROFILE_IMAGE_UPDATED",
      message: "Imaginea de profil a fost actualizată cu succes",
      imageUrl: newImageUrl,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      code: "SERVER_ERROR",
      message: "Eroare la actualizarea imaginii de profil",
    });
  }
};
