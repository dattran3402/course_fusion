import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

import { Message } from "../common/messages";
import { getUpdateData, getRandomElements } from "../common/helper";

const prisma = new PrismaClient();
const router = Router();

interface ConfigQuizRequest extends Request {
  sectionId: string;
  minutes?: number;
  questionIds?: string[];
  percentToPass?: number;
  configuration?: any;
}

router.post("/config", async (req: ConfigQuizRequest, res: Response) => {
  try {
    const { minutes, sectionId, questionIds, percentToPass, configuration } =
      req.body;

    const exitedData = await prisma.quizConfiguration.findFirst({
      where: {
        sectionId: sectionId,
      },
    });

    const updateFields = { minutes, questionIds, percentToPass, configuration };

    const updateData = getUpdateData(updateFields);

    if (exitedData) {
      await prisma.quizConfiguration.update({
        where: {
          sectionId: sectionId,
        },
        data: updateData,
      });
    } else {
      await prisma.quizConfiguration.create({
        data: {
          ...updateData,
          sectionId: sectionId,
          configuration: configuration,
        },
      });
    }

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

// interface ConfigQuizRequest extends Request {
//   sectionId: string;
//   configuration?: any;
// }

// router.post("/config", async (req: ConfigQuizRequest, res: Response) => {
//   try {
//     const { configuration, sectionId } = req.body;

//     const exitedData = await prisma.quizConfiguration.findFirst({
//       where: {
//         sectionId: sectionId,
//       },
//     });

//     if (exitedData) {
//       await prisma.quizConfiguration.delete({
//         where: {
//           sectionId: sectionId,
//         },
//       });
//     }

//     const newData = await prisma.quizConfiguration.create({
//       data: {
//         sectionId: sectionId,
//         configuration: configuration,
//       },
//     });

//     return res.status(200).json({
//       status: 200,
//       data: newData,
//     });
//   } catch (error) {
//     console.error(`Error: ${error}`);
//     return res.status(500).json({
//       status: 500,
//       message: Message.E000023,
//     });
//   }
// });

interface SubmitQuizRequest extends Request {
  sectionId: string;
  studentId: string;
  submitQuizQuestions?: any;
}

router.post("/submit", async (req: SubmitQuizRequest, res: Response) => {
  try {
    const { sectionId, studentId, submitQuizQuestions } = req.body;

    const exitedData = await prisma.quizStudent.findFirst({
      where: {
        sectionId: sectionId,
        studentId: studentId,
      },
    });

    if (exitedData) {
      await prisma.quizQuestionStudent.deleteMany({
        where: {
          sectionId: sectionId,
          studentId: studentId,
        },
      });

      await prisma.quizStudent.deleteMany({
        where: {
          sectionId: sectionId,
          studentId: studentId,
        },
      });
    }

    let correctCount = 0;
    await Promise.all(
      submitQuizQuestions.map(async (quizQuestion) => {
        await prisma.quizQuestionStudent.deleteMany({
          where: {
            quizQuestionId: quizQuestion.id,
            studentId: studentId,
            sectionId: sectionId,
          },
        });

        const question = await prisma.quizQuestion.findUnique({
          where: {
            id: quizQuestion.id,
          },
        });

        const isCorrect = question.answer === quizQuestion.answer;
        if (isCorrect) {
          correctCount++;
        }

        return prisma.quizQuestionStudent.create({
          data: {
            quizQuestionId: quizQuestion.id,
            studentId: studentId,
            sectionId: sectionId,
            answer: quizQuestion.answer,
            status: isCorrect,
          },
        });
      })
    );

    const newData = await prisma.quizStudent.create({
      data: {
        sectionId: sectionId,
        studentId: studentId,
        correct: correctCount,
        total: submitQuizQuestions.length,
      },
    });

    return res.status(200).json({
      status: 200,
      data: newData,
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(500).json({
      status: 500,
      message: Message.E000023,
    });
  }
});

router.delete("/submit", async (req: SubmitQuizRequest, res: Response) => {
  try {
    const { sectionId, studentId } = req.query;

    const exitedData = await prisma.quizStudent.findFirst({
      where: {
        sectionId: sectionId.toString(),
        studentId: studentId.toString(),
      },
    });

    if (exitedData) {
      await Promise.all([
        await prisma.quizQuestionStudent.deleteMany({
          where: {
            sectionId: sectionId.toString(),
            studentId: studentId.toString(),
          },
        }),
        await prisma.quizStudent.deleteMany({
          where: {
            sectionId: sectionId.toString(),
            studentId: studentId.toString(),
          },
        }),
      ]);
    }

    return res.status(204).json({
      status: 204,
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(500).json({
      status: 500,
      message: Message.E000023,
    });
  }
});

router.get("/submit/all", async (req: Request, res: Response) => {
  try {
    const sectionId = req.query.sectionId.toString();

    const exitedData = await prisma.quizStudent.findMany({
      where: {
        sectionId: sectionId,
      },
    });

    return res.status(200).json({
      status: 200,
      data: exitedData,
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(500).json({
      status: 500,
      message: Message.E000023,
    });
  }
});

router.get("/submit", async (req: Request, res: Response) => {
  try {
    const sectionId = req.query.sectionId.toString();
    const studentId = req.query.studentId.toString();

    const exitedData = await prisma.quizStudent.findFirst({
      where: {
        sectionId: sectionId,
        studentId: studentId,
      },
    });

    if (!exitedData) {
      return res.status(400).json({
        status: 400,
        message: "Not found",
      });
    }

    const quizQuestionStudents = await prisma.quizQuestionStudent.findMany({
      where: {
        sectionId: sectionId,
        studentId: studentId,
      },
    });

    const submittedQuestions = await Promise.all(
      quizQuestionStudents.map(async (quizQuestionStudent) => {
        const quizQuestion = await prisma.quizQuestion.findUnique({
          where: {
            id: quizQuestionStudent.quizQuestionId,
          },
        });

        return {
          ...quizQuestionStudent,
          ...quizQuestion,
          userAnswer: quizQuestionStudent.answer,
          answer: quizQuestion.answer,
        };
      })
    );

    return res.status(200).json({
      status: 200,
      data: {
        submittedQuestions,
        quizStudent: exitedData,
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

router.get("/config/:sectionId", async (req: Request, res: Response) => {
  try {
    const { sectionId } = req.params;

    const newData = await prisma.quizConfiguration.findFirst({
      where: {
        sectionId: sectionId,
      },
    });

    return res.status(200).json({
      status: 200,
      data: newData,
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(500).json({
      status: 500,
      message: Message.E000023,
    });
  }
});

router.get("/tags/:courseId", async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;

    const quizQuestions = await prisma.quizQuestion.findMany({
      where: {
        courseId: courseId,
      },
    });

    const tags = quizQuestions.map((quizQuestion) => quizQuestion.tags).flat();

    return res.status(200).json({
      status: 200,
      data: [...new Set(tags.filter((tag) => tag))],
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(500).json({
      status: 500,
      message: Message.E000023,
    });
  }
});

router.get("/question/by-ids", async (req: Request, res: Response) => {
  try {
    const { id } = req.query;

    let ids = id ? id.toString().split(",") : [];

    const data = await prisma.quizQuestion.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return res.status(200).json({
      status: 200,
      data: data,
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(500).json({
      status: 500,
      message: Message.E000023,
    });
  }
});

router.get("/question/random", async (req: Request, res: Response) => {
  try {
    const { tag, courseId, limit } = req.query;

    let tagIds = tag ? tag.toString().split(",") : [];

    const whereCondition: any = {
      courseId: courseId.toString(),
      sectionId: "",
    };

    let allQuizQuestions = await prisma.quizQuestion.findMany({
      where: whereCondition,
    });

    if (tagIds.length > 0) {
      allQuizQuestions = allQuizQuestions.filter((question) => {
        if (Array.isArray(question.tags) && question.tags.length > 0) {
          if (
            tagIds.every(
              (element) =>
                Array.isArray(question.tags) && question.tags.includes(element)
            )
          ) {
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      });
    }

    allQuizQuestions = getRandomElements(allQuizQuestions, Number(limit));

    return res.status(200).json({
      status: 200,
      data: allQuizQuestions,
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(500).json({
      status: 500,
      message: Message.E000023,
    });
  }
});

router.get("/question", async (req: Request, res: Response) => {
  try {
    const { tag, courseId, sectionId } = req.query;

    let tagIds = tag ? tag.toString().split(",") : [];

    const whereCondition: any = {
      courseId: courseId.toString(),
      sectionId: sectionId ? sectionId.toString() : "",
    };

    let allQuizQuestions = await prisma.quizQuestion.findMany({
      where: whereCondition,
    });

    if (tagIds.length > 0) {
      allQuizQuestions = allQuizQuestions.filter((question) => {
        if (Array.isArray(question.tags)) {
          for (let i = 0; i < question.tags.length; i++) {
            if (tagIds.includes(question.tags[i].toString())) {
              return true;
            }
          }
        }
        return false;
      });
    }

    return res.status(200).json({
      status: 200,
      data: allQuizQuestions,
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(500).json({
      status: 500,
      message: Message.E000023,
    });
  }
});

interface CreateQuestionRequest extends Request {
  courseId?: string;
  sectionId?: string;
  type?: string;
  question?: string;
  options?: {
    id: string;
    content: string;
  }[];
  answer?: string;
  tags?: string[];
}

router.post("/question", async (req: CreateQuestionRequest, res: Response) => {
  try {
    const { courseId, type, question, options, answer, tags, sectionId } =
      req.body;

    const formattedOptions = options
      ?.filter((option) => option.content.trim() !== "")
      .map((option) => ({
        id: option.id,
        content: option.content.trim(),
      }));

    const formattedTags = tags?.filter((tag) => tag.trim() !== "");

    const newQuizQuestion = await prisma.quizQuestion.create({
      data: {
        type: type,
        question: question,
        options: formattedOptions,
        answer: answer,
        tags: formattedTags,
        courseId: courseId,
        sectionId: sectionId,
      },
    });

    return res.status(200).json({
      status: 200,
      data: newQuizQuestion,
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(500).json({
      status: 500,
      message: Message.E000023,
    });
  }
});

router.put(
  "/question/:questionId",
  async (req: CreateQuestionRequest, res: Response) => {
    try {
      const { questionId } = req.params;
      const { type, question, options, answer, tags, courseId, sectionId } =
        req.body;

      const updateFields = {
        type,
        question,
        answer,
        courseId,
        sectionId,
      };

      const updateData: any = getUpdateData(updateFields);

      if (options !== undefined) {
        const formattedOptions = options
          ?.filter((option) => option.content.trim() !== "")
          .map((option) => ({
            id: option.id,
            content: option.content.trim(),
          }));

        updateData.options = formattedOptions;
      }

      if (tags !== undefined) {
        const formattedTags = tags?.filter((tag) => tag.trim() !== "");

        updateData.tags = formattedTags;
      }

      const newQuizQuestion = await prisma.quizQuestion.update({
        where: {
          id: questionId,
        },
        data: updateData,
      });

      return res.status(200).json({
        status: 200,
        data: newQuizQuestion,
      });
    } catch (error) {
      console.error(`Error: ${error}`);
      return res.status(500).json({
        status: 500,
        message: Message.E000023,
      });
    }
  }
);

router.delete(
  "/question/:questionId",
  async (req: CreateQuestionRequest, res: Response) => {
    try {
      const { questionId } = req.params;

      await prisma.quizQuestion.delete({
        where: {
          id: questionId,
        },
      });

      return res.status(204).json({
        status: 204,
      });
    } catch (error) {
      console.error(`Error: ${error}`);
      return res.status(500).json({
        status: 500,
        message: Message.E000023,
      });
    }
  }
);

// router.post("/:courseId", async (req: CreateQuestionRequest, res: Response) => {
//   try {
//     const { questions } = req.body;
//     const { courseId } = req.params;

//     // delete old data
//     await prisma.quizQuestion.deleteMany({
//       where: {
//         courseId: courseId,
//       },
//     });

//     const newQuizQuestions = await prisma.quizQuestion.createMany({
//       data: questions.map((question) => {
//         const formattedOptions = question.options
//           ?.filter((option) => option.content.trim() !== "")
//           .map((option) => ({
//             id: option.id,
//             content: option.content.trim(),
//           }));

//         const formattedTags = question.tags?.filter((tag) => tag.trim() !== "");

//         return {
//           type: question.type,
//           question: question.question,
//           options: formattedOptions,
//           answer: question.answer,
//           tags: formattedTags,
//           courseId: courseId,
//         };
//       }),
//     });

//     return res.status(200).json({
//       status: 200,
//       data: newQuizQuestions,
//     });
//   } catch (error) {
//     console.error(`Error: ${error}`);
//     return res.status(500).json({
//       status: 500,
//       message: Message.E000023,
//     });
//   }
// });

router.get("/:courseId", async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;

    const quizQuestions = await prisma.quizQuestion.findMany({
      where: {
        courseId: courseId,
      },
    });

    return res.status(200).json({
      status: 200,
      data: quizQuestions,
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(500).json({
      status: 500,
      message: Message.E000023,
    });
  }
});

interface MoveQuestionToQuiz extends Request {
  quizQuestionId: string;
  sectionId: string;
  order?: number;
}

router.post("/move", async (req: MoveQuestionToQuiz, res: Response) => {
  try {
    const { quizQuestionId, sectionId, order } = req.params;

    const newData = await prisma.quizQuestionSection.create({
      data: {
        quizQuestionId: quizQuestionId,
        sectionId: sectionId,
        order: order ? Number(order) : null,
      },
    });

    return res.status(200).json({
      status: 200,
      data: newData,
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
