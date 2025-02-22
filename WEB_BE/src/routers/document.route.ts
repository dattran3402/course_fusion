import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import path from "path";
import { v4 as uuidv4 } from "uuid";
// import fs from "fs";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3 } from "aws-sdk";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getVideoDurationInSeconds } from "get-video-duration";
import fs from "fs";

import { Message } from "../common/messages";
import { uploadMiddleware } from "../middlewares/upload.middleware";

const prisma = new PrismaClient();
const router = Router();

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

router.delete("/by-id/:documentId", async (req, res) => {
  try {
    const documentId = req.params.documentId;

    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return res.status(404).json({
        status: 404,
        message: Message.E000009,
      });
    }

    // Delete the file from AWS S3
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: documentId,
    };

    await s3.deleteObject(params).promise();

    // Delete the document from the database
    await prisma.document.delete({
      where: {
        id: documentId,
      },
    });

    res.status(200).json({
      status: 200,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
});

router.post("/upload", uploadMiddleware(), async (req: any, res) => {
  try {
    if (!req.file) {
      return res.status(404).json({
        status: 200,
        message: "File not found",
      });
    }

    const fileId = uuidv4();

    const fileContent = req.file.buffer;

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileId,
      Body: fileContent,
      ContentType: req.file.mimetype,
    };

    let videoDuration = 0;
    if (req.file.mimetype.includes("video")) {
      const tempDir = path.join(__dirname, "../..", "temp");
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }

      const tempFilePath = path.join(tempDir, fileId);
      fs.writeFileSync(tempFilePath, fileContent);

      videoDuration = await getVideoDurationInSeconds(tempFilePath);

      fs.unlinkSync(tempFilePath);
    }

    const uploadResult = await s3.upload(params).promise();

    if (uploadResult) {
      const newDocument = await prisma.document.create({
        data: {
          id: fileId,
          name: req.file.originalname,
          size: req.file.size,
          type: req.file.mimetype,
          duration: videoDuration,
        },
      });

      return res.status(200).json({
        status: 200,
        message: Message.E000013,
        data: newDocument,
      });
    } else {
      return res.status(500).json({
        status: 500,
        message: Message.E000023,
      });
    }
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(500).json({
      status: 500,
      message: Message.E000023,
    });
  }
});

router.get("/detail/:documentId", async (req, res) => {
  try {
    const document = await prisma.document.findUnique({
      where: {
        id: req.params.documentId,
      },
    });

    if (!document) {
      return res.status(404).json({
        status: 404,
        message: Message.E000009,
      });
    }

    let documentSection;
    documentSection = await prisma.documentSection.findFirst({
      where: {
        documentId: req.params.documentId,
      },
    });

    if (!documentSection) {
      documentSection = await prisma.documentAssignment.findFirst({
        where: {
          documentId: req.params.documentId,
        },
      });
    }

    return res.status(200).json({
      status: 200,
      data: {
        ...document,
        sectionId: documentSection ? documentSection.sectionId : "",
      },
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(500).json({
      status: 500,
      message: Message.E000023,
    });
  }
});

router.get("/view/:documentId", async (req, res) => {
  try {
    const documentId = req.params.documentId;

    const document = await prisma.document.findUnique({
      where: {
        id: documentId,
      },
    });

    if (!document) {
      return res.status(404).json({
        status: 404,
        message: Message.E000009,
      });
    }

    const url = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: documentId,
      }),
      { expiresIn: 3600 }
    );

    return res.redirect(url);
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(500).json({
      status: 500,
      message: Message.E000023,
    });
  }
});

router.get("/url/:documentId", async (req, res) => {
  try {
    const documentId = req.params.documentId;

    const document = await prisma.document.findUnique({
      where: {
        id: documentId,
      },
    });

    if (!document) {
      return res.status(404).json({
        status: 404,
        message: Message.E000009,
      });
    }

    const url = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: documentId,
      }),
      { expiresIn: 3600 }
    );

    return res.status(200).json({
      status: 200,
      data: url,
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
