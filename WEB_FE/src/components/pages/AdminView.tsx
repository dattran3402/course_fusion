import React, { useState, useEffect, Fragment, useCallback } from "react";
import ReactQuill from "react-quill";
import Heading from "@atlaskit/heading";
import Tabs, { Tab, TabList, TabPanel } from "@atlaskit/tabs";
import LoadingButton from "@atlaskit/button/loading-button";
import Button from "@atlaskit/button/standard-button";
import TextField from "@atlaskit/textfield";
import Form, { Field } from "@atlaskit/form";
import Modal, {
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTransition,
} from "@atlaskit/modal-dialog";
import Textfield from "@atlaskit/textfield";
import { useAppSelector, useAppDispatch } from "@/redux/hook";
import { Link } from "react-router-dom";

import CourseApi from "@/api/courseApi";
import UserManage from "../common/admin-view/UserManage";
import AdminPerformance from "../common/admin-view/AdminPerformance";
import AdminCourseManage from "../common/admin-view/AdminCourseManage";

const AdminView = () => {
  const user = useAppSelector((state) => state.context.user);
  const dispatch = useAppDispatch();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [stripeCustomerId, setStripeCustomerId] = useState<string>("");

  useEffect(() => {
    if (user?.id !== "") {
      setStripeCustomerId(user?.stripeCustomerId || "");
    }
  }, [user]);

  return (
    <div className="mt-4 flex justify-center">
      <div className="w-full max-w-7xl px-4">
        <div className="px-2 py-4">
          <Heading level="h700">Admin view</Heading>
        </div>
        <div>
          <Tabs
            onChange={(index) => console.log("Selected Tab", index + 1)}
            id="default"
          >
            <TabList>
              <Tab>Courses manage</Tab>
              <Tab>Users manage</Tab>
              <Tab>Performance</Tab>
            </TabList>
            <TabPanel>
              <AdminCourseManage />
            </TabPanel>
            <TabPanel>
              <UserManage />
            </TabPanel>
            <TabPanel>
              <AdminPerformance />
            </TabPanel>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminView;
