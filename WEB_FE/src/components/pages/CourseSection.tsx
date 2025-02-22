import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hook";
import { useParams } from "react-router-dom";
import EditIcon from "@atlaskit/icon/glyph/edit";
import Button from "@atlaskit/button";
import EmptyState from "@atlaskit/empty-state";
import { useNavigate } from "react-router-dom";
import Tabs, { Tab, TabList, TabPanel } from "@atlaskit/tabs";
import ReactQuill from "react-quill";
import Avatar from "@atlaskit/avatar";
import EditorRemoveIcon from "@atlaskit/icon/glyph/editor/remove";
import Pagination from "@atlaskit/pagination";
import LoadingButton from "@atlaskit/button/loading-button";
import styled from "styled-components";
import CommentIcon from "@atlaskit/icon/glyph/comment";
import { Link } from "react-router-dom";
import Spinner from "@atlaskit/spinner";

import ContentHeader from "../common/section-view/SectionHeader";
import SectionApi from "@/api/sectionApi";
import SectionQuiz from "../common/section-view/SectionQuiz";
import {
  setCurrentSection,
  setCourseLectureAndQuiz,
  setCourseProgress,
} from "@/redux/features/contextSlice";
import { CourseSectionTypeEnum } from "@/utils/enum";
import SectionVideo from "../common/section-view/SectionVideo";
import SectionFiles from "../common/section-view/SectionFiles";
import SectionAssignment from "../common/section-view/SectionAssignment";
import { getFileUrl, formatDate } from "@/utils/helper";
import { SectionType } from "@/utils/types";
import CourseApi from "@/api/courseApi";
import Footer from "../common/footer/Footer";
import UserApi from "@/api/userApi";
import AssignmentApi from "@/api/assignmentApi";
import QuizApi from "@/api/quizApi";
import { addFlag } from "@/redux/features/contextSlice";
import { socketInstance } from "@/App";

const NewCommentStyled = styled.div`
  margin-top: 1rem;
  width: 100%;

  .btn-wrapper {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    width: 100%;
    gap: 10px;
    margin-top: 10px;
  }
`;

const CommentStyled = styled.div<{ isChild }>`
  margin-top: 2.5rem;
  margin-bottom: 2.5rem;
  width: ${(props) => (props.isChild ? "calc(100% - 40px)" : "100%")};
  margin-left: ${(props) => (props.isChild ? "40px" : "0px")};

  .main {
    display: flex;
    flex-direction: row;

    .reply-wrapper {
      display: flex;
      justify-content: flex-end;

      .reply-btn {
        cursor: pointer;
        margin-right: 60px;
        display: flex;
        align-items: center;
        gap: 10px;
      }
    }
  }
`;

