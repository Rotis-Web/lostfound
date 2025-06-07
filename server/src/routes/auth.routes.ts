import express from "express";
import {
  login,
  logout,
  register,
  refreshToken,
} from "../controllers/authController";
import { validate } from "../middleware/validate";
import {
  registerSchema,
  loginSchema,
} from "../utils/validators/auth.validator";

const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);

export default router;
