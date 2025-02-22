import axiosInstance from "./axiosInstance";

const getUploadedFiles = async ({
  assignmentId,
  userId,
}: {
  assignmentId: string;
  userId: string;
}) => {
  const res = await axiosInstance.get(
    `assignment/document?assignmentId=${assignmentId}&userId=${userId}`
  );
  return res.data;
};

const moveFileToAssignment = async ({ documentId, assignmentId, userId }) => {
  const data = {
    documentId: documentId,
    assignmentId: assignmentId,
    userId: userId,
  };
  const res = await axiosInstance.post(`assignment/document/move`, data);
  return res.data;
};

const updateAssignmentStudent = async ({
  assignmentId,
  userId,
  grade,
  status,
}: {
  assignmentId: string;
  userId: string;
  grade?: number;
  status?: string;
}) => {
  const data = {
    assignmentId: assignmentId,
    userId: userId,
    grade: grade,
    status: status,
  };
  const res = await axiosInstance.post(`assignment/student`, data);
  return res.data;
};

const getUploadStatus = async ({
  assignmentId,
  userId,
}: {
  assignmentId: string;
  userId: string;
}) => {
  const res = await axiosInstance.get(
    `assignment/student?assignmentId=${assignmentId}&userId=${userId}`
  );
  return res.data.data;
};

const getAllUploadStatus = async ({ sectionId }: { sectionId: string }) => {
  const res = await axiosInstance.get(
    `assignment/student/all?assignmentId=${sectionId}`
  );
  return res.data.data;
};

const AssignmentApi = {
  getUploadedFiles,
  moveFileToAssignment,
  updateAssignmentStudent,
  getUploadStatus,
  getAllUploadStatus,
};

export default AssignmentApi;
