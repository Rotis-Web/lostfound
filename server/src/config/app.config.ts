import { getEnv } from "../utils/get-env";
import dotenv from "dotenv";

dotenv.config();

const appConfig = () => ({
  NODE_ENV: getEnv("NODE_ENV", "development"),
  APP_ORIGIN: getEnv("APP_ORIGIN", "localhost"),
  FRONTEND_URL: getEnv("FRONTEND_URL", "http://localhost:3000"),
  PORT: getEnv("PORT", "8000"),
  BASE_PATH: getEnv("BASE_PATH", "/api/v1"),
  MONGO_URI: getEnv("MONGO_URI"),
  REDIS_URL: getEnv("REDIS_URL"),
  JWT: {
    SECRET: getEnv("JWT_SECRET"),
    REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET"),
  },
  RESEND_API_KEY: getEnv("RESEND_API_KEY"),
  SMTP_HOST: getEnv("SMTP_HOST"),
  SMTP_PORT: getEnv("SMTP_PORT"),
  SMTP_USER: getEnv("SMTP_USER"),
  SMTP_PASS: getEnv("SMTP_PASS"),
  FROM_EMAIL: getEnv("FROM_EMAIL"),
  FROM_NAME: getEnv("FROM_NAME"),
  CLOUDINARY_CLOUD_NAME: getEnv("CLOUDINARY_CLOUD_NAME"),
  CLOUDINARY_API_KEY: getEnv("CLOUDINARY_API_KEY"),
  CLOUDINARY_API_SECRET: getEnv("CLOUDINARY_API_SECRET"),
});

export const config = appConfig();
