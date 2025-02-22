import DynamicTable from "@atlaskit/dynamic-table";
import { useEffect, useState, useCallback } from "react";
import TextField from "@atlaskit/textfield";
import Select from "@atlaskit/select";
import SearchIcon from "@atlaskit/icon/glyph/search";
import Spinner from "@atlaskit/spinner";
import { Link } from "react-router-dom";
import Form, { Field } from "@atlaskit/form";
import Modal, {
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTransition,
} from "@atlaskit/modal-dialog";
import Button from "@atlaskit/button";
import LoadingButton from "@atlaskit/button/loading-button";
import { useAppSelector, useAppDispatch } from "@/redux/hook";
import UserApi from "@/api/userApi";
import { SelectOptionType } from "@/utils/types";
import { formatDateToYYYYMMDD, getFileUrl } from "@/utils/helper";
import { CourseStatus } from "@/utils/enum";
import CourseApi from "@/api/courseApi";

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

const TeacherCourseManage = () => {
  const user = useAppSelector((state) => state.context.user);

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
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => {
    setIsSubmitting(false);
    setNewCourseName("");
    setIsOpen(false);
  }, []);
  const [newCourseName, setNewCourseName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleAddCourse = async () => {
    setIsSubmitting(true);

    const newCourse = await CourseApi.createCourse({
      name: newCourseName,
      backgroundFileId: "",
    });

    window.location.href = `/course/${newCourse.data.id}`;

    setIsSubmitting(false);
    setNewCourseName("");
    closeModal();
  };

  const fetchSearchResults = async () => {
    try {
      setIsSearching(true);

      let status;
      if (searchMode.value !== "all") {
        if (searchMode.value === "public") {
          status = CourseStatus.PUBLIC;
        } else if (searchMode.value === "review") {
          status = CourseStatus.REVIEW;
        } else {
          status = CourseStatus.PRIVATE;
        }
      }

      const rawData = await CourseApi.getCoursesByTeacher({
        teacherId: user?.id,
        name: searchValue,
        status,
      });

      if (rawData) {
        const order = sortCreatedDateOrder.value === "descending" ? -1 : 1;
        setCourseList(
          rawData.data.sort(
            (a, b) => order * a.createdAt.localeCompare(b.createdAt)
          )
        );

        const newRows = await Promise.all(
          rawData.data.map(async (course: any, index: number) => {
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

          <div>
            <Button appearance="primary" onClick={openModal}>
              Create course
            </Button>

            <ModalTransition>
              {isOpen && (
                <Modal onClose={closeModal}>
                  <ModalHeader>
                    <ModalTitle>Create course</ModalTitle>
                  </ModalHeader>
                  <ModalBody>
                    <Field
                      label="Course name"
                      name="course-name"
                      defaultValue=""
                    >
                      {({ fieldProps }) => (
                        <TextField
                          autoComplete="off"
                          {...fieldProps}
                          value={newCourseName}
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            setNewCourseName(e.target.value);
                          }}
                        />
                      )}
                    </Field>
                  </ModalBody>
                  <ModalFooter>
                    <Button appearance="subtle" onClick={closeModal}>
                      Cancel
                    </Button>
                    <LoadingButton
                      type="submit"
                      isLoading={isSubmitting}
                      appearance="primary"
                      onClick={() => handleAddCourse()}
                    >
                      Submit
                    </LoadingButton>
                  </ModalFooter>
                </Modal>
              )}
            </ModalTransition>
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

export default TeacherCourseManage;
