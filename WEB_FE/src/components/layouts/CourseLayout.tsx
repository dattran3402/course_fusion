import { Routes, Route } from "react-router-dom";
import routes from "@/routes";
import { useEffect, ReactNode, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import AppFrame from "@/components/common/design-system/side-navigation/examples/common/app-frame";
import {
  ButtonItem,
  NavigationFooter,
  NestableNavigationContent,
  NestingItem,
  Section,
  SideNavigation,
} from "@atlaskit/side-navigation";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import Spinner from "@atlaskit/spinner";
import Heading from "@atlaskit/heading";
import PremiumIcon from "@atlaskit/icon/glyph/premium";
import CheckIcon from "@atlaskit/icon/glyph/check";

import Header from "../common/header/Header";
import { RoutesType } from "@/utils/types";
import CourseApi from "@/api/courseApi";
import SectionApi from "@/api/sectionApi";
import {
  setCurrentCourse,
  setSections,
  setStudentCourseRelation,
  setCourseProgress,
} from "@/redux/features/contextSlice";
import { getFileUrl, truncateString } from "@/utils/helper";
import SectionNavigate from "../common/SectionNavigate";
import { CourseSectionTypeEnum } from "@/utils/enum";

const CourseLayout = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const currentSection = useAppSelector(
    (state) => state.context.currentSection
  );
  const lectureAndQuiz = useAppSelector(
    (state) => state.context.lectureAndQuiz
  );
  const courseProgress = useAppSelector((state) => state.context.courseProgress);
  const sections = useAppSelector((state) => state.context.sections);
  const currentCourse = useAppSelector((state) => state.context.currentCourse);
  const user = useAppSelector((state) => state.context.user);
  const studentCourseRelation = useAppSelector(
    (state) => state.context.studentCourseRelation
  );

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMember, setIsMember] = useState<boolean>(true);

  const fetchSectionsData = async () => {
    try {
      const data = await Promise.all([
        SectionApi.getStudentProgressByCourseId({
          courseId: id,
          studentId: user?.id || "",
        }),
        SectionApi.getSectionsByCourseId(id),
      ]);

      const progress = data[0].data;
      const sections = data[1];

      dispatch(setCourseProgress(progress));
      dispatch(setSections(sections));
    } catch (err) {
      console.log("err", err);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    const course = await CourseApi.getCourseById(id);

    let isMember = false;

    isMember = await CourseApi.getCourseStudent({
      courseId: course.id,
      studentId: user?.id || "",
    });

    if (!isMember) {
      const localRandomString = localStorage.getItem("randomString");
      const queryRandomString1 = searchParams.get("randomString");

      if (
        localRandomString &&
        localRandomString !== "" &&
        localRandomString === queryRandomString1
      ) {
        await CourseApi.addStudentToCourse({
          studentId: user?.id || "",
          courseId: course.id,
          price: course.price,
        });
        window.location.reload();
      }
    }

    fetchSectionsData();

    setIsMember(isMember);
    dispatch(setStudentCourseRelation(isMember));
    dispatch(setCurrentCourse(course));
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [id, user]);

  const getRoutes = (routes: RoutesType[]): ReactNode => {
    const res = routes.map((prop, key) => {
      if (prop.layout === "course-layout") {
        return (
          <Route path={`/${prop.path}`} element={prop.component} key={key} />
        );
      } else {
        return null;
      }
    });

    return res.filter((r) => r !== null);
  };

  const [systemList, setSystemList] = useState([
    {
      name: "Management",
      id: "manage",
      link: "",
      type: CourseSectionTypeEnum.LIST,
      parentSectionId: "",
    },

    {
      name: "Chatbot",
      id: "chatbot",
      link: `/course/${currentCourse?.id}/chatbot`,
      type: "SYSTEM",
      parentSectionId: "",
      iconBefore: <PremiumIcon label="" size="small" />,
    },
  ]);

  useEffect(() => {
    const init: any = [
      {
        name: "Chatbot",
        id: "chatbot",
        link: `/course/${currentCourse?.id}/chatbot`,
        type: "SYSTEM",
        parentSectionId: "",
        iconBefore: <PremiumIcon label="" size="small" />,
      },
    ];

    if (user?.id === currentCourse.teacherId) {
      init.unshift({
        name: "Management",
        id: "manage",
        link: "",
        type: CourseSectionTypeEnum.LIST,
        parentSectionId: "",
      });
    }

    if (studentCourseRelation?.finishedDate) {
      init.push({
        name: "Certificate",
        id: "certificate",
        link: `/certificate/${studentCourseRelation?.id}`,
        type: "SYSTEM",
        parentSectionId: "",
        iconBefore: <CheckIcon label="" size="small" />,
      });
    }

    setSystemList(init);
  }, [studentCourseRelation]);

  return (
    <div className="h-full">
      <Header />

      {!isLoading ? (
        <>
          <div className="flex h-[calc(100%_-_58px)] w-full flex-row">
            {isMember && (
              <AppFrame shouldHideAppBar>
                <SideNavigation label="project" testId="side-navigation">
                  <div className="mx-4 my-4 flex w-fit flex-row items-center gap-4">
                    <img
                      src={
                        currentCourse.backgroundFileId
                          ? getFileUrl(currentCourse.backgroundFileId)
                          : "/course-bg.png"
                      }
                      alt={currentCourse.name}
                      className="w-10"
                    ></img>
                    <button
                      onClick={() => navigate(`/preview/${currentCourse.id}`)}
                    >
                      <Heading level="h500">
                        <div style={{ textAlign: "left" }}>
                          {truncateString(currentCourse?.name, 40)}
                        </div>
                      </Heading>
                    </button>
                  </div>
                  <NestableNavigationContent
                    initialStack={[]}
                    testId="nestable-navigation-content"
                  >
                    <Section>
                      <div className="ml-2 w-full overflow-x-hidden">
                        {systemList.map((section) => (
                          <SectionNavigate key={section.id} section={section} />
                        ))}
                      </div>
                    </Section>

                    <Section isList>
                      <div
                        className="ml-2 w-full overflow-x-hidden"
                        key={
                          JSON.stringify(currentCourse) +
                          currentSection.id +
                          JSON.stringify(lectureAndQuiz) +
                          location.pathname
                        }
                      >
                        {sections
                          .filter((section) => section.parentSectionId === "")
                          .map((section) => (
                            <SectionNavigate
                              key={section.id}
                              section={section}
                            />
                          ))}
                      </div>
                    </Section>
                  </NestableNavigationContent>
                </SideNavigation>
              </AppFrame>
            )}

            <div className="w-full overflow-y-auto">
              <Routes>{getRoutes(routes)}</Routes>
            </div>
          </div>

          {/* <ChatPopup /> */}
        </>
      ) : (
        <div className="flex h-[calc(100%_-_100px)] w-full items-center justify-center">
          <Spinner size="large" />
        </div>
      )}
    </div>
  );
};

export default CourseLayout;
