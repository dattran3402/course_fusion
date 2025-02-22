import DynamicTable from "@atlaskit/dynamic-table";
import { useEffect, useMemo, useState } from "react";
import Avatar from "@atlaskit/avatar";
import { useAppSelector, useAppDispatch } from "@/redux/hook";
import Spinner from "@atlaskit/spinner";

import CourseApi from "@/api/courseApi";
import QuizApi from "@/api/quizApi";
import { getFileUrl } from "@/utils/helper";
import UserApi from "@/api/userApi";

const QuizAnalytics = () => {
  const currentCourse = useAppSelector((state) => state.context.currentCourse);
  const currentSection = useAppSelector(
    (state) => state.context.currentSection
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [students, setStudents] = useState<any>([]);
  const [rows, setRows] = useState<any>([]);
  const [submittedQuestionList, setSubmittedQuestionList] = useState<any>([]);

  const getStudentSubmitData = async (studentId) => {
    try {
      const submitData = await QuizApi.getSubmittedQuiz({
        sectionId: currentSection.id,
        studentId: studentId,
      });
      return submitData.data;
    } catch (err) {
      console.log("err", err);
      return null;
    }
  };

  const initData = async () => {
    try {
      setIsLoading(true);

      const studentsRaw = await CourseApi.getCourseStudents(currentCourse.id);
      const studentList = await Promise.all(
        studentsRaw.map((studentCourse) =>
          UserApi.getUserById(studentCourse.studentId)
        )
      );

      const studentSubmitDataPromises = studentList.map(async (student) => {
        return getStudentSubmitData(student.id);
      });
      const studentSubmitData = await Promise.all(studentSubmitDataPromises);

      const submittedQuestions = studentSubmitData
        .filter((data) => data !== null)
        .map((data) => data.submittedQuestions)
        .flat();
      console.log("submittedQuestions", submittedQuestions);

      const formattedSubmittedQuestions: any[] = [];
      submittedQuestions.forEach((question) => {
        if (
          formattedSubmittedQuestions.findIndex((q) => q.id === question.id) ===
          -1
        ) {
          formattedSubmittedQuestions.push(question);
        }
      });
      console.log("formattedSubmittedQuestions", formattedSubmittedQuestions);

      setRows(
        formattedSubmittedQuestions.map((question, index) => {
          let correct = 0;
          let fail = 0;

          for (let i = 0; i < submittedQuestions.length; i++) {
            if (submittedQuestions[i].id === question.id) {
              if (submittedQuestions[i].status === true) {
                correct++;
              } else {
                fail++;
              }
            }
          }

          const status =
            correct + fail !== 0
              ? ((correct / (correct + fail)) * 100).toFixed(1) + "%"
              : "null";

          return {
            key: `row-${index}-${question.id}`,
            isHighlighted: false,
            cells: [
              {
                key: "index",
                content: index + 1,
              },
              {
                key: "question",
                content: question.question,
              },
              {
                key: "correct",
                content: correct,
              },
              {
                key: "fail",
                content: fail,
              },
              {
                key: "status",
                content: status,
              },
            ],
          };
        })
      );

      setSubmittedQuestionList(submittedQuestions.flat());
      setStudents(studentList);
      setIsLoading(false);
    } catch (err) {
      setStudents([]);
      setSubmittedQuestionList([]);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentCourse.id) {
      initData();
    }
  }, [currentCourse.id]);

  const head = {
    cells: [
      {
        key: "index",
        content: "",
        width: undefined,
      },
      {
        key: "question",
        content: "Question",
        isSortable: true,
        width: undefined,
      },
      {
        key: "correct",
        content: "Correct",
        isSortable: true,
        width: undefined,
      },
      {
        key: "fail",
        content: "Fail",
        isSortable: true,
        width: undefined,
      },
      {
        key: "status",
        content: "Status",
        isSortable: true,
        width: undefined,
      },
    ],
  };

  return (
    <div className="mb-20 mt-6 w-full">
      {isLoading ? (
        <div className="flex min-h-[100px] items-center justify-center">
          <Spinner interactionName="load" size="large" />
        </div>
      ) : (
        <DynamicTable
          head={head}
          rows={rows}
          rowsPerPage={10}
          defaultPage={1}
          loadingSpinnerSize="large"
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default QuizAnalytics;