const CourseSection = () => {
  const dispatch = useAppDispatch();
  const { sectionId } = useParams();
  const navigate = useNavigate();

  const currentCourse = useAppSelector((state) => state.context.currentCourse);
  const currentSection = useAppSelector(
    (state) => state.context.currentSection
  );
  const user = useAppSelector((state) => state.context.user);
  const studentCourseRelation = useAppSelector(
    (state) => state.context.studentCourseRelation
  );
  const sections = useAppSelector((state) => state.context.sections);
  const courseProgress = useAppSelector(
    (state) => state.context.courseProgress
  );
  const lectureAndQuiz = useAppSelector(
    (state) => state.context.lectureAndQuiz
  );

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [prevSection, setPrevSection] = useState<SectionType>();
  const [nextSection, setNextSection] = useState<SectionType>();
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [commentList, setCommentList] = useState<any>([]);
  const [newComment, setNewComment] = useState<string>("");
  const [totalCommentPages, setTotalCommentPages] = useState<number>(0);
  const [currentCommentPage, setCurrentCommentPage] = useState<number>(1);
  const [parentCommentId, setParentCommentId] = useState<string>("");
  const [placeToAddComment, setPlaceToAddComment] = useState<string>("");

  const getCommentData = async (sectionId) => {
    try {
      const PAGE_SIZE = 5;

      const commentsRaw = await SectionApi.getCommentsInSection({
        sectionId,
        page: currentCommentPage,
        pageSize: PAGE_SIZE,
      });

      setTotalCommentPages(Math.ceil(commentsRaw.total / PAGE_SIZE));

      const formattedCommentPromises = commentsRaw.data.map(async (comment) => {
        const commenter = await UserApi.getUserById(comment.userId);
        return {
          ...comment,
          userName: commenter.name,
          userAvatar: getFileUrl(commenter.avatarFileId),
        };
      });
      const formattedComment = await Promise.all(formattedCommentPromises);

      setCommentList(formattedComment);
    } catch (err) {
      console.log("err", err);
      setCommentList([]);
    }
  };

  const fetchData = async () => {
    try {
      const section = await SectionApi.getSectionById(sectionId);
      dispatch(setCurrentSection(section));

      if (!studentCourseRelation && user?.id !== currentCourse.teacherId) {
        navigate("/");
      }

      await getCommentData(section.id);

      if (studentCourseRelation) {
        if (section.type === CourseSectionTypeEnum.VIDEO) {
          const res = await SectionApi.getStudentProgress({
            sectionId: sectionId,
            studentId: user?.id || "",
          });

          if (res.data) {
            setProgressPercent(res.data.progressPercent);
          } else {
            setProgressPercent(0);
          }
        } else {
          setProgressPercent(100);
          handleUpdateProgress(100);
        }
      }

      setIsLoading(false);
    } catch (err) {
      console.log("err", err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (lectureAndQuiz.length > 0) {
      const currentSectionIndex = lectureAndQuiz.findIndex(
        (item) => sectionId === item.id
      );

      setPrevSection(lectureAndQuiz[currentSectionIndex - 1]);
      setNextSection(lectureAndQuiz[currentSectionIndex + 1]);
    }
  }, [lectureAndQuiz, sectionId]);

  const postComment = async () => {
    try {
      if (newComment.trim() !== "" && newComment.trim() !== "<p><br></p>") {
        setIsSubmitting(true);
        await SectionApi.postComment({
          sectionId: currentSection.id,
          userId: user?.id,
          content: newComment,
          parentCommentId: parentCommentId,
        });

        if (parentCommentId === "") {
          socketInstance.emit("notification", {
            userIds: [currentCourse.teacherId],
            data: {
              content: `${user?.name} has commented on ${currentSection.name}`,
              link: `/course/${currentCourse.id}/section/${currentSection.id}`,
            },
          });
        } else {
          let userIds: any[] = [];
          const parentComment = commentList.find(
            (cmt) => cmt.id === parentCommentId
          );
          userIds.push(parentComment.userId);

          commentList.forEach((cmt) => {
            if (cmt.parentCommentId === parentCommentId) {
              userIds.push(cmt.userId);
            }
          });

          userIds = userIds.filter((id) => id !== user?.id);

          socketInstance.emit("notification", {
            userIds: userIds,
            data: {
              content: `${user?.name} has reply your commented on ${currentSection.name}`,
              link: `/course/${currentCourse.id}/section/${currentSection.id}`,
            },
          });
        }

        getCommentData(currentSection.id);
        setNewComment("");
        setIsSubmitting(false);
        setParentCommentId("");
        setPlaceToAddComment("");
      }
    } catch (err) {
      console.log("err", err);
      setIsSubmitting(false);
    }
  };

  const deleteComment = async (commentId) => {
    try {
      const userConfirmed = window.confirm(
        "Are you sure to delete this comment?"
      );

      if (userConfirmed) {
        await SectionApi.deleteComment(commentId);
        getCommentData(currentSection.id);
      }
    } catch (err) {
      console.log("err", err);
    }
  };

  useEffect(() => {
    if (currentSection.id) {
      getCommentData(currentSection.id);
    }
  }, [currentSection, currentCommentPage]);

  useEffect(() => {
    fetchData();
  }, [sectionId]);

  const handleUpdateProgress = async (percent) => {
    try {
      if (user && sectionId && !isLoading) {
        if (currentSection.type === CourseSectionTypeEnum.VIDEO) {
          if (percent > 0) {
            await SectionApi.updateStudentProgress({
              sectionId: sectionId,
              studentId: user.id,
              progressPercent: percent,
            });
          }
        } else {
          await SectionApi.updateStudentProgress({
            sectionId: sectionId,
            studentId: user.id,
            progressPercent: 100,
          });
        }

        const progress = await SectionApi.getStudentProgressByCourseId({
          courseId: currentCourse.id,
          studentId: user?.id || "",
        });

        dispatch(setCourseProgress(progress.data));

        if (!nextSection && !studentCourseRelation?.finishedDate) {
          CourseApi.updateStudentCourse({
            studentId: user.id,
            courseId: currentCourse.id,
            finishedDate: new Date(),
          });
        }
      }
    } catch (err) {
      console.log("err", err);
    }
  };

  useEffect(() => {
    handleUpdateProgress(progressPercent);
  }, [progressPercent, isLoading]);

  const handleClickReply = (comment) => {
    if (!comment.parentCommentId) {
      setParentCommentId(comment.id);

      if (comment.lastChildId) {
        setPlaceToAddComment(comment.lastChildId);
      } else {
        setPlaceToAddComment(comment.id);
      }
    } else {
      const parentComment = commentList.find(
        (cmt) => cmt.id === comment.parentCommentId
      );

      setParentCommentId(parentComment.id);
      setPlaceToAddComment(parentComment.lastChildId);
    }
  };

  const handleClickCancel = () => {
    setParentCommentId("");
    setPlaceToAddComment("");
  };

  return (
    <>
      <div className="mx-10 my-2.5 min-h-[100vh]">
        <div className="flex w-full flex-row justify-between">
          <div className="-mt-6">
            <ContentHeader />
          </div>
          {user?.id === currentCourse.teacherId && (
            <div>
              <Button
                iconAfter={<EditIcon label="" size="medium" />}
                appearance="subtle"
                onClick={() => {
                  window.open(
                    `${import.meta.env.VITE_APP_URL}/course/${
                      currentCourse.id
                    }/sections?sectionId=${sectionId}`,
                    "_blank"
                  );
                }}
              ></Button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div>
            <Spinner />
          </div>
        ) : (
          <div className="mx-auto mb-4 max-w-5xl">
            {currentSection.type === CourseSectionTypeEnum.VIDEO && (
              <SectionVideo
                progressPercent={progressPercent}
                setProgressPercent={setProgressPercent}
              />
            )}
            {currentSection.type === CourseSectionTypeEnum.ASSIGNMENT && (
              <SectionAssignment />
            )}
            {currentSection.type === CourseSectionTypeEnum.QUIZ && (
              <SectionQuiz />
            )}
            {currentSection.type === CourseSectionTypeEnum.FILES && (
              <SectionFiles />
            )}
          </div>
        )}

        <div className="mb-4 flex w-full flex-row justify-between">
          <Button
            onClick={() => {
              navigate(
                `/course/${currentCourse.id}/section/${prevSection?.id || ""}`
              );
            }}
            isDisabled={prevSection ? false : true}
          >
            Previous
          </Button>
          <Button
            onClick={() => {
              if (nextSection) {
                navigate(
                  `/course/${currentCourse.id}/section/${nextSection?.id || ""}`
                );
              } else {
                dispatch(
                  addFlag({
                    color: "success",
                    content:
                      "Congratulation for completed the course, we are processing your certificate!",
                  })
                );

                setTimeout(() => {
                  window.open(`/certificate/${studentCourseRelation?.id}`);
                }, 4000);
              }
            }}
            isDisabled={
              currentCourse.requiresSequentialViewing &&
              progressPercent < (currentCourse.percentToViewNext || 100)
            }
          >
            Next
          </Button>
        </div>

        {![
          CourseSectionTypeEnum.ASSIGNMENT,
          CourseSectionTypeEnum.QUIZ,
        ].includes(currentSection.type) && (
          <div>
            <Tabs
              onChange={(index) => console.log("Selected Tab", index + 1)}
              id="default"
            >
              <TabList>
                <Tab>Description</Tab>
                <Tab>Q&A</Tab>
                {/* <Tab>Notes</Tab>
                  <Tab>Announcements</Tab> */}
              </TabList>
              <TabPanel>
                <div
                  className="m-4"
                  dangerouslySetInnerHTML={{
                    __html: currentSection.description,
                  }}
                />
              </TabPanel>
              <TabPanel>
                <div className="w-full">
                  {parentCommentId === "" && (
                    <NewCommentStyled>
                      <div className="editor">
                        <ReactQuill
                          theme="snow"
                          value={newComment}
                          onChange={setNewComment}
                        />
                      </div>

                      <div className="btn-wrapper">
                        <LoadingButton
                          type="submit"
                          appearance={"primary"}
                          isDisabled={
                            newComment.trim() === "" ||
                            newComment.trim() === "<p><br></p>"
                          }
                          isLoading={isSubmitting}
                          onClick={() => postComment()}
                        >
                          Submit
                        </LoadingButton>
                      </div>
                    </NewCommentStyled>
                  )}

                  {commentList.map((comment) => (
                    <CommentStyled
                      key={comment.userId}
                      isChild={comment.parentCommentId}
                    >
                      <div className="main">
                        <div className="flex flex-col items-center">
                          <Avatar size="small" src={comment.userAvatar} />
                        </div>
                        <div className="mx-4 flex-1">
                          <div className="flex w-full justify-between">
                            <div>
                              <Link
                                to={`/profile/${comment.userId}`}
                                target="_blank"
                              >
                                {comment.userName}
                              </Link>{" "}
                              at {formatDate(comment.createdAt)}
                            </div>
                            {user?.id === comment.userId && (
                              <button onClick={() => deleteComment(comment.id)}>
                                <EditorRemoveIcon label="" />
                              </button>
                            )}
                          </div>
                          <div
                            dangerouslySetInnerHTML={{
                              __html: comment.content,
                            }}
                          />
                          {placeToAddComment !== comment.id && (
                            <div className="reply-wrapper">
                              <div
                                className="reply-btn"
                                onClick={() => handleClickReply(comment)}
                              >
                                <CommentIcon label="" />
                                Reply
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {placeToAddComment === comment.id && (
                        <NewCommentStyled>
                          <div className="editor">
                            <ReactQuill
                              theme="snow"
                              value={newComment}
                              onChange={setNewComment}
                            />
                          </div>

                          <div className="btn-wrapper">
                            <Button onClick={() => handleClickCancel()}>
                              Cancel
                            </Button>
                            <LoadingButton
                              type="submit"
                              appearance={"primary"}
                              isDisabled={
                                newComment.trim() === "" ||
                                newComment.trim() === "<p><br></p>"
                              }
                              isLoading={isSubmitting}
                              onClick={() => postComment()}
                            >
                              Submit
                            </LoadingButton>
                          </div>
                        </NewCommentStyled>
                      )}
                    </CommentStyled>
                  ))}

                  <div className="flex w-full items-center justify-center py-10">
                    {totalCommentPages > 1 && (
                      <Pagination
                        nextLabel="Next"
                        label="Page"
                        pageLabel="Page"
                        pages={
                          totalCommentPages > 0
                            ? Array.from(
                                { length: totalCommentPages },
                                (_, i) => i + 1
                              )
                            : [1]
                        }
                        previousLabel="Previous"
                        onChange={(e, page) => setCurrentCommentPage(page)}
                      />
                    )}
                  </div>
                </div>
              </TabPanel>
              {/* <TabPanel>
                  <div>This is the content area of the third tab.</div>
                </TabPanel>
                <TabPanel>
                  <div>This is the content area of the third tab.</div>
                </TabPanel> */}
            </Tabs>
          </div>
        )}
      </div>

      <div className="my-[100px]"></div>
      <Footer />
    </>
  );
};

export default CourseSection;
