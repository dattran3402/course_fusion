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
import Spinner from "@atlaskit/spinner";

import CourseApi from "@/api/courseApi";

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

const TeacherPerformance = () => {
  const user = useAppSelector((state) => state.context.user);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [courseStudents, setCourseStudents] = useState<any[]>([]);
  const [courseList, setCourseList] = useState<any[]>([]);

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

  const getCourseStudents = async (courseId) => {
    try {
      const res = await CourseApi.getCourseStudents(courseId);
      return res;
    } catch (err) {
      console.log("err", err);
      return [];
    }
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);

      const rawData = await CourseApi.getCoursesByTeacher({
        teacherId: user?.id,
      });

      if (rawData) {
        const promises = rawData.data.map((course) => {
          return getCourseStudents(course.id);
        });

        const data = await Promise.all(promises);

        setCourseList(rawData.data);
        setCourseStudents(data.flat());
      }

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
    <div className="w-full max-w-[1000px]">
      {isLoading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <Spinner interactionName="load" size="large" />
        </div>
      ) : (
        <div>
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

          <div className="mb-4">
            {newStudentData.datasets.length > 0 ? (
              <Line options={lineOptions} data={totalStudentData} />
            ) : (
              <div>
                <Heading level="h600">Total students: 0</Heading>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherPerformance;
