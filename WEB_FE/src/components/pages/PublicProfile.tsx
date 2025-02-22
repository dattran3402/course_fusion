import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Avatar from "@atlaskit/avatar";
import Heading from "@atlaskit/heading";
import {
  FacebookFilled,
  TwitterSquareFilled,
  LinkedinFilled,
  YoutubeFilled,
  MailFilled,
  GlobalOutlined,
} from "@ant-design/icons";
import styled from "styled-components";
import Spinner from "@atlaskit/spinner";

import UserApi from "@/api/userApi";
import { UserType, CourseType } from "@/utils/types";
import CourseApi from "@/api/courseApi";
import { Link } from "react-router-dom";
import { getFileUrl } from "@/utils/helper";
import CourseCard from "../common/CourseCard";
import { CourseStatus } from "@/utils/enum";

const PublicProfileStyles = styled.div`
  display: flex;
  justify-content: center;

  .container {
    width: 100%;
    max-width: 1200px;
    display: flex;
    gap: 10px;

    .floating-side {
      position: relative;

      .floating-side-container {
        position: sticky;
        top: 72px;
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 300px;
      }
    }

    .general-side {
      flex: 1;
    }
  }
`;

const PublicProfile = () => {
  const { id } = useParams();

  const [viewUser, setViewUser] = useState<UserType>();
  const [courseList, setCourseList] = useState<CourseType[]>();
  const [isFetchingUserData, setIsFetchingUserData] = useState<boolean>(true);
  const [isFetchingCourses, setIsFetchingCourses] = useState<boolean>(true);

  const fetchCourses = async (id) => {
    try {
      setIsFetchingCourses(true);

      const res = await CourseApi.getCoursesByTeacher({
        teacherId: id,
        status: CourseStatus.PUBLIC,
      });

      setCourseList(res.data);
      setIsFetchingCourses(false);
    } catch (err) {
      console.log("err", err);
      setCourseList([]);
      setIsFetchingCourses(false);
    }
  };

  const fetchUserData = async (id) => {
    try {
      setIsFetchingUserData(true);

      const res = await UserApi.getUserById(id);

      setViewUser(res);
      setIsFetchingUserData(false);
    } catch (err) {
      console.log("err", err);
      setIsFetchingUserData(false);
    }
  };

  useEffect(() => {
    fetchUserData(id);
    fetchCourses(id);
  }, [id]);

  return (
    <PublicProfileStyles>
      {isFetchingUserData ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <Spinner interactionName="load" size="large" />
        </div>
      ) : (
        <div className="container">
          <div className="floating-side">
            <div className="floating-side-container">
              <Avatar
                appearance="circle"
                src={getFileUrl(viewUser?.avatarFileId)}
                size="xlarge"
                name={viewUser?.name}
              ></Avatar>
              <div>
                <Heading level="h800">{viewUser?.name}</Heading>
              </div>

              <div>
                <div className="mt-4 flex gap-3">
                  <MailFilled />
                  <div>{viewUser?.email}</div>
                </div>
                {viewUser?.website && (
                  <div className="mt-4 flex gap-3">
                    <GlobalOutlined />
                    <a
                      href={viewUser?.website}
                      target="_blank"
                      className="mt-[-5px]"
                      rel="noopener noreferrer"
                    >
                      {viewUser?.website}
                    </a>
                  </div>
                )}
                {viewUser?.facebook && (
                  <div className="mt-4 flex gap-3">
                    <FacebookFilled />
                    <a
                      href={viewUser?.facebook}
                      target="_blank"
                      className="mt-[-5px]"
                      rel="noopener noreferrer"
                    >
                      {viewUser?.facebook}
                    </a>
                  </div>
                )}

                {viewUser?.twitter && (
                  <div className="mt-4 flex gap-3">
                    <TwitterSquareFilled />
                    <a
                      href={viewUser?.twitter}
                      target="_blank"
                      className="mt-[-5px]"
                      rel="noopener noreferrer"
                    >
                      {viewUser?.twitter}
                    </a>
                  </div>
                )}

                {viewUser?.linkedIn && (
                  <div className="mt-4 flex gap-3">
                    <LinkedinFilled />
                    <a
                      href={viewUser?.linkedIn}
                      target="_blank"
                      className="mt-[-5px]"
                      rel="noopener noreferrer"
                    >
                      {viewUser?.linkedIn}
                    </a>
                  </div>
                )}

                {viewUser?.youtube && (
                  <div className="mt-4 flex gap-3">
                    <YoutubeFilled />
                    <a
                      href={viewUser?.youtube}
                      target="_blank"
                      className="mt-[-5px]"
                      rel="noopener noreferrer"
                    >
                      {viewUser?.youtube}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="general-side">
            <div className="mt-10">
              <Heading level="h500">{viewUser?.headline}</Heading>

              <div className="mt-4">
                <Heading level="h600">About me</Heading>
                {viewUser?.biography || "User doesn't wrote any thing"}
              </div>
            </div>

            <div className="mt-10">
              <Heading level="h600">Courses:</Heading>
              {isFetchingCourses ? (
                <div className="flex min-h-[400px] items-center justify-center">
                  <Spinner interactionName="load" size="large" />
                </div>
              ) : (
                <>
                  {courseList && courseList.length > 0 ? (
                    <div className="auto-rows-[320px]; mt-4 grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))]">
                      {courseList?.map((course) => (
                        <CourseCard course={course} />
                      ))}
                    </div>
                  ) : (
                    <div>This user doesn't have any courses</div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </PublicProfileStyles>
  );
};

export default PublicProfile;
