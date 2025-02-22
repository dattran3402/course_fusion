import DynamicTable from "@atlaskit/dynamic-table";
import { useEffect, useState } from "react";
import TextField from "@atlaskit/textfield";
import Select from "@atlaskit/select";
import SearchIcon from "@atlaskit/icon/glyph/search";
import Spinner from "@atlaskit/spinner";
import Toggle from "@atlaskit/toggle";
import { Link } from "react-router-dom";
import Tooltip from "@atlaskit/tooltip";

import UserApi from "@/api/userApi";
import { SelectOptionType } from "@/utils/types";
import { formatDateToYYYYMMDD, getFileUrl } from "@/utils/helper";
import { CourseStatus } from "@/utils/enum";
import CourseApi from "@/api/courseApi";
import { socketInstance } from "@/App";

const searchModeOptions: SelectOptionType[] = [
  { label: "All courses", value: "all" },
  { label: "Public", value: "public" },
  { label: "Review", value: "review" },
  { label: "Draft", value: "private" },
];

const sortCreatedDateOptions: SelectOptionType[] = [
  { label: "Newest First", value: "descending" },
  { label: "Oldest First", value: "ascending" },
];

const AdminCourseManage = () => {
  const [courseList, setCourseList] = useState<any[]>([]);
  const [tableRows, setTableRows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(true);
  const [searchMode, setSearchMode] = useState<SelectOptionType>(
    searchModeOptions[0]
  );
  const [sortCreatedDateOrder, setSortCreatedDateOrder] =
    useState<SelectOptionType>(sortCreatedDateOptions[0]);

  const fetchSearchResults = async () => {
    try {
      setIsSearching(true);

      const searchConditions: any = {
        query: searchValue,
      };

      if (searchMode.value !== "all") {
        if (searchMode.value === "public") {
          searchConditions.status = CourseStatus.PUBLIC;
        } else if (searchMode.value === "review") {
          searchConditions.status = CourseStatus.REVIEW;
        } else {
          searchConditions.status = CourseStatus.PRIVATE;
        }
      }

      const rawData = await CourseApi.getAllCourses(searchConditions);

      if (rawData) {
        const order = sortCreatedDateOrder.value === "descending" ? -1 : 1;
        setCourseList(
          rawData.data.sort(
            (a, b) => order * a.createdAt.localeCompare(b.createdAt)
          )
        );

        const newRows = await Promise.all(
          rawData.data.map(async (course: any, index: number) => {
            const teacher = await UserApi.getUserById(course.teacherId);
            const courseStudents = await CourseApi.getCourseStudents(course.id);
            // Assuming each student object has a 'price' property
            const totalRevenue = courseStudents.reduce((total, student) => {
              return total + (student.price ? student.price : 0);
            }, 0);

            return {
              key: `row-${index}-${course.id}`,
              isHighlighted: false,
              cells: [
                {
                  key: "index",
                  content: index + 1,
                },
                {
                  key: "background",
                  content: (
                    <div className="mb-8 flex w-40 flex-row items-center gap-4">
                      <img
                        className="h-24 w-40"
                        src={
                          course.backgroundFileId
                            ? getFileUrl(course.backgroundFileId)
                            : "/course-bg.png"
                        }
                        alt={course.name}
                      ></img>
                    </div>
                  ),
                },
                {
                  key: "name",
                  content: (
                    <Link to={"/course/" + course.id}>{course.name}</Link>
                  ),
                },
                {
                  key: "createdAt",
                  content: formatDateToYYYYMMDD(new Date(course.createdAt)),
                },
                {
                  key: "author",
                  content: (
                    <Link to={"/profile/" + teacher?.id}>{teacher?.name}</Link>
                  ),
                },
                {
                  key: "students",
                  content: courseStudents.length,
                },
                {
                  key: "revenue",
                  content: totalRevenue,
                },
                {
                  key: "status",
                  content: (
                    <div className="flex w-[120px] flex-row items-center justify-between gap-4">
                      <div>
                        {course.status === CourseStatus.PUBLIC && "Public"}
                        {course.status === CourseStatus.REVIEW && "Reviewing"}
                        {course.status === CourseStatus.PRIVATE && "Draft"}
                      </div>

                      <Tooltip
                        content={() => {
                          if (course.status === CourseStatus.PUBLIC) {
                            return "Hide this course";
                          } else if (course.status === CourseStatus.REVIEW) {
                            return "Public this course";
                          } else {
                            return "This course is not ready to public";
                          }
                        }}
                      >
                        <Toggle
                          defaultChecked={course.status === CourseStatus.PUBLIC}
                          isDisabled={course.status === CourseStatus.PRIVATE}
                          onChange={() => ToggleCourse(course)}
                        />
                      </Tooltip>
                    </div>
                  ),
                },
              ],
            };
          })
        );
        setTableRows(newRows);
      }

      setIsSearching(false);
    } catch (err) {
      console.error("err", err);
      setCourseList([]);
      setIsSearching(false);
    }
  };

  useEffect(() => {
    let timerId;

    const delaySearch = () => {
      timerId = setTimeout(() => {
        fetchSearchResults();
      }, 300);
    };

    delaySearch();

    return () => {
      clearTimeout(timerId);
    };
  }, [searchValue, searchMode]);

  useEffect(() => {
    if (courseList.length > 0) {
      const order = sortCreatedDateOrder.value === "descending" ? -1 : 1;
      setCourseList((prev) =>
        prev.sort((a, b) => order * b.createdAt.localeCompare(a.createdAt))
      );
    }
  }, [courseList, sortCreatedDateOrder]);

  const courseListHead = {
    cells: [
      {
        key: "index",
        content: "",
        width: undefined,
      },
      {
        key: "background",
        content: "Background",
        shouldTruncate: true,
        width: undefined,
      },
      {
        key: "name",
        content: "Name",
        isSortable: true,
        width: undefined,
      },
      {
        key: "createdAt",
        content: "Created At",
        shouldTruncate: true,
        width: undefined,
      },
      {
        key: "author",
        content: "Author",
        shouldTruncate: true,
        width: undefined,
      },
      {
        key: "students",
        content: "Total students",
        shouldTruncate: true,
        width: undefined,
      },
      {
        key: "revenue",
        content: "Total revenue ($)",
        shouldTruncate: true,
        width: undefined,
      },
      {
        key: "status",
        content: "Status",
        shouldTruncate: true,
        width: undefined,
      },
    ],
  };

  const ToggleCourse = async (course) => {
    try {
      if (course.status === CourseStatus.REVIEW) {
        const userConfirmed = window.confirm(
          "Are you sure you want to public this course?"
        );

        if (userConfirmed) {
          await CourseApi.updateCourse({
            courseId: course.id,
            status: CourseStatus.PUBLIC,
          });

          socketInstance.emit("notification", {
            userIds: [course.teacherId],
            data: {
              content: `Your course has been public: ${course.name}`,
              link: `/course/${course.id}`,
            },
          });
        }
      }

      if (course.status === CourseStatus.PUBLIC) {
        const userConfirmed = window.confirm(
          "Are you sure you want to hide this course? The teacher must send a review request to publish it again."
        );

        if (userConfirmed) {
          await CourseApi.updateCourse({
            courseId: course.id,
            status: CourseStatus.PRIVATE,
          });

          socketInstance.emit("notification", {
            userIds: [course.teacherId],
            data: {
              content: `Your course has been reject: ${course.name}`,
              link: `/course/${course.id}`,
            },
          });
        }
      }
      fetchSearchResults();
    } catch (err) {
      console.error("Error", err);
    }
  };

  return (
    <div className="mt-4 flex w-full flex-col justify-center gap-6">
      <div className="flex">
        <div className="mt-4 flex w-full flex-row items-center gap-4">
          <div>
            <TextField
              elemBeforeInput={<SearchIcon size="small" label="" />}
              value={searchValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setSearchValue(e.target.value);
              }}
              placeholder="Search for courses here"
            />
          </div>

          <div>
            <Select
              classNamePrefix="react-select"
              options={searchModeOptions}
              placeholder=""
              value={searchMode}
              onChange={(e) =>
                setSearchMode({
                  label: e?.label || "",
                  value: e?.value || "",
                })
              }
            />
          </div>

          <div>
            <Select
              classNamePrefix="react-select"
              options={sortCreatedDateOptions}
              placeholder=""
              value={sortCreatedDateOrder}
              onChange={(e) =>
                setSortCreatedDateOrder({
                  label: e?.label || "",
                  value: e?.value || "",
                })
              }
            />
          </div>
        </div>
      </div>

      <div>
        {isSearching ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <Spinner interactionName="load" size="large" />
          </div>
        ) : (
          <DynamicTable
            head={courseListHead}
            rows={tableRows}
            rowsPerPage={10}
            defaultPage={1}
            loadingSpinnerSize="large"
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
};

export default AdminCourseManage;
