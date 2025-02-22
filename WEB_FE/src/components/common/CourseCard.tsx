import { Link } from "react-router-dom";
import styled from "styled-components";

import { getFileUrl, truncateString } from "@/utils/helper";
import { CourseFilterEnum } from "@/utils/enum";
import GeneralReviewInfo from "./GeneralReviewInfo";

const CourseCardStyles = styled.div`
  margin-top: 1rem;
  height: 300px;
  width: 280px;
  background-color: whitesmoke;

  .bg-img {
    height: 160px;
    width: 100%;
  }

  .content {
    padding: 0 10px;

    .title {
      font-weight: 500;
    }

    .student-count,
    .tags {
      font-weight: 100;
    }

    .tags {
      margin-top: 6px;
      width: 100%;
      display: flex;
      gap: 6px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .tag {
      background-color: #e2e2e2;
      padding: 0 4px;
      border-radius: 2px;
      cursor: pointer;
    }
  }
`;

const CourseCard = ({ course }) => {
  return (
    <CourseCardStyles key={course.id}>
      <img
        src={
          course.backgroundFileId
            ? getFileUrl(course.backgroundFileId)
            : "/course-bg.png"
        }
        alt={course.name}
        className="bg-img"
      ></img>
      <div className="content">
        <Link to={`/preview/${course.id}`} className="title">
          {truncateString(course.name, 70)}
        </Link>

        <GeneralReviewInfo course={course} />

        <div className="student-count">{`${
          course.totalStudents || 0
        } students`}</div>

        <div className="tags">
          {course.tags?.map((tag) => (
            <div className="tag" key={tag}>
              <Link
                to={`/dashboard?type=${CourseFilterEnum.ALL}&query=${tag}`}
                target="_blank"
              >
                {tag}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </CourseCardStyles>
  );
};

export default CourseCard;
