import { useAppSelector } from "@/redux/hook";
import { useState, useEffect, useCallback } from "react";
import Breadcrumbs, { BreadcrumbsItem } from "@atlaskit/breadcrumbs";
import __noop from "@atlaskit/ds-lib/noop";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import Heading from "@atlaskit/heading";
import DynamicTable from "@atlaskit/dynamic-table";
import { Link } from "react-router-dom";

import CourseApi from "@/api/courseApi";
import SectionApi from "@/api/sectionApi";
import { CourseSectionTypeEnum } from "@/utils/enum";
import QuizApi from "@/api/quizApi";
import AssignmentApi from "@/api/assignmentApi";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const lineOptions = {
  responsive: true,
  interaction: {
    mode: "index" as const,
    intersect: false,
  },
  stacked: false,
  plugins: {
    title: {
      display: true,
    },
  },
  scales: {
    y: {
      type: "linear" as const,
      display: true,
      position: "left" as const,
    },
  },
};

const sectionViewHead = {
  cells: [
    {
      key: "index",
      content: "",
      width: undefined,
    },
    {
      key: "name",
      content: "Name",
      isSortable: true,
      width: undefined,
    },
    {
      key: "view",
      content: "View",
      isSortable: true,
      width: undefined,
    },
    {
      key: "link",
      content: "Link",
      shouldTruncate: true,
      width: undefined,
    },
  ],
};

const doneHead = {
  cells: [
    {
      key: "index",
      content: "",
      width: undefined,
    },
    {
      key: "name",
      content: "Name",
      isSortable: true,
      width: undefined,
    },
    {
      key: "submitted",
      content: "Submitted",
      isSortable: true,
      width: undefined,
    },
    {
      key: "link",
      content: "Link",
      shouldTruncate: true,
      width: undefined,
    },
  ],
};

