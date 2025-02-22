import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hook";
import { useParams } from "react-router-dom";
import EditIcon from "@atlaskit/icon/glyph/edit";
import Button from "@atlaskit/button";
import EmptyState from "@atlaskit/empty-state";
import { useNavigate } from "react-router-dom";

import { getSectionByOffset } from "@/utils/helper";
import { SectionType } from "@/utils/types";

const CourseNoSection = () => {
  const dispatch = useAppDispatch();
  const { sectionId } = useParams();
  const navigate = useNavigate();

  const lectureAndQuiz = useAppSelector(
    (state) => state.context.lectureAndQuiz
  );
  const currentCourse = useAppSelector((state) => state.context.currentCourse);
  const currentSection = useAppSelector(
    (state) => state.context.currentSection
  );
  const courseProgress = useAppSelector((state) => state.context.courseProgress);
  const sections = useAppSelector((state) => state.context.sections);
  const user = useAppSelector((state) => state.context.user);

  const [firstSection, setFirstSection] = useState<SectionType | null>(null);
  const [lastSection, setLastSection] = useState<SectionType | null>(null);

  useEffect(() => {
    if (lectureAndQuiz.length > 0) {
      console.log("courseProgress", courseProgress);
      console.log("lectureAndQuiz", lectureAndQuiz);

      let last: any = null;
      for (let i = lectureAndQuiz.length - 1; i >= 0; i--) {
        const progress = courseProgress?.find(
          (item) => lectureAndQuiz[i].id === item.sectionId
        );

        console.log("progress", progress);

        if (progress) {
          if (
            i < lectureAndQuiz.length - 1 &&
            progress.progressPercent >= (currentCourse.percentToViewNext || 0)
          ) {
            last = lectureAndQuiz[i + 1];
          } else {
            last = lectureAndQuiz[i];
          }
          break;
        }
      }
      console.log("last", last);

      setLastSection(last);
      setFirstSection(lectureAndQuiz[0]);
    } else {
      setFirstSection(null);
    }
  }, [lectureAndQuiz, courseProgress]);

  return (
    <div className="mx-10 my-2.5">
      <div className="flex h-full w-full flex-row items-center justify-between">
        <EmptyState
          header={`Welcome to the ${currentCourse.name}`}
          description="Click on the right side panel to select the content what you what to learn or click the below button to start your course."
          headingLevel={2}
          primaryAction={
            <Button
              appearance="primary"
              onClick={() => {
                const des = lastSection ? lastSection : firstSection;

                navigate(
                  `/course/${currentCourse.id}/section/${des?.id || ""}`
                );
              }}
              isDisabled={firstSection ? false : true}
            >
              {lastSection ? "Continue" : "Start course"}
            </Button>
          }
          imageUrl={"/public/bg-1.png"}
          maxImageWidth={1000}
          maxImageHeight={300}
        />
      </div>
    </div>
  );
};

export default CourseNoSection;
