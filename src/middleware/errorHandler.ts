import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

export const globalErrorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  } else {
    console.error("UNEXPECTED ERROR:", err);

    res.status(500).json({
      status: "error",
      message: "Something went wrong!",
    });
  }
};
