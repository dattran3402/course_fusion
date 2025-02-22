import { getFileUrl } from "@/utils/helper";
import axiosInstance from "./axiosInstance";

const uploadSectionDocument = async ({ file, sectionId }) => {
  const formData = new FormData();
  formData.append("file", file.file);
  const res = await axiosInstance.post(
    `/document/upload?sectionId=${sectionId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return res.data;
};

const getFileDetailById = async (fileId) => {
  const res = await axiosInstance.get(`/document/detail/${fileId}`);
  if (res.data && res.data.data) {
    return {
      ...res.data,
      data: {
        ...res.data.data,
        url: getFileUrl(res.data.data.id),
      },
    };
  }
  return null;
};

const removeFileById = async (fileId) => {
  const res = await axiosInstance.delete(`/document/by-id/${fileId}`);
  return res.data;
};

const storeEmbedding = async (fileId) => {
  const res = await axiosInstance.post(
    `/document/store_embedding_v2?documentId=${fileId}`
  );
  return res.data;
};

const getFilePublicUrl = async (fileId) => {
  const res = await axiosInstance.get(`/document/url/${fileId}`);
  return res.data;
};

const FileApi = {
  uploadSectionDocument,
  getFileDetailById,
  removeFileById,
  storeEmbedding,
  getFilePublicUrl,
};

export default FileApi;
