import { Request, Response, NextFunction } from "express";
import multer from "multer";

export function handleMulterError(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (error instanceof multer.MulterError) {
    let message = "Eroare la încărcarea fișierului";
    let field = "images";

    switch (error.code) {
      case "LIMIT_FILE_SIZE":
        message = "Fișierul este prea mare. Mărimea maximă este 5MB per fișier";
        break;
      case "LIMIT_FILE_COUNT":
        message = "Prea multe fișiere. Maxim 5 imagini sunt permise";
        break;
      case "LIMIT_UNEXPECTED_FILE":
        message = "Câmp neașteptat pentru încărcarea fișierului";
        break;
    }

    res.status(400).json({
      code: "FILE_UPLOAD_ERROR",
      message: message,
      errors: [
        {
          field: field,
          message: message,
        },
      ],
    });
    return;
  }

  if (
    error.message.includes("Doar fișierele imagine") ||
    error.message.includes("Formatele acceptate")
  ) {
    res.status(400).json({
      code: "INVALID_FILE_TYPE",
      message: error.message,
      errors: [
        {
          field: "images",
          message: error.message,
        },
      ],
    });
    return;
  }

  next(error);
}
