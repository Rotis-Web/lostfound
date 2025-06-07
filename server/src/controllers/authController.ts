import { Request, Response } from "express";
import User from "../models/User";
import { config } from "../config/app.config";
import jwt from "jsonwebtoken";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken";

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password } = req.body;

    if (await User.exists({ email })) {
      res.status(409).json({
        code: "EMAIL_EXISTS",
        message: "User already exists with this email",
      });
      return;
    }

    const user = new User({ name, email, password });
    await user.save();

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error",
    });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({
        code: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
      });
      return;
    }

    const isValid = await user.validatePassword(password);
    if (!isValid) {
      res.status(401).json({
        code: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
      });
      return;
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error",
    });
  }
}

export function logout(req: Request, res: Response) {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "strict",
    secure: config.NODE_ENV === "production",
  });
  res.json({ code: "LOGGED_OUT", message: "Logged out" });
}

export function refreshToken(req: Request, res: Response) {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      res.status(401).json({
        code: "NO_REFRESH_TOKEN",
        message: "No refresh token provided",
      });
      return;
    }

    jwt.verify(token, config.JWT.REFRESH_SECRET, (err: any, decoded: any) => {
      if (err) {
        res.status(403).json({
          code: "INVALID_REFRESH_TOKEN",
          message: "Invalid refresh token",
        });
        return;
      }
      const accessToken = generateAccessToken(decoded.userId);
      res.json({ accessToken });
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({
        code: "INTERNAL_SERVER_ERROR",
        message: "Internal server error",
      });
  }
}
