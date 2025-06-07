import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/app.config";

interface JwtPayload {
  id: string;
}

export const authenticate: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res
      .status(401)
      .json({ code: "UNAUTHORIZED", message: "Missing Bearer token" });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const { id } = jwt.verify(token, config.JWT.SECRET) as JwtPayload;
    req.user = { id };
    next();
  } catch {
    res
      .status(403)
      .json({ code: "FORBIDDEN", message: "Invalid or expired token" });
    return;
  }
};
