import { Request, Response, NextFunction, RequestHandler } from "express";
import { ZodSchema } from "zod";

export const validate = (schema: ZodSchema): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        code: "VALIDATION_ERROR",
        message: "Validation error",
        errors: result.error.errors,
      });
      return;
    }
    req.body = result.data;
    next();
  };
};
