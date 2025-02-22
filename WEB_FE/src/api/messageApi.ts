import { getFileUrl } from "@/utils/helper";
import axiosInstance from "./axiosInstance";

const createMessage = async ({ userId, courseId, data }) => {
  const res = await axiosInstance.post(`/message`, { userId, courseId, data });
  return res.data;
};

const getMessages = async ({ userId, courseId }) => {
  const res = await axiosInstance.get(`/message/${userId}/${courseId}`);
  return res.data;
};

const deleteMessage = async ({ userId, courseId }) => {
  const res = await axiosInstance.delete(`/message/${userId}/${courseId}`);
  return res.data;
};

const MessageApi = {
  getMessages,
  deleteMessage,
  createMessage,
};

export default MessageApi;
