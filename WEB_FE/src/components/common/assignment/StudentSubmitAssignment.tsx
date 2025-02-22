import DynamicTable from "@atlaskit/dynamic-table";
import { useEffect, useMemo, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hook";
import type { UploadProps } from "antd";
import { Button as AntdButton, Upload, Space } from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import Button from "@atlaskit/button";
import ExportIcon from "@atlaskit/icon/glyph/export";
import Heading from "@atlaskit/heading";
import axios from "axios";

import FileApi from "@/api/fileApi";
import { SectionType } from "@/utils/types";
import AssignmentApi from "@/api/assignmentApi";
import { FileTypeEnum, AssignmentStatus } from "@/utils/enum";
import LoadingButton from "../buttons/LoadingButton";

const StudentSubmitAssignment = ({ section }: { section: SectionType }) => {
  const user = useAppSelector((state) => state.context.user);
  const supportedTypes = Object.values(FileTypeEnum);

  const [uploadedFileList, setUploadedFileList] = useState<UploadFile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [rows, setRows] = useState<any>();
  const [grade, setGrade] = useState<number | null>(null);
  const [status, setStatus] = useState<string>("");
  const [createdAt, setCreatedAt] = useState<string>("");

  const getUploadedFilesInAssignment = async () => {
    try {
      if (user) {
        const res = await AssignmentApi.getUploadedFiles({
          assignmentId: section.id,
          userId: user.id,
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

        setUploadedFileList(newFiles);
      }
    } catch (error) {
      console.error("Error fetching files:", error);
      setUploadedFileList([]);
    }
  };

  const getUploadStatus = async () => {
    if (user && section) {
      try {
        const data = await AssignmentApi.getUploadStatus({
          userId: user?.id,
          assignmentId: section.id,
        });

        if (data.status === AssignmentStatus.SUCCESS) {
          setGrade(data.grade);
          setStatus(data.status);
          setCreatedAt(data.createdAt);
        }
      } catch {
        setGrade(null);
        setStatus("Not turned in");
        setCreatedAt("");
      }
    }
  };

  const handleSubmit = async () => {
    if (section && user) {
      const userConfirmed = window.confirm(
        "This assignment allow to submit once, are you sure to submit?"
      );

      if (userConfirmed) {
        setIsLoading(true);

        try {
          await AssignmentApi.updateAssignmentStudent({
            assignmentId: section.id,
            userId: user.id,
            status: AssignmentStatus.SUCCESS,
          });

          const updateFileSectionPromises = uploadedFileList.map((file) =>
            AssignmentApi.moveFileToAssignment({
              documentId: file.uid,
              assignmentId: section.id,
              userId: user?.id,
            })
          );
          await Promise.all(updateFileSectionPromises);

          setIsLoading(false);
        } catch {
          console.log("error");
          setIsLoading(false);
        }
      }
    }
  };

  const getRows = () => {
    setRows([
      {
        key: `row-status`,
        isHighlighted: false,
        cells: [
          {
            key: "0",
            content: "Status",
          },
          {
            key: "1",
            content: status,
          },
        ],
      },
      {
        key: `row-grade`,
        isHighlighted: false,
        cells: [
          {
            key: "0",
            content: "Grade",
          },
          {
            key: "1",
            content: grade,
          },
        ],
      },
      {
        key: `row-submitted-at`,
        isHighlighted: false,
        cells: [
          {
            key: "0",
            content: "Submitted at",
          },
          {
            key: "1",
            content: "" + createdAt,
          },
        ],
      },
      {
        key: `row-due-date`,
        isHighlighted: false,
        cells: [
          {
            key: "0",
            content: "Due date",
          },
          {
            key: "1",
            content: "" + section.dueDate,
          },
        ],
      },
      {
        key: `row-files-submitted`,
        isHighlighted: false,
        cells: [
          {
            key: "0",
            content: "Files submitted",
          },
          {
            key: "1",
            content: (
              <div>
                <Space
                  direction="vertical"
                  style={{ width: "100%" }}
                  size="large"
                >
                  <Upload
                    multiple={true}
                    fileList={uploadedFileList}
                    customRequest={handleUploadFiles}
                    onChange={handleChange}
                    onRemove={handleRemoveFile}
                    maxCount={1000}
                    disabled={status === AssignmentStatus.SUCCESS}
                  >
                    {status !== AssignmentStatus.SUCCESS && (
                      <Button iconBefore={<ExportIcon label="" />}>
                        Upload
                      </Button>
                    )}
                  </Upload>
                </Space>
              </div>
            ),
          },
        ],
      },
      {
        key: `row-submit-button`,
        isHighlighted: false,
        cells: [
          {
            key: "0",
            content: "",
          },
          {
            key: "1",
            content: (
              <div className="mt-4 flex flex-row-reverse">
                {status !== AssignmentStatus.SUCCESS ? (
                  <LoadingButton
                    isLoading={isLoading}
                    appearance="primary"
                    content="Submit"
                    onClick={() => {
                      handleSubmit();
                    }}
                    type="Submit"
                  ></LoadingButton>
                ) : (
                  <div></div>
                )}
              </div>
            ),
          },
        ],
      },
    ]);
  };

  useEffect(() => {
    if (section.id) {
      getUploadedFilesInAssignment();
      getUploadStatus();
    }
  }, [section]);

  useEffect(() => {
    if (section) {
      getRows();
    }
  }, [section, uploadedFileList, status]);

  const validateFileType = (file) => {
    if (!file) {
      return false;
    }

    if (!supportedTypes.includes(file.type)) {
      return false;
    }

    return true;
  };

  const handleUploadFiles = async (options) => {
    const { onSuccess, onError, file, onProgress } = options;

    if (!validateFileType(file)) {
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const config = {
      headers: { "content-type": "multipart/form-data" },
      onUploadProgress: (event) => {
        onProgress({ percent: (event.loaded / event.total) * 100 });
      },
    };

    axios
      .post(
        import.meta.env.VITE_BASE_API_URL + "/document/upload",
        formData,
        config
      )
      .then((res) => {
        onSuccess(res.data.data);
      })
      .catch((err) => {
        const error = new Error("Some error");
        onError({ event: error });
      });
  };

  const handleChange: UploadProps["onChange"] = async (info) => {
    let newFileList = [...info.fileList];

    newFileList = newFileList.map((file) => {
      if (file.response) {
        // Component will show file.url as link
        file.uid = file.response.id;
        file.url = file.response.url;
        file.status = "done";
      }

      return file;
    });

    setUploadedFileList(newFileList);
  };

  const handleRemoveFile = async (e) => {
    await FileApi.removeFileById(e.uid);
  };

  return (
    <div>
      <Heading level="h600">Submission</Heading>
      <DynamicTable
        rows={rows}
        rowsPerPage={10}
        defaultPage={1}
        loadingSpinnerSize="large"
        isLoading={isLoading}
      />
    </div>
  );
};

export default StudentSubmitAssignment;
