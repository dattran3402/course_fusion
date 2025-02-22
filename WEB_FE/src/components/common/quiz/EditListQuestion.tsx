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

const EditListQuestion = ({ questionList, setQuestionList }) => {
  const dispatch = useAppDispatch();
  const currentCourse = useAppSelector((state) => state.context.currentCourse);

  const [newQuestionType, setNewQuestionType] = useState<any>({
    label: "Select",
    value: QuizQuestionTypeEnum.SELECT,
  });
  const [tagList, setTagList] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState<string>("");
  const [searchMode, setSearchMode] = useState<SelectOptionType>(
    searchModeOptions[0]
  );
  const [sortCreatedDateOrder, setSortCreatedDateOrder] =
    useState<SelectOptionType>(sortCreatedDateOptions[0]);

  const deleteQuestion = (questionId: string) => {
    setQuestionList((prev) => prev.filter((q) => q.id !== questionId));
  };

  const addQuestion = () => {
    setQuestionList((prev) => [
      ...prev,
      {
        id: "NEW" + generateUUID(),
        type: newQuestionType.value,
        order: questionList.length + 1,
        answer: "",
      },
    ]);
  };

  const editQuestion = ({
    questionId,
    question,
    answer,
    options,
    tags,
  }: {
    questionId: string;
    question?: string;
    answer?: string;
    options?: [];
    tags?: string[];
  }) => {
    const newTagList = tagList;
    tags?.forEach((tag) => {
      if (!newTagList.includes(tag)) {
        newTagList.push(tag);
      }
    });
    setTagList(newTagList);

    setQuestionList((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            question: question !== undefined ? question : q.question,
            answer: answer !== undefined ? answer : q.answer,
            options: options !== undefined ? options : q.options,
            tags: tags !== undefined ? tags : q.tags,
          };
        } else {
          return q;
        }
      })
    );
  };

  return (
    <div className="mx-10">
      <div className="flex flex-col">
        {questionList.map((quiz, index) => (
          <div key={quiz.id}>
            <EditQuestion
              quiz={quiz}
              questionIndex={index}
              deleteQuestion={deleteQuestion}
              editQuestion={editQuestion}
              tagList={tagList}
            />
          </div>
        ))}
      </div>

      <div className="mt-10 flex gap-4">
        <PopupSelect
          placeholder="Search labels..."
          options={newQuizQuestionTypeOptions}
          target={({ isOpen, ...triggerProps }) => (
            <Button {...triggerProps} iconAfter={<ChevronDownIcon label="" />}>
              {newQuestionType.label}
            </Button>
          )}
          value={newQuestionType.label}
          onChange={(e) => {
            setNewQuestionType(e);
          }}
        />

        <div>
          <Button
            appearance="primary"
            iconAfter={<AddIcon label="" />}
            onClick={() => {
              addQuestion();
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default EditListQuestion;
