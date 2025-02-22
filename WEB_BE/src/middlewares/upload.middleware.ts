import multer from "multer";

const uploadMiddleware = () => {
  const uploadStorage = multer.memoryStorage();

  return multer({ storage: uploadStorage }).single("file");
};

export { uploadMiddleware };
