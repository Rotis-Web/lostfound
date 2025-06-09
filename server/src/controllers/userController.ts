import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcrypt";

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
