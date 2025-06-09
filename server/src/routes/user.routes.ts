import express from "express";
import { authenticate } from "../middleware/authenticate";
import { getProfile, changePassword } from "../controllers/userController";
import { validate } from "../middleware/validate";
import { changePasswordSchema } from "../utils/validators/auth.validator";

const router = express.Router();

router.get("/profile", authenticate, getProfile);
router.put(
  "/change-password",
  authenticate,
  validate(changePasswordSchema),
  changePassword
);

export default router;
