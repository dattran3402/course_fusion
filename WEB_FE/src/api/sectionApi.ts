import { Dayjs } from "dayjs";

import axiosInstance from "./axiosInstance";
import { toTimestamp } from "@/utils/helper";

const getSectionsByCourseId = async (courseId) => {
  const res = await axiosInstance.get(`/section/course/${courseId}`);
  return res.data.data;
};

const createSection = async ({
  name,
  courseId,
  type,
  parentSectionId,
  order,
  description,
  openDate,
  dueDate,
}: {
  name: string;
  courseId: string;
  type: string;
  parentSectionId: string;
  order: number;
  description: string;
  openDate?: Dayjs | null;
  dueDate?: Dayjs | null;
}) => {
  const data = {
    name: name,
    courseId: courseId,
    type: type,
    parentSectionId: parentSectionId !== "" ? parentSectionId : null,
    order: order,
    description: description,
    openDate: openDate ? openDate.toISOString() : undefined,
    dueDate: dueDate ? dueDate.toISOString() : undefined,
  };

  const res = await axiosInstance.post(`/section/`, data);
  return res.data.data;
};

const updateSections = async (
  sections: {
    id: string;
    name?: string;
    type?: string;
    parentSectionId?: string;
    description?: string;
    order?: number;
    openDate?: Dayjs | null;
    dueDate?: Dayjs | null;
  }[]
) => {
  const data = sections.map((section) => ({
    id: section.id,
    name: section.name,
    type: section.type,
    parentSectionId:
      section.parentSectionId !== "" ? section.parentSectionId : null,
    order: section.order,
    description: section.description,
    openDate: section.openDate ? section.openDate.toISOString() : undefined,
    dueDate: section.dueDate ? section.dueDate.toISOString() : undefined,
  }));

  const res = await axiosInstance.put(`/section/`, {
    sections: data,
  });
  return res.data;
};

const deleteSectionById = async (sectionId) => {
  const res = await axiosInstance.delete(`/section/${sectionId}`);
  return res.data;
};

const getSectionById = async (sectionId) => {
  const res = await axiosInstance.get(`/section/${sectionId}`);
  return res.data.data;
};

const getFilesInSection = async (sectionId) => {
  const res = await axiosInstance.get(
    `section/document?sectionId=${sectionId}`
  );
  return res.data;
};

const moveFileToSection = async ({ documentId, sectionId }) => {
  const data = {
    documentId: documentId,
    sectionId: sectionId,
  };
  const res = await axiosInstance.post(`section/document/move`, data);
  return res.data;
};

const postComment = async ({
  userId,
  sectionId,
  content,
  parentCommentId,
}: {
  userId: any;
  sectionId: string;
  content?: string;
  parentCommentId?: string;
}) => {
  const data = {
    userId: userId,
    sectionId: sectionId,
    content: content,
    parentCommentId: parentCommentId,
  };
  const res = await axiosInstance.post(`section/comment`, data);
  return res.data;
};

const getCommentsInSection = async ({ sectionId, pageSize = 10, page }) => {
  const res = await axiosInstance.get(`section/comment/${sectionId}`, {
    params: {
      page: page,
      pageSize: pageSize,
    },
  });
  return res.data;
};

const deleteComment = async (commentId) => {
  const res = await axiosInstance.delete(`section/comment/${commentId}`);
  return res.data;
};

const updateStudentProgress = async ({
  studentId,
  sectionId,
  progressPercent,
}) => {
  const data = {
    studentId,
    sectionId,
    progressPercent,
  };

  const res = await axiosInstance.post(`section/student`, data);
  return res.data;
};

const getStudentProgress = async ({ studentId, sectionId }) => {
  const res = await axiosInstance.get(
    `section/student?studentId=${studentId}&sectionId=${sectionId}`
  );
  return res.data;
};

const getStudentProgressByCourseId = async ({ studentId, courseId }) => {
  const res = await axiosInstance.get(
    `section/student/in-course?studentId=${studentId}&courseId=${courseId}`
  );
  return res.data;
};

const getAllStudentsProgress = async ({ sectionId }) => {
  const res = await axiosInstance.get(
    `section/student/all?sectionId=${sectionId}`
  );
  return res.data;
};

const SectionApi = {
  getSectionsByCourseId,
  createSection,
  updateSections,
  deleteSectionById,
  getSectionById,
  getFilesInSection,
  moveFileToSection,
  postComment,
  getCommentsInSection,
  deleteComment,
  updateStudentProgress,
  getStudentProgress,
  getAllStudentsProgress,
  getStudentProgressByCourseId,
};

export default SectionApi;
