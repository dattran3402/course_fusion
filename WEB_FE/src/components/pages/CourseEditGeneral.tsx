import { useState, useEffect, useCallback } from "react";
import Button from "@atlaskit/button";
import { InlineEditableTextfield } from "@atlaskit/inline-edit";
import Modal, {
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTransition,
} from "@atlaskit/modal-dialog";
import ExportIcon from "@atlaskit/icon/glyph/export";
import { Upload, Space, Modal as AntdModal, UploadProps } from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import axios from "axios";
import Breadcrumbs, { BreadcrumbsItem } from "@atlaskit/breadcrumbs";
import __noop from "@atlaskit/ds-lib/noop";
import { CreatableSelect } from "@atlaskit/select";
import Heading from "@atlaskit/heading";
import Toggle from "@atlaskit/toggle";
import { useAppDispatch, useAppSelector } from "@/redux/hook";

import LoadingButton from "../common/buttons/LoadingButton";
import CourseApi from "@/api/courseApi";
import FileApi from "@/api/fileApi";
import SectionApi from "@/api/sectionApi";
import { FileTypeEnum, CourseStatus } from "@/utils/enum";
import { getBase64 } from "@/utils/helper";
import { AntdFileType } from "@/utils/types";
import {
  setCurrentCourse,
  setSections,
  setUser,
} from "@/redux/features/contextSlice";

