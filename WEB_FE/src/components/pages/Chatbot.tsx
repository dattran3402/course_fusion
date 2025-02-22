import { useEffect, useState, useRef } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hook";
import { Link } from "react-router-dom";
import Button from "@atlaskit/button";
import TextArea from "@atlaskit/textarea";
import LoadingButton from "@atlaskit/button/loading-button";
import { Checkbox } from "@atlaskit/checkbox";
import Heading from "@atlaskit/heading";
import EditIcon from "@atlaskit/icon/glyph/edit";
import Tooltip from "@atlaskit/tooltip";
import Spinner from "@atlaskit/spinner";
import ChevronDownIcon from "@atlaskit/icon/glyph/chevron-down";
import ChevronRightIcon from "@atlaskit/icon/glyph/chevron-right";

import SectionApi from "@/api/sectionApi";
import ChatbotScreen from "../common/chat/ChatbotScreen";
import FileApi from "@/api/fileApi";
import { CourseSectionTypeEnum, FileTypeEnum } from "@/utils/enum";
import ChatbotApi from "@/api/chatbotApi";
import CourseApi from "@/api/courseApi";
import { addFlag } from "@/redux/features/contextSlice";

const Chatbot = () => {
  const currentCourse = useAppSelector((state) => state.context.currentCourse);
  const user = useAppSelector((state) => state.context.user);
  const lectureAndQuiz = useAppSelector(
    (state) => state.context.lectureAndQuiz
  );
  const dispatch = useAppDispatch();

  const [showCustomPanel, setShowCustomPanel] = useState(false);
  const [listDocuments, setListDocuments] = useState<any[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isFetchingFiles, setIsFetchingFiles] = useState(false);
  const [configuredDocumentIds, setConfiguredDocumentIds] = useState<string[]>(
    []
  );

  const fetchData = async () => {
    try {
      setIsFetchingFiles(true);

      const getDocumentPromises = await lectureAndQuiz
        .filter((section) => section.type === CourseSectionTypeEnum.FILES)
        .map(async (section) => {
          const res = await SectionApi.getFilesInSection(section.id);
          return {
            section: section,
            documentIds: res.data,
          };
        });

      const documentSectionsPromisesResult = await Promise.all(
        getDocumentPromises
      );

      const documentSections = documentSectionsPromisesResult.flatMap((item) =>
        item.documentIds.map((documentId) => ({
          id: documentId,
          section: item.section,
        }))
      );

      const documentIds = documentSections.reduce(
        (prev, current) => prev.concat(current.id),
        []
      );

      const documents = await Promise.all(
        documentIds.map(async (documentId) => {
          try {
            const res = await FileApi.getFileDetailById(documentId);
            return res.data;
          } catch (err) {
            console.log(err);
            return null;
          }
        })
      );

      const chatbotConfig = await CourseApi.getCourseStudent({
        courseId: currentCourse.id,
        studentId: user?.id || "",
      });

      let selectedDocumentIds: any[] = [];
      if (chatbotConfig.chatbotDocumentIds) {
        selectedDocumentIds = chatbotConfig.chatbotDocumentIds;
      }

      const allowedDocuments = documents
        .filter((document) => FileTypeEnum.PDF === document?.type)
        .map((document) => ({
          ...document,
          isChecked: selectedDocumentIds.includes(document.id),
        }));

      const formattedDocuments = allowedDocuments.map((doc) => {
        const documentSection = documentSections.find(
          (documentSection) => documentSection.id === doc.id
        );
        return {
          ...doc,
          section: documentSection.section,
        };
      });

      setConfiguredDocumentIds(selectedDocumentIds);
      setIsFetchingFiles(false);
      setListDocuments(formattedDocuments);
    } catch (err) {
      setIsFetchingFiles(false);
      console.error("Error!", err);
    }
  };

  useEffect(() => {
    if (currentCourse.id && currentCourse.id !== "") {
      fetchData();
    }
  }, [currentCourse.id, lectureAndQuiz, showCustomPanel]);

  const handleUpdateChatbotConfig = async () => {
    try {
      setIsUpdating(true);

      const listDocumentToUpdate = listDocuments.filter((doc) => doc.isChecked);
      const documentIds = listDocumentToUpdate.map((doc) => doc.id);

      await ChatbotApi.updateChatbotConfig({
        studentId: user?.id || "",
        courseId: currentCourse.id,
        chatbotDocumentIds: documentIds,
      });

      await Promise.all(
        listDocumentToUpdate.map((document) =>
          ChatbotApi.embeddingDocument({
            documentId: document.id,
            title: document.name,
            sectionId: document.section.id,
            sectionTitle: document.section.name,
          })
        )
      );

      dispatch(
        addFlag({
          color: "success",
          content: "Update configuration successfully!",
        })
      );

      setConfiguredDocumentIds(documentIds);
      setIsUpdating(false);
      setShowCustomPanel(false);
    } catch (err) {
      setIsUpdating(false);
      console.error(err);

      dispatch(
        addFlag({
          color: "error",
          content: "Fail to update configuration!",
        })
      );
    }
  };

  const SectionComponent = ({ section }) => {
    const [showChildren, setShowChildren] = useState(true);

    const handleSelectDocument = (doc) => {
      setListDocuments((prev) =>
        prev.map((document) => {
          if (document.id === doc.id) {
            return {
              ...document,
              isChecked: !document.isChecked,
            };
          } else {
            return document;
          }
        })
      );
    };

    const documents = listDocuments.filter(
      (doc) => doc.section.id === section.id
    );

    return (
      <>
        <div className="container ml-[-8px] flex">
          <button onClick={() => setShowChildren(!showChildren)}>
            {showChildren ? (
              <ChevronDownIcon label="" />
            ) : (
              <ChevronRightIcon label="" />
            )}
          </button>

          <div className="link">{section.name}</div>
        </div>
        <div>
          {showChildren &&
            documents.map((doc) => (
              <div key={doc.value} className="my-2 flex">
                <Checkbox
                  label=""
                  isChecked={doc.isChecked}
                  onClick={() => {
                    handleSelectDocument(doc);
                  }}
                />
                <Link to={doc.url} target="_blank">
                  {doc.name}
                </Link>
              </div>
            ))}
        </div>
      </>
    );
  };

  return (
    <div className="flex h-full w-full">
      <ChatbotScreen configuredDocumentIds={configuredDocumentIds} />

      {showCustomPanel ? (
        <div className="w-[300px] justify-center border-l-2 border-gray-200">
          <div className="ml-6 mt-4">
            <Heading level="h500">Files</Heading>
            <div className="flex flex-col">
              {isFetchingFiles ? (
                <div className="flex min-h-[400px] items-center justify-center">
                  <Spinner interactionName="load" size="large" />
                </div>
              ) : (
                <>
                  {lectureAndQuiz
                    .filter(
                      (section) => section.type === CourseSectionTypeEnum.FILES
                    )
                    .map((section) => (
                      <SectionComponent section={section} />
                    ))}
                </>
              )}
            </div>
          </div>

          <div className="fixed bottom-10 right-4 flex gap-4">
            <Button onClick={() => setShowCustomPanel(false)}>Cancel</Button>
            <Button
              onClick={() => {
                const isSelectAll = listDocuments.every((doc) => doc.isChecked);
                setListDocuments((prev) =>
                  prev.map((doc) => ({
                    ...doc,
                    isChecked: !isSelectAll,
                  }))
                );
              }}
            >
              {listDocuments.every((doc) => doc.isChecked)
                ? "Un select all"
                : "Select all"}
            </Button>
            <LoadingButton
              type="submit"
              appearance="primary"
              isLoading={isUpdating}
              onClick={() => handleUpdateChatbotConfig()}
            >
              Update
            </LoadingButton>
          </div>
        </div>
      ) : (
        <div className="hihi fixed right-9 top-[70px]">
          <Tooltip content="Customize your chatbot">
            <Button
              iconAfter={<EditIcon label="" size="medium" />}
              appearance="subtle"
              onClick={() => setShowCustomPanel(true)}
            />
          </Tooltip>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
