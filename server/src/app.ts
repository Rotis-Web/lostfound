import express from "express";
import { config } from "./config/app.config";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
dotenv.config();

const app = express();
app.use(morgan("dev"));

app.use(express.json());
app.use(cookieParser());

app.use(`${config.BASE_PATH}/auth`, authRoutes);
app.use(`${config.BASE_PATH}/user`, userRoutes);

export default app;
