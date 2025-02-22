import { useEffect, useMemo, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hook";
import Button from "@atlaskit/button/standard-button";
import Tabs, { Tab, TabList, TabPanel } from "@atlaskit/tabs";

import EditQuiz from "../quiz/EditQuiz";
import ClassSubmitQuiz from "../quiz/ClassSubmitQuiz";
import ViewQuiz from "../quiz/ViewQuiz";
import QuizAnalytics from "../quiz/QuizAnalytics";

const SectionQuiz = () => {
  const currentSection = useAppSelector(
    (state) => state.context.currentSection
  );
  const currentCourse = useAppSelector((state) => state.context.currentCourse);
  const user = useAppSelector((state) => state.context.user);

  return (
    <div>
      {user?.id !== currentCourse.teacherId ? (
        <ViewQuiz />
      ) : (
        <Tabs id="quiz-tab">
          <TabList>
            <Tab>Edit Quiz</Tab>
            <Tab>Preview Quiz</Tab>
            <Tab>Submission</Tab>
            <Tab>Analytics</Tab>
          </TabList>
          <TabPanel>
            <EditQuiz />
          </TabPanel>
          <TabPanel>
            <ViewQuiz />
          </TabPanel>
          <TabPanel>
            <ClassSubmitQuiz />
          </TabPanel>
          <TabPanel>
            <QuizAnalytics />
          </TabPanel>
        </Tabs>
      )}
    </div>
  );
};

export default SectionQuiz;
