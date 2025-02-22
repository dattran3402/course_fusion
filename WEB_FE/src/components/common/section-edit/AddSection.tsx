import { useState, useCallback, useEffect } from "react";
import ReactQuill from "react-quill";
import { useAppSelector, useAppDispatch } from "@/redux/hook";
import AddIcon from "@atlaskit/icon/glyph/add";
import Textfield from "@atlaskit/textfield";
import ButtonGroup from "@atlaskit/button/button-group";
import LoadingButton from "@atlaskit/button/loading-button";
import Button from "@atlaskit/button";
import ChevronDownIcon from "@atlaskit/icon/glyph/chevron-down";
import { PopupSelect } from "@atlaskit/select";
import type { UploadProps } from "antd";
import { Upload, Space } from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import ExportIcon from "@atlaskit/icon/glyph/export";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import axios from "axios";
import Tooltip from "@atlaskit/tooltip";
import Toggle from "@atlaskit/toggle";
import dayjs, { Dayjs } from "dayjs";
import styled from "styled-components";

import { CourseSectionTypeEnum } from "@/utils/enum";
import { setSections } from "@/redux/features/contextSlice";
import { SectionType } from "@/utils/types";
import SectionApi from "@/api/sectionApi";
import FileApi from "@/api/fileApi";
import { FileTypeEnum } from "@/utils/enum";

export const newSectionTypeOptions = [
  { label: "List", value: CourseSectionTypeEnum.LIST },
  { label: "Video", value: CourseSectionTypeEnum.VIDEO },
  { label: "Reading", value: CourseSectionTypeEnum.FILES },
  { label: "Assignment", value: CourseSectionTypeEnum.ASSIGNMENT },
  { label: "Quiz", value: CourseSectionTypeEnum.QUIZ },
];

const AddSectionStyles = styled.div<{ isAdding }>`
  position: relative;

  &::after {
    position: absolute;
    content: "";
    left: -10px;
    width: ${(props) => (props.isAdding ? "4px" : "0px")};
    height: calc(100% - 48px);
    top: 0;
    background-color: #0052cc;
  }
`;

const AddSection = ({ parentSectionId }: { parentSectionId: string }) => {
  const dispatch = useAppDispatch();
  const supportedTypes = Object.values(FileTypeEnum);

  const sections = useAppSelector((state) => state.context.sections);
  const currentCourse = useAppSelector((state) => state.context.currentCourse);

  const [showAddSection, setShowAddSection] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [sectionName, setSectionName] = useState<string>("");
  const [sectionType, setSectionType] = useState<any>({
    label: "List",
    value: CourseSectionTypeEnum.LIST,
  });
  const [description, setDescription] = useState<string>("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  // const [openDate, setOpenDate] = useState<Dayjs | null>(dayjs());
  // const [dueDate, setDueDate] = useState<Dayjs | null>(null);

  const handleAddSection = async () => {
    setIsSubmitting(true);
    const brotherSections = sections.filter(
      (section) => section.parentSectionId === parentSectionId
    );
    const newSection: SectionType = await SectionApi.createSection({
      name: sectionName,
      courseId: currentCourse.id,
      order: brotherSections.length + 1,
      parentSectionId: parentSectionId,
      type: sectionType.value,
      description: description,
      // openDate: openDate,
      // dueDate: dueDate,
    });

    const updateFileSectionPromises = fileList.map((file) =>
      SectionApi.moveFileToSection({
        documentId: file.uid,
        sectionId: newSection.id,
      })
    );
    await Promise.all(updateFileSectionPromises);

    setSectionName("");
    setSectionType({ label: "List", value: CourseSectionTypeEnum.LIST });
    const newSections = [...sections, newSection];
    dispatch(setSections(newSections));
    setIsSubmitting(false);
    setShowAddSection(false);
    setFileList([]);
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

  return (
    <AddSectionStyles isAdding={showAddSection}>
      {showAddSection ? (
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
                options={newSectionTypeOptions}
                target={({ isOpen, ...triggerProps }) => (
                  <Button
                    {...triggerProps}
                    iconAfter={<ChevronDownIcon label="" />}
                  >
                    {sectionType.label}
                  </Button>
                )}
                value={sectionType}
                onChange={(e) => {
                  if (fileList.length === 0) {
                    setSectionType(e);
                  }
                }}
              />
            </div>
          </div>

          {sectionType.value !== CourseSectionTypeEnum.LIST && (
            <div className="mt-4">
              <h4>Descriptions</h4>
              <ReactQuill
                theme="snow"
                value={description}
                onChange={setDescription}
              />

              <h4>Files</h4>
              <Space
                direction="vertical"
                style={{ width: "100%" }}
                size="large"
              >
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
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <ButtonGroup>
              <Button
                appearance="subtle"
                onClick={() => setShowAddSection(false)}
              >
                Cancel
              </Button>
              <LoadingButton
                type="submit"
                appearance="primary"
                isLoading={isSubmitting}
                onClick={() => handleAddSection()}
              >
                Add
              </LoadingButton>
            </ButtonGroup>
          </div>
        </div>
      ) : (
        <div className="flex h-12 flex-row items-center border-b border-solid border-b-[#ccc]">
          <button onClick={() => setShowAddSection(true)}>
            <AddIcon label="" />
          </button>
          Add
        </div>
      )}
    </AddSectionStyles>
  );
};

export default AddSection;
