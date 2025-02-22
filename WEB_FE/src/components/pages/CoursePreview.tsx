import { useEffect, useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { useNavigate } from "react-router-dom";
import Heading from "@atlaskit/heading";
import Button from "@atlaskit/button/standard-button";
import StarIcon from "@atlaskit/icon/glyph/star";
import { Link } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import StarFilledIcon from "@atlaskit/icon/glyph/star-filled";
import Tooltip from "@atlaskit/tooltip";
import ReactQuill from "react-quill";
import Avatar from "@atlaskit/avatar";
import EditorRemoveIcon from "@atlaskit/icon/glyph/editor/remove";
import AddIcon from "@atlaskit/icon/glyph/add";
import Modal, {
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTransition,
} from "@atlaskit/modal-dialog";
import Spinner from "@atlaskit/spinner";
import styled from "styled-components";

import CourseApi from "@/api/courseApi";
import SectionApi from "@/api/sectionApi";
import {
  setCurrentCourse,
  setSections,
  setUser,
  addFlag,
} from "@/redux/features/contextSlice";
import { getFileUrl, getSectionTypes } from "@/utils/helper";
import PaymentApi from "@/api/paymentApi";
import { loadStripe } from "@stripe/stripe-js";
import { CourseType, UserType } from "@/utils/types";
import UserApi from "@/api/userApi";
import LoadingButton from "../common/buttons/LoadingButton";
import StarEmptyIconSvg from "../common/stars/StarEmptyIconSvg";
import StarFilledIconSvg from "../common/stars/StarFilledIconSvg";
import Stars from "../common/Stars";
import GeneralReviewInfo from "../common/GeneralReviewInfo";
import CourseCard from "../common/CourseCard";
import { CourseStatus, CourseFilterEnum } from "../../utils/enum";
import FileApi from "@/api/fileApi";

const CoursePreviewStyles = styled.div`
  display: flex;
  justify-content: center;

  .container {
    margin: 3.5rem;
    margin-top: 1rem;
    display: flex;
    width: 100%;
    max-width: 1100px;
    gap: 10px;
  }

  .general-side {
    flex: 1;

    .general-info {
      min-height: 200px;
    }

    .tags {
      font-weight: 100;
      margin-top: 6px;
      width: 100%;
      display: flex;
      gap: 6px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      .tag {
        background-color: #e2e2e2;
        padding: 0 4px;
        border-radius: 2px;
        cursor: pointer;
      }
    }

    .review-item {
      margin-top: 2.5rem;
      margin-bottom: 2.5rem;

      .main {
        display: flex;
        flex-direction: row;
      }
    }
  }

  .floating-side {
    display: flex;
    flex-direction: column;
    position: relative;

    .floating-side-container {
      position: sticky;
      top: 72px;
    }

    .summary-course {
      padding: 10px 20px;

      .heading {
        text-align: center;
        margin-bottom: 10px;
      }
    }
  }
`;

const CoursePreview = () => {
  const { courseId } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const sections = useAppSelector((state) => state.context.sections);
  const currentCourse = useAppSelector((state) => state.context.currentCourse);
  const user = useAppSelector((state) => state.context.user);

  const [courseTeacher, setCourseTeacher] = useState<UserType | null>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [courseRelationWithUser, setCourseRelationWithUser] =
    useState<any>(false);
  const [reviewList, setReviewList] = useState<any>([]);
  const [newReview, setNewReview] = useState<{
    content: string;
    star: number;
  }>({
    content: "",
    star: 0,
  });
  const [totalReviewPages, setTotalReviewPages] = useState<number>(0);
  const [currentReviewPage, setCurrentReviewPage] = useState<number>(1);
  const [isOpenReviewModal, setIsOpenReviewModal] = useState<boolean>(false);
  const openModal = useCallback(() => setIsOpenReviewModal(true), []);
  const closeModal = useCallback(() => setIsOpenReviewModal(false), []);
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [courseList, setCourseList] = useState<CourseType[]>();
  const [sectionTypes, setSectionTypes] = useState<any>();
  const [videoDuration, setVideoDuration] = useState<string>("");

  const getCourseTeacher = async (teacherId) => {
    const teacher = await UserApi.getUserById(teacherId);
    setCourseTeacher(teacher);
  };

  const getCourseRelationWithUserData = async (courseId) => {
    if (user) {
      const res = await CourseApi.getCourseStudent({
        courseId: courseId,
        studentId: user?.id || "",
      });

      setCourseRelationWithUser(res);
    } else {
      setCourseRelationWithUser(false);
    }
  };

  const getReviewData = async (courseId) => {
    try {
      const PAGE_SIZE = 5;

      const courseStudentRaw = await CourseApi.getCourseStudents(courseId);

      const courseStudentWithReview = courseStudentRaw.filter(
        (item) => item.reviewStar && item.reviewStar !== -1
      );

      setTotalReviewPages(courseStudentWithReview.length);

      const formattedReviewPromises = courseStudentWithReview
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .map(async (review) => {
          const reviewer = await UserApi.getUserById(review.studentId);
          return {
            ...review,
            userName: reviewer.name,
            userAvatar: getFileUrl(reviewer.avatarFileId),
          };
        });
      const formattedReview = await Promise.all(formattedReviewPromises);
      setReviewList(formattedReview);
    } catch (err) {
      console.log("err", err);
      setReviewList([]);
      setCourseRelationWithUser(false);
    }
  };

  const getOtherCourses = async (teacherId) => {
    try {
      const res = await CourseApi.getCoursesByTeacher({
        teacherId: teacherId,
        page: 1,
        pageSize: 8,
        status: CourseStatus.PUBLIC,
      });
      setCourseList(res.data);
    } catch (err) {
      console.log("err", err);
      return null;
    }
  };

  const getTotalVideoDuration = async (sectionVideos) => {
    try {
      const promises = sectionVideos.map(async (section) => {
        const fileRes = await SectionApi.getFilesInSection(section.id);
        const fileIds = fileRes.data;

        if (fileIds.length > 0) {
          const file = await FileApi.getFileDetailById(
            fileIds[fileIds.length - 1]
          );

          return file.data;
        } else {
          return null;
        }
      });
      const videos = await Promise.all(promises);

      const totalDuration = videos
        .filter((video) => video)
        .reduce((prev, video) => prev + video.duration, 0);

      let result = "";
      if (totalDuration < 60) {
        result = "0 minute";
      } else if (totalDuration < 3600) {
        let minutes = Math.floor(totalDuration / 60);
        result = minutes + " minute" + (minutes > 1 ? "s" : "");
      } else {
        let hours = Math.floor(totalDuration / 3600);
        result = hours + " hour" + (hours > 1 ? "s" : "");
      }

      setVideoDuration(result);
    } catch (err) {
      console.log("err", err);
      setVideoDuration("");
    }
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);

      const promisesData = await Promise.all([
        CourseApi.getCourseById(courseId),
        SectionApi.getSectionsByCourseId(courseId),
      ]);

      const course = promisesData[0];

      console.log("courseId", course);

      getReviewData(course.id);
      getCourseRelationWithUserData(course.id);

      const sections = promisesData[1];
      dispatch(setSections(sections));

      const sectionTypes = getSectionTypes(sections);
      setSectionTypes(sectionTypes);

      getTotalVideoDuration(sectionTypes.video);

      getCourseTeacher(course.teacherId);

      getOtherCourses(course.teacherId);

      dispatch(setCurrentCourse(course));
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setCourseTeacher(null);
      dispatch(setSections([]));

      console.log("err", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const LoveButton = () => {
    const isLoved = user?.favouriteCourseIds?.includes(currentCourse.id);

    return (
      <Tooltip
        content={`${isLoved ? "Remove from wishlist" : "Add to wishlist"}`}
      >
        <Button
          onClick={() => addToWishlist()}
          appearance={isLoved ? "primary" : "subtle"}
          iconAfter={
            isLoved ? <StarFilledIcon label="" /> : <StarIcon label="" />
          }
        />
      </Tooltip>
    );
  };

  const makePayment = async () => {
    try {
      const stripe = await loadStripe(
        import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
      );

      const randomString = uuidv4();

      const session = await PaymentApi.pay({
        courseId: currentCourse.id,
        userId: user?.id || "",
        successUrl:
          window.location.origin +
          "/course/" +
          courseId +
          "?randomString=" +
          randomString,
        cancelUrl: window.location.href,
      });

      if (session && stripe) {
        localStorage.setItem("randomString", randomString);

        stripe.redirectToCheckout({
          sessionId: session.id,
        });
      }
    } catch (err) {
      console.log("err", err);
    }
  };

  const joinCourse = async () => {
    try {
      CourseApi.addStudentToCourse({
        studentId: user?.id || "",
        courseId: currentCourse.id,
      });
      navigate(`/course/${currentCourse.id}`);
    } catch (err) {
      console.log("err", err);
    }
  };

  const goToCourse = () => {
    if (currentCourse.id !== "") {
      navigate(`/course/${currentCourse.id}`);
    }
  };

  const addToWishlist = async () => {
    try {
      let newFavoriteCourseIds = user?.favouriteCourseIds || [];
      let successText = "Add course to wish list successfully!";

      if (newFavoriteCourseIds.includes(currentCourse?.id)) {
        newFavoriteCourseIds = newFavoriteCourseIds.filter(
          (id) => id !== currentCourse?.id
        );
        successText = "Remove course from wish list successfully!";
      } else {
        newFavoriteCourseIds = [...newFavoriteCourseIds, currentCourse?.id];
      }

      await UserApi.updateUser({
        userId: user?.id || "",
        favouriteCourseIds: newFavoriteCourseIds,
      });

      const res = await UserApi.getUserById(user?.id || "");
      dispatch(setUser(res));

      dispatch(
        addFlag({
          color: "success",
          content: successText,
        })
      );
    } catch (err) {
      console.log("err", err);

      dispatch(
        addFlag({
          color: "error",
          content: "Fail to add course to wish list!",
        })
      );
    }
  };

  const postReview = async () => {
    try {
      if (newReview.star > 0) {
        setIsSubmittingReview(true);

        await CourseApi.updateStudentCourse({
          courseId: currentCourse.id,
          studentId: user?.id || "",
          reviewContent: newReview.content,
          reviewStar: newReview.star,
        });

        await Promise.all([
          getReviewData(currentCourse.id),
          getCourseRelationWithUserData(currentCourse.id),
        ]);

        setNewReview({
          content: "",
          star: 0,
        });
        setIsSubmittingReview(false);
        closeModal();
      }
    } catch (err) {
      setIsSubmittingReview(false);
      console.log("err", err);
    }
  };

  const deleteReview = async () => {
    try {
      const userConfirmed = window.confirm(
        "Are you sure you want to delete this review?"
      );

      if (userConfirmed) {
        await CourseApi.updateStudentCourse({
          courseId: currentCourse.id,
          studentId: user?.id || "",
          reviewContent: "",
          reviewStar: -1,
        });

        await Promise.all([
          getReviewData(currentCourse.id),
          getCourseRelationWithUserData(currentCourse.id),
        ]);
      }
    } catch (err) {
      console.log("err", err);
    }
  };

  useEffect(() => {
    if (currentCourse.id) {
      getReviewData(currentCourse.id);
      getCourseRelationWithUserData(currentCourse.id);
    }
  }, [currentCourse, currentReviewPage]);

  return (
    <CoursePreviewStyles>
      {isLoading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <Spinner interactionName="load" size="large" />
        </div>
      ) : (
        <div className="container">
          <div className="general-side">
            <div className="general-info">
              <div>
                <Heading level="h800">{currentCourse.name}</Heading>
              </div>
              <div
                dangerouslySetInnerHTML={{
                  __html: currentCourse.subtitle || "",
                }}
              />

              <div className="mt-4">
                <span className="mr-2">Instructor</span>
                <Link to={"/profile/" + courseTeacher?.id}>
                  {courseTeacher?.name}
                </Link>
              </div>

              <GeneralReviewInfo course={currentCourse} />
              <div>{`${currentCourse.totalStudents} students`}</div>

              <div className="tags">
                {currentCourse.tags?.map((tag) => (
                  <div className="tag">
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

            {currentCourse.whatWillLearn && (
              <div className="mb-20">
                <Heading level="h700">What you'll learn</Heading>
                <div
                  dangerouslySetInnerHTML={{
                    __html: currentCourse.whatWillLearn,
                  }}
                />
              </div>
            )}

            {currentCourse.description && (
              <div className="mb-20">
                <Heading level="h700">Description</Heading>
                <div
                  dangerouslySetInnerHTML={{
                    __html: currentCourse.description,
                  }}
                />
              </div>
            )}

            {currentCourse.requirements && (
              <div className="mb-20">
                <Heading level="h700">Requirements</Heading>
                <div
                  dangerouslySetInnerHTML={{
                    __html: currentCourse.requirements,
                  }}
                />
              </div>
            )}

            {currentCourse.whoThisCourseFor && (
              <div className="mb-20">
                <Heading level="h700">Who this course is for</Heading>
                <div
                  dangerouslySetInnerHTML={{
                    __html: currentCourse.whoThisCourseFor,
                  }}
                />
              </div>
            )}

            <div className="mb-2">
              <div className="flex items-center gap-4">
                <Heading level="h700">Ratings</Heading>
                {courseRelationWithUser &&
                  courseRelationWithUser.reviewStar === -1 && (
                    <div>
                      <Button
                        iconAfter={<AddIcon label="" />}
                        onClick={openModal}
                      ></Button>
                    </div>
                  )}
              </div>
              <div className="mb-10 w-full">
                <ModalTransition>
                  {isOpenReviewModal && (
                    <Modal
                      onClose={closeModal}
                      shouldCloseOnOverlayClick={false}
                    >
                      <ModalHeader>
                        <ModalTitle>Rating</ModalTitle>
                      </ModalHeader>
                      <ModalBody>
                        <div className="flex-1">
                          <ReactQuill
                            theme="snow"
                            value={newReview.content}
                            onChange={(e) =>
                              setNewReview((prev) => ({
                                ...prev,
                                content: e,
                              }))
                            }
                          />
                        </div>

                        <div className="mt-8 flex flex-row justify-center">
                          {Array.from({ length: 5 }, (_, i) => i + 1).map(
                            (i) => {
                              let star = <></>;
                              if (i <= newReview.star) {
                                star = <StarFilledIconSvg size={48} />;
                              } else {
                                star = <StarEmptyIconSvg size={48} />;
                              }

                              return (
                                <div
                                  onClick={() =>
                                    setNewReview((prev) => ({
                                      ...prev,
                                      star: i,
                                    }))
                                  }
                                  className="cursor-pointer"
                                >
                                  {star}
                                </div>
                              );
                            }
                          )}
                        </div>
                      </ModalBody>
                      <ModalFooter>
                        <Button appearance="subtle" onClick={closeModal}>
                          Cancel
                        </Button>
                        <LoadingButton
                          appearance="primary"
                          type="submit"
                          onClick={() => postReview()}
                          isLoading={isSubmittingReview}
                          content="Confirm"
                          isDisabled={
                            isSubmittingReview || newReview.star === 0
                          }
                        />
                      </ModalFooter>
                    </Modal>
                  )}
                </ModalTransition>

                {reviewList.map((review) => (
                  <div className="review-item" key={review.studentId}>
                    <div className="main">
                      <div className="flex flex-col items-center">
                        <Avatar size="small" src={review.userAvatar} />
                      </div>
                      <div className="mx-4 flex-1">
                        <div className="flex w-full justify-between">
                          <div className="flex items-center justify-center gap-4">
                            <Link
                              to={`/profile/${review.studentId}`}
                              target="_blank"
                            >
                              {review.userName}
                            </Link>

                            <Stars rating={review.reviewStar} />

                            {user?.id === review.studentId && (
                              <button
                                onClick={() => deleteReview()}
                                className="text-brightRed"
                              >
                                delete
                              </button>
                            )}
                          </div>
                        </div>
                        <div
                          dangerouslySetInnerHTML={{
                            __html: review.reviewContent,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-20">
              <div className="flex items-center gap-6">
                <Heading level="h700">
                  Other courses from{" "}
                  <Link to={"/profile/" + courseTeacher?.id}>
                    {courseTeacher?.name}
                  </Link>
                </Heading>
                <Link to={"/profile/" + courseTeacher?.id}>View all</Link>
              </div>

              <div className="auto-rows-[320px]; mt-4 grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))]">
                {courseList?.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </div>
          </div>

          <div className="floating-side">
            <div className="floating-side-container">
              <div className="mt-4 h-[200px] w-[280px]">
                <img
                  src={
                    currentCourse.backgroundFileId
                      ? getFileUrl(currentCourse.backgroundFileId)
                      : "/course-bg.png"
                  }
                  alt={currentCourse.name}
                  className="h-[160px] w-full"
                ></img>
              </div>

              {currentCourse.teacherId !== user?.id &&
              !courseRelationWithUser ? (
                <>
                  {currentCourse.price ? (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-center">
                        <Heading level="h700">{currentCourse.price}$</Heading>
                      </div>

                      {user && (
                        <>
                          <div>
                            <Button
                              appearance="default"
                              shouldFitContainer
                              onClick={() => makePayment()}
                            >
                              Buy now
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <>
                      {user && (
                        <div className="flex justify-between gap-4">
                          <div className="flex-1">
                            <Button
                              shouldFitContainer
                              appearance="primary"
                              onClick={() => joinCourse()}
                            >
                              Learn for free
                            </Button>
                          </div>
                          <div className="ml-4">
                            <LoveButton />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              ) : (
                <>
                  <div className="flex justify-between gap-4">
                    <div className="flex-1">
                      <Button
                        shouldFitContainer
                        appearance="primary"
                        onClick={() => goToCourse()}
                      >
                        Go to course
                      </Button>
                    </div>
                    <div className="ml-4">
                      <LoveButton />
                    </div>
                  </div>
                </>
              )}

              <div className="summary-course">
                <div className="heading">
                  <Heading level="h500">This course includes:</Heading>
                </div>
                {sectionTypes?.video?.length > 0 && (
                  <div>{`${sectionTypes.video.length} videos (${videoDuration})`}</div>
                )}
                {sectionTypes?.files?.length > 0 && (
                  <div>{`${sectionTypes.files.length} readings`}</div>
                )}
                {sectionTypes?.quiz?.length > 0 && (
                  <div>{`${sectionTypes.quiz.length} quiz`}</div>
                )}
                <div>Full lifetime access</div>
                <div>Certificate of completion</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </CoursePreviewStyles>
  );
};

export default CoursePreview;
