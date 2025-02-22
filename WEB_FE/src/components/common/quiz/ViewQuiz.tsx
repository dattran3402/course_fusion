import { useEffect, useMemo, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hook";
import { InlineEditableTextfield } from "@atlaskit/inline-edit";
import { Radio } from "@atlaskit/radio";
import { Checkbox } from "@atlaskit/checkbox";
import SectionMessage from "@atlaskit/section-message";
import CheckIcon from "@atlaskit/icon/glyph/check";
import CrossIcon from "@atlaskit/icon/glyph/cross";

import { QuizQuestionType } from "@/utils/types";
import { QuizQuestionTypeEnum } from "@/utils/enum";
import QuizApi from "@/api/quizApi";
import LoadingButton from "../buttons/LoadingButton";

const ViewQuiz = () => {
  const user = useAppSelector((state) => state.context.user);
  const currentSection = useAppSelector(
    (state) => state.context.currentSection
  );
  const currentCourse = useAppSelector((state) => state.context.currentCourse);

  const [questionList, setQuestionList] = useState<QuizQuestionType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [userSubmit, setUserSubmit] = useState<
    {
      questionId;
      answer;
    }[]
  >([]);
  const [submitted, setSubmitted] = useState<{
    state;
    correct;
    total;
  }>({
    state: false,
    correct: 0,
    total: 0,
  });

  const getSubmitData = async () => {
    try {
      const submitData = await QuizApi.getSubmittedQuiz({
        sectionId: currentSection.id,
        studentId: user ? user.id : "",
      });
      console.log("submitData", submitData);
      return submitData.data;
    } catch (err) {
      console.log("err", err);
      return null;
    }
  };

  const fetchData = async () => {
    try {
      if (currentSection.id && user?.id) {
        const submitData = await getSubmitData();

        if (submitData) {
          setQuestionList(submitData.submittedQuestions);
          setUserSubmit(
            submitData.submittedQuestions.map((q) => ({
              questionId: q.id,
              answer: q.userAnswer,
            }))
          );
          setSubmitted({
            state: submitData.quizStudent,
            correct: submitData.quizStudent.correct,
            total: submitData.quizStudent.total,
          });
          return;
        } else {
          setSubmitted({
            state: false,
            correct: null,
            total: null,
          });
        }

        const quizConfig = await QuizApi.getConfigQuiz(currentSection.id);

        const initQuestionList = await QuizApi.getQuestionByIds(
          quizConfig.data.questionIds
        );

        setQuestionList(initQuestionList.data);
        setUserSubmit(
          initQuestionList.data.map((q) => ({
            questionId: q.id,
            answer: "",
          }))
        );
      }
    } catch (error) {
      console.log("error", error);
      setQuestionList([]);
      setSubmitted({
        state: false,
        correct: null,
        total: null,
      });
    }
  };

  useEffect(() => {
    if (currentSection.id && user?.id) {
      fetchData();
    }
  }, [currentSection.id, user]);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      const res = await QuizApi.submitQuiz({
        quizId: currentSection.id,
        studentId: user ? user.id : "",
        submitQuizQuestions: userSubmit,
      });

      setIsSubmitting(false);
      fetchData();
    } catch (error) {
      console.log("error", error);
      setSubmitted({
        state: false,
        correct: null,
        total: null,
      });
    }
  };

  const handleRedo = async () => {
    try {
      setIsSubmitting(true);

      await QuizApi.redoQuiz({
        studentId: user?.id || "",
        quizId: currentSection.id,
      });

      setIsSubmitting(false);
      fetchData();
    } catch (error) {
      fetchData();
      console.log("error", error);
    }
  };

  const renderQuizQuestion = ({ quizQuestion, questionIndex }) => (
    <div key={quizQuestion.id}>
      <div className="mt-4 flex flex-col">
        <div className="flex w-full justify-between">
          {submitted.state && (
            <div className="mr-2">
              {quizQuestion.status ? (
                <CheckIcon label="" />
              ) : (
                <CrossIcon label="" />
              )}
            </div>
          )}
          <h4>{questionIndex + 1}. Question:</h4>

          <div className="mx-2 flex-1">{quizQuestion.question}</div>
        </div>

        {quizQuestion.type === QuizQuestionTypeEnum.SELECT && (
          <div className="mx-4 flex flex-row gap-4">
            <div className="w-full">
              {quizQuestion.options?.map((option) => (
                <div className="flex" key={option.id}>
                  <Radio
                    value={option.id}
                    testId={option.id}
                    isChecked={userSubmit[questionIndex].answer === option.id}
                    onChange={(e) => {
                      // Not editable if the quiz has been submitted
                      if (
                        submitted.state === true &&
                        user?.id !== currentCourse.teacherId
                      ) {
                        return;
                      }

                      setUserSubmit((prev) =>
                        prev.map((s) => {
                          if (s.questionId === quizQuestion.id) {
                            return {
                              ...s,
                              answer: e.target.value,
                            };
                          } else {
                            return s;
                          }
                        })
                      );
                    }}
                  />
                  <div className="flex-1">{option.content}</div>
                  {/* {submitted.state === true && (
                    <div>
                      <CheckIcon label="" />
                    </div>
                  )} */}
                </div>
              ))}
            </div>
          </div>
        )}

        {quizQuestion.type === QuizQuestionTypeEnum.MULTI_SELECT && (
          <div className="mx-4 flex flex-row gap-4">
            <div className="w-full">
              {quizQuestion.options?.map((option) => (
                <div className="flex" key={option.id}>
                  <Checkbox
                    value={option.id}
                    testId={option.id}
                    isChecked={
                      userSubmit[questionIndex].answer.indexOf(option.id) !== -1
                    }
                    onChange={(e) => {
                      // Not editable if the quiz has been submitted
                      if (
                        submitted.state === true &&
                        user?.id !== currentCourse.teacherId
                      ) {
                        return;
                      }

                      const isSelected =
                        userSubmit[questionIndex].answer.indexOf(option.id) !==
                        -1;

                      const arrayAnswer =
                        userSubmit[questionIndex].answer.split("|");

                      if (isSelected) {
                        const editedAnswer = arrayAnswer?.filter(
                          (op) => op !== option.id
                        );

                        setUserSubmit((prev) =>
                          prev.map((s) => {
                            if (s.questionId === quizQuestion.id) {
                              return {
                                ...s,
                                answer: editedAnswer?.join("|"),
                              };
                            } else {
                              return s;
                            }
                          })
                        );
                      } else {
                        arrayAnswer?.push(option.id);
                        setUserSubmit((prev) =>
                          prev.map((s) => {
                            if (s.questionId === quizQuestion.id) {
                              return {
                                ...s,
                                answer: arrayAnswer?.join("|"),
                              };
                            } else {
                              return s;
                            }
                          })
                        );
                      }
                    }}
                  />

                  <div className="flex-1">{option.content}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {quizQuestion.type === QuizQuestionTypeEnum.FILL && (
          <div>
            <div>
              <div className="mx-4 flex items-center">
                <div className="mx-2">
                  <InlineEditableTextfield
                    defaultValue={userSubmit[questionIndex].answer}
                    label=""
                    onConfirm={(value) => {
                      // Not editable if the quiz has been submitted
                      if (
                        submitted.state === true &&
                        user?.id !== currentCourse.teacherId
                      ) {
                        return;
                      }

                      setUserSubmit((prev) =>
                        prev.map((s) => {
                          if (s.questionId === quizQuestion.id) {
                            return {
                              ...s,
                              answer: value,
                            };
                          } else {
                            return s;
                          }
                        })
                      );
                    }}
                    placeholder="Click to enter text"
                    // validate={validate}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {submitted.state && (
        <SectionMessage appearance="success">
          <strong>
            {submitted.correct}/{submitted.total}
          </strong>
          <p>The quiz has been submitted</p>
        </SectionMessage>
      )}

      {questionList.map((quizQuestion, index) =>
        renderQuizQuestion({ quizQuestion, questionIndex: index })
      )}

      <div className="mb-10 mt-4 flex justify-end">
        {submitted.state ? (
          <LoadingButton
            type="submit"
            appearance="primary"
            isLoading={isSubmitting}
            onClick={() => handleRedo()}
            content={"Re do"}
          />
        ) : (
          <LoadingButton
            type="submit"
            appearance="primary"
            isLoading={isSubmitting}
            onClick={() => handleSubmit()}
            content={"Submit"}
          />
        )}
      </div>
    </div>
  );
};

export default ViewQuiz;
