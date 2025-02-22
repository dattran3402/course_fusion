import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

import { Message } from "../common/messages";
import { getUpdateData } from "../common/helper";

const prisma = new PrismaClient();
const router = Router();

interface CreateNotificationRequest extends Request {
  userId?: string;
  userIds?: string[];
  content?: string;
  link?: string;
}

router.post("/", async (req: CreateNotificationRequest, res: Response) => {
  try {
    const { userIds, content, link } = req.body;

    console.log("userIds", userIds);

    const promises = userIds.map(async (id) => {
      return await prisma.notification.create({
        data: {
          userId: id ? id : "",
          content: content,
          link: link,
        },
      });
    });

    await Promise.all(promises);

    return res.status(200).json({
      status: 200,
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(500).json({
      status: 500,
      message: Message.E000023,
    });
  }
});

interface UpdateNotificationRequest extends Request {
  id: string;
  userId?: string;
  content?: string;
  link?: string;
  isViewed?: boolean;
}

router.put("/", async (req: UpdateNotificationRequest, res: Response) => {
  try {
    const { id, userId, content, link, isViewed } = req.body;

    const updateFields = {
      userId: userId,
      content: content,
      link: link,
      isViewed: isViewed,
    };

    const updateData = getUpdateData(updateFields);

    await prisma.notification.update({
      where: {
        id: id,
      },
      data: updateData,
    });

    return res.status(200).json({
      status: 200,
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(500).json({
      status: 500,
      message: Message.E000023,
    });
  }
});

router.get("/", async (req, res: Response) => {
  try {
    const userId = req.cookies.userId;

    const notification = await prisma.notification.findMany({
      where: {
        OR: [
          {
            userId: userId,
          },
          {
            userId: "",
          },
        ],
      },
      skip: 0,
      take: 50,
    });

    return res.status(200).json({
      status: 200,
      data: notification,
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
