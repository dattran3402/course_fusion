import axiosInstance from "./axiosInstance";

const getNotification = async () => {
  const res = await axiosInstance.get(`/notification`);
  return res.data.data;
};

const updateNotification = async ({
  id,
  userId,
  content,
  link,
  isViewed,
}: {
  id: string;
  userId?: string;
  content?: string;
  link?: string;
  isViewed?: boolean;
}) => {
  const res = await axiosInstance.put(`/notification`, {
    id,
    userId,
    content,
    link,
    isViewed,
  });
  return res.data.data;
};

const NotificationApi = {
  getNotification,
  updateNotification,
};

export default NotificationApi;
