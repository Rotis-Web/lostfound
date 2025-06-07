import { Request, Response, NextFunction, RequestHandler } from "express";
import { ZodSchema } from "zod";

export const validate = (schema: ZodSchema): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;

      const errors = Object.entries(fieldErrors).map(([field, messages]) => ({
        field,
        message: messages?.[0] || "Invalid value",
      }));

      res.status(400).json({
        code: "VALIDATION_ERROR",
        errors,
      });
      return;
    }

    req.body = result.data;
    next();
  };
};