const CourseEditGeneral = () => {
  const sections = useAppSelector((state) => state.context.sections);
  const currentCourse = useAppSelector((state) => state.context.currentCourse);
  const dispatch = useAppDispatch();

  const [courseName, setCourseName] = useState<string>("");
  const [courseTags, setCourseTags] = useState<string[]>([]);
  const [coursePrice, setCoursePrice] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [backgroundImageFileList, setBackgroundImageFileList] = useState<
    UploadFile[]
  >([]);
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [previewTitle, setPreviewTitle] = useState<string>("");
  const [tagList, setTagList] = useState<string[]>([]);
  const [requiresSequentialViewing, setRequiresSequentialViewing] =
    useState<boolean>(true);
  const [percentToViewNext, setPercentToViewNext] = useState<number>(0);

  useEffect(() => {
    setCourseName(currentCourse.name);
    setCoursePrice(currentCourse.price || 0);
    setRequiresSequentialViewing(
      currentCourse?.requiresSequentialViewing || false
    );
    setPercentToViewNext(currentCourse?.percentToViewNext || 0);
  }, [currentCourse]);

  const fetchData = async () => {
    try {
      if (currentCourse.id) {
        if (
          currentCourse.backgroundFileId &&
          currentCourse.backgroundFileId !== ""
        ) {
          const bgImage = await FileApi.getFileDetailById(
            currentCourse.backgroundFileId
          );

          setBackgroundImageFileList([
            {
              uid: bgImage.data.id,
              name: bgImage.data.name,
              status: "done",
              url: bgImage.data.url,
              type: bgImage.data.type,
            },
          ]);
        }

        const tags = await CourseApi.getAllTags();
        setTagList(tags.data || []);
        setCourseTags(currentCourse?.tags || []);
      }
    } catch (err) {
      setBackgroundImageFileList([]);
      setTagList([]);

      console.log("error", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentCourse.id]);

  const handlePublishCourse = async () => {
    setIsSubmitting(true);

    let newStatus;
    if (currentCourse.status === CourseStatus.PRIVATE) {
      newStatus = CourseStatus.REVIEW;
    } else {
      newStatus = CourseStatus.PRIVATE;
    }
    await CourseApi.updateCourse({
      courseId: currentCourse.id,
      status: newStatus,
    });
    window.location.reload();
  };

  const fetchCourseData = async () => {
    try {
      const course = await CourseApi.getCourseById(currentCourse.id);

      dispatch(setCurrentCourse(course));
    } catch (err) {
      console.log("err", err);
    }
  };

  const handleUpdateCourse = async ({
    newCourseName,
    newCoursePrice,
    newCourseTags,
    newRequiresSequentialViewing,
    newPercentToViewNext,
  }: {
    newCourseName?: string;
    newCoursePrice?: number;
    newCourseTags?: string[];
    newRequiresSequentialViewing?: boolean;
    newPercentToViewNext?: number;
  }) => {
    try {
      await CourseApi.updateCourse({
        courseId: currentCourse.id,
        name: newCourseName,
        price: newCoursePrice,
        tags: newCourseTags,
        requiresSequentialViewing: newRequiresSequentialViewing,
        percentToViewNext: newPercentToViewNext,
      });

      if (newCourseName) {
        setCourseName(newCourseName);
      }
      if (newCoursePrice !== null && newCoursePrice !== undefined) {
        setCoursePrice(newCoursePrice);
      }
      if (newRequiresSequentialViewing !== undefined) {
        setRequiresSequentialViewing(newRequiresSequentialViewing);
      }
      if (newPercentToViewNext !== undefined) {
        setPercentToViewNext(newPercentToViewNext);
      }

      fetchCourseData();
    } catch (err) {
      console.log(err);
    }
  };

  const handleCancel = () => setPreviewOpen(false);

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as AntdFileType);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
    setPreviewTitle(
      file.name || file.url!.substring(file.url!.lastIndexOf("/") + 1)
    );
  };

  const validateFileType = (file) => {
    if (!file) {
      return false;
    }

    if (file.type !== FileTypeEnum.JPEG && file.type !== FileTypeEnum.PNG) {
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
      .then(async (res) => {
        await CourseApi.updateCourse({
          courseId: currentCourse.id,
          backgroundFileId: res.data.data.id,
        });

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
        file.uid = file.response.id;
        file.url = file.response.url;
        file.status = "done";
      }

      return file;
    });

    setBackgroundImageFileList(newFileList);
  };

  const handleRemoveFile = async (e) => {
    await FileApi.removeFileById(e.uid);

    await CourseApi.updateCourse({
      courseId: currentCourse.id,
      backgroundFileId: "",
    });
  };

  return (
    <div className="mx-10 my-2.5">
      <Breadcrumbs onExpand={__noop}>
        <BreadcrumbsItem text="Manage" key="manage" />
        <BreadcrumbsItem text="General" key="general" />
      </Breadcrumbs>

      <div className="mt-10">
        <Heading level="h500">1. Name</Heading>
        <InlineEditableTextfield
          defaultValue={courseName}
          label=""
          onConfirm={(value) =>
            handleUpdateCourse({
              newCourseName: value,
            })
          }
          placeholder="Click to enter text"
          // validate={validate}
        />
      </div>

      <div className="mt-10">
        <Heading level="h500">2. Background</Heading>
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          <Upload
            customRequest={handleUploadFiles}
            onChange={handleChange}
            listType="picture"
            fileList={backgroundImageFileList}
            onRemove={handleRemoveFile}
            maxCount={1}
            onPreview={handlePreview}
          >
            {backgroundImageFileList?.length === 0 && (
              <Button iconBefore={<ExportIcon label="" />}>Upload</Button>
            )}
          </Upload>
        </Space>

        <AntdModal
          open={previewOpen}
          title={previewTitle}
          footer={null}
          onCancel={handleCancel}
        >
          <img alt="example" style={{ width: "100%" }} src={previewImage} />
        </AntdModal>
      </div>

      <div className="mt-10">
        <Heading level="h500">3. Course price</Heading>
        <InlineEditableTextfield
          defaultValue={coursePrice}
          label=""
          onConfirm={(value) =>
            handleUpdateCourse({
              newCoursePrice: Number(value),
            })
          }
          placeholder="Click to enter course price"
          // validate={validate}
        />
      </div>

      <div className="mt-10">
        <Heading level="h500">4. Tags (maximum 10 tags)</Heading>
        <CreatableSelect
          isMulti
          options={tagList.map((op) => ({
            label: op,
            value: op,
          }))}
          value={courseTags?.map((op) => ({
            label: op,
            value: op,
          }))}
          onChange={(e) => {
            const newData = Array.from(
              new Set(e.map((op) => op.label.toLocaleLowerCase()))
            );
            if (newData.length < 10) {
              setCourseTags(newData);
              handleUpdateCourse({
                newCourseTags: newData,
              });
            }
          }}
        />
      </div>

      <div className="mt-10 flex gap-6">
        <Heading level="h500">5. Require Sequential Viewing?</Heading>
        <Toggle
          // defaultChecked={requiresSequentialViewing}
          isChecked={requiresSequentialViewing}
          onChange={() => {
            handleUpdateCourse({
              newRequiresSequentialViewing: !requiresSequentialViewing,
            });
          }}
        />
      </div>

      {requiresSequentialViewing && (
        <div className="mt-10">
          <Heading level="h500">
            {`6. Percent To View Next Lecture (< 100)`}
          </Heading>
          <InlineEditableTextfield
            defaultValue={percentToViewNext}
            label=""
            onConfirm={(value) => {
              let data = Number(value);

              if (data > 100) {
                data = 100;
              } else if (data <= 0) {
                return;
              }

              handleUpdateCourse({
                newPercentToViewNext: data,
              });
            }}
            placeholder=""
            // validate={validate}
          />
        </div>
      )}

      <div className="mt-10">
        <Heading level="h500">{`${
          requiresSequentialViewing ? "7" : "6"
        }. Submit course`}</Heading>
        <div className="mb-10 mt-4">
          <Button
            appearance={
              currentCourse.status === CourseStatus.PRIVATE
                ? "primary"
                : "warning"
            }
            onClick={openModal}
            isDisabled={currentCourse.status === CourseStatus.PUBLIC}
          >
            {currentCourse.status === CourseStatus.PRIVATE &&
              "Submit course for review"}
            {currentCourse.status === CourseStatus.REVIEW && "Cancel review"}
            {currentCourse.status === CourseStatus.PUBLIC &&
              "Course now is public"}
          </Button>

          <ModalTransition>
            {isOpen && (
              <Modal onClose={closeModal}>
                <ModalHeader>
                  <ModalTitle>
                    {currentCourse.status === CourseStatus.PRIVATE &&
                      "Submit course for review"}
                    {currentCourse.status === CourseStatus.REVIEW &&
                      "Cancel review"}
                  </ModalTitle>
                </ModalHeader>
                <ModalBody>
                  {currentCourse.status === CourseStatus.PRIVATE &&
                    "It will take few days to review all files & lectures before publish your course"}
                  {currentCourse.status === CourseStatus.PUBLIC &&
                    "The course will be disable for everyone"}
                </ModalBody>
                <ModalFooter>
                  <Button appearance="subtle" onClick={closeModal}>
                    Cancel
                  </Button>
                  <LoadingButton
                    appearance="primary"
                    type="submit"
                    onClick={() => handlePublishCourse()}
                    isLoading={isSubmitting}
                    content="Confirm"
                    isDisabled={isSubmitting}
                  />
                </ModalFooter>
              </Modal>
            )}
          </ModalTransition>
        </div>
        <div className="h-60"></div>
      </div>
    </div>
  );
};

export default CourseEditGeneral;
