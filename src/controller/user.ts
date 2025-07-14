import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { prisma } from "../lib/prisma";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { ApiResponse } from "../utils/ApiResponse";
interface RegisterUserInput {
  id: string;
  username: string;
  email: string;
  password: string;
  contactNo?: string;
  createdAt: Date;
  updatedAt: Date;
}
interface LoginUserInput {
  email: string;
  password: string;
}
export const registerUser = async (
  req: Request<{}, {}, RegisterUserInput, {}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, username, password } = req.body;
    if (!email || !username || !password) {
      console.log("no creds");
      throw new ApiError("All fields are required", 404);
    }
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (existingUser) {
      console.log("Al ready existing");

      throw new ApiError("User already registered", 404);
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const createdUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashPassword,
      },
      select: {
        username: true,
        email: true,
      },
    });
    return res
      .status(200)
      .json(new ApiResponse(200, "User registered successfully", createdUser));
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (
  req: Request<{}, {}, LoginUserInput, {}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new ApiError("Invalid credentials", 404);
    }
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (!existingUser) {
      throw new ApiError("Registration is required", 400);
    }
    const passwordMatch = await bcrypt.compare(password, existingUser.password);
    if (!passwordMatch) {
      throw new ApiError("Invalid credentials", 400);
    }
    const payload = {
      userId: existingUser.id,
      email: existingUser.email,
      username: existingUser.username,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });
    return res.status(200).json(new ApiResponse(200, "Log In success", token));
  } catch (error) {
    next(error);
  }
};
