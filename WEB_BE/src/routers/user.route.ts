import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

import { Message } from "../common/messages";
import { getUpdateData } from "../common/helper";

const prisma = new PrismaClient();
const router = Router();

router.get("/all", async (req: Request, res: Response) => {
  try {
    const query = req.query.query ? req.query.query.toString() : "";
    const isBlocked = req.query.isBlocked;

    const whereCondition: any = {
      OR: [
        {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: query,
            mode: "insensitive",
          },
        },
      ],
    };

    if (isBlocked === "true") {
      whereCondition.isBlocked = true;
    } else if (isBlocked === "false") {
      whereCondition.isBlocked = false;
    }

    const [users, totalUsers] = await Promise.all([
      prisma.user.findMany({
        where: whereCondition,
      }),
      prisma.user.count({
        where: whereCondition,
      }),
    ]);

    return res.status(200).json({
      status: 200,
      data: users,
      total: totalUsers,
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(500).json({
      status: 500,
      message: "Internal server error.",
    });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const existedUser = await prisma.user.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!existedUser) {
      return res.status(400).json({
        status: 400,
        message: Message.E000031,
      });
    }

    return res.status(200).json({
      status: 200,
      message: Message.E000039,
      data: existedUser,
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(500).json({
      status: 500,
      message: Message.E000023,
    });
  }
});

router.delete("/:userId", async (req: any, res) => {
  try {
    const userId = req.params.userId;

    await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    res.status(200).json({
      status: 200,
      message: Message.E000012,
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(500).json({
      status: 500,
      message: Message.E000023,
    });
  }
});

interface UpdateUserRequest extends Request {
  role?: string;
  email?: string;
  userId?: string;
  name?: string;
  avatarFileId?: string;
  password?: string;
  headline?: string;
  biography?: string;
  website?: string;
  twitter?: string;
  facebook?: string;
  linkedIn?: string;
  youtube?: string;
  stripeCustomerId?: string;
  isBlocked?: boolean;
  favouriteCourseIds?: string[];
}

router.put("/", async (req: UpdateUserRequest, res: Response) => {
  try {
    const {
      userId,
      role,
      name,
      email,
      avatarFileId,
      password,
      headline,
      biography,
      website,
      twitter,
      facebook,
      linkedIn,
      youtube,
      stripeCustomerId,
      isBlocked,
      favouriteCourseIds,
    } = req.body;

    const updateFields = {
      role,
      name,
      avatarFileId,
      password,
      headline,
      biography,
      website,
      twitter,
      facebook,
      linkedIn,
      youtube,
      stripeCustomerId,
      isBlocked,
      favouriteCourseIds,
    };

    const updateData = getUpdateData(updateFields);

    let existedUser = null;
    if (userId) {
      existedUser = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });
    } else if (email) {
      existedUser = await prisma.user.findUnique({
        where: {
          email: email,
        },
      });
    }

    if (!existedUser) {
      return res.status(400).json({
        status: 400,
        message: Message.E000031,
      });
    }

    await prisma.user.update({
      where: {
        id: existedUser.id,
      },
      data: updateData,
    });

    return res.status(200).json({
      status: 200,
      data: existedUser,
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(500).json({
      status: 500,
      message: Message.E000023,
    });
  }
});

export default router;
