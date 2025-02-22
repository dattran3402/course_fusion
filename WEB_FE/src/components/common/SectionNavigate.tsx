import { useState, useEffect, useRef } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hook";
import ChevronDownIcon from "@atlaskit/icon/glyph/chevron-down";
import ChevronRightIcon from "@atlaskit/icon/glyph/chevron-right";
import { Link, useLocation, useParams } from "react-router-dom";
import QuestionCircleIcon from "@atlaskit/icon/glyph/question-circle";
import HipchatSdVideoIcon from "@atlaskit/icon/glyph/hipchat/sd-video";
import DocumentIcon from "@atlaskit/icon/glyph/document";
import styled from "styled-components";
import EditIcon from "@atlaskit/icon/glyph/edit";
import BacklogIcon from "@atlaskit/icon/glyph/backlog";
import QueuesIcon from "@atlaskit/icon/glyph/queues";
import GraphBarIcon from "@atlaskit/icon/glyph/graph-bar";
import PreferencesIcon from "@atlaskit/icon/glyph/preferences";

const SectionNavigateStyles = styled.div<{ active; isDisable }>`
  .wrapper {
    height: 3rem;
  }

  .container {
    height: 60%;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.25rem;
    /* background-color: #e9f2ff;
    color: #0c66e4; */
    background-color: ${(props) => (props.active ? "#e9f2ff" : "")};
    color: ${(props) => (props.active ? "#0c66e4" : "")};
    cursor: ${(props) => (props.isDisable ? "not-allowed" : "")};

    .link {
      word-wrap: break-word;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
`;

import { CourseSectionTypeEnum } from "@/utils/enum";

