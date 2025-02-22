import Button from "@atlaskit/button";
import EditorRemoveIcon from "@atlaskit/icon/glyph/editor/remove";
import { InlineEditableTextfield } from "@atlaskit/inline-edit";
import { Radio } from "@atlaskit/radio";
import { Checkbox } from "@atlaskit/checkbox";
import AddIcon from "@atlaskit/icon/glyph/add";
import MoreIcon from "@atlaskit/icon/glyph/more";
import DropdownMenu, {
  DropdownItem,
  DropdownItemGroup,
} from "@atlaskit/dropdown-menu";
import { CreatableSelect } from "@atlaskit/select";

import { QuizQuestionType } from "@/utils/types";
import { QuizQuestionTypeEnum } from "@/utils/enum";
import { generateUUID } from "@/utils/helper";

const EditQuestion = ({
  quiz,
  questionIndex,
  deleteQuestion,
  editQuestion,
  tagList,
  isReadOnly = false,
}: {
  quiz: QuizQuestionType;
  questionIndex: number;
  deleteQuestion?: any;
  editQuestion?: any;
  tagList: string[];
  isReadOnly?: boolean;
}) => {
  const Dropdown = () => {
    return (
      <DropdownMenu
        trigger={({ triggerRef, ...props }) => (
          <div
            className="cursor-pointer"
            ref={triggerRef as React.RefObject<HTMLDivElement>}
            {...props}
          >
            <MoreIcon label="" />
          </div>
        )}
      >
        <DropdownItemGroup>
          {/* <DropdownItem
            onClick={() => {
              moveQuestionUp({ quiz, pad: -1 });
            }}
          >
            Move up
          </DropdownItem>
          <DropdownItem
            onClick={() => {
              moveQuestionUp({ quiz, pad: 1 });
            }}
          >
            Move down
          </DropdownItem> */}
          <DropdownItem
            onClick={() => {
              deleteQuestion(quiz.id);
            }}
          >
            Delete
          </DropdownItem>
        </DropdownItemGroup>
      </DropdownMenu>
    );
  };

  return (
    <div>
      <div className="mt-4 flex flex-col">
        <div className="flex w-full items-center justify-between">
          <h4>{questionIndex + 1}. Question:</h4>

          <div className="mx-2 flex-1">
            <InlineEditableTextfield
              defaultValue={quiz.question}
              label=""
              onConfirm={(value) => {
                if (!isReadOnly) {
                  editQuestion({
                    questionId: quiz.id,
                    question: value,
                  });
                }
              }}
              placeholder="Click to enter text"
              // validate={validate}
            />
          </div>

          {!isReadOnly && (
            <div>
              <Dropdown />
            </div>
          )}
        </div>

        {quiz.type === QuizQuestionTypeEnum.SELECT && (
          <div className="mx-4 flex flex-row gap-4">
            <h4>Options: </h4>

            <div className="w-full">
              {quiz.options?.map((option) => (
                <div className="flex" key={option.id}>
                  <Radio
                    value={option.id}
                    testId={option.id}
                    isChecked={quiz.answer === option.id}
                    onChange={(e) => {
                      editQuestion({
                        questionId: quiz.id,
                        answer: e.target.value,
                      });
                    }}
                    isDisabled={isReadOnly}
                  />

                  <div className="flex-1">
                    <InlineEditableTextfield
                      defaultValue={option.content}
                      label=""
                      onConfirm={(value) => {
                        if (!isReadOnly) {
                          const updatedOptions = quiz.options?.map((op) =>
                            op.id === option.id
                              ? {
                                  id: op.id,
                                  content: value,
                                }
                              : op
                          );

                          editQuestion({
                            questionId: quiz.id,
                            options: updatedOptions,
                          });
                        }
                      }}
                      placeholder="Click to enter text"
                    />
                  </div>

                  {!isReadOnly && (
                    <div>
                      <Button
                        appearance="subtle"
                        iconAfter={<EditorRemoveIcon label="" />}
                        onClick={() => {
                          const updatedOptions = quiz.options?.filter(
                            (op) => op.id !== option.id
                          );

                          if (quiz.answer === option.id) {
                            editQuestion({
                              questionId: quiz.id,
                              options: updatedOptions,
                              answer: "",
                            });
                          } else {
                            editQuestion({
                              questionId: quiz.id,
                              options: updatedOptions,
                            });
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}

              {!isReadOnly && (
                <div>
                  <Button
                    appearance="subtle"
                    iconAfter={<AddIcon label="" />}
                    onClick={() => {
                      if (quiz.options && quiz.options.length > 0) {
                        editQuestion({
                          questionId: quiz.id,
                          options: [
                            ...quiz.options,
                            {
                              id: generateUUID(),
                              content: "",
                            },
                          ],
                        });
                      } else {
                        editQuestion({
                          questionId: quiz.id,
                          options: [
                            {
                              id: generateUUID(),
                              content: "",
                            },
                          ],
                        });
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {quiz.type === QuizQuestionTypeEnum.MULTI_SELECT && (
          <div className="mx-4 flex flex-row gap-4">
            <h4>Options: </h4>

            <div className="w-full">
              {quiz.options?.map((option) => (
                <div className="flex" key={option.id}>
                  <Checkbox
                    value={option.id}
                    testId={option.id}
                    isChecked={quiz.answer?.indexOf(option.id) !== -1}
                    isDisabled={isReadOnly}
                    onChange={(e) => {
                      const isSelected = quiz.answer?.indexOf(option.id) !== -1;

                      const arrayAnswer = quiz.answer?.split("|");

                      if (isSelected) {
                        const editedAnswer = arrayAnswer?.filter(
                          (op) => op !== option.id
                        );

                        editQuestion({
                          questionId: quiz.id,
                          answer: editedAnswer?.join("|"),
                        });
                      } else {
                        arrayAnswer?.push(option.id);
                        editQuestion({
                          questionId: quiz.id,
                          answer: arrayAnswer?.join("|"),
                        });
                      }
                    }}
                  />

                  <div className="flex-1">
                    <InlineEditableTextfield
                      defaultValue={option.content}
                      label=""
                      onConfirm={(value) => {
                        if (!isReadOnly) {
                          const updatedOptions = quiz.options?.map((op) =>
                            op.id === option.id
                              ? {
                                  id: op.id,
                                  content: value,
                                }
                              : op
                          );

                          editQuestion({
                            questionId: quiz.id,
                            options: updatedOptions,
                          });
                        }
                      }}
                      placeholder="Click to enter text"
                    />
                  </div>

                  {!isReadOnly && (
                    <div>
                      <Button
                        appearance="subtle"
                        iconAfter={<EditorRemoveIcon label="" />}
                        onClick={() => {
                          const updatedOptions = quiz.options?.filter(
                            (op) => op.id !== option.id
                          );

                          const arrayAnswer = quiz.answer?.split("|");
                          if (arrayAnswer && arrayAnswer.includes(option.id)) {
                            const editedAnswer = arrayAnswer.filter(
                              (op) => op !== option.id
                            );

                            editQuestion({
                              questionId: quiz.id,
                              options: updatedOptions,
                              answer: editedAnswer.join("|"),
                            });
                          } else {
                            editQuestion({
                              questionId: quiz.id,
                              options: updatedOptions,
                            });
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}

              {!isReadOnly && (
                <div>
                  <Button
                    appearance="subtle"
                    iconAfter={<AddIcon label="" />}
                    onClick={() => {
                      if (quiz.options && quiz.options.length > 0) {
                        editQuestion({
                          questionId: quiz.id,
                          options: [
                            ...quiz.options,
                            {
                              id: generateUUID(),
                              content: "",
                            },
                          ],
                        });
                      } else {
                        editQuestion({
                          questionId: quiz.id,
                          options: [
                            {
                              id: generateUUID(),
                              content: "",
                            },
                          ],
                        });
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {quiz.type === QuizQuestionTypeEnum.FILL && (
          <div>
            <div>
              <div className="mx-4 flex items-center">
                <h4>Answer:</h4>
                <div className="mx-2">
                  <InlineEditableTextfield
                    defaultValue={quiz.answer}
                    label=""
                    onConfirm={(value) => {
                      if (!isReadOnly) {
                        editQuestion({
                          questionId: quiz.id,
                          answer: value,
                        });
                      }
                    }}
                    placeholder="Click to enter text"
                    // validate={validate}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div>
          <div>
            <div className="mx-4 flex flex-row gap-4">
              <h4>Tags:</h4>

              <div className="w-full">
                <CreatableSelect
                  isMulti
                  isDisabled={isReadOnly}
                  options={tagList.map((op) => ({
                    label: op,
                    value: op,
                  }))}
                  value={quiz.tags?.map((op) => ({
                    label: op,
                    value: op,
                  }))}
                  onChange={(e) => {
                    editQuestion({
                      questionId: quiz.id,
                      tags: e.map((op) => op.label),
                    });
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditQuestion;
