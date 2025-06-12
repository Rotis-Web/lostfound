import express from "express";
import {
  login,
  logout,
  register,
  refreshToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
} from "../controllers/authController";
import { validate } from "../middleware/validate";
import {
  registerSchema,
  loginSchema,
  resetPasswordSchema,
  emailSchema,
} from "../utils/validators/auth.validator";

const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);
router.post("/verify-email", verifyEmail);
router.post("/forgot-password", validate(emailSchema), forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);

export default router;
