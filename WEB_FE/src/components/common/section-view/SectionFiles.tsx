import ReactPlayer from "react-player";
import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hook";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";
import { Button as AntdButton, Upload, Space } from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import Button from "@atlaskit/button";
import ExportIcon from "@atlaskit/icon/glyph/export";

import FileApi from "@/api/fileApi";
import SectionApi from "@/api/sectionApi";

const SectionFiles = () => {
  const [fileList, setFileList] = useState<UploadFile[]>();

  const currentSection = useAppSelector(
    (state) => state.context.currentSection
  );

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
  }, [currentSection.id]);

  return (
    <div>
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <Upload multiple={true} disabled fileList={fileList}></Upload>
      </Space>
    </div>
  );
};

export default SectionFiles;