const CourseAnalytics = () => {
  const sections = useAppSelector((state) => state.context.sections);
  const currentCourse = useAppSelector((state) => state.context.currentCourse);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [courseStudents, setCourseStudents] = useState<any[]>([]);
  const [sectionsViewData, setSectionsViewData] = useState<any[]>([]);
  const [quizDoneData, setQuizDoneData] = useState<any[]>([]);
  const [assignmentDoneData, setAssignmentDoneData] = useState<any[]>([]);

  const [newStudentData, setNewStudentData] = useState<{
    labels: string[];
    datasets: any[];
  }>({
    labels: [],
    datasets: [],
  });
  const [totalStudentData, setTotalStudentData] = useState<{
    labels: string[];
    datasets: any[];
  }>({
    labels: [],
    datasets: [],
  });
  const [totalRevenueData, setTotalRevenueData] = useState<{
    labels: string[];
    datasets: any[];
  }>({
    labels: [],
    datasets: [],
  });

  const getCourseStudents = async () => {
    try {
      const res = await CourseApi.getCourseStudents(currentCourse.id);
      setCourseStudents(res);
      return res;
    } catch (err) {
      console.log("err", err);
    }
  };

  const getSectionsViewData = async () => {
    try {
      const sectionProgressPromises = await sections
        .filter((section) =>
          [CourseSectionTypeEnum.VIDEO, CourseSectionTypeEnum.FILES].includes(
            section.type
          )
        )
        .map(async (section) => {
          const progress = await SectionApi.getAllStudentsProgress({
            sectionId: section.id,
          });
          return {
            ...section,
            progress: progress.data,
          };
        });
      const sectionProgress = await Promise.all(sectionProgressPromises);
      const data = sectionProgress.sort(
        (a, b) => b.progress.length - a.progress.length
      );

      setSectionsViewData(
        data.map((section, index) => ({
          key: `section-${section.id}`,
          isHighlighted: false,
          cells: [
            {
              key: "index",
              content: index + 1,
            },
            {
              key: "name",
              content: section.name,
            },
            {
              key: "view",
              content: section.progress.length,
            },
            {
              key: "link",
              content: (
                <Link
                  to={`http://localhost:4000/course/${currentCourse.id}/section/${section.id}`}
                >
                  Link
                </Link>
              ),
            },
          ],
        }))
      );
    } catch (err) {
      console.log("err", err);
    }
  };

  const getDoneQuizData = async (numberOfStudents) => {
    try {
      const fetchDataPromises = await sections
        .filter((section) => section.type === CourseSectionTypeEnum.QUIZ)
        .map(async (section) => {
          const submission = await QuizApi.getAllSubmittedQuiz({
            sectionId: section.id,
          });
          return {
            ...section,
            submission: submission.data,
          };
        });
      const submissionData = await Promise.all(fetchDataPromises);
      const data = submissionData.sort(
        (a, b) => b.submission.length - a.submission.length
      );

      setQuizDoneData(
        data.map((section, index) => ({
          key: `section-${section.id}`,
          isHighlighted: false,
          cells: [
            {
              key: "index",
              content: index + 1,
            },
            {
              key: "name",
              content: section.name,
            },
            {
              key: "submitted",
              content: section.submission.length + "/" + numberOfStudents,
            },
            {
              key: "link",
              content: (
                <Link
                  to={`http://localhost:4000/course/${currentCourse.id}/section/${section.id}`}
                >
                  Link
                </Link>
              ),
            },
          ],
        }))
      );
    } catch (err) {
      console.log("err", err);
    }
  };

  const getDoneAssignmentData = async (numberOfStudents) => {
    try {
      const fetchDataPromises = await sections
        .filter((section) => section.type === CourseSectionTypeEnum.ASSIGNMENT)
        .map(async (section) => {
          const submission = await AssignmentApi.getAllUploadStatus({
            sectionId: section.id,
          });
          return {
            ...section,
            submission: submission,
          };
        });
      const submissionData = await Promise.all(fetchDataPromises);
      const data = submissionData.sort(
        (a, b) => b.submission.length - a.submission.length
      );

      setAssignmentDoneData(
        data.map((section, index) => ({
          key: `section-${section.id}`,
          isHighlighted: false,
          cells: [
            {
              key: "index",
              content: index + 1,
            },
            {
              key: "name",
              content: section.name,
            },
            {
              key: "submitted",
              content: section.submission.length + "/" + numberOfStudents,
            },
            {
              key: "link",
              content: (
                <Link
                  to={`http://localhost:4000/course/${currentCourse.id}/section/${section.id}`}
                >
                  Link
                </Link>
              ),
            },
          ],
        }))
      );
    } catch (err) {
      console.log("err", err);
    }
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);

      const studentInCourse = await getCourseStudents();

      await Promise.all([
        getSectionsViewData(),
        getDoneQuizData(studentInCourse.length),
        getDoneAssignmentData(studentInCourse.length),
      ]);

      setIsLoading(false);
    } catch (err) {
      console.log("err", err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (courseStudents && courseStudents.length > 0) {
      const newStudentsCount = {};
      const totalRevenueCount = {};
      let totalRevenueCounter = 0;

      courseStudents.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      courseStudents.forEach((courseStudent) => {
        const monthYear = `${
          new Date(courseStudent.createdAt).getMonth() + 1
        }/${new Date(courseStudent.createdAt).getFullYear()}`;

        if (!newStudentsCount[monthYear]) {
          newStudentsCount[monthYear] = 1;
          totalRevenueCounter += courseStudent.price || 0;
          totalRevenueCount[monthYear] = totalRevenueCounter;
        } else {
          newStudentsCount[monthYear]++;
          totalRevenueCounter += courseStudent.price || 0;
          totalRevenueCount[monthYear] += totalRevenueCounter;
        }
      });

      setNewStudentData({
        labels: Object.keys(newStudentsCount),
        datasets: [
          {
            label: "New students",
            data: Object.values(newStudentsCount),
            borderColor: "rgb(53, 162, 235)",
            backgroundColor: "rgba(53, 162, 235, 0.5)",
            yAxisID: "y",
          },
        ],
      });

      const createArrayForTotal = (arr) => {
        let sum = 0;
        return arr.map((value) => {
          sum += value;
          return sum;
        });
      };

      setTotalStudentData({
        labels: Object.keys(newStudentsCount),
        datasets: [
          {
            label: "Total students",
            data: createArrayForTotal(Object.values(newStudentsCount)),
            borderColor: "rgb(53, 162, 235)",
            backgroundColor: "rgba(53, 162, 235, 0.5)",
            yAxisID: "y",
          },
        ],
      });

      setTotalRevenueData({
        labels: Object.keys(totalRevenueCount),
        datasets: [
          {
            label: "Total revenue ($)",
            data: Object.values(totalRevenueCount),
            borderColor: "rgb(255, 99, 132)",
            backgroundColor: "rgba(255, 99, 132, 0.5)",
            yAxisID: "y",
          },
        ],
      });
    }
  }, [courseStudents]);

  return (
    <div className="mx-10 my-2.5">
      <Breadcrumbs onExpand={__noop}>
        <BreadcrumbsItem text="Analytics" key="general" />
      </Breadcrumbs>
      <div className="max-w-[1000px]">
        <div className="mb-4">
          <div className="mb-4">
            {newStudentData.datasets.length > 0 ? (
              <Line options={lineOptions} data={newStudentData} />
            ) : (
              <></>
            )}
          </div>
          {newStudentData.datasets.length > 0 ? (
            <Line options={lineOptions} data={totalRevenueData} />
          ) : (
            <Heading level="h600">Total revenue: 0$</Heading>
          )}
        </div>

        <div className="mb-4">
          {newStudentData.datasets.length > 0 ? (
            <Line options={lineOptions} data={totalStudentData} />
          ) : (
            <div>
              <Heading level="h600">Total students: 0</Heading>
            </div>
          )}
        </div>

        <div className="mt-10">
          <Heading level="h600">Most view sections</Heading>
          <div className="mt-2">
            <DynamicTable
              head={sectionViewHead}
              rows={sectionsViewData}
              rowsPerPage={10}
              defaultPage={1}
              loadingSpinnerSize="large"
            />
          </div>
        </div>

        <div className="mt-10">
          <Heading level="h600">Most done quizzes</Heading>
          <div className="mt-2">
            <DynamicTable
              head={doneHead}
              rows={quizDoneData}
              rowsPerPage={10}
              defaultPage={1}
              loadingSpinnerSize="large"
            />
          </div>
        </div>

        <div className="mt-10">
          <Heading level="h600">Most submitted assignments</Heading>
          <div className="mt-2">
            <DynamicTable
              head={doneHead}
              rows={assignmentDoneData}
              rowsPerPage={10}
              defaultPage={1}
              loadingSpinnerSize="large"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseAnalytics;
