import { useEffect, useState, useCallback } from "react";
import { useAppSelector } from "@/redux/hook";
import SearchIcon from "@atlaskit/icon/glyph/search";
import Textfield from "@atlaskit/textfield";
import { Link } from "react-router-dom";
import Breadcrumbs, { BreadcrumbsItem } from "@atlaskit/breadcrumbs";
import __noop from "@atlaskit/ds-lib/noop";
import EmptyState from "@atlaskit/empty-state";
import Pagination from "@atlaskit/pagination";
import Spinner from "@atlaskit/spinner";
import styled from "styled-components";

import CourseApi from "@/api/courseApi";
import { CourseType, SelectOptionType } from "@/utils/types";
import { getFileUrl } from "@/utils/helper";
import { CourseFilterEnum } from "@/utils/enum";
import CourseCard from "../common/CourseCard";

const SearchContainerStyles = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 800px;
`;

const PAGE_SIZE = 8;

const DashBoard = () => {
  const queryParams = new URLSearchParams(window.location.search);
  const filterType = queryParams.get("type");
  const initQuery = queryParams.get("query");

  const user = useAppSelector((state) => state.context.user);

  const [courses, setCourses] = useState<CourseType[]>([]);
  const [searchValue, setSearchValue] = useState<string>(initQuery || "");
  const [isSearching, setIsSearching] = useState<boolean>(true);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const fetchSearchResults = useCallback(
    async ({ page }) => {
      setIsSearching(true);

      let rawData;

      if (filterType === CourseFilterEnum.YOUR_LEARNING) {
        rawData = await CourseApi.getMyCourses({
          name: searchValue,
          pageSize: PAGE_SIZE,
          page: page,
        });
      } else if (filterType === CourseFilterEnum.TOP_RATE) {
        rawData = await CourseApi.getTopRateCourses({
          name: searchValue,
          pageSize: PAGE_SIZE,
          page: page,
        });
      } else if (filterType === CourseFilterEnum.POPULATE) {
        rawData = await CourseApi.getPopulateCourses({
          name: searchValue,
          pageSize: PAGE_SIZE,
          page: page,
        });
      } else if (filterType === CourseFilterEnum.NEW) {
        rawData = await CourseApi.getNewCourses({
          name: searchValue,
          pageSize: PAGE_SIZE,
          page: page,
        });
      } else if (filterType === CourseFilterEnum.ALL) {
        rawData = await CourseApi.getPublicCourses({
          name: searchValue,
          pageSize: PAGE_SIZE,
          page: page,
        });
      } else if (filterType === CourseFilterEnum.WISH_LIST) {
        const courseIds = user?.favouriteCourseIds || [];

        const promises = courseIds.map((id) => CourseApi.getCourseById(id));
        rawData = {
          data: [],
        };
        rawData.data = await Promise.all(promises);
      }

      if (rawData) {
        console.log("rawData.data", rawData.data);
        setCourses(rawData.data);
        setTotalPages(Math.ceil(rawData.total / PAGE_SIZE));
      }

      setIsSearching(false);
    },
    [searchValue]
  );

  useEffect(() => {
    let timerId;

    const delaySearch = () => {
      timerId = setTimeout(() => {
        fetchSearchResults({
          page: currentPage,
        });
      }, 300);
    };

    delaySearch();

    return () => {
      clearTimeout(timerId);
    };
  }, [searchValue, fetchSearchResults, currentPage]);

  return (
    <div className="mt-4 flex justify-center">
      <div className="mx-10 w-full max-w-7xl px-4 ">
        <div className="mt-4">
          <Breadcrumbs onExpand={__noop}>
            <BreadcrumbsItem text="Courses" key="courses" />
            <BreadcrumbsItem text={"Course search"} key="course-all" />
          </Breadcrumbs>
        </div>

        <div className="mt-2 flex w-full flex-row items-center gap-4">
          <SearchContainerStyles>
            <Textfield
              elemBeforeInput={<SearchIcon size="small" label="" />}
              value={searchValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setSearchValue(e.target.value);
              }}
              placeholder="Search for courses here"
            />
          </SearchContainerStyles>
        </div>

        <div className="auto-rows-[320px]; mt-4 grid w-full max-w-7xl grid-cols-[repeat(auto-fit,minmax(280px,1fr))]">
          {!isSearching &&
            courses.map((course) => <CourseCard course={course} />)}

          {!isSearching && courses.length === 0 && (
            <div>
              <EmptyState
                header="No courses found"
                description="Please try a different search term."
              />
            </div>
          )}

          {isSearching && (
            <div className="flex min-h-[400px] items-center justify-center">
              <Spinner interactionName="load" size="large" />
            </div>
          )}
        </div>

        <div className="flex w-full items-center justify-center py-10">
          <Pagination
            nextLabel="Next"
            label="Page"
            pageLabel="Page"
            pages={
              totalPages > 0
                ? Array.from({ length: totalPages }, (_, i) => i + 1)
                : [1]
            }
            previousLabel="Previous"
            onChange={(e, page) => setCurrentPage(page)}
          />
        </div>
      </div>
    </div>
  );
};

export default DashBoard;
