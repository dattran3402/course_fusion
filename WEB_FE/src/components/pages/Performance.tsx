import { useParams } from "react-router-dom";
import React, { useState, useEffect, Fragment, useCallback } from "react";
import Avatar from "@atlaskit/avatar";
import ReactQuill from "react-quill";
import Heading from "@atlaskit/heading";
import Tabs, { Tab, TabList, TabPanel } from "@atlaskit/tabs";
import LoadingButton from "@atlaskit/button/loading-button";
import Button from "@atlaskit/button/standard-button";
import { Checkbox } from "@atlaskit/checkbox";
import TextField from "@atlaskit/textfield";
import Form, {
  CheckboxField,
  ErrorMessage,
  Field,
  FormFooter,
  FormHeader,
  FormSection,
  HelperMessage,
  RequiredAsterisk,
} from "@atlaskit/form";
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
import { addFlag } from "@/redux/features/contextSlice";
import AuthApi from "@/api/authApi";

const Performance = () => {
  const { id } = useParams();

  const user = useAppSelector((state) => state.context.user);
  const dispatch = useAppDispatch();

  return (
    <div className="mt-4 flex justify-center">
      <div className="w-full max-w-7xl px-4">
        <div className="px-2 py-4">
          <Heading level="h700">Performance</Heading>
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
            <TabPanel>Performance</TabPanel>
            <TabPanel>Performance</TabPanel>
            <TabPanel>Performance</TabPanel>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Performance;
