import { Request, Response, NextFunction } from "express";
import { CustomRequest } from "../middleware/isOwner";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
export const addProduct = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productName, price } = req.body;
    console.log(req.params);
    const { id: shopId } = req.params;

    const addedProduct = await prisma.product.create({
      data: {
        productName,
        price,
        shopId: Number(shopId),
      },
    });
    if (!addProduct) {
      throw new ApiError("Failed to add product", 404);
    }
    return res
      .status(200)
      .json(new ApiResponse(201, "Product added successfully"));
  } catch (error) {
    next(error);
  }
};