const SectionNavigate = ({ section }) => {
  const dispatch = useAppDispatch();
  const location = useLocation();

  const sections = useAppSelector((state) => state.context.sections);
  const lectureAndQuiz = useAppSelector(
    (state) => state.context.lectureAndQuiz
  );
  const courseProgress = useAppSelector(
    (state) => state.context.courseProgress
  );
  const currentCourse = useAppSelector((state) => state.context.currentCourse);
  const currentSection = useAppSelector(
    (state) => state.context.currentSection
  );

  const [showChildren, setShowChildren] = useState<boolean>(true);
  const [childSections, setChildSections] = useState<any[]>();

  const [isDisable, setIsDisable] = useState(true);
  const [isSelected, setIsSelected] = useState(false);

  useEffect(() => {
    if (location.pathname.includes("/section/")) {
      setIsSelected(
        location.pathname.split("/section/")[1]?.substring(0, 36) === section.id
      );
    } else if (location.pathname.includes("general")) {
      setIsSelected(section.id === "general");
    } else if (location.pathname.includes("information")) {
      setIsSelected(section.id === "information");
    } else if (location.pathname.includes("sections")) {
      setIsSelected(section.id === "sections");
    } else if (location.pathname.includes("quizzes")) {
      setIsSelected(section.id === "quizzes");
    } else if (location.pathname.includes("analytics")) {
      setIsSelected(section.id === "analytics");
    } else if (location.pathname.includes("chatbot")) {
      setIsSelected(section.id === "chatbot");
    }
  }, [location]);

  useEffect(() => {
    if (section.type !== "SYSTEM" && currentCourse.requiresSequentialViewing) {
      const currentSectionIndex = lectureAndQuiz.findIndex(
        (item) => section.id === item.id
      );
      const previousSection = lectureAndQuiz[currentSectionIndex - 1];

      const currentSectionProgress = courseProgress?.find(
        (item) => item.sectionId === lectureAndQuiz[currentSectionIndex]?.id
      );
      const previousSectionProgress = courseProgress?.find(
        (item) => item.sectionId === previousSection?.id
      );

      if (section.type === CourseSectionTypeEnum.LIST || !previousSection) {
        setIsDisable(false);
      } else {
        if (currentSectionProgress) {
          setIsDisable(false);
        } else if (previousSectionProgress) {
          const newState =
            previousSectionProgress.progressPercent <
            (currentCourse.percentToViewNext || 100);

          setIsDisable(newState);
        } else {
          setIsDisable(true);
        }
      }
    } else {
      setIsDisable(false);
    }
  }, [currentSection, courseProgress]);

  useEffect(() => {
    if (section.id === "manage") {
      const children = [
        {
          name: "General",
          id: "general",
          link: `/course/${currentCourse?.id}/general`,
          type: "SYSTEM",
          parentSectionId: "manage",
          iconBefore: <PreferencesIcon label="" size="small" />,
        },
        {
          name: "Landing page",
          id: "information",
          link: `/course/${currentCourse?.id}/information`,
          type: "SYSTEM",
          parentSectionId: "manage",
          iconBefore: <EditIcon label="" size="small" />,
        },
        {
          name: "Sections",
          id: "sections",
          link: `/course/${currentCourse?.id}/sections`,
          type: "SYSTEM",
          parentSectionId: "manage",
          iconBefore: <BacklogIcon label="" size="small" />,
        },
        {
          name: "Quiz bank",
          id: "quizzes",
          link: `/course/${currentCourse?.id}/quizzes`,
          type: "SYSTEM",
          parentSectionId: "manage",
          iconBefore: <QueuesIcon label="" size="small" />,
        },
        {
          name: "Analytics",
          id: "analytics",
          link: `/course/${currentCourse?.id}/analytics`,
          type: "SYSTEM",
          parentSectionId: "manage",
          iconBefore: <GraphBarIcon label="" size="small" />,
        },
      ];

      setChildSections(children);
    } else {
      const children = sections.filter(
        (sec) => sec.parentSectionId === section.id
      );
      setChildSections(children);
    }
  }, [sections]);

  const IconBefore = () => {
    if (
      section.type === CourseSectionTypeEnum.QUIZ ||
      section.type === CourseSectionTypeEnum.ASSIGNMENT
    ) {
      return <QuestionCircleIcon label="" size="small" />;
    } else if (section.type === CourseSectionTypeEnum.VIDEO) {
      return <HipchatSdVideoIcon label="" size="small" />;
    } else if (section.type === CourseSectionTypeEnum.FILES) {
      return <DocumentIcon label="" size="small" />;
    } else if (section.type === "SYSTEM") {
      return section.iconBefore;
    } else {
      return <div></div>;
    }
  };

  const MainComponent = () => {
    if (section.type === CourseSectionTypeEnum.LIST) {
      return (
        <div className="container ml-[-8px]">
          <button onClick={() => setShowChildren(!showChildren)}>
            {showChildren ? (
              <ChevronDownIcon label="" />
            ) : (
              <ChevronRightIcon label="" />
            )}
          </button>

          <div className="link">{section.name}</div>
        </div>
      );
    } else if (section.type === "SYSTEM") {
      return (
        <div className="container">
          <IconBefore />
          <Link to={section.link}>{section.name}</Link>
        </div>
      );
    } else {
      return (
        <div className="container">
          <IconBefore />
          <Link
            to={`/course/${currentCourse.id}/section/${section.id}`}
            onClick={(event) => {
              if (isDisable) {
                event.preventDefault();
              }
            }}
            style={{
              pointerEvents: isDisable ? "none" : "unset",
            }}
          >
            <div className="link">{section.name}</div>
          </Link>
        </div>
      );
    }
  };

  return (
    <SectionNavigateStyles active={isSelected} isDisable={isDisable}>
      <div className="wrapper">
        <MainComponent />
      </div>

      {showChildren && (
        <div className="ml-6">
          {childSections?.map((section) => (
            <SectionNavigate key={section.id} section={section} />
          ))}
        </div>
      )}
    </SectionNavigateStyles>
  );
};

export default SectionNavigate;
