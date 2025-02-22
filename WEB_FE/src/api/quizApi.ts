import axiosInstance from "./axiosInstance";
import { QuizQuestionTypeEnum } from "@/utils/enum";

const createQuizQuestion = async ({
  courseId,
  sectionId,
  type,
  question,
  options,
  answer,
  tags,
}: {
  courseId?: string;
  sectionId?: string;
  type?: string;
  question?: string;
  options?: {
    id: string;
    content: string;
  }[];
  answer?: string;
  tags?: string[];
}) => {
  const data = {
    courseId,
    sectionId,
    type,
    question,
    options,
    answer,
    tags,
  };

  const res = await axiosInstance.post(`/quiz/question`, data);

  return res.data;
};

const updateQuizQuestion = async ({
  questionId,
  courseId,
  sectionId,
  type,
  question,
  options,
  answer,
  tags,
}: {
  questionId: string;
  courseId?: string;
  sectionId?: string;
  type?: string;
  question?: string;
  options?: {
    id: string;
    content: string;
  }[];
  answer?: string;
  tags?: string[];
}) => {
  const data = {
    courseId,
    sectionId,
    type,
    question,
    options,
    answer,
    tags,
  };

  const res = await axiosInstance.put(`/quiz/question/${questionId}`, data);

  return res.data;
};

const deleteQuizQuestion = async (questionId) => {
  const res = await axiosInstance.delete(`/quiz/question/${questionId}`);

  return res.data;
};

const getQuestionByIds = async (questionIds: string[]) => {
  const query = questionIds.map((id) => encodeURIComponent(id));

  const res = await axiosInstance.get(`/quiz/question/by-ids?id=${query}`);

  return res.data;
};

const getQuizQuestions = async ({
  courseId,
  sectionId,
  tags,
}: {
  courseId: string;
  sectionId: string;
  tags?: string[];
}) => {
  try {
    let queryString = `/quiz/question?courseId=${courseId}&sectionId=${sectionId}`;

    if (tags !== undefined) {
      const tagsQuery = tags.map((tag) => encodeURIComponent(tag));
      queryString += "&tag=" + tagsQuery;
    }

    const res = await axiosInstance.get(queryString);

    return res.data.data;
  } catch (err) {
    console.log("error", err);
    return [];
  }
};

const getAllTags = async (courseId) => {
  try {
    const res = await axiosInstance.get(`/quiz/tags/${courseId}`);
    return res.data.data;
  } catch (err) {
    console.log("error", err);
    return [];
  }
};

const getRandomQuestionByTags = async ({
  courseId,
  tags,
  limit,
}: {
  courseId: string;
  tags?: string[];
  limit: number;
}) => {
  try {
    let queryString = `/quiz/question/random?courseId=${courseId}&limit=${limit}`;

    if (tags !== undefined) {
      const tagsQuery = tags.map((tag) => encodeURIComponent(tag));
      queryString += "&tag=" + tagsQuery;
    }

    const res = await axiosInstance.get(queryString);

    return res.data.data;
  } catch (err) {
    console.log("error", err);
    return [];
  }
};

const submitQuiz = async ({
  quizId,
  studentId,
  submitQuizQuestions,
}: {
  quizId: string;
  studentId: string;
  submitQuizQuestions: {
    questionId: string;
    answer?: string;
  }[];
}) => {
  const data = {
    sectionId: quizId,
    studentId: studentId,
    submitQuizQuestions: submitQuizQuestions.map((q) => ({
      id: q.questionId,
      answer: q.answer?.trim(),
    })),
  };

  const res = await axiosInstance.post("/quiz/submit", data);

  return res.data;
};

const redoQuiz = async ({
  quizId,
  studentId,
}: {
  quizId: string;
  studentId: string;
}) => {
  const res = await axiosInstance.delete(
    `/quiz/submit?sectionId=${quizId}&studentId=${studentId}`
  );

  return res.data;
};

const getSubmittedQuiz = async ({
  sectionId,
  studentId,
}: {
  sectionId: string;
  studentId: string;
}) => {
  const res = await axiosInstance.get(
    `/quiz/submit?studentId=${studentId}&sectionId=${sectionId}`
  );

  return res.data;
};

const getAllSubmittedQuiz = async ({ sectionId }: { sectionId: string }) => {
  const res = await axiosInstance.get(
    `/quiz/submit/all?sectionId=${sectionId}`
  );

  return res.data;
};

const configQuiz = async ({
  minutes,
  sectionId,
  questionIds,
  percentToPass,
  configuration,
}: {
  sectionId?: string;
  minutes?: number;
  questionIds?: string[];
  percentToPass?: number;
  configuration?: {
    numberOfQuestions: number;
    tags: string[];
  }[];
}) => {
  const data = {
    minutes,
    questionIds,
    percentToPass,
    sectionId,
    configuration,
  };

  const res = await axiosInstance.post("/quiz/config", data);

  return res.data;
};

const getConfigQuiz = async (sectionId) => {
  const res = await axiosInstance.get(`/quiz/config/${sectionId}`);

  return res.data;
};

const updateConfigQuiz = async (sectionId) => {
  const res = await axiosInstance.get(`/quiz/config/${sectionId}`);

  return res.data;
};

const QuizApi = {
  createQuizQuestion,
  getQuizQuestions,
  submitQuiz,
  getRandomQuestionByTags,
  getAllTags,
  configQuiz,
  getConfigQuiz,
  updateConfigQuiz,
  getSubmittedQuiz,
  getAllSubmittedQuiz,
  updateQuizQuestion,
  deleteQuizQuestion,
  getQuestionByIds,
  redoQuiz,
};

export default QuizApi;
