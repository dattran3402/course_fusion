import { useEffect, useMemo, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hook";
import Button from "@atlaskit/button";
import AddIcon from "@atlaskit/icon/glyph/add";
import { PopupSelect } from "@atlaskit/select";
import ChevronDownIcon from "@atlaskit/icon/glyph/chevron-down";
import Breadcrumbs, { BreadcrumbsItem } from "@atlaskit/breadcrumbs";
import __noop from "@atlaskit/ds-lib/noop";
import TextField from "@atlaskit/textfield";
import Select from "@atlaskit/select";
import SearchIcon from "@atlaskit/icon/glyph/search";

import QuizApi from "@/api/quizApi";
import { QuizQuestionTypeEnum } from "@/utils/enum";
import EditQuestion from "./EditQuestion";
import { generateUUID } from "@/utils/helper";
import LoadingButton from "../buttons/LoadingButton";
import { addFlag } from "@/redux/features/contextSlice";
import { SelectOptionType } from "@/utils/types";
import EditListQuestion from "./EditListQuestion";

export const newQuizQuestionTypeOptions = [
  { label: "Select", value: QuizQuestionTypeEnum.SELECT },
  { label: "Multi Select", value: QuizQuestionTypeEnum.MULTI_SELECT },
  { label: "Fill", value: QuizQuestionTypeEnum.FILL },
];

const searchModeOptions: SelectOptionType[] = [
  { label: "All questions", value: "all" },
  { label: "Single Select", value: "singleSelect" },
  { label: "Multi Select", value: "multiSelect" },
  { label: "Fill", value: "full" },
];

const sortCreatedDateOptions: SelectOptionType[] = [
  { label: "Newest First", value: "descending" },
  { label: "Oldest First", value: "ascending" },
];

const QuizBank = () => {
  const dispatch = useAppDispatch();
  const currentCourse = useAppSelector((state) => state.context.currentCourse);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [newQuestionType, setNewQuestionType] = useState<any>({
    label: "Select",
    value: QuizQuestionTypeEnum.SELECT,
  });
  const [questionList, setQuestionList] = useState<any[]>([]);
  const [initQuestionList, setInitQuestionList] = useState<any[]>([]);
  const [tagList, setTagList] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState<string>("");
  const [searchMode, setSearchMode] = useState<SelectOptionType>(
    searchModeOptions[0]
  );
  const [sortCreatedDateOrder, setSortCreatedDateOrder] =
    useState<SelectOptionType>(sortCreatedDateOptions[0]);

  const fetchData = async () => {
    try {
      if (currentCourse) {
        const res = await QuizApi.getQuizQuestions({
          courseId: currentCourse.id,
          sectionId: "",
        });

        const tagListRaw = await QuizApi.getAllTags(currentCourse.id);
        setTagList(tagListRaw);
        setQuestionList(res);
        setInitQuestionList(res);
      }
    } catch {
      setQuestionList([]);
      setTagList([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentCourse.id]);

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

      const createPromises = newQuestions.map(
        async (question) =>
          await QuizApi.createQuizQuestion({
            courseId: currentCourse.id,
            sectionId: "",
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

      await Promise.all([
        ...deletePromises,
        ...createPromises,
        ...updatePromises,
      ]);

      // await QuizApi.createQuizQuestion({
      //   courseId: currentCourse.id,
      //   questionList: questionList,
      // });

      dispatch(
        addFlag({
          color: "success",
          content: "Submit success!",
        })
      );

      fetchData();

      setIsSubmitting(false);
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-10 my-2.5">
      <Breadcrumbs onExpand={__noop}>
        <BreadcrumbsItem text="Quiz Bank" key="general" />
      </Breadcrumbs>

      {/* <div className="mt-4 flex w-full flex-row items-center gap-4">
        <div>
          <TextField
            elemBeforeInput={<SearchIcon size="small" label="" />}
            value={searchValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSearchValue(e.target.value);
            }}
            placeholder="Search for questions here"
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

        <div>
          <Select
            classNamePrefix="react-select"
            options={sortCreatedDateOptions}
            placeholder=""
            value={sortCreatedDateOrder}
            onChange={(e) =>
              setSortCreatedDateOrder({
                label: e?.label || "",
                value: e?.value || "",
              })
            }
          />
        </div>
      </div> */}

      <EditListQuestion
        questionList={questionList}
        setQuestionList={setQuestionList}
      />

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

export default QuizBank;
