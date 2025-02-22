import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DropdownMenu, {
  DropdownItem,
  DropdownItemGroup,
} from "@atlaskit/dropdown-menu";
import { PrimaryDropdownButton } from "@atlaskit/atlassian-navigation";
import { useLocation } from "react-router-dom";
import { useAppSelector } from "@/redux/hook";

import CourseApi from "@/api/courseApi";
import { CourseType } from "@/utils/types";
import { getFileUrl, truncateString } from "@/utils/helper";
import { CourseFilterEnum } from "@/utils/enum";

const MyLearningDropdown = () => {
  const location = useLocation();

  const user = useAppSelector((state) => state.context.user);

  const [courses, setCourses] = useState<CourseType[]>([]);

  const getCourses = async () => {
    const res = await CourseApi.getMyCourses({
      page: 1,
      pageSize: 5,
    });
    setCourses(res.data);
  };

  useEffect(() => {
    getCourses();
  }, []);

  return (
    <>
      {user && (
        <DropdownMenu
          trigger={({ triggerRef, ...props }) => (
            <PrimaryDropdownButton
              isDisabled={!user}
              ref={triggerRef}
              {...props}
            >
              My Learning
            </PrimaryDropdownButton>
          )}
        >
          <DropdownItemGroup>
            {courses.length === 0 ? (
              <div className="flex h-11 w-40 flex-row items-center justify-center gap-4">
                No courses
              </div>
            ) : (
              <>
                {courses.map((course) => (
                  <Link to={`/course/${course.id}`} key={course.id}>
                    <DropdownItem>
                      <div className="flex w-64 flex-row items-center gap-4">
                        <img
                          className="h-12 w-20"
                          src={
                            course.backgroundFileId
                              ? getFileUrl(course.backgroundFileId)
                              : "/course-bg.png"
                          }
                          alt={course.name}
                        ></img>
                        <div>{truncateString(course.name, 60)}</div>
                      </div>
                    </DropdownItem>
                  </Link>
                ))}
                <div className="flex justify-center py-2">
                  <Link
                    to={`/dashboard?type=${CourseFilterEnum.YOUR_LEARNING}`}
                  >
                    View all
                  </Link>
                </div>
              </>
            )}
          </DropdownItemGroup>
        </DropdownMenu>
      )}
    </>
  );
};

export default MyLearningDropdown;
