import axiosInstance from "./axiosInstance";

import { UserType } from "@/utils/types";

const getUserById = async (id: string) => {
  const res = await axiosInstance.get(`/user/${id}`);
  return res.data.data;
};

const getAllUsers = async ({
  query = "",
  isBlocked,
}: {
  query?: string;
  isBlocked?: boolean;
}) => {
  const res = await axiosInstance.get(`/user/all`, {
    params: {
      query: query.trim(),
      isBlocked,
    },
  });
  return res.data;
};

const deleteUser = async (userId: string) => {
  const res = await axiosInstance.delete(`/user/${userId}`);
  return res.data;
};

const updateUser = async ({
  userId,
  name,
  email,
  avatarFileId,
  password,
  headline,
  biography,
  website,
  twitter,
  facebook,
  linkedIn,
  youtube,
  stripeCustomerId,
  isBlocked,
  favouriteCourseIds,
}: {
  userId?: string;
  name?: string;
  email?: string;
  avatarFileId?: string;
  password?: string;
  headline?: string;
  biography?: string;
  website?: string;
  twitter?: string;
  facebook?: string;
  linkedIn?: string;
  youtube?: string;
  stripeCustomerId?: string;
  isBlocked?: boolean;
  favouriteCourseIds?: string[];
}) => {
  const res = await axiosInstance.put(`/user`, {
    userId,
    name,
    email,
    avatarFileId,
    password,
    headline,
    biography,
    website,
    twitter,
    facebook,
    linkedIn,
    youtube,
    stripeCustomerId,
    isBlocked,
    favouriteCourseIds,
  });
  return res.data;
};

const UserApi = {
  getUserById,
  deleteUser,
  updateUser,
  getAllUsers,
};

export default UserApi;
