import axiosInstance from "./axiosInstance";

const getAllCourses = async ({
  name = "",
  status,
}: {
  name?: string;
  status?: string;
}) => {
  const res = await axiosInstance.get(`/course/all`, {
    params: {
      name: name.trim(),
      status: status,
    },
  });
  return res.data;
};

const getPublicCourses = async ({ name = "", page = 1, pageSize = 1000 }) => {
  const res = await axiosInstance.get(`/course/public`, {
    params: {
      name: name.trim(),
      page: page,
      pageSize: pageSize,
    },
  });
  return res.data;
};

const getMyCourses = async ({ name = "", page = 1, pageSize = 1000 }) => {
  const res = await axiosInstance.get(`/course/my-learning`, {
    params: {
      name: name.trim(),
      page: page,
      pageSize: pageSize,
    },
  });
  return res.data;
};

const getWishListCourses = async ({ name = "", page = 1, pageSize = 1000 }) => {
  const res = await axiosInstance.get(`/course/my-learning`, {
    params: {
      name: name.trim(),
      page: page,
      pageSize: pageSize,
    },
  });
  return res.data;
};

const getTopRateCourses = async ({ name = "", page = 1, pageSize = 1000 }) => {
  const res = await axiosInstance.get(`/course/top-rated`, {
    params: {
      name: name.trim(),
      page: page,
      pageSize: pageSize,
    },
  });
  return res.data;
};

const getPopulateCourses = async ({ name = "", page = 1, pageSize = 1000 }) => {
  const res = await axiosInstance.get(`/course/populate`, {
    params: {
      name: name.trim(),
      page: page,
      pageSize: pageSize,
    },
  });
  return res.data;
};

const getNewCourses = async ({ name = "", page = 1, pageSize = 1000 }) => {
  const res = await axiosInstance.get(`/course/new`, {
    params: {
      name: name.trim(),
      page: page,
      pageSize: pageSize,
    },
  });
  return res.data;
};

const getCourseById = async (courseId) => {
  const res = await axiosInstance.get(`/course/${courseId}`);
  return res.data.data;
};

const getAllTags = async () => {
  const res = await axiosInstance.get(`/course/tags`);
  return res.data;
};

const getTeachersInCourse = async (courseId) => {
  const res = await axiosInstance.get(`/course/teachers/${courseId}`);
  return res.data.data;
};

const getCourseStudents = async (courseId) => {
  const res = await axiosInstance.get(`/course/students/total/${courseId}`);
  return res.data.data;
};

const getCoursesByTeacher = async ({
  teacherId,
  name = "",
  status,
  page = 1,
  pageSize = 1000,
}: {
  teacherId: string | undefined;
  name?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) => {
  const res = await axiosInstance.get(`/course/by`, {
    params: {
      teacherId,
      name,
      status: status,
      page: page,
      pageSize: pageSize,
    },
  });
  return res.data;
};

const updateCourse = async ({
  courseId,
  name,
  backgroundFileId,
  status,
  price,
  tags,
  description,
  whatWillLearn,
  requirements,
  whoThisCourseFor,
  promoVideoFileId,
  subtitle,
  requiresSequentialViewing,
  percentToViewNext,
}: {
  courseId: string;
  name?: string;
  backgroundFileId?: string;
  status?: string;
  price?: number;
  tags?: string[];
  description?: string;
  whatWillLearn?: string;
  requirements?: string;
  whoThisCourseFor?: string;
  promoVideoFileId?: string;
  subtitle?: string;
  requiresSequentialViewing?: boolean;
  percentToViewNext?: number;
}) => {
  const data = {
    courseId,
    name,
    backgroundFileId,
    status,
    price,
    tags,
    description,
    whatWillLearn,
    requirements,
    whoThisCourseFor,
    promoVideoFileId,
    subtitle,
    requiresSequentialViewing,
    percentToViewNext,
  };

  const res = await axiosInstance.put(`/course/`, data);
  return res.data;
};

const addStudentToCourse = async ({
  studentId,
  courseId,
  price = 0,
}: {
  studentId: string;
  courseId: string;
  price?: number;
}) => {
  const data = { studentId, courseId, price };
  const res = await axiosInstance.post(`/course/students/`, data);
  return res.data;
};

const updateStudentCourse = async ({
  studentId,
  courseId,
  chatbotInstructions,
  chatbotDocumentIds,
  finishedDate,
  reviewStar,
  reviewContent,
}: {
  studentId: string;
  courseId: string;
  chatbotInstructions?: string;
  chatbotDocumentIds?: string[];
  finishedDate?: Date;
  reviewStar?: number;
  reviewContent?: string;
}) => {
  const data = {
    studentId,
    courseId,
    chatbotInstructions,
    chatbotDocumentIds,
    finishedDate,
    reviewStar,
    reviewContent,
  };
  const res = await axiosInstance.put(`/course/students/`, data);
  return res.data;
};

const getCourseStudent = async ({
  studentId,
  courseId,
}: {
  studentId: string;
  courseId: string;
}) => {
  const res = await axiosInstance.get(
    `/course/course-student?courseId=${courseId}`
  );
  return res.data.data;
};

const createCourse = async ({
  name,
  backgroundFileId,
}: {
  name: string;
  backgroundFileId?: string;
}) => {
  const data = {
    name: name,
    backgroundFileId: backgroundFileId ? backgroundFileId : "",
  };

  const res = await axiosInstance.post(`/course/`, data);
  return res.data;
};

const deleteCourse = async (id) => {
  const res = await axiosInstance.delete(`/course/${id}`);
  return res.data;
};

const getCoursesInWishlist = async () => {
  const currentCartStr = localStorage.getItem("wishlist");

  let res: any[] = [];
  if (currentCartStr) {
    res = JSON.parse(currentCartStr);
  }
  return res;
};

const setCoursesInWishlist = async (courses) => {
  localStorage.setItem("wishlist", JSON.stringify(courses));
};

const getCoursesInCart = async () => {
  const currentCartStr = localStorage.getItem("cart");

  let res: any[] = [];
  if (currentCartStr) {
    res = JSON.parse(currentCartStr);
  }
  return res;
};

const setCoursesInCart = async (courses) => {
  localStorage.setItem("cart", JSON.stringify(courses));
};

const getStudentCourseRelation = async (id) => {
  const res = await axiosInstance.get(`/course/students/relation/` + id);
  return res.data;
};

const CourseApi = {
  getPublicCourses,
  getAllCourses,
  getCourseById,
  getCourseStudents,
  getTeachersInCourse,
  addStudentToCourse,
  updateStudentCourse,
  createCourse,
  deleteCourse,
  getMyCourses,
  updateCourse,
  getCourseStudent,
  getCoursesInWishlist,
  getCoursesInCart,
  setCoursesInWishlist,
  setCoursesInCart,
  getAllTags,
  getCoursesByTeacher,
  getStudentCourseRelation,
  getTopRateCourses,
  getPopulateCourses,
  getNewCourses,
  getWishListCourses,
};

export default CourseApi;
