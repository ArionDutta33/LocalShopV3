import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: number;
  email: string;
  role: string;
  username: string;
  iat: number;
  exp: number;
}

interface CustomRequest extends Request {
  user?: JwtPayload;
}

export const isAuthenticated = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"];
    const token =
      (authHeader &&
        authHeader.startsWith("Bearer ") &&
        authHeader.split(" ")[1]) ||
      req.cookies["token"];

    if (!token) {
      return next(new ApiError("Unauthorized: Token missing", 401));
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in env");
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    req.user = decoded;

    console.log("Decoded user:", decoded);

    next();
  } catch (error) {
    next(new ApiError("Unauthorized: Invalid token", 401));
  }
};
