import { Request, Response } from "express";
import User from "../models/User";
import { config } from "../config/app.config";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken";
import emailService from "../services/emailService";

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password } = req.body;

    if (await User.exists({ email })) {
      res.status(409).json({
        code: "EMAIL_EXISTS",
        message: "Email-ul este deja folosit",
      });
      return;
    }

    const user = new User({ name, email, password });
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    try {
      await emailService.sendVerificationEmail(email, name, verificationToken);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
    }

    res.status(201).json({
      code: "REGISTRATION_SUCCESS",
      message:
        "Contul a fost creat cu succes. Verifică-ți email-ul pentru a activa contul.",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isEmailVerified: user.isEmailVerified,
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
        message: "Email sau parolă incorecte",
      });
      return;
    }

    const isValid = await user.validatePassword(password);
    if (!isValid) {
      res.status(401).json({
        code: "INVALID_CREDENTIALS",
        message: "Email sau parolă incorecte",
      });
      return;
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    if (!user.isEmailVerified) {
      res.status(401).json({
        code: "EMAIL_NOT_VERIFIED",
        message: "Te rugăm să-ți verifici email-ul înainte de a te loga.",
        userId: user.id,
      });
      return;
    }

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password: _, ...safeUser } = user.toObject();

    res.json({
      accessToken,
      user: safeUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error",
    });
  }
}

export function logout(req: Request, res: Response): void {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "strict",
    secure: config.NODE_ENV === "production",
  });
  res.json({ code: "LOGGED_OUT", message: "Logged out" });
}

export function refreshToken(req: Request, res: Response): void {
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
      const accessToken = generateAccessToken(decoded.id);
      res.json({ accessToken });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error",
    });
  }
}

export async function verifyEmail(req: Request, res: Response): Promise<void> {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({
        code: "MISSING_TOKEN",
        message: "Token de verificare lipsește",
      });
      return;
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      res.status(400).json({
        code: "INVALID_TOKEN",
        message: "Token de verificare invalid sau expirat",
      });
      return;
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password: _, ...safeUser } = user.toObject();

    res.json({
      code: "EMAIL_VERIFIED",
      message: "Email verificat cu succes!",
      accessToken,
      user: safeUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error",
    });
  }
}
