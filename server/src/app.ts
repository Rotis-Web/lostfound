import express from "express";
import { config } from "./config/app.config";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { handleMulterError } from "./middleware/errorHandler";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import geoRoutes from "./routes/geo.routes";
import postRoutes from "./routes/post.routes";
import searchRoutes from "./routes/search.routes";
import commentRoutes from "./routes/comment.routes";
dotenv.config();

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);
app.use(mongoSanitize());

app.use(morgan("dev"));
app.use(
  cors({
    origin: config.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(`${config.BASE_PATH}/auth`, authRoutes);
app.use(`${config.BASE_PATH}/user`, userRoutes);
app.use(`${config.BASE_PATH}/geo`, geoRoutes);
app.use(`${config.BASE_PATH}/post`, postRoutes);
app.use(`${config.BASE_PATH}/comment`, commentRoutes);
app.use(`${config.BASE_PATH}/search`, searchRoutes);

app.use(handleMulterError);

export default app;
