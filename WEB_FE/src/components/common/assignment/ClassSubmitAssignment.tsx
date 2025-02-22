import DynamicTable from "@atlaskit/dynamic-table";
import { useEffect, useMemo, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hook";
import { Button as AntdButton, Upload, Space } from "antd";
import Avatar from "@atlaskit/avatar";
import Spinner from "@atlaskit/spinner";

import Textfield from "@atlaskit/textfield";
import FileApi from "@/api/fileApi";
import { SectionType, UserType } from "@/utils/types";
import AssignmentApi from "@/api/assignmentApi";
import { FileTypeEnum, AssignmentStatus } from "@/utils/enum";
import CourseApi from "@/api/courseApi";
import Button from "@atlaskit/button";
import LoadingButton from "../buttons/LoadingButton";
import UserAvatar from "../UserAvatar";
import { getFileUrl } from "@/utils/helper";
import UserApi from "@/api/userApi";

const ClassSubmitAssignment = ({ section }: { section: SectionType }) => {
  const currentCourse = useAppSelector((state) => state.context.currentCourse);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [students, setStudents] = useState<any>([]);
  const [rows, setRows] = useState<any>([]);
  const [grades, setGrades] = useState<
    {
      userId: string;
      grade: number;
    }[]
  >([]);

  const initStudentList = async () => {
    const studentsRaw = await CourseApi.getCourseStudents(currentCourse.id);
    setStudents(studentsRaw);
  };

  useEffect(() => {
    if (currentCourse.id) {
      initStudentList();
    }
  }, [currentCourse.id]);

  const getUploadedFilesInAssignment = async (studentId: string) => {
    try {
      const res = await AssignmentApi.getUploadedFiles({
        assignmentId: section.id,
        userId: studentId,
      });
      const fileIds = res.data.map((data) => data.documentId);

      const filePromises = fileIds.map(async (fileId) => {
        const file = await FileApi.getFileDetailById(fileId);
        return {
          uid: file.data.id,
          name: file.data.name,
          status: "done",
          url: file.data.url,
          type: file.data.type,
        };
      });

      const newFiles = await Promise.all(filePromises);

      return newFiles;
    } catch (error) {
      console.error("Error fetching files:", error);

      return [];
    }
  };

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
      {
        key: "files",
        content: "Files uploaded",
        shouldTruncate: true,
        width: undefined,
      },
      {
        key: "grade",
        content: (
          <div className="flex items-center gap-2">
            <div>Grade</div>
            <Button
              appearance={isEditing ? "default" : "primary"}
              onClick={() => {
                setIsEditing(true);
              }}
            >
              Edit
            </Button>
          </div>
        ),
        shouldTruncate: true,
        width: undefined,
      },
    ],
  };

  const handleUploadGrades = async () => {
    setIsSubmitting(true);

    try {
      const updatePromises = grades.map(async (grade) => {
        await AssignmentApi.updateAssignmentStudent({
          assignmentId: section.id,
          userId: grade.userId,
          grade: grade.grade,
        });
      });

      await Promise.all(updatePromises);
      setIsEditing(false);
      setIsSubmitting(false);
    } catch {
      setIsSubmitting(false);
    }
  };

  const getRows = async () => {
    try {
      setIsLoading(true);

      const renderRowsPromises = students.map(
        async (studentAssignment, index: number) => {
          const uploadedFiles = await getUploadedFilesInAssignment(
            studentAssignment.studentId
          );

          let status = "";
          let grade = 0;
          const student = await UserApi.getUserById(
            studentAssignment.studentId
          );
          try {
            const data = await AssignmentApi.getUploadStatus({
              userId: student.id,
              assignmentId: section.id,
            });
            status = data.status;
            grade = data.grade;
          } catch (err) {
            // console.log("err", err);
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
                content:
                  status === AssignmentStatus.SUCCESS
                    ? "Success"
                    : "Not turned in",
              },
              {
                key: "files",
                content: (
                  <div>
                    {status === AssignmentStatus.SUCCESS && (
                      <Space
                        direction="vertical"
                        style={{ width: "100%" }}
                        size="large"
                      >
                        <Upload
                          multiple={true}
                          fileList={uploadedFiles}
                          disabled
                          maxCount={1000}
                        ></Upload>
                      </Space>
                    )}
                  </div>
                ),
              },
              {
                key: "grade",
                content: (
                  <div>
                    {status === AssignmentStatus.SUCCESS && (
                      <div>
                        {isEditing ? (
                          <Textfield
                            name="basic"
                            id="basic-textfield"
                            defaultValue={grade}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) => {
                              const newGrade = e.target.value;

                              setGrades((prev) => {
                                const oldValue = prev.find(
                                  (grade) => grade.userId === student.id
                                );
                                if (oldValue) {
                                  const newGrades = prev;
                                  newGrades.map((grade) => {
                                    if (grade.userId === student.id) {
                                      grade.grade = Number(newGrade);
                                    }
                                  });
                                  return newGrades;
                                } else {
                                  const newGrades = prev;
                                  newGrades.push({
                                    userId: student.id,
                                    grade: Number(newGrade),
                                  });
                                  return newGrades;
                                }
                              });
                            }}
                          />
                        ) : (
                          <div>{grade}</div>
                        )}
                      </div>
                    )}
                  </div>
                ),
              },
            ],
          };
        }
      );

      const newRows = await Promise.all(renderRowsPromises);
      setRows(newRows);
      setIsLoading(false);
    } catch (err) {
      console.log("err", err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (section) {
      getRows();
    }
  }, [students, isEditing]);

  return (
    <div className="mt-10">
      {isLoading ? (
        <div className="flex min-h-[100px] items-center justify-center">
          <Spinner interactionName="load" size="large" />
        </div>
      ) : (
        <>
          <DynamicTable
            head={head}
            rows={rows}
            rowsPerPage={10}
            defaultPage={1}
            loadingSpinnerSize="large"
            isLoading={isLoading}
          />
          {isEditing && (
            <div className="flex flex-row-reverse gap-4">
              <LoadingButton
                appearance="primary"
                isLoading={isSubmitting}
                content="Submit"
                type="Submit"
                onClick={() => {
                  handleUploadGrades();
                }}
              ></LoadingButton>
              <Button
                onClick={() => {
                  setIsEditing(false);
                }}
              >
                Cancel
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ClassSubmitAssignment;
