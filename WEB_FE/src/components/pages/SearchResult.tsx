import { useEffect, useState, useCallback } from "react";
import { useAppSelector } from "@/redux/hook";
import SearchIcon from "@atlaskit/icon/glyph/search";
import Textfield from "@atlaskit/textfield";
import { Link } from "react-router-dom";
import Breadcrumbs, { BreadcrumbsItem } from "@atlaskit/breadcrumbs";
import __noop from "@atlaskit/ds-lib/noop";
import Select from "@atlaskit/select";
import EmptyState from "@atlaskit/empty-state";
import Pagination from "@atlaskit/pagination";
import Spinner from "@atlaskit/spinner";

import CourseApi from "@/api/courseApi";
import { CourseType, SelectOptionType } from "@/utils/types";
import { getFileUrl } from "@/utils/helper";
import CourseCard from "../common/CourseCard";

const searchModeOptions: SelectOptionType[] = [
  { label: "All courses", value: "all" },
  { label: "My courses", value: "my" },
  { label: "My cart", value: "my" },
  { label: "My wishlist", value: "my" },
];

// const sortOptions: SelectOptionType[] = [
//   { label: "All courses", value: "all" },
//   { label: "My courses", value: "my" },
// ];

const SearchResult = () => {
  const PAGE_SIZE = 8;
  const user = useAppSelector((state) => state.context.user);

  const [courses, setCourses] = useState<CourseType[]>([]);
  const [searchValue, setSearchValue] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(true);
  const [searchMode, setSearchMode] = useState<SelectOptionType>(
    searchModeOptions[0]
  );
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const fetchSearchResults = useCallback(
    async ({ mode, page }) => {
      setIsSearching(true);

      let rawData;
      if (mode === "all") {
        rawData = await CourseApi.getPublicCourses({
          name: searchValue,
          pageSize: PAGE_SIZE,
          page: page,
        });
      } else {
        rawData = await CourseApi.getMyCourses({
          name: searchValue,
          pageSize: PAGE_SIZE,
          page: page,
        });
      }

      if (rawData) {
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
          mode: searchMode.value,
          page: currentPage,
        });
      }, 300);
    };

    delaySearch();

    return () => {
      clearTimeout(timerId);
    };
  }, [searchValue, searchMode, fetchSearchResults, currentPage]);

  return (
    <div className="mt-4 flex justify-center">
      <div className="mx-10 w-full max-w-7xl px-4 ">
        {/* <div className="mt-2 flex w-full flex-row items-center gap-4">
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
        </div> */}

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

export default SearchResult;
