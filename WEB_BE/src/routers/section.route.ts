import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

import { Message } from "../common/messages";
import { CourseSectionType } from "../common/enums";
import { getUpdateData } from "../common/helper";

const prisma = new PrismaClient();
const router = Router();

interface CreateSectionCommentRequest extends Request {
  userId: string;
  sectionId: string;
  content?: string;
  parentCommentId?: string;
}

router.post(
  "/comment",
  async (req: CreateSectionCommentRequest, res: Response) => {
    try {
      const { userId, sectionId, content, parentCommentId } = req.body;

      const existedData = await prisma.section.findFirst({
        where: {
          id: sectionId,
        },
      });
      if (!existedData) {
        return res.status(400).json({
          status: 400,
          message: "Section not found",
        });
      }

      const sectionComment = await prisma.sectionComment.create({
        data: {
          userId,
          sectionId,
          content,
          parentCommentId,
        },
      });

      return res.status(200).json({
        status: 200,
        data: sectionComment,
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

router.get("/comment/:sectionId", async (req: Request, res: Response) => {
  try {
    const sectionId = req.params.sectionId;

    const section = await prisma.section.findUnique({
      where: {
        id: sectionId,
      },
    });

    if (!section) {
      return res.status(400).json({
        status: 400,
        message: Message.E000020,
      });
    }

    const page = req.query.page ? parseInt(req.query.page.toString(), 10) : 1;
    const pageSize = req.query.pageSize
      ? parseInt(req.query.pageSize.toString(), 10)
      : 10;

    const skip = (page - 1) * pageSize;

    const sectionComment = await prisma.sectionComment.findMany({
      where: {
        sectionId: sectionId,
        OR: [
          {
            parentCommentId: "",
          },
          {
            parentCommentId: null,
          },
        ],
      },
      skip: skip,
      take: pageSize,
    });

    sectionComment.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
    const promises = sectionComment.map(async (comment) => {
      const children = await prisma.sectionComment.findMany({
        where: {
          parentCommentId: comment.id,
        },
      });
      children.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

      const childrenLength = children.length;
      const lastChildId =
        childrenLength > 0 ? children[childrenLength - 1].id : comment.id;

      return [
        {
          ...comment,
          lastChildId: lastChildId,
        },
        ...children,
      ];
    });

    const splittedArrays = await Promise.all(promises);
    const allComments = splittedArrays.reduce(
      (acc, curr) => acc.concat(curr),
      []
    );

    const totalComment = await prisma.sectionComment.count({
      where: {
        sectionId: sectionId,
        OR: [
          {
            parentCommentId: "",
          },
          {
            parentCommentId: null,
          },
        ],
      },
    });

    return res.status(200).json({
      status: 200,
      data: allComments,
      total: totalComment,
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(500).json({
      status: 500,
      message: Message.E000023,
    });
  }
});

interface UpdateSectionStudentRequest extends Request {
  studentId: string;
  sectionId: string;
  progressPercent?: number;
}

router.post(
  "/student",
  async (req: UpdateSectionStudentRequest, res: Response) => {
    try {
      const { studentId, sectionId, progressPercent } = req.body;

      const existedData = await prisma.sectionStudent.findFirst({
        where: {
          studentId: studentId,
          sectionId: sectionId,
        },
      });

      if (existedData) {
        const sectionStudent = await prisma.sectionStudent.updateMany({
          where: {
            studentId: studentId,
            sectionId: sectionId,
          },
          data: {
            progressPercent: progressPercent || 0,
          },
        });

        return res.status(200).json({
          status: 200,
          data: sectionStudent,
        });
      } else {
        const sectionStudent = await prisma.sectionStudent.create({
          data: {
            studentId: studentId,
            sectionId: sectionId,
            progressPercent: progressPercent || 0,
          },
        });

        return res.status(200).json({
          status: 200,
          data: sectionStudent,
        });
      }
    } catch (error) {
      console.error(`Error: ${error}`);
      return res.status(500).json({
        status: 500,
        message: Message.E000023,
      });
    }
  }
);

router.get("/student/all", async (req: Request, res: Response) => {
  try {
    const sectionId = req.query.sectionId.toString();

    const section = await prisma.section.findUnique({
      where: {
        id: sectionId,
      },
    });

    if (!section) {
      return res.status(400).json({
        status: 400,
        message: Message.E000020,
      });
    }

    const sectionStudents = await prisma.sectionStudent.findMany({
      where: {
        sectionId: sectionId,
      },
    });

    return res.status(200).json({
      status: 200,
      data: sectionStudents,
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(500).json({
      status: 500,
      message: Message.E000023,
    });
  }
});

router.get("/student/in-course", async (req: Request, res: Response) => {
  try {
    const courseId = req.query.courseId.toString();
    const studentId = req.query.studentId.toString();

    const sections = await prisma.section.findMany({
      where: {
        courseId: courseId,
      },
    });

    if (!sections) {
      return res.status(204).json({
        status: 204,
        data: [],
      });
    }

    const result = await Promise.all(
      sections.map((section) =>
        prisma.sectionStudent.findFirst({
          where: {
            sectionId: section.id,
            studentId: studentId,
          },
        })
      )
    );

    return res.status(200).json({
      status: 200,
      data: result.filter((item) => item),
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(500).json({
      status: 500,
      message: Message.E000023,
    });
  }
});

router.get("/student", async (req: Request, res: Response) => {
  try {
    const sectionId = req.query.sectionId.toString();
    const studentId = req.query.studentId.toString();

    const section = await prisma.section.findUnique({
      where: {
        id: sectionId,
      },
    });

    if (!section) {
      return res.status(400).json({
        status: 400,
        message: Message.E000020,
      });
    }

    const sectionStudent = await prisma.sectionStudent.findFirst({
      where: {
        sectionId: sectionId,
        studentId: studentId,
      },
    });

    return res.status(200).json({
      status: 200,
      data: sectionStudent,
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(500).json({
      status: 500,
      message: Message.E000023,
    });
  }
});

router.delete("/comment/:commentId", async (req: Request, res: Response) => {
  try {
    const commentId = req.params.commentId;

    const existedData = await prisma.sectionComment.findUnique({
      where: {
        id: commentId,
      },
    });

    if (!existedData) {
      return res.status(400).json({
        status: 400,
        message: "Not found!",
      });
    }

    const sectionComment = await prisma.sectionComment.delete({
      where: {
        id: commentId,
      },
    });

    return res.status(200).json({
      status: 200,
      data: sectionComment,
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(500).json({
      status: 500,
      message: Message.E000023,
    });
  }
});

router.get("/document", async (req, res) => {
  try {
    const sectionId = req.query.sectionId.toString();
    const documentsInSection = await prisma.documentSection.findMany({
      where: {
        sectionId: sectionId,
      },
    });

    return res.status(200).json({
      status: 200,
      message: Message.E000025,
      data: documentsInSection.map(
        (documentsInSection) => documentsInSection.documentId
      ),
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(500).json({
      status: 500,
      message: Message.E000023,
    });
  }
});

router.post("/document/move", async (req, res) => {
  try {
    const { sectionId, documentId } = req.body;

    const existedData = await prisma.documentSection.findFirst({
      where: {
        documentId: documentId.toString(),
        sectionId: sectionId.toString(),
      },
    });

    if (existedData) {
      return res.status(204).json({
        status: 204,
      });
    }

    const documentsInSection = await prisma.documentSection.create({
      data: {
        documentId: documentId.toString(),
        sectionId: sectionId.toString(),
      },
    });

    return res.status(200).json({
      status: 200,
      message: Message.E000025,
      data: documentsInSection,
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(500).json({
      status: 500,
      message: Message.E000023,
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      name,
      courseId,
      type,
      order,
      parentSectionId,
      description,
      openDate,
      dueDate,
    } = req.body;

    const section = await prisma.section.create({
      data: {
        name,
        courseId,
        type,
        order,
        parentSectionId: parentSectionId || "",
        description,
        openDate,
        dueDate,
      },
    });

    return res.status(200).json({
      status: 200,
      message: Message.E000017,
      data: section,
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(500).json({
      status: 500,
      message: Message.E000023,
    });
  }
});

router.get("/:sectionId", async (req, res) => {
  try {
    const sectionId = req.params.sectionId;

    const section = await prisma.section.findUnique({
      where: {
        id: sectionId,
      },
    });

    if (!section) {
      return res.status(400).json({
        status: 400,
        message: Message.E000020,
      });
    }

    return res.status(200).json({
      status: 200,
      data: section,
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(500).json({
      status: 500,
      message: Message.E000023,
    });
  }
});

router.get("/course/:courseId", async (req, res) => {
  try {
    const courseId = req.params.courseId;

    const sections = await prisma.section.findMany({
      where: {
        courseId: courseId,
      },
    });

    if (!sections) {
      return res.status(400).json({
        status: 400,
        message: Message.E000005,
      });
    }

    return res.status(200).json({
      status: 200,
      data: sections,
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(500).json({
      status: 500,
      message: Message.E000023,
    });
  }
});

router.put("/", async (req, res) => {
  try {
    const sections = req.body.sections;

    if (!sections) {
      return res.status(400).json({
        status: 400,
        message: Message.E000005,
      });
    }

    const updatedSections = [];

    for (const sectionUpdate of sections) {
      const sectionId = sectionUpdate.id;

      const updateFields = {
        name: sectionUpdate.name,
        type: sectionUpdate.type,
        order: sectionUpdate.order,
        parentSectionId: sectionUpdate.parentSectionId,
        description: sectionUpdate.description,
        openDate: sectionUpdate.openDate,
        dueDate: sectionUpdate.dueDate,
      };

      const updateData = getUpdateData(updateFields);

      await prisma.section.update({
        where: {
          id: sectionId,
        },
        data: updateData,
      });

      updatedSections.push(sectionId);
    }

    return res.status(200).json({
      status: 200,
      message: Message.E000024,
      data: updatedSections,
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(500).json({
      status: 500,
      message: Message.E000023,
    });
  }
});

const deleteChildSections = async (parentId) => {
  const childSectionIds = await prisma.section
    .findMany({
      where: {
        parentSectionId: parentId,
      },
    })
    .then((childSections) => childSections.map((section) => section.id));

  const promises = childSectionIds.map(async (sectionId) => {
    const childSection = await prisma.section.findUnique({
      where: {
        id: sectionId,
      },
    });

    if (childSection.type === CourseSectionType.LIST) {
      return await deleteChildSections(sectionId);
    }
  });

  await Promise.all(promises);

  await prisma.section.deleteMany({
    where: {
      parentSectionId: parentId,
    },
  });
};

router.delete("/:sectionId", async (req, res) => {
  try {
    const sectionId = req.params.sectionId;

    const section = await prisma.section.findUnique({
      where: {
        id: sectionId,
      },
    });

    if (!section) {
      return res.status(400).json({
        status: 400,
        message: Message.E000005,
      });
    }

    await deleteChildSections(sectionId);

    const parentSectionId = section.parentSectionId;

    if (parentSectionId) {
      await prisma.section.updateMany({
        where: {
          parentSectionId: parentSectionId,
          order: { gt: section.order },
        },
        data: {
          order: { decrement: 1 },
        },
      });
    } else {
      await prisma.section.updateMany({
        where: {
          parentSectionId: null,
          courseId: section.courseId,
          order: { gt: section.order },
        },
        data: {
          order: { decrement: 1 },
        },
      });
    }

    await prisma.section.delete({
      where: {
        id: sectionId,
      },
    });

    return res.status(200).json({
      status: 200,
      data: Message.E000019,
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
