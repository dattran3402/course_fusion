import { useState, useCallback, useEffect } from "react";
import ReactQuill from "react-quill";
import { useAppSelector, useAppDispatch } from "@/redux/hook";
import axios from "axios";

import Textfield from "@atlaskit/textfield";
import ButtonGroup from "@atlaskit/button/button-group";
import LoadingButton from "@atlaskit/button/loading-button";
import Button from "@atlaskit/button";
import ChevronDownIcon from "@atlaskit/icon/glyph/chevron-down";
import { PopupSelect } from "@atlaskit/select";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import type { UploadProps } from "antd";
import { Button as AntdButton, Upload, Space } from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import ExportIcon from "@atlaskit/icon/glyph/export";
import dayjs, { Dayjs } from "dayjs";

import { CourseSectionTypeEnum } from "@/utils/enum";
import { setSections } from "@/redux/features/contextSlice";
import { SectionType } from "@/utils/types";
import SectionApi from "@/api/sectionApi";
import FileApi from "@/api/fileApi";
import { newSectionTypeOptions } from "./AddSection";
import { FileTypeEnum } from "@/utils/enum";

const EditSection = ({
  section,
  setShowEditSection,
}: {
  section: SectionType;
  setShowEditSection;
}) => {
  const supportedTypes = Object.values(FileTypeEnum);
  const dispatch = useAppDispatch();

  const sections = useAppSelector((state) => state.context.sections);
  const [openDate, setOpenDate] = useState<Dayjs | null>(
    section.openDate ? dayjs(section.openDate) : null
  );
  const [dueDate, setDueDate] = useState<Dayjs | null>(
    section.dueDate ? dayjs(section.dueDate) : null
  );

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [sectionName, setSectionName] = useState<string>(section.name);
  const [sectionType, setSectionType] = useState<any>({
    label: newSectionTypeOptions.filter(
      (option) => option.value === section.type
    )[0].label,
    value: section.type,
  });
  const [description, setDescription] = useState<string>(section.description);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const handleEditSection = async () => {
    try {
      setIsSubmitting(true);

      await SectionApi.updateSections([
        {
          id: section.id,
          description: description,
          name: sectionName,
          openDate: openDate,
          dueDate: dueDate,
        },
      ]);

      const updateFileSectionPromises = fileList.map((file) =>
        SectionApi.moveFileToSection({
          documentId: file.uid,
          sectionId: section.id,
        })
      );
      await Promise.all(updateFileSectionPromises);

      const newSections = sections.map((sec) => {
        if (sec.id === section.id) {
          return {
            ...sec,
            description: description,
            name: sectionName,
          };
        } else {
          return sec;
        }
      });

      dispatch(setSections(newSections));

      setSectionName("");
      setSectionType({ label: "List", value: CourseSectionTypeEnum.LIST });
      setIsSubmitting(false);
      setShowEditSection(false);
    } catch {
      setIsSubmitting(false);
    }
  };

  const validateFileType = (file) => {
    if (!file) {
      return false;
    }

    if (!supportedTypes.includes(file.type)) {
      return false;
    }

    if (sectionType.value === CourseSectionTypeEnum.VIDEO) {
      if (
        file.type !== FileTypeEnum.MP3 &&
        file.type !== FileTypeEnum.MP4 &&
        file.type !== FileTypeEnum.MOV
      ) {
        return false;
      }
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

    setFileList(newFileList);
  };

  const handleRemoveFile = async (e) => {
    await FileApi.removeFileById(e.uid);
  };

  const getFilesInSection = async () => {
    try {
      const res = await SectionApi.getFilesInSection(section.id);
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
      const formattedFiles = newFiles.filter((file) => file !== null);
      setFileList(formattedFiles);

      if (
        formattedFiles.length > 0 &&
        section.type === CourseSectionTypeEnum.VIDEO
      ) {
        setFileList([formattedFiles[formattedFiles.length - 1]]);
      } else {
        setFileList(formattedFiles);
      }
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  useEffect(() => {
    getFilesInSection();
  }, []);

  return (
    <div>
      <div className="mt-4 flex w-full items-center gap-2">
        <div className="flex-1">
          <Textfield
            name="basic"
            id="basic-textfield"
            value={sectionName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSectionName(e.target.value);
            }}
          />
        </div>
        <div>
          <PopupSelect
            placeholder="Search labels..."
            options={[sectionType]}
            target={({ isOpen, ...triggerProps }) => (
              <Button
                {...triggerProps}
                iconAfter={<ChevronDownIcon label="" />}
              >
                {sectionType.label}
              </Button>
            )}
            value={sectionType}
            onChange={(e) => setSectionType(e)}
          />
        </div>
      </div>

      {sectionType.value !== CourseSectionTypeEnum.LIST && (
        <div className="mt-4">
          <ReactQuill
            theme="snow"
            value={description}
            onChange={setDescription}
          />

          {/* <div className="mt-5 flex w-full justify-between gap-5">
            <div className="flex w-full flex-col">
              <h4>Open Date</h4>
              <DateTimePicker
                value={openDate}
                onChange={(e) => {
                  setOpenDate(e);
                }}
              />
            </div>
            <div className="flex w-full flex-col">
              <h4>Due Date</h4>
              <DateTimePicker
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e);
                }}
              />
            </div>
          </div> */}

          <h4>Files</h4>
          <Space direction="vertical" style={{ width: "100%" }} size="large">
            <Upload
              customRequest={handleUploadFiles}
              multiple={true}
              onChange={handleChange}
              fileList={fileList}
              onRemove={handleRemoveFile}
              maxCount={
                sectionType.value === CourseSectionTypeEnum.VIDEO ? 1 : 1000
              }
            >
              <Button iconBefore={<ExportIcon label="" />}>Upload</Button>
            </Upload>
          </Space>
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <ButtonGroup>
          <Button appearance="subtle" onClick={() => setShowEditSection(false)}>
            Cancel
          </Button>
          <LoadingButton
            type="submit"
            appearance="primary"
            isLoading={isSubmitting}
            onClick={() => handleEditSection()}
          >
            Submit
          </LoadingButton>
        </ButtonGroup>
      </div>
    </div>
  );
};

export default EditSection;
