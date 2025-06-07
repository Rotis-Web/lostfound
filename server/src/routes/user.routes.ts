import express from "express";
import { authenticate } from "../middleware/authenticate";
import { getProfile } from "../controllers/userController";

const router = express.Router();

router.get("/profile", authenticate, getProfile);

export default router;
