import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
interface JwtPayload {
  userId: number;
  email: string;
  username: string;
  iat: number;
  exp: number;
}

interface CustomRequest extends Request {
  user?: JwtPayload;
}

export const getAllShops = async (
  req: Request<{}, {}, {}, { term: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { term } = req.query;
    if (!term) {
      const shops = await prisma.shop.findMany();
      if (!shops || shops.length <= 0) {
        return res.status(400).json(new ApiResponse(400, "No shops found"));
      }
      return res.status(200).json(new ApiResponse(200, "Shops fetched", shops));
    }
    const findSearchedShop = await prisma.shop.findMany({
      where: {
        OR: [
          { name: { contains: term, mode: "insensitive" } },
          { description: { contains: term, mode: "insensitive" } },
          {
            address: {
              OR: [
                { city: { contains: term, mode: "insensitive" } },
                { streetName: { contains: term, mode: "insensitive" } },
              ],
            },
          },
        ],
      },
      include: {
        address: true,
      },
    });
    return res
      .status(200)
      .json(new ApiResponse(200, "Shops fetched", findSearchedShop));
  } catch (error) {
    next(error);
  }
};

export const followShop = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    //take the id of the user from req.user.userId
    //take the id of the shop from the params
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError("User not authenticated", 401);
    }
    const checkFollowing = await prisma.follower.findUnique({
      where: {
        userId_shopId: {
          userId: userId,
          shopId: Number(id),
        },
      },
    });

    if (checkFollowing) {
      //following then unfollow
      await prisma.follower.delete({
        where: {
          userId_shopId: {
            userId: userId,
            shopId: Number(id),
          },
        },
      });
      return res.status(200).json(new ApiResponse(200, "Unfollowed the shop"));
    }
    //then follow
    await prisma.follower.create({
      data: {
        shopId: Number(id),
        userId: Number(userId),
      },
    });
    return res.status(200).json(new ApiResponse(200, "Followed the shop"));
  } catch (error) {
    next(error);
  }
};

interface ShopRequest {
  name: string;
  description: string;
  contact: string;
  address: {
    streetName: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  socialLinks: {
    name: string;
  };
}
export const createShop = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  // model SocialLink {
  //   id     Int    @id @default(autoincrement())
  //   name   String
  //   shopId Int
  //   shop   Shop   @relation(fields: [shopId], references: [id])
  // }
  try {
    const { name, description, contact, address, socialLinks } = req.body;
    if (!name || !description || !contact || !address) {
      throw new ApiError("All fields are required", 400);
    }

    const createdShop = await prisma.shop.create({
      data: {
        name,
        description,
        contact,
        owner: {
          connect: { id: req.user?.userId },
        },
        address: {
          create: {
            streetName: address.streetName,
            city: address.city,
            state: address.state,
            zipCode: address.zipCode,
            country: address.country,
          },
        },
        socialLinks: {
          create: {
            name: socialLinks.name,
          },
        },
      },
      include: {
        address: true,
      },
    });

    return res
      .status(201)
      .json(new ApiResponse(201, "Shop created successfully", createdShop));
  } catch (error) {
    next(error);
  }
};
export const deleteShop = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    await prisma.shop.delete({
      where: {
        id: Number(id),
      },
    });
  } catch (error) {
    next(error);
  }
};
