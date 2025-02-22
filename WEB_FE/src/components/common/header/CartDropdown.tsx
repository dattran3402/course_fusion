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
import { getFileUrl } from "@/utils/helper";

const CartDropdown = () => {
  const location = useLocation();

  const user = useAppSelector((state) => state.context.user);

  const [courses, setCourses] = useState<CourseType[]>([]);

  const getCourses = async () => {
    const courseInCartIds = await CourseApi.getCoursesInCart();

    const promises = courseInCartIds.map((courseId) =>
      CourseApi.getCourseById(courseId)
    );
    const res = await Promise.all(promises);
    setCourses(res || []);
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
              Cart
            </PrimaryDropdownButton>
          )}
        >
          <DropdownItemGroup>
            <div className="mx-4"></div>

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
                        <div>
                          <div>{course.name}</div>
                          <div>{course.price}$</div>
                        </div>
                      </div>
                    </DropdownItem>
                  </Link>
                ))}
              </>
            )}
          </DropdownItemGroup>
        </DropdownMenu>
      )}
    </>
  );
};

export default CartDropdown;
