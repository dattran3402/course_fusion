import { useParams } from "react-router-dom";
import React, { useState, useEffect, Fragment, useCallback } from "react";
import Avatar from "@atlaskit/avatar";
import ReactQuill from "react-quill";
import Heading from "@atlaskit/heading";
import Tabs, { Tab, TabList, TabPanel } from "@atlaskit/tabs";
import LoadingButton from "@atlaskit/button/loading-button";
import Button from "@atlaskit/button";
import TextField from "@atlaskit/textfield";
import Form, {
  ErrorMessage,
  Field,
  FormFooter,
  FormSection,
} from "@atlaskit/form";
import Modal, {
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTransition,
} from "@atlaskit/modal-dialog";
import ButtonGroup from "@atlaskit/button/button-group";
import { Upload, Space, Modal as AntdModal, UploadProps } from "antd";
import { useAppSelector, useAppDispatch } from "@/redux/hook";
import type { UploadFile } from "antd/es/upload/interface";
import axios from "axios";
import ExportIcon from "@atlaskit/icon/glyph/export";
import EditorWarningIcon from "@atlaskit/icon/glyph/editor/warning";

import UserApi from "@/api/userApi";
import FileApi from "@/api/fileApi";
import { UserType, CourseType, AntdFileType } from "@/utils/types";
import { getBase64, getFileUrl } from "@/utils/helper";
import { FileTypeEnum } from "@/utils/enum";
import { addFlag, setUser } from "@/redux/features/contextSlice";
import AuthApi from "@/api/authApi";

