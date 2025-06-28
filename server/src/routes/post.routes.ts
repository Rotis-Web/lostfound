import express from "express";
import multer from "multer";
import {
  createPost,
  getUserPosts,
  deletePost,
  getPostByID,
  editPost,
  markPostSolved,
} from "../controllers/postController";
import { validate } from "../middleware/validate";
import {
  createPostSchema,
  editPostSchema,
} from "../utils/validators/post.validator";
import rateLimit from "express-rate-limit";
import RedisStore, { RedisReply, SendCommandFn } from "rate-limit-redis";
import redis from "../config/redis";
import { authenticate } from "../middleware/authenticate";

const sendCommand: SendCommandFn = (commandName, ...args) => {
  return redis.call(commandName, ...args) as Promise<RedisReply>;
};

const createPostLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 93,
  message: {
    code: "TOO_MANY_POST_CREATION_ATTEMPTS",
    message: "Prea multe postări create. Încearcă mai târziu.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({ sendCommand, prefix: "rl_create_post:" }),
});

const editPostLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  message: {
    code: "TOO_MANY_EDIT_ATTEMPTS",
    message: "Prea multe încercări de editare. Încearcă mai târziu.",
  },
  store: new RedisStore({ sendCommand, prefix: "rl_edit_post:" }),
});

const deletePostLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: {
    code: "TOO_MANY_DELETE_ATTEMPTS",
    message: "Prea multe încercări de ștergere. Încearcă mai târziu.",
  },
  store: new RedisStore({ sendCommand, prefix: "rl_delete_post:" }),
});

const postGeneralLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  message: {
    code: "TOO_MANY_REQUESTS",
    message: "Prea multe cereri. Încearcă mai târziu.",
  },
  store: new RedisStore({ sendCommand, prefix: "rl_posts_general:" }),
});

const imageUploadLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 115,
  message: {
    code: "TOO_MANY_IMAGE_UPLOADS",
    message: "Prea multe încărcări de imagini. Încearcă mai târziu.",
  },
  store: new RedisStore({ sendCommand, prefix: "rl_image_upload:" }),
});

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 5,
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Doar fișierele imagine sunt permise"));
      return;
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.mimetype)) {
      cb(new Error("Formatele acceptate sunt: JPEG, JPG, PNG, WebP"));
      return;
    }

    cb(null, true);
  },
});

const router = express.Router();

router.post(
  "/create",
  authenticate,
  createPostLimiter,
  imageUploadLimiter,
  upload.array("images", 5),
  validate(createPostSchema),
  createPost
);
router.put(
  "/edit/:postId",
  authenticate,
  editPostLimiter,
  imageUploadLimiter,
  upload.array("images", 5),
  validate(editPostSchema),
  editPost
);
router.patch(
  "/solve/:postId",
  authenticate,
  postGeneralLimiter,
  markPostSolved
);
router.delete("/delete/:postId", authenticate, deletePostLimiter, deletePost);
router.get("/user-posts", authenticate, postGeneralLimiter, getUserPosts);
router.get("/:postId", postGeneralLimiter, getPostByID);

export default router;
