import express from "express";
import { config } from "./config/app.config";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import geoRoutes from "./routes/geo.routes";
dotenv.config();

const app = express();

app.use(helmet());

app.use(morgan("dev"));
app.use(cors({ origin: config.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(`${config.BASE_PATH}/auth`, authRoutes);
app.use(`${config.BASE_PATH}/user`, userRoutes);
app.use(`${config.BASE_PATH}/geo`, geoRoutes);

export default app;
