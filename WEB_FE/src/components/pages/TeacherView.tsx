import React, { useState, useEffect, Fragment, useCallback } from "react";
import ReactQuill from "react-quill";
import Heading from "@atlaskit/heading";
import Tabs, { Tab, TabList, TabPanel } from "@atlaskit/tabs";
import LoadingButton from "@atlaskit/button/loading-button";
import TextField from "@atlaskit/textfield";
import { useAppSelector, useAppDispatch } from "@/redux/hook";
import { Link } from "react-router-dom";

import UserApi from "@/api/userApi";
import { UserType, CourseType, AntdFileType } from "@/utils/types";
import { getBase64, getFileUrl } from "@/utils/helper";
import { addFlag } from "@/redux/features/contextSlice";
import CourseApi from "@/api/courseApi";
import TeacherCourseManage from "../common/teacher-view/TeacherCourseManage";
import TeacherPerformance from "../common/teacher-view/TeacherPerformance";

const TeacherView = () => {
  const user = useAppSelector((state) => state.context.user);
  const dispatch = useAppDispatch();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [stripeCustomerId, setStripeCustomerId] = useState<string>("");
  const [courseList, setCourseList] = useState<CourseType[]>();

  useEffect(() => {
    if (user?.id !== "") {
      setStripeCustomerId(user?.stripeCustomerId || "");
    }
  }, [user]);

  const handleChangeStripeCustomerId = async () => {
    try {
      setIsSubmitting(true);

      await UserApi.updateUser({
        userId: user?.id,
        stripeCustomerId: stripeCustomerId,
      });

      dispatch(
        addFlag({
          color: "success",
          content: `Update stripe id successfully!`,
        })
      );
      setIsSubmitting(false);
    } catch (err) {
      dispatch(
        addFlag({
          color: "error",
          content: "Fail to change stripe id!",
        })
      );

      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-4 flex justify-center">
      <div className="w-full max-w-7xl px-4">
        <div className="px-2 py-4">
          <Heading level="h700">Teacher view</Heading>
        </div>
        <div>
          <Tabs
            onChange={(index) => console.log("Selected Tab", index + 1)}
            id="default"
          >
            <TabList>
              <Tab>My courses</Tab>
              <Tab>Performance</Tab>
              <Tab>Payment</Tab>
            </TabList>
            <TabPanel>
              <TeacherCourseManage />
            </TabPanel>
            <TabPanel>
              <TeacherPerformance />
            </TabPanel>
            <TabPanel>
              <div className="mx-5 mt-10 flex flex-row items-center gap-10">
                <div className="whitespace-nowrap">Stripe ID: </div>
                <TextField
                  value={stripeCustomerId}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setStripeCustomerId(e.target.value);
                  }}
                />
                <LoadingButton
                  type="submit"
                  isLoading={isSubmitting}
                  appearance="primary"
                  onClick={() => {
                    handleChangeStripeCustomerId();
                  }}
                >
                  Submit
                </LoadingButton>
              </div>
            </TabPanel>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default TeacherView;
