import { Link } from "react-router-dom";
import Heading from "@atlaskit/heading";
import { useEffect, useState } from "react";
import { useAppSelector } from "@/redux/hook";
import styled from "styled-components";
import Textfield from "@atlaskit/textfield";
import SearchIcon from "@atlaskit/icon/glyph/search";
import { useNavigate } from "react-router-dom";

import { HOME_PAGE_BACKGROUND } from "@/utils/image";
import { getFileUrl } from "@/utils/helper";
import { CourseType } from "@/utils/types";
import CourseApi from "@/api/courseApi";
import CourseCard from "../common/CourseCard";
import { CourseFilterEnum } from "@/utils/enum";

const SearchContainerStyles = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translateY(-80px);

  .wrapper {
    width: 100%;
    max-width: 800px;
    background-color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    border-radius: 4px;
    gap: 4px;
  }

  .search-btn {
    width: 60px;
    height: 39px;
    background-color: #0052cc;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 3px;
    cursor: pointer;
  }
`;

const CourseGroupStyles = styled.div`
  margin-left: 2.5rem;
  margin-right: 2.5rem;
  margin-top: 1rem;
  display: flex;
  width: 100%;
  max-width: 80rem;
  justify-content: center;
  padding-left: 1rem;
  padding-right: 1rem;

  .heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
`;

const filterList = [
  {
    title: "Your learning",
    type: CourseFilterEnum.YOUR_LEARNING,
    requiredLogin: true,
  },
  {
    title: "Top rated",
    type: CourseFilterEnum.TOP_RATE,
    requiredLogin: false,
  },
  {
    title: "Populate",
    type: CourseFilterEnum.POPULATE,
    requiredLogin: false,
  },
  {
    title: "New",
    type: CourseFilterEnum.NEW,
    requiredLogin: false,
  },
  {
    title: "All",
    type: CourseFilterEnum.ALL,
    requiredLogin: false,
  },
];

const Home = () => {
  const user = useAppSelector((state) => state.context.user);
  const navigate = useNavigate();

  const SearchContainer = () => {
    const [value, setValue] = useState("");

    const handleSubmit = () => {
      console.log("value", value);
      if (value.trim() !== "") {
        navigate(`/dashboard?type=${CourseFilterEnum.ALL}&query=${value}`);
      }
    };

    return (
      <SearchContainerStyles>
        <div className="wrapper">
          <Textfield
            value={value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setValue(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit();
              }
            }}
            placeholder="Search for courses here"
          />
          <div
            className="search-btn"
            onClick={() => {
              handleSubmit();
            }}
          >
            <SearchIcon size="medium" label="" primaryColor="white" />
          </div>
        </div>
      </SearchContainerStyles>
    );
  };

  const CourseGroup = ({ filter }) => {
    const [isShow, setIsShow] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [courses, setCourses] = useState<CourseType[]>([]);

    const PAGE_NUMBER = 1;
    const PAGE_SIZE = 10;

    const fetchData = async () => {
      try {
        let res = {
          data: [],
        };

        if (filter.type === CourseFilterEnum.YOUR_LEARNING) {
          res = await CourseApi.getMyCourses({
            page: PAGE_NUMBER,
            pageSize: PAGE_SIZE,
          });
        } else if (filter.type === CourseFilterEnum.TOP_RATE) {
          res = await CourseApi.getTopRateCourses({
            page: PAGE_NUMBER,
            pageSize: PAGE_SIZE,
          });
        } else if (filter.type === CourseFilterEnum.POPULATE) {
          res = await CourseApi.getPopulateCourses({
            page: PAGE_NUMBER,
            pageSize: PAGE_SIZE,
          });
        } else if (filter.type === CourseFilterEnum.NEW) {
          res = await CourseApi.getNewCourses({
            page: PAGE_NUMBER,
            pageSize: PAGE_SIZE,
          });
        } else if (filter.type === CourseFilterEnum.ALL) {
          res = await CourseApi.getPublicCourses({
            page: PAGE_NUMBER,
            pageSize: PAGE_SIZE,
          });
        }

        setCourses(res.data);
        setIsLoading(false);

        if (res.data.length > 0 && (filter.requiredLogin === false || user)) {
          setIsShow(true);
        } else {
          setIsShow(false);
        }
      } catch (err) {
        setCourses([]);
        setIsLoading(false);
        setIsShow(false);
        console.log("err", err);
      }
    };

    useEffect(() => {
      fetchData();
    }, []);

    return (
      <>
        {isShow && (
          <CourseGroupStyles>
            <div className="mx-10 w-full max-w-7xl flex-row justify-center px-4">
              <div className="heading">
                <Heading level="h700">{filter.title}</Heading>
                <Link to={`/dashboard?type=${filter.type}`}>View all</Link>
              </div>
              <div className="mt-4 grid h-[320px] w-full max-w-7xl grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-[32px] overflow-hidden">
                {!isLoading &&
                  courses.map((course) => <CourseCard course={course} />)}
              </div>
            </div>
          </CourseGroupStyles>
        )}
      </>
    );
  };

  return (
    <div>
      <div>
        <div
          className="h-[200px] w-full bg-auto bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${HOME_PAGE_BACKGROUND})` }}
        ></div>
      </div>

      <SearchContainer />

      <div className="flex flex-col items-center">
        {filterList.map((filter) => (
          <CourseGroup filter={filter} key={filter.type} />
        ))}
      </div>

      <div className="mb-[-15px] mt-[100px] h-[100px] w-full bg-[linear-gradient(#fff_0.05%,#deebff_99.95%)]">
        <div className="flex justify-center"></div>
        <div className="flex flex-row"></div>
      </div>
    </div>
  );
};

export default Home;
