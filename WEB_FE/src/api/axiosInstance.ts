import axios from "axios";

import { Constant } from "@/utils";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_API_URL,
  timeout: Constant.Http.REQUEST_TIMEOUT_UPLOAD,
  headers: {
    Accept: "application/json",
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  },
  withCredentials: true,
});

export default axiosInstance;
