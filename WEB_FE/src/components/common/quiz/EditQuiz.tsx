import { useEffect, useMemo, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hook";
import Button from "@atlaskit/button";
import AddIcon from "@atlaskit/icon/glyph/add";
import Textfield from "@atlaskit/textfield";
import { CheckboxSelect } from "@atlaskit/select";
import EditorRemoveIcon from "@atlaskit/icon/glyph/editor/remove";
import Heading from "@atlaskit/heading";
import ChevronDownIcon from "@atlaskit/icon/glyph/chevron-down";
import ChevronRightIcon from "@atlaskit/icon/glyph/chevron-right";

import QuizApi from "@/api/quizApi";
import LoadingButton from "../buttons/LoadingButton";
import { addFlag } from "@/redux/features/contextSlice";
import EditListQuestion from "./EditListQuestion";
import EditQuestion from "./EditQuestion";

const EditQuiz = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.context.user);
  const currentSection = useAppSelector(
    (state) => state.context.currentSection
  );
  const currentCourse = useAppSelector((state) => state.context.currentCourse);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [tagList, setTagList] = useState<string[]>([]);
  const [test, setTest] = useState<string>("");
  const [questionGroups, setQuestionGroups] = useState<
    {
      numberOfQuestions: number;
      tags: string[];
    }[]
  >([]);
  const [questionList, setQuestionList] = useState<any[]>([]);
  const [allQuestionIds, setAllQuestionIds] = useState<string[]>([]);
  const [randomQuestions, setRandomQuestions] = useState<any[]>([]);
  const [initQuestionList, setInitQuestionList] = useState<any[]>([]);
  const [groupExpand, setGroupExpand] = useState<{
    fromBank: boolean;
    other: boolean;
  }>({
    fromBank: false,
    other: false,
  });
  const [isFetchingRandomQuestions, setIsFetchingRandomQuestions] =
    useState<boolean>(false);

  const getTags = async () => {
    try {
      if (currentSection) {
        const tagListRaw = await QuizApi.getAllTags(currentCourse.id);
        setTagList(tagListRaw);
      }
    } catch (err) {
      console.log("err", err);
      setTagList([]);
    }
  };

  const getRandomConfiguration = async (questionsInSection) => {
    try {
      if (currentSection) {
        const quizConfig = await QuizApi.getConfigQuiz(currentSection.id);
        setQuestionGroups(quizConfig.data.configuration || []);
        setAllQuestionIds(quizConfig.data.questionIds || []);

        if (quizConfig.data.questionIds) {
          const randomQuestionIds = quizConfig.data.questionIds.filter(
            (id) => !questionsInSection.find((question) => question.id === id)
          );

          const res = await QuizApi.getQuestionByIds(randomQuestionIds);
          setRandomQuestions(res.data);
        }
      }
    } catch {
      setQuestionGroups([]);
      setAllQuestionIds([]);
    }
  };

  const getRandomQuestion = async () => {
    try {
      setIsFetchingRandomQuestions(true);

      const res = await Promise.all(
        questionGroups.map(async (group) => {
          if (group.numberOfQuestions > 0) {
            const questions = await QuizApi.getRandomQuestionByTags({
              courseId: currentCourse.id,
              tags: group.tags,
              limit: group.numberOfQuestions,
            });

            return questions;
          } else {
            return 0;
          }
        })
      );

      setIsFetchingRandomQuestions(false);
      setRandomQuestions(res.flat());
    } catch {
      setRandomQuestions([]);
      setIsFetchingRandomQuestions(false);
    }
  };

  const fetchData = async () => {
    try {
      const res = await QuizApi.getQuizQuestions({
        courseId: currentCourse.id,
        sectionId: currentSection.id,
      });

      getTags();
      getRandomConfiguration(res);

      setQuestionList(res);
      setInitQuestionList(res);
    } catch (err) {
      console.log("err", err);
      setQuestionList([]);
      setInitQuestionList([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentCourse.id]);

  useEffect(() => {
    fetchData();
  }, [currentSection.id]);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      const newQuestions = questionList.filter(
        (question) => !initQuestionList.find((q) => q.id === question.id)
      );

      const deletedQuestions = initQuestionList.filter(
        (question) => !questionList.find((q) => q.id === question.id)
      );

      const otherQuestions = questionList.filter(
        (question) =>
          ![...newQuestions, ...deletedQuestions].find(
            (q) => q.id === question.id
          )
      );

      const updatedQuestions = otherQuestions.filter((question) => {
        const initQuestion = initQuestionList.find((q) => q.id === question.id);
        return JSON.stringify(initQuestion) !== JSON.stringify(question);
      });

      const deletePromises = deletedQuestions.map(
        async (question) =>
          await QuizApi.updateQuizQuestion({
            questionId: question.id,
            courseId: "",
          })
      );

      // const deletePromises = deletedQuestions.map(
      //   async (question) => await QuizApi.deleteQuizQuestion(question.id)
      // );

      const createPromises = newQuestions.map(
        async (question) =>
          await QuizApi.createQuizQuestion({
            courseId: currentCourse.id,
            sectionId: currentSection.id,
            type: question.type,
            question: question.question,
            options: question.options,
            answer: question.answer,
            tags: question.tags,
          })
      );

      const updatePromises = updatedQuestions.map(
        async (question) =>
          await QuizApi.updateQuizQuestion({
            questionId: question.id,
            type: question.type,
            question: question.question,
            options: question.options,
            answer: question.answer,
            tags: question.tags,
          })
      );

      await Promise.all([...deletePromises, ...updatePromises]);

      const createQuestionRes = await Promise.all(createPromises);
      const newQuestionIds = createQuestionRes.map(
        (question) => question.data.id
      );

      const currentQuestionIds = questionList
        .map((question) => question.id)
        .filter((id) => !id.includes("NEW"));

      const randomQuestionsIds = randomQuestions.map((question) => question.id);

      const allQuestionIds = [
        ...currentQuestionIds,
        ...newQuestionIds,
        ...randomQuestionsIds,
      ];

      console.log("allQuestionIds", allQuestionIds);

      await QuizApi.configQuiz({
        sectionId: currentSection.id,
        questionIds: allQuestionIds,
        configuration: questionGroups,
      });

      dispatch(
        addFlag({
          color: "success",
          content: "Submit success!",
        })
      );

      await fetchData();

      setIsSubmitting(false);
    } catch (err) {
      console.log("err", err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <div
        dangerouslySetInnerHTML={{
          __html: currentSection.description,
        }}
      />

      <div className="mt-4 flex">
        <button
          onClick={() =>
            setGroupExpand((prev) => ({
              ...prev,
              fromBank: !prev.fromBank,
            }))
          }
        >
          {groupExpand.fromBank ? (
            <ChevronDownIcon label="" />
          ) : (
            <ChevronRightIcon label="" />
          )}
        </button>
        <Heading level="h500">{`Random questions (${randomQuestions.length})`}</Heading>
      </div>

      {groupExpand.fromBank && (
        <div className="mx-10">
          {questionGroups.map((questionGroup, index) => {
            return (
              <div className="mt-10 flex gap-4" key={index}>
                <div className="max-w-12">
                  <Textfield
                    name="basic"
                    value={questionGroup.numberOfQuestions}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setQuestionGroups((prev) =>
                        prev.map((gr, i) =>
                          i === index
                            ? {
                                ...gr,
                                numberOfQuestions: Number(e.target.value),
                              }
                            : gr
                        )
                      );
                    }}
                  />
                </div>

                <div>
                  <CheckboxSelect
                    inputId="checkbox-select-example"
                    className="checkbox-select"
                    classNamePrefix="select"
                    options={tagList.map((tag) => ({
                      label: tag,
                      value: tag,
                    }))}
                    value={questionGroup.tags.map((tag) => ({
                      value: tag,
                      label: tag,
                    }))}
                    placeholder="Choose tags"
                    onChange={(e) => {
                      setQuestionGroups((prev) =>
                        prev.map((gr, i) =>
                          i === index
                            ? {
                                ...gr,
                                tags: e.map((a) => a.value),
                              }
                            : gr
                        )
                      );
                    }}
                  />
                </div>

                <button
                  onClick={() => {
                    setQuestionGroups((prev) =>
                      prev.filter((gr, i) => i !== index)
                    );
                  }}
                >
                  <EditorRemoveIcon label="" />
                </button>
              </div>
            );
          })}

          <div className="mt-10 flex gap-4">
            <Button
              iconAfter={<AddIcon label="" />}
              onClick={() => {
                setQuestionGroups((prev) => [
                  ...prev,
                  {
                    numberOfQuestions: 1,
                    tags: [],
                  },
                ]);
              }}
              content=""
            >
              Add group
            </Button>
          </div>

          <div className="mt-4 flex gap-4">
            <LoadingButton
              type="submit"
              appearance="primary"
              onClick={() => {
                getRandomQuestion();
              }}
              isLoading={isFetchingRandomQuestions}
              content="Get new random questions"
            />
          </div>

          {randomQuestions.map((quiz, index) => (
            <div key={quiz.id}>
              <EditQuestion
                quiz={quiz}
                questionIndex={index}
                tagList={tagList}
                isReadOnly
              />
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex">
        <button
          onClick={() =>
            setGroupExpand((prev) => ({
              ...prev,
              other: !prev.other,
            }))
          }
        >
          {groupExpand.other ? (
            <ChevronDownIcon label="" />
          ) : (
            <ChevronRightIcon label="" />
          )}
        </button>
        <Heading level="h500">{`Other questions (${questionList.length})`}</Heading>
      </div>
      {groupExpand.other && (
        <EditListQuestion
          questionList={questionList}
          setQuestionList={setQuestionList}
        />
      )}

      <div className="mb-10 mt-4 flex justify-end">
        <LoadingButton
          type="submit"
          appearance="primary"
          isLoading={isSubmitting}
          onClick={() => handleSubmit()}
          content="Submit"
        />
      </div>
    </div>
  );
};

export default EditQuiz;
