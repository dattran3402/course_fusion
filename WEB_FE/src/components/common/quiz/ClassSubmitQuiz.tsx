import DynamicTable from "@atlaskit/dynamic-table";
import { useEffect, useMemo, useState } from "react";
import Avatar from "@atlaskit/avatar";
import { useAppSelector, useAppDispatch } from "@/redux/hook";
import Spinner from "@atlaskit/spinner";

import CourseApi from "@/api/courseApi";
import QuizApi from "@/api/quizApi";
import { getFileUrl } from "@/utils/helper";
import UserApi from "@/api/userApi";

const ClassSubmitQuiz = () => {
  const currentCourse = useAppSelector((state) => state.context.currentCourse);
  const currentSection = useAppSelector(
    (state) => state.context.currentSection
  );

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [students, setStudents] = useState<any>([]);
  const [rows, setRows] = useState<any>([]);

  const initStudentList = async () => {
    try {
      setIsLoading(true);
      const studentsRaw = await CourseApi.getCourseStudents(currentCourse.id);
      const studentList = await Promise.all(
        studentsRaw.map((studentCourse) =>
          UserApi.getUserById(studentCourse.studentId)
        )
      );
      setStudents(studentList);
    } catch (err) {
      console.log("err", err);
    }
  };

  useEffect(() => {
    if (currentCourse.id) {
      initStudentList();
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
        key: "name",
        content: "Name",
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

  const getRows = async () => {
    setIsLoading(true);

    const renderRowsPromises = students.map(async (student, index: number) => {
      const submitData = await getStudentSubmitData(student.id);

      let renderStatus = "Not submitted";
      if (submitData) {
        if (submitData.submittedQuestions.length > 0) {
          renderStatus =
            submitData.quizStudent.correct + "/" + submitData.quizStudent.total;
        } else {
          renderStatus = "0";
        }
      }

      return {
        key: `row-${index}-${student.id}`,
        isHighlighted: false,
        cells: [
          {
            key: "index",
            content: index + 1,
          },
          {
            key: "name",
            content: (
              <div className="flex items-center gap-4">
                <Avatar src={getFileUrl(student.avatarFileId)} />
                <div>{student.name}</div>
              </div>
            ),
          },
          {
            key: "status",
            content: renderStatus,
          },
        ],
      };
    });

    const newRows = await Promise.all(renderRowsPromises);
    setRows(newRows);
    setIsLoading(false);
  };

  useEffect(() => {
    if (currentSection) {
      getRows();
    }
  }, [students]);

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

export default ClassSubmitQuiz;
