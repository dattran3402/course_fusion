import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

import { Message } from "../common/messages";
import { CourseStatus } from "../common/enums";
import { getUpdateData } from "../common/helper";

const prisma = new PrismaClient();
const router = Router();

interface CreateCourseRequest extends Request {
  teacherId: string;
  name: string;
  price: number;
  backgroundFileId?: string;
  description?: string;
}

router.post("/", async (req: CreateCourseRequest, res: Response) => {
  try {
    const userId = req.cookies.userId;

    const { name, backgroundFileId, description, price = 0 } = req.body;

    const newCourse = await prisma.course.create({
      data: {
        teacherId: userId,
        backgroundFileId: backgroundFileId,
        name: name,
        description: description,
        price: price,
        status: CourseStatus.PRIVATE,
      },
    });

    await prisma.courseStudent.create({
      data: {
        courseId: newCourse.id,
        studentId: userId,
        price: 0,
      },
    });

    return res.status(200).json({
      status: 200,
      data: newCourse,
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(500).json({
      status: 500,
      message: Message.E000023,
    });
  }
});

interface EditCourseRequest extends Request {
  name?: string;
  backgroundFileId?: string;
  price?: number;
  courseId: string;
  tags: string[];
  description?: string;
  whatWillLearn?: string;
  requirements?: string;
  whoThisCourseFor?: string;
  status?: string;
  promoVideoFileId?: string;
  subtitle?: string;
  requiresSequentialViewing?: boolean;
  percentToViewNext?: number;
}

router.put("/", async (req: EditCourseRequest, res: Response) => {
  try {
    const {
      name,
      backgroundFileId,
      price,
      courseId,
      status,
      tags,
      description,
      whatWillLearn,
      requirements,
      whoThisCourseFor,
      promoVideoFileId,
      subtitle,
      requiresSequentialViewing,
      percentToViewNext,
    } = req.body;

    const updateFields = {
      backgroundFileId,
      name,
      price,
      status,
      tags,
      description,
      whatWillLearn,
      requirements,
      whoThisCourseFor,
      promoVideoFileId,
      subtitle,
      requiresSequentialViewing,
      percentToViewNext,
    };

    const updateData = getUpdateData(updateFields);

    const newCourse = await prisma.course.update({
      where: {
        id: courseId,
      },
      data: updateData,
    });

    return res.status(200).json({
      status: 200,
      data: newCourse,
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(500).json({
      status: 500,
      message: Message.E000023,
    });
  }
});

router.get("/tags", async (req: Request, res: Response) => {
  try {
    const courses = await prisma.course.findMany();

    if (!courses) {
      return res.status(400).json({
        status: 400,
        message: "User or course not found",
      });
    }

    // add student to course
    const tags = courses
      .map((course) => course.tags)
      .flat()
      .filter((tag) => tag);

    return res.status(200).json({
      status: 200,
      data: tags,
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(500).json({
      status: 500,
      message: Message.E000023,
    });
  }
});

router.get("/all", async (req: Request, res: Response) => {
  try {
    const name = req.query.name ? req.query.name.toString() : "";
    const status = req.query.status;

    const whereCondition: any = {
      name: {
        contains: name,
        mode: "insensitive",
      },
    };

    if (status !== undefined) {
      whereCondition.status = status;
    }

    const courses = await prisma.course.findMany({
      where: whereCondition,
    });

    return res.status(200).json({
      status: 200,
      data: courses,
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(500).json({
      status: 500,
      message: "Internal server error.",
    });
  }
});

router.get("/course-student", async (req: Request, res: Response) => {
  try {
    const studentId = req.cookies.userId;
    const courseId = req.query.courseId.toString();

    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
    });

    const user = await prisma.user.findUnique({
      where: {
        id: studentId,
      },
    });

    if (!course || !user) {
      return res.status(400).json({
        status: 400,
        message: "User or course not found",
      });
    }

    // add student to course
    const existingCourseStudent = await prisma.courseStudent.findFirst({
      where: {
        courseId: courseId,
        studentId: studentId,
      },
    });

    return res.status(200).json({
      status: 200,
      data: existingCourseStudent,
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(500).json({
      status: 500,
      message: Message.E000023,
    });
  }
});

// get courses
// const addMetaDataToCourseList = async (courses) => {
//   const promises = courses.map(async (course) => {
//     const totalStudents = await prisma.courseStudent.count({
//       where: {
//         courseId: course.id,
//       },
//     });
//     return {
//       ...course,
//       totalStudents,
//     };
//   });

//   return await Promise.all(promises);
// };

router.get("/my-learning", async (req: Request, res: Response) => {
  try {
    const name = req.query.name ? req.query.name.toString() : "";
    const userId = req.cookies.userId;
    const page = req.query.page ? parseInt(req.query.page.toString(), 10) : 1;
    const pageSize = req.query.pageSize
      ? parseInt(req.query.pageSize.toString(), 10)
      : 1000;

    const skip = (page - 1) * pageSize;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return res.status(400).json({
        status: 400,
        message: "User not found.",
      });
    }

    let courses: any = [];
    let totalCourses: number = 0;

    const courseIds = await prisma.courseStudent
      .findMany({
        where: {
          studentId: userId,
        },
      })
      .then((courseStudents) =>
        courseStudents.map((courseStudent) => courseStudent.courseId)
      );

    courses = await prisma.course.findMany({
      where: {
        id: {
          in: courseIds,
        },
        name: {
          contains: name,
          mode: "insensitive",
        },
      },
      skip: skip,
      take: pageSize,
    });
    // courses = await addMetaDataToCourseList(courses);

    totalCourses = await prisma.course.count({
      where: {
        id: {
          in: courseIds,
        },
        name: {
          contains: name,
          mode: "insensitive",
        },
      },
    });

    if (!courses) {
      return res.status(400).json({
        status: 400,
        message: "No courses found matching the search criteria.",
      });
    }

    return res.status(200).json({
      status: 200,
      data: courses,
      total: totalCourses,
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(500).json({
      status: 500,
      message: "Internal server error.",
    });
  }
});

router.get("/top-rated", async (req: Request, res: Response) => {
  try {
    const name = req.query.name ? req.query.name.toString() : "";
    const page = req.query.page ? parseInt(req.query.page.toString(), 10) : 1;
    const pageSize = req.query.pageSize
      ? parseInt(req.query.pageSize.toString(), 10)
      : 1000;

    const skip = (page - 1) * pageSize;

    const whereCondition: any = {
      name: {
        contains: name,
        mode: "insensitive",
      },
      status: CourseStatus.PUBLIC,
    };

    let [courses, totalCourses] = await Promise.all([
      prisma.course.findMany({
        where: whereCondition,
        skip: skip,
        take: pageSize,
        orderBy: {
          totalReviewStar: "desc",
        },
      }),
      prisma.course.count({
        where: whereCondition,
      }),
    ]);

    return res.status(200).json({
      status: 200,
      data: courses,
      total: totalCourses,
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(500).json({
      status: 500,
      message: "Internal server error.",
    });
  }
});

router.get("/populate", async (req: Request, res: Response) => {
  try {
    const name = req.query.name ? req.query.name.toString() : "";
    const page = req.query.page ? parseInt(req.query.page.toString(), 10) : 1;
    const pageSize = req.query.pageSize
      ? parseInt(req.query.pageSize.toString(), 10)
      : 1000;

    const skip = (page - 1) * pageSize;

    const whereCondition: any = {
      name: {
        contains: name,
        mode: "insensitive",
      },
      status: CourseStatus.PUBLIC,
    };

    let [courses, totalCourses] = await Promise.all([
      prisma.course.findMany({
        where: whereCondition,
        skip: skip,
        take: pageSize,
        orderBy: {
          totalStudents: "desc",
        },
      }),
      prisma.course.count({
        where: whereCondition,
      }),
    ]);

    // courses = await addMetaDataToCourseList(courses);

    return res.status(200).json({
      status: 200,
      data: courses,
      total: totalCourses,
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(500).json({
      status: 500,
      message: "Internal server error.",
    });
  }
});

router.get("/public", async (req: Request, res: Response) => {
  try {
    const name = req.query.name ? req.query.name.toString() : "";
    const page = req.query.page ? parseInt(req.query.page.toString(), 10) : 1;
    const pageSize = req.query.pageSize
      ? parseInt(req.query.pageSize.toString(), 10)
      : 1000;

    const skip = (page - 1) * pageSize;

    const whereCondition: any = {
      OR: [
        {
          name: {
            contains: name,
            mode: "insensitive", // Optional: This makes the search case-insensitive
          },
        },
        {
          tags: {
            array_contains: name, // This assumes 'tags' is a JSON array and we want to check if 'query' is one of the elements
          },
        },
      ],
      status: CourseStatus.PUBLIC,
    };

    let [courses, totalCourses] = await Promise.all([
      prisma.course.findMany({
        where: whereCondition,
        skip: skip,
        take: pageSize,
      }),
      prisma.course.count({
        where: whereCondition,
      }),
    ]);

    // courses = await addMetaDataToCourseList(courses);

    return res.status(200).json({
      status: 200,
      data: courses,
      total: totalCourses,
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(500).json({
      status: 500,
      message: "Internal server error.",
    });
  }
});

router.get("/new", async (req: Request, res: Response) => {
  try {
    const name = req.query.name ? req.query.name.toString() : "";
    const page = req.query.page ? parseInt(req.query.page.toString(), 10) : 1;
    const pageSize = req.query.pageSize
      ? parseInt(req.query.pageSize.toString(), 10)
      : 1000;

    const skip = (page - 1) * pageSize;

    const whereCondition: any = {
      name: {
        contains: name,
        mode: "insensitive",
      },
      status: CourseStatus.PUBLIC,
    };

    let [courses, totalCourses] = await Promise.all([
      prisma.course.findMany({
        where: whereCondition,
        skip: skip,
        take: pageSize,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.course.count({
        where: whereCondition,
      }),
    ]);

    // courses = await addMetaDataToCourseList(courses);

    return res.status(200).json({
      status: 200,
      data: courses,
      total: totalCourses,
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(500).json({
      status: 500,
      message: "Internal server error.",
    });
  }
});

router.get("/by", async (req, res) => {
  try {
    const teacherId = req.query.teacherId.toString();
    const name = req.query.name ? req.query.name.toString() : "";
    const page = req.query.page ? parseInt(req.query.page.toString(), 10) : 1;
    const pageSize = req.query.pageSize
      ? parseInt(req.query.pageSize.toString(), 10)
      : 1000;
    const status = req.query.status;

    const skip = (page - 1) * pageSize;

    const whereCondition: any = {
      teacherId: teacherId,
      name: {
        contains: name,
        mode: "insensitive",
      },
    };

    if (status !== undefined) {
      whereCondition.status = status;
    }

    let [courses, totalCourses] = await Promise.all([
      prisma.course.findMany({
        where: whereCondition,
        skip: skip,
        take: pageSize,
      }),
      prisma.course.count({
        where: whereCondition,
      }),
    ]);

    return res.status(200).json({
      status: 200,
      data: courses,
      total: totalCourses,
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(500).json({
      status: 500,
      message: Message.E000023,
    });
  }
});

router.get("/:courseId", async (req: Request, res: Response) => {
  try {
    const courseId = req.params.courseId;
    const userId = req.cookies.userId;

    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
        OR: [
          {
            status: CourseStatus.PUBLIC,
          },
          {
            teacherId: userId,
          },
        ],
      },
    });

    if (!course) {
      return res.status(400).json({
        status: 400,
        message: Message.E000005,
      });
    }

    return res.status(200).json({
      status: 200,
      data: course,
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(500).json({
      status: 500,
      message: Message.E000023,
    });
  }
});

interface StudentsRequest extends Request {
  studentId: string;
  courseId: string;
  price: number;
}

router.post("/students", async (req: StudentsRequest, res: Response) => {
  try {
    const { studentId, courseId, price } = req.body;

    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
    });

    if (!course) {
      return res.status(400).json({
        status: 400,
        message: "Course not found",
      });
    }

    // add student to course
    const existingCourseStudent = await prisma.courseStudent.findFirst({
      where: {
        courseId,
        studentId,
      },
    });

    if (!existingCourseStudent) {
      await Promise.all([
        await prisma.courseStudent.create({
          data: {
            courseId,
            studentId,
            price,
          },
        }),
        await prisma.course.update({
          where: {
            id: courseId,
          },
          data: {
            totalStudents: course.totalStudents + 1,
          },
        }),
      ]);
    }

    return res.status(200).json({
      status: 200,
      message: Message.E000026,
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(500).json({
      status: 500,
      message: Message.E000023,
    });
  }
});

interface StudentsRequest extends Request {
  studentId: string;
  courseId: string;
  chatbotInstructions?: string;
  chatbotDocumentIds?: string[];
  finishedDate?: Date;
  reviewStar?: number;
  reviewContent?: string;
}

router.put("/students", async (req: StudentsRequest, res: Response) => {
  try {
    const {
      studentId,
      courseId,
      chatbotInstructions,
      chatbotDocumentIds,
      finishedDate,
      reviewStar,
      reviewContent,
    } = req.body;

    const courseStudent = await prisma.courseStudent.findFirst({
      where: {
        courseId,
        studentId,
      },
    });

    if (!courseStudent) {
      return res.status(404).json({
        status: 404,
        message: "Student not in course",
      });
    }

    const updateFields = {
      chatbotInstructions,
      chatbotDocumentIds,
      finishedDate,
      reviewStar,
      reviewContent,
    };

    const updateData = getUpdateData(updateFields);

    const updateResult = await prisma.courseStudent.updateMany({
      where: {
        courseId,
        studentId,
      },
      data: updateData,
    });

    if (reviewStar) {
      const course = await prisma.course.findFirst({
        where: {
          id: courseId,
        },
      });

      if (reviewStar !== -1) {
        await prisma.course.update({
          where: {
            id: courseId,
          },
          data: {
            totalReviewStar: course.totalReviewStar + Number(reviewStar),
            totalReview: course.totalReview + 1,
          },
        });
      } else if (reviewStar === -1) {
        await prisma.course.update({
          where: {
            id: courseId,
          },
          data: {
            totalReviewStar:
              course.totalReviewStar - Number(courseStudent.reviewStar),
            totalReview: course.totalReview - 1,
          },
        });
      }
    }

    return res.status(200).json({
      status: 200,
      data: updateResult,
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(500).json({
      status: 500,
      message: Message.E000023,
    });
  }
});

router.get(
  "/students/relation/:courseStudentId",
  async (req: Request, res: Response) => {
    try {
      const courseStudentId = req.params.courseStudentId.toLocaleString();

      const courseStudents = await prisma.courseStudent.findFirst({
        where: {
          id: courseStudentId,
        },
      });

      return res.status(200).json({
        status: 200,
        data: courseStudents,
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

router.get("/students/total/:courseId", async (req: Request, res: Response) => {
  try {
    const courseId = req.params.courseId;

    const courseStudents = await prisma.courseStudent.findMany({
      where: {
        courseId: courseId,
      },
    });

    if (!courseStudents) {
      return res.status(400).json({
        status: 400,
        message: Message.E000005,
      });
    }

    return res.status(200).json({
      status: 200,
      data: courseStudents,
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(500).json({
      status: 500,
      message: Message.E000023,
    });
  }
});

router.delete("/students", async (req: StudentsRequest, res: Response) => {
  try {
    const { studentId, courseId } = req.body;

    await prisma.courseStudent.deleteMany({
      where: {
        courseId: courseId,
        studentId: studentId,
      },
    });

    return res.status(200).json({
      status: 200,
      message: Message.E000028,
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(500).json({
      status: 500,
      message: Message.E000023,
    });
  }
});

router.delete("/:courseId", async (req, res) => {
  try {
    const courseId = req.params.courseId;

    await prisma.course.delete({
      where: {
        id: courseId,
      },
    });

    return res.status(200).json({
      status: 200,
      message: Message.E000022,
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
