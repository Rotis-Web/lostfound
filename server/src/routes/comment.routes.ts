import express from "express";
import { createComment } from "../controllers/commentController";
import { validate } from "../middleware/validate";
import { createCommentSchema } from "../utils/validators/post.validator";
import rateLimit from "express-rate-limit";
import { authenticate } from "../middleware/authenticate";

const createCommentLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: {
    code: "TOO_MANY_REQUESTS",
    error: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = express.Router();

router.post(
  "/create",
  authenticate,
  createCommentLimiter,
  validate(createCommentSchema),
  createComment
);

export default router;
