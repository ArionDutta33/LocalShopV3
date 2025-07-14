import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

export interface CustomRequest extends Request {
  user?: {
    userId: number;
    email: string;
    role: string;
    username: string;
    iat: number;
    exp: number;
  };
}

export const isOwner = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(new ApiError("Unauthorized: No user info found", 401));
  }

  if (req.user.role.trim() !== "owner") {
    return next(
      new ApiError("Forbidden: Only owners can perform this action", 403)
    );
  }

  next();
};
