import { Router, Request } from "express";
import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";

import { Message } from "../common/messages";

const prisma = new PrismaClient();
const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

interface CoursePayment extends Request {
  courseId: string;
  successUrl?: Number;
  cancelUrl?: string;
}

router.post("/course", async (req: CoursePayment, res) => {
  try {
    const { courseId, successUrl, cancelUrl } = req.body;

    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
      },
    });

    if (!course) {
      return res.status(400);
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: course.name,
            },
            unit_amount: course.price * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return res.status(200).json({
      data: session,
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(500).json({
      status: 500,
      message: Message.E000023,
    });
  }
});

// router.post("/webhook", async (req, res) => {
//   try {
//     const sig = req.headers["stripe-signature"];

//     let event;

//     try {
//       event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
//     } catch (err) {
//       return res.status(400).send(`Webhook Error: ${err.message}`);
//     }

//     // Handle the event
//     if (event.type === "checkout.session.completed") {
//       const session = event.data.object;
//       const courseId = session.client_reference_id;
//       const studentEmail = session.customer_email;

//       const course = await prisma.course.findUnique({
//         where: {
//           id: courseId,
//         },
//       });

//       const user = await prisma.user.findUnique({
//         where: {
//           email: studentEmail,
//         },
//       });

//       if (!course || !user) {
//         return res.status(400).json({
//           status: 400,
//           message: Message.E000005,
//         });
//       }

//       // add student to course
//       const existingCourseStudent = await prisma.courseStudent.findFirst({
//         where: {
//           courseId: courseId,
//           studentId: user.id,
//         },
//       });

//       if (!existingCourseStudent) {
//         await prisma.courseStudent.create({
//           data: {
//             courseId: courseId,
//             studentId: user.id,
//           },
//         });
//       }

//       return res.status(200).json({
//         status: 200,
//         message: Message.E000026,
//       });
//     }

//     return res.status(204);
//   } catch (error) {
//     console.error(`Error: ${error}`);
//     return res.status(500).json({
//       status: 500,
//       message: Message.E000023,
//     });
//   }
// });

export default router;
