import express from "express";
import { authenticate } from "../middleware/authenticate";
import {
  getProfile,
  getPublicUserProfile,
  changePassword,
  deleteAccount,
  changeProfileImage,
  savePost,
  removePost,
} from "../controllers/userController";
import { validate } from "../middleware/validate";
import {
  changePasswordSchema,
  deleteAccountSchema,
} from "../utils/validators/auth.validator";
import rateLimit from "express-rate-limit";
import RedisStore, { RedisReply, SendCommandFn } from "rate-limit-redis";
import redis from "../config/redis";
import multer from "multer";

const sendCommand: SendCommandFn = (commandName, ...args) => {
  return redis.call(commandName, ...args) as Promise<RedisReply>;
};

const userLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 2,
  message: {
    code: "TOO_MANY_REQUESTS",
    error: "Prea multe cereri. Încearcă mai târziu",
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({ sendCommand, prefix: "rl_user:" }),
});
const profileLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  message: {
    code: "TOO_MANY_REQUESTS",
    error: "Prea multe cereri. İncearcă mai târziu",
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({ sendCommand, prefix: "rl_profile:" }),
});
const savePostLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  message: {
    code: "TOO_MANY_REQUESTS",
    error: "Prea multe cereri. İncearcă mai târziu",
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({ sendCommand, prefix: "rl_save_post:" }),
});

const storage = multer.memoryStorage();
const imageUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Doar fișierele imagine sunt permise"));
      return;
    }
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.mimetype)) {
      cb(new Error("Formatele acceptate sunt: JPEG, JPG, PNG, WebP"));
      return;
    }
    cb(null, true);
  },
});

const router = express.Router();

router.get("/profile", profileLimiter, authenticate, getProfile);
router.get("/public-profile/:id", profileLimiter, getPublicUserProfile);
router.put(
  "/change-password",
  userLimiter,
  authenticate,
  validate(changePasswordSchema),
  changePassword
);
router.delete(
  "/delete-account",
  userLimiter,
  authenticate,
  validate(deleteAccountSchema),
  deleteAccount
);
router.put(
  "/change-profile-image",
  userLimiter,
  authenticate,
  imageUpload.single("image"),
  changeProfileImage
);
router.post("/save-post", savePostLimiter, authenticate, savePost);
router.post("/remove-post", savePostLimiter, authenticate, removePost);

export default router;
