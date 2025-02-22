import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

interface CreateAssignmentStudentRequest extends Request {
  userId: string;
  assignmentId: string;
  grade?: Number;
  status?: string;
}

router.post("/student", async (req: CreateAssignmentStudentRequest, res) => {
  try {
    const { assignmentId, userId, grade, status } = req.body;

    const currentAssignmentStudent = await prisma.assignmentStudent.findFirst({
      where: {
        userId: userId,
        assignmentId: assignmentId,
      },
    });
    if (!currentAssignmentStudent) {
      const studentAssignment = await prisma.assignmentStudent.create({
        data: {
          assignmentId,
          userId,
          grade,
          status,
        },
      });

      return res.status(200).json({
        status: 200,
        message: "Assignment student created successfully",
        data: studentAssignment,
      });
    } else {
      const updatedAssignmentStudent = await prisma.assignmentStudent.update({
        where: {
          id: currentAssignmentStudent.id,
        },
        data: {
          grade,
          status,
        },
      });

      return res.status(200).json({
        status: 200,
        message: "Assignment student updated successfully",
        data: updatedAssignmentStudent,
      });
    }
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
});

router.get("/student/all", async (req, res) => {
  try {
    const assignmentId = req.query.assignmentId.toString();

    const exitedData = await prisma.assignmentStudent.findMany({
      where: {
        assignmentId: assignmentId,
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
      message: "Internal server error",
    });
  }
});

router.get("/student", async (req, res) => {
  try {
    const userId = req.query.userId.toString();
    const assignmentId = req.query.assignmentId.toString();

    const assignmentStudent = await prisma.assignmentStudent.findFirst({
      where: {
        assignmentId: assignmentId,
        userId: userId,
      },
    });

    if (!assignmentStudent) {
      return res.status(400).json({
        status: 400,
        message: "Not found!",
      });
    }

    return res.status(200).json({
      status: 200,
      data: assignmentStudent,
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
});

router.get("/document", async (req: MoveDocumentToAssignmentRequest, res) => {
  try {
    const assignmentId = req.query.assignmentId.toString();
    const userId = req.query.userId.toString();

    const documentAssignment = await prisma.documentAssignment.findMany({
      where: {
        assignmentId: assignmentId,
        userId: userId,
      },
    });

    if (!documentAssignment) {
      return res.status(400).json({
        status: 400,
        message: "Not found",
      });
    }

    return res.status(200).json({
      status: 200,
      data: documentAssignment,
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
});

interface MoveDocumentToAssignmentRequest extends Request {
  documentId: string;
  sectionId: string;
  userId: string;
}

router.post(
  "/document/move",
  async (req: MoveDocumentToAssignmentRequest, res) => {
    try {
      const { documentId, assignmentId, userId } = req.body;

      const documentAssignment = await prisma.documentAssignment.create({
        data: {
          documentId: documentId,
          assignmentId: assignmentId,
          userId: userId,
        },
      });

      res.status(200).json({
        status: 200,
        data: documentAssignment,
      });
    } catch (error) {
      console.error(`Error: ${error}`);
      return res.status(500).json({
        status: 500,
        message: "Internal server error",
      });
    }
  }
);

export default router;
