import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

router.get("/", (req, res) => {
  res.send("App started").status(200);
});

router.get("/helloworld", (req, res) => {
  res.send("Hello, World!").status(200);
});

router.get("/siu", (req, res) => {
  res.send("Siuu").status(200);
});

router.get("/get-cookies", (req, res) => {
  const cookies = req.cookies;

  if (cookies) {
    res.status(200).json({ cookies, userId: cookies.userId });
  } else {
    res.status(404).json({ message: "Cookies not found" });
  }
});

export default router;
