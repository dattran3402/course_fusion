import axiosInstance from "./axiosInstance";

const signIn = async ({ email, password }) => {
  const res = await axiosInstance.post(`/auth/sign-in`, {
    email,
    password,
  });
  return res.data.data;
};

const signUp = async ({ email, password, name }) => {
  const res = await axiosInstance.post(`/auth/sign-up`, {
    email,
    password,
    name,
  });
  return res.data.data;
};

const changePassword = async ({ email }) => {
  const res = await axiosInstance.get(`/auth/password/${email}`);
  return res.data;
};

const AuthApi = {
  signIn,
  signUp,
  changePassword,
};

export default AuthApi;
