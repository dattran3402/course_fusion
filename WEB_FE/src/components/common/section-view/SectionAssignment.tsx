import { useEffect, useMemo, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hook";
import { Button as AntdButton, Upload, Space } from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import Heading from "@atlaskit/heading";
import Tabs, { Tab, TabList, TabPanel } from "@atlaskit/tabs";

import FileApi from "@/api/fileApi";
import { FileTypeEnum } from "@/utils/enum";
import SectionApi from "@/api/sectionApi";
import StudentSubmitAssignment from "../assignment/StudentSubmitAssignment";
import ClassSubmitAssignment from "../assignment/ClassSubmitAssignment";

const SectionAssignment = () => {
  const user = useAppSelector((state) => state.context.user);
  const currentSection = useAppSelector(
    (state) => state.context.currentSection
  );
  const currentCourse = useAppSelector((state) => state.context.currentCourse);
  const supportedTypes = Object.values(FileTypeEnum);

  const [fileList, setFileList] = useState<UploadFile[]>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getFilesInSection = async () => {
    try {
      const res = await SectionApi.getFilesInSection(currentSection.id);
      const fileIds = res.data;

      const filePromises = fileIds.map(async (fileId) => {
        try {
          const file = await FileApi.getFileDetailById(fileId);
          return {
            uid: file.data.id,
            name: file.data.name,
            status: "done",
            url: file.data.url,
            type: file.data.type,
          };
        } catch (err) {
          return null;
        }
      });

      const newFiles = await Promise.all(filePromises);

      setFileList(newFiles.filter((file) => file !== null));
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  useEffect(() => {
    if (currentSection.id) {
      getFilesInSection();
    }
  }, [currentSection]);

  return (
    <div>
      <div className="mt-10">
        {user?.id === currentCourse.teacherId ? (
          <Tabs id="quiz-tab">
            <TabList>
              <Tab>Assignment</Tab>
              <Tab>Submission</Tab>
            </TabList>
            <TabPanel>
              <div className="mb-20">
                <div
                  className="mt-4"
                  dangerouslySetInnerHTML={{
                    __html: currentSection.description,
                  }}
                />
                <Space
                  direction="vertical"
                  style={{ width: "100%" }}
                  size="large"
                >
                  <Upload multiple={true} disabled fileList={fileList}></Upload>
                </Space>
              </div>
            </TabPanel>
            <TabPanel>
              <ClassSubmitAssignment section={currentSection} />
            </TabPanel>
          </Tabs>
        ) : (
          <div>
            <div className="mb-20">
              <div
                dangerouslySetInnerHTML={{
                  __html: currentSection.description,
                }}
              />
              <Space
                direction="vertical"
                style={{ width: "100%" }}
                size="large"
              >
                <Upload multiple={true} disabled fileList={fileList}></Upload>
              </Space>
            </div>
            <StudentSubmitAssignment section={currentSection} />
          </div>
        )}
      </div>
    </div>
  );
};

export default SectionAssignment;
