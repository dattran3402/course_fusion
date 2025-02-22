import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer";

import { Message } from "../common/messages";
import { UserRole } from "../common/enums";

const prisma = new PrismaClient();
const router = Router();

interface SignUpRequest extends Request {
  email: string;
  password: string;
  name: string;
}

router.post("/sign-up", async (req: SignUpRequest, res) => {
  try {
    const { email, password, name } = req.body;

    const existedUser = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (existedUser) {
      return res.status(400).json({
        status: 400,
        message: Message.E000003,
      });
    }

    const newUser = await prisma.user.create({
      data: {
        email: email,
        password: password,
        name: name,
        role: UserRole.NORMAL,
        isBlocked: false,
      },
    });

    return res.status(200).json({
      status: 200,
      message: Message.E000001,
      data: newUser,
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(500).json({
      status: 500,
      message: Message.E000023,
    });
  }
});

interface SignInRequest extends Request {
  email: string;
  password: string;
}

router.post("/sign-in", async (req: SignInRequest, res) => {
  try {
    const { email, password } = req.body;

    const existedUser = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
        password: password,
        isBlocked: false,
      },
    });

    if (!existedUser) {
      return res.status(400).json({
        status: 400,
        message: Message.E000005,
      });
    }

    return res.status(200).json({
      status: 200,
      message: Message.E000002,
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

router.get("/password/:email", async (req: Request, res) => {
  try {
    const email = req.params.email.toString();

    const existedUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!existedUser) {
      return res.status(400).json({
        status: 400,
        message: Message.E000005,
      });
    }

    const verifyCode = uuidv4();

    await prisma.user.update({
      where: {
        email: email,
      },
      data: {
        verifyCode: verifyCode,
      },
    });

    const verifyUrl =
      process.env.CLIENT_URL +
      "/auth/password?verifyCode=" +
      verifyCode +
      "&userId=" +
      existedUser.id;

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      host: "smtp.gmail.com",
      port: 587,
      auth: {
        user: process.env.SMTP_EMAIL_ADDRESS, // Your email address
        pass: process.env.SMTP_EMAIL_PASSWORD, // Your password
      },
    });

    const yourHTMLContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Email Example</title>
        <style>
          /* Your CSS styles here */
        </style>
      </head>
      <body>
        <a href="${verifyUrl}">Click to change your password!</a>
      </body>
      </html> 
    `;

    const mailOptions = {
      from: process.env.SMTP_EMAIL_ADDRESS,
      to: email,
      subject: "CourseFusion - Change password",
      html: yourHTMLContent,
    };

    let message = "";
    await new Promise((resolve) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          message = "Email sending failed:" + error;
        } else {
          message = "Email sent: " + info.response;
        }
        resolve(true);
      });
    });

    return res.status(200).json({
      status: 200,
      message: message,
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
