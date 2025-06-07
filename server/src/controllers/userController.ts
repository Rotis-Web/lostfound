import { Request, Response } from "express";
import User from "../models/User";

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