const AccountSettings = () => {
  const user = useAppSelector((state) => state.context.user);
  const dispatch = useAppDispatch();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [backgroundImageFileList, setUserProfileImageFileList] = useState<
    UploadFile[]
  >([]);
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [previewTitle, setPreviewTitle] = useState<string>("");
  const [newImageId, setNewImageId] = useState<string>("");

  const handleSubmit = async (data) => {
    try {
      await UserApi.updateUser({
        userId: user?.id,
        headline: data.headline,
        biography: data.biography,
        website: data.website,
        twitter: data.twitter,
        facebook: data.facebook,
        linkedIn: data.linkedIn,
        youtube: data.youtube,
        name: data.name,
      });

      dispatch(
        addFlag({
          color: "success",
          content: "Update account success!",
        })
      );
    } catch (err) {
      console.log("err", err);
      dispatch(
        addFlag({
          color: "error",
          content: "Submit failed!",
        })
      );
    }
  };

  const handleCancelPreview = () => setPreviewOpen(false);

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
        setNewImageId(res.data.data.id);
        onSuccess(res.data.data);
      })
      .catch((err) => {
        const error = new Error("Some error");
        onError({ event: error });
      });
  };

  const fetchUser = async () => {
    try {
      const res = await UserApi.getUserById(user?.id || "");
      dispatch(setUser(res));
    } catch (err) {
      console.log("err", err);
    }
  };

  const handleSaveAvatar = async () => {
    try {
      await UserApi.updateUser({
        userId: user?.id || "",
        avatarFileId: newImageId,
      });
      fetchUser();
      setNewImageId("");
    } catch (err) {
      console.log("err", err);
    }
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

    setUserProfileImageFileList(newFileList);
  };

  const handleRemoveFile = async (id, deleteUserAvatar = true) => {
    await FileApi.removeFileById(id);
    setPreviewImage("");

    if (deleteUserAvatar) {
      await UserApi.updateUser({
        userId: user?.id || "",
        avatarFileId: "",
      });

      fetchUser();
    }
  };

  const handleChangePassword = async (data) => {
    try {
      setIsSubmitting(true);

      if (data.oldPassword.trim() === "") {
        const errors = {
          oldPassword: "Password must be a valid string!",
          newPassword: undefined,
          confirmPassword: undefined,
        };

        setIsSubmitting(false);
        return errors;
      }
      if (data.newPassword.trim() === "") {
        const errors = {
          oldPassword: undefined,
          newPassword: "Password must be a valid string!",
          confirmPassword: undefined,
        };

        setIsSubmitting(false);
        return errors;
      }
      if (data.newPassword.trim() === data.oldPassword.trim()) {
        const errors = {
          oldPassword: undefined,
          newPassword: "Please use another password!",
          confirmPassword: undefined,
        };

        setIsSubmitting(false);
        return errors;
      }
      if (data.newPassword.trim() !== data.confirmPassword.trim()) {
        const errors = {
          oldPassword: undefined,
          newPassword: undefined,
          confirmPassword: "Please confirm your password!",
        };

        setIsSubmitting(false);
        return errors;
      }

      await AuthApi.signIn({
        email: user?.email,
        password: data.oldPassword.trim(),
      });

      await UserApi.updateUser({
        userId: user?.id,
        password: data.newPassword.trim(),
      });

      setIsSubmitting(false);
      dispatch(
        addFlag({
          color: "success",
          content: `Password changed successfully!`,
        })
      );
      closeModal();
    } catch (err) {
      dispatch(
        addFlag({
          color: "error",
          content: "Fail to change password!",
        })
      );
      const errors = {
        oldPassword: "Wrong password!",
        newPassword: undefined,
        confirmPassword: undefined,
      };

      setIsSubmitting(false);
      return errors;
    }
  };

  return (
    <div className="mt-4 flex justify-center">
      <div className="w-full max-w-7xl px-4">
        <div className="px-2 py-4">
          <Heading level="h700">Account settings</Heading>
        </div>
        <div>
          <Tabs
            onChange={(index) => console.log("Selected Tab", index + 1)}
            id="default"
          >
            <TabList>
              <Tab>Personal profile</Tab>
              <Tab>Profile picture</Tab>
              <Tab>Security</Tab>
            </TabList>
            <TabPanel>
              <div className="w-full">
                <Form<{ email: string; password: string; remember: boolean }>
                  onSubmit={handleSubmit}
                >
                  {({ formProps, submitting }) => (
                    <form {...formProps}>
                      <FormSection>
                        <div className="flex w-full flex-row gap-10">
                          <div className="flex-1">
                            <Field
                              name="name"
                              label="Name"
                              defaultValue={user?.name}
                              isRequired
                            >
                              {({ fieldProps, error }) => (
                                <Fragment>
                                  <TextField {...fieldProps} />
                                </Fragment>
                              )}
                            </Field>

                            <Field
                              name="headline"
                              label="Headline"
                              defaultValue={user?.headline}
                            >
                              {({ fieldProps, error }) => (
                                <Fragment>
                                  <TextField {...fieldProps} />
                                </Fragment>
                              )}
                            </Field>

                            <Field
                              name="biography"
                              label="Biography"
                              defaultValue={user?.biography}
                            >
                              {({ fieldProps, error }) => (
                                <Fragment>
                                  <TextField {...fieldProps} />
                                </Fragment>
                              )}
                            </Field>

                            <Field
                              name="website"
                              label="Website"
                              defaultValue={user?.website}
                            >
                              {({ fieldProps, error }) => (
                                <Fragment>
                                  <TextField {...fieldProps} />
                                </Fragment>
                              )}
                            </Field>
                          </div>

                          <div className="flex-1">
                            <Field
                              name="twitter"
                              label="Twitter"
                              defaultValue={user?.twitter}
                            >
                              {({ fieldProps, error }) => (
                                <Fragment>
                                  <TextField {...fieldProps} />
                                </Fragment>
                              )}
                            </Field>

                            <Field
                              name="facebook"
                              label="Facebook"
                              defaultValue={user?.facebook}
                            >
                              {({ fieldProps, error }) => (
                                <Fragment>
                                  <TextField {...fieldProps} />
                                </Fragment>
                              )}
                            </Field>

                            <Field
                              name="linkedIn"
                              label="LinkedIn"
                              defaultValue={user?.linkedIn}
                            >
                              {({ fieldProps, error }) => (
                                <Fragment>
                                  <TextField {...fieldProps} />
                                </Fragment>
                              )}
                            </Field>

                            <Field
                              name="youtube"
                              label="Youtube"
                              defaultValue={user?.youtube}
                            >
                              {({ fieldProps, error }) => (
                                <Fragment>
                                  <TextField {...fieldProps} />
                                </Fragment>
                              )}
                            </Field>
                          </div>
                        </div>
                      </FormSection>

                      <FormFooter>
                        <ButtonGroup>
                          <LoadingButton
                            type="submit"
                            appearance="primary"
                            isLoading={submitting}
                          >
                            Save
                          </LoadingButton>
                        </ButtonGroup>
                      </FormFooter>
                    </form>
                  )}
                </Form>
              </div>
            </TabPanel>
            <TabPanel>
              <div>
                <div className="flex p-10">
                  <div className="px-10">
                    <Avatar
                      size="xxlarge"
                      src={getFileUrl(user?.avatarFileId)}
                      name="Atlassian account: Emil Rottmayer"
                    />
                  </div>

                  <div>
                    <Space
                      direction="vertical"
                      style={{ width: "100%" }}
                      size="large"
                    >
                      <Upload
                        customRequest={handleUploadFiles}
                        onChange={handleChange}
                        listType="picture"
                        fileList={backgroundImageFileList}
                        onRemove={(e) => handleRemoveFile(e.uid, false)}
                        maxCount={1}
                        onPreview={handlePreview}
                      >
                        {backgroundImageFileList?.length === 0 && (
                          <Button iconBefore={<ExportIcon label="" />}>
                            Upload
                          </Button>
                        )}
                      </Upload>
                    </Space>

                    <AntdModal
                      open={previewOpen}
                      title={previewTitle}
                      footer={null}
                      onCancel={handleCancelPreview}
                    >
                      <img
                        alt="example"
                        style={{ width: "100%" }}
                        src={previewImage}
                      />
                    </AntdModal>

                    <div className="mt-10 flex gap-4">
                      <Button
                        isDisabled={!user?.avatarFileId}
                        appearance="warning"
                        onClick={() => {
                          handleRemoveFile(user?.avatarFileId);
                        }}
                      >
                        Remove
                      </Button>

                      <Button
                        isDisabled={newImageId === ""}
                        appearance="primary"
                        onClick={() => {
                          handleSaveAvatar();
                        }}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabPanel>
            <TabPanel>
              <div className="mx-5 mt-10">
                <LoadingButton
                  type="submit"
                  appearance="warning"
                  isLoading={isSubmitting}
                  iconBefore={<EditorWarningIcon label="" />}
                  onClick={openModal}
                >
                  Change password
                </LoadingButton>

                <ModalTransition>
                  {isOpen && (
                    <Modal
                      onClose={closeModal}
                      shouldCloseOnOverlayClick={false}
                    >
                      <ModalHeader>
                        <ModalTitle>Change password</ModalTitle>
                      </ModalHeader>
                      <ModalBody>
                        <Form<{
                          email: string;
                          password: string;
                          remember: boolean;
                        }>
                          onSubmit={handleChangePassword}
                        >
                          {({ formProps, submitting }) => (
                            <form {...formProps}>
                              <FormSection>
                                <Field
                                  aria-required={true}
                                  name="oldPassword"
                                  label="Current password"
                                  defaultValue=""
                                  isRequired
                                >
                                  {({ fieldProps, error, valid, meta }) => {
                                    return (
                                      <Fragment>
                                        <TextField
                                          type="password"
                                          {...fieldProps}
                                        />
                                        {error && (
                                          <ErrorMessage>{error}</ErrorMessage>
                                        )}
                                      </Fragment>
                                    );
                                  }}
                                </Field>
                                <Field
                                  aria-required={true}
                                  name="newPassword"
                                  label="New password"
                                  defaultValue=""
                                  isRequired
                                >
                                  {({ fieldProps, error, valid, meta }) => {
                                    return (
                                      <Fragment>
                                        <TextField
                                          type="password"
                                          {...fieldProps}
                                        />
                                        {error && (
                                          <ErrorMessage>{error}</ErrorMessage>
                                        )}
                                      </Fragment>
                                    );
                                  }}
                                </Field>
                                <Field
                                  aria-required={true}
                                  name="confirmPassword"
                                  label="Confirm your new password"
                                  defaultValue=""
                                  isRequired
                                >
                                  {({ fieldProps, error, valid, meta }) => {
                                    return (
                                      <Fragment>
                                        <TextField
                                          type="password"
                                          {...fieldProps}
                                        />
                                        {error && (
                                          <ErrorMessage>{error}</ErrorMessage>
                                        )}
                                      </Fragment>
                                    );
                                  }}
                                </Field>
                              </FormSection>

                              <FormFooter>
                                <div className="my-4">
                                  <ButtonGroup>
                                    <Button
                                      appearance="subtle"
                                      onClick={closeModal}
                                    >
                                      Cancel
                                    </Button>
                                    <LoadingButton
                                      type="submit"
                                      appearance="primary"
                                      isLoading={isSubmitting}
                                    >
                                      Submit
                                    </LoadingButton>
                                  </ButtonGroup>
                                </div>
                              </FormFooter>
                            </form>
                          )}
                        </Form>
                      </ModalBody>
                    </Modal>
                  )}
                </ModalTransition>
              </div>
            </TabPanel>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
