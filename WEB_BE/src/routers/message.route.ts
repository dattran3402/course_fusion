import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

import { Message } from "../common/messages";

const prisma = new PrismaClient();
const router = Router();

interface CreateMessageRequest extends Request {
  userId: string;
  courseId: string;
  data: any;
}

router.post("/", async (req: CreateMessageRequest, res: Response) => {
  try {
    const { userId, courseId, data } = req.body;

    const newData = await prisma.message.create({
      data: {
        userId: userId,
        courseId: courseId,
        data: data,
      },
    });

    return res.status(200).json({
      message: Message.E000039,
      data: newData,
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(500);
  }
});

router.delete("/:userId/:courseId", async (req: Request, res: Response) => {
  try {
    const { userId, courseId } = req.params;

    await prisma.message.deleteMany({
      where: {
        userId,
        courseId,
      },
    });

    return res.status(204).json({
      status: 204,
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(500);
  }
});

router.get("/:userId/:courseId", async (req: Request, res: Response) => {
  try {
    const { userId, courseId } = req.params;

    console.log("userId", userId);
    console.log("courseId", courseId);

    const data = await prisma.message.findMany({
      where: {
        userId,
        courseId,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: 0,
      take: 20,
    });

    return res.status(200).json({
      status: 200,
      data: data,
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(500);
  }
});

export default router;
