import jwt from "jsonwebtoken";
import { config } from "../config/app.config";

const generateAccessToken = (id: string): string => {
  return jwt.sign({ id }, config.JWT.SECRET, {
    expiresIn: "1h",
  });
};

const generateRefreshToken = (id: string): string => {
  return jwt.sign({ id }, config.JWT.REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

export { generateAccessToken, generateRefreshToken };
