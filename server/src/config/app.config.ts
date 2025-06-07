import { getEnv } from "../utils/get-env";
import dotenv from "dotenv";

dotenv.config();

const appConfig = () => ({
  NODE_ENV: getEnv("NODE_ENV", "development"),
  APP_ORIGIN: getEnv("APP_ORIGIN", "localhost"),
  PORT: getEnv("PORT", "8000"),
  BASE_PATH: getEnv("BASE_PATH", "/api/v1"),
  MONGO_URI: getEnv("MONGO_URI"),
  JWT: {
    SECRET: getEnv("JWT_SECRET"),
    REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET"),
  },
});

export const config = appConfig();
