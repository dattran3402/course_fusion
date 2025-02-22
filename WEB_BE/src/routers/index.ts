import { Router } from "express";

import TestRouter from "./test.route";
import AuthRouter from "./auth.route";
import UserRouter from "./user.route";
import DocumentRouter from "./document.route";
import CourseRouter from "./course.route";
import SectionRouter from "./section.route";
import AssignmentRouter from "./assignment.route";
import QuizRouter from "./quiz.route";
import PaymentRouter from "./payment.route";
import MessageRouter from "./message.route";
import NotificationRouter from "./notification.route";

const router = Router();

router.use("/auth", AuthRouter);
router.use("/user", UserRouter);
router.use("/message", MessageRouter);
router.use("/document", DocumentRouter);
router.use("/course", CourseRouter);
router.use("/section", SectionRouter);
router.use("/assignment", AssignmentRouter);
router.use("/quiz", QuizRouter);
router.use("/payment", PaymentRouter);
router.use("/notification", NotificationRouter);

router.use("/test", TestRouter);

export default router;
