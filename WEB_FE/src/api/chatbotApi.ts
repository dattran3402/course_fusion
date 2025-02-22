import axios from "axios";

import axiosInstance from "./axiosInstance";
import { Constant } from "@/utils";

const chatbotAxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_AI_API_URL,
  timeout: Constant.Http.REQUEST_TIMEOUT_UPLOAD,
  headers: {
    Accept: "application/json",
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  },
  // withCredentials: true,
});

const embeddingDocument = async ({
  documentId,
  title,
  sectionId,
  sectionTitle,
}: {
  documentId: string;
  title: string;
  sectionId: string;
  sectionTitle: string;
}) => {
  console.log("documentId", documentId);
  const res = await chatbotAxiosInstance.post(`/api/embedding`, {
    document_id: documentId,
    title: title,
    section_id: sectionId,
    section_title: sectionTitle,
  });
  return res.data.data;
};

const updateChatbotConfig = async ({
  studentId,
  courseId,
  chatbotInstructions,
  chatbotDocumentIds,
}: {
  studentId: string;
  courseId: string;
  chatbotInstructions?: string;
  chatbotDocumentIds?: string[];
}) => {
  const data = { studentId, courseId, chatbotInstructions, chatbotDocumentIds };
  const res = await axiosInstance.put(`/course/students/`, data);
  return res.data;
};

const chatGenerate = async ({
  configuredDocumentIds,
  message,
  chatHistory,
}) => {
  const data = {
    document_ids: configuredDocumentIds,
    question: message,
    chat_history: chatHistory,
  };

  const res = await chatbotAxiosInstance.post(`/api/chat/`, data);

  return res.data;
};

const ChatbotApi = {
  embeddingDocument,
  updateChatbotConfig,
  chatGenerate,
};

export default ChatbotApi;
