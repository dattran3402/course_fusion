import { useEffect, useState, useRef } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hook";
import { Profile } from "@atlaskit/atlassian-navigation";
import Avatar from "@atlaskit/avatar";
import SendIcon from "@atlaskit/icon/glyph/send";
import styled from "styled-components";
import { Button as AntdButton } from "antd";
import CameraTakePictureIcon from "@atlaskit/icon/glyph/camera-take-picture";
import TextArea from "@atlaskit/textarea";
import ScrollableFeed from "react-scrollable-feed";
import { Checkbox } from "@atlaskit/checkbox";
import Heading from "@atlaskit/heading";
import Spinner from "@atlaskit/spinner";
import TrashIcon from "@atlaskit/icon/glyph/trash";

import { generateUUID } from "@/utils/helper";
import SectionApi from "@/api/sectionApi";
import NewChatScreen from "./NewChatScreen";
import { SelectOptionType } from "@/utils/types";
import ChatbotApi from "@/api/chatbotApi";
import { getFileUrl } from "@/utils/helper";
import { Link } from "react-router-dom";
import MessageApi from "@/api/messageApi";
import { addFlag } from "@/redux/features/contextSlice";

const logoApp = import.meta.env.VITE_APP_URL + "/public/chatgpt-logo.png";

const StyledChatSession = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20px;
  height: calc(100% - 20px);
  overflow-x: hidden;

  div:first-child {
    width: 100%;
    max-width: 800px;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background: #efefef;
      border-radius: 6px;
      cursor: pointer;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: #dbdbdb;
    }

    .conversation {
      width: 100%;
      max-width: 700px;
    }
  }

  .ai-avatar {
    width: 46px !important;
  }

  .source-title {
    width: 80px !important;
  }

  .human-message {
    width: calc(100% - 50px) !important;
  }
`;

const ChatInputStyled = styled.div`
  margin: 20px auto;
  width: 70%;
  max-width: 800px;
  position: relative;

  .delete-btn {
    position: absolute;
    left: -40px;
    top: 14px;
  }

  .textarea-wrapper {
    position: relative;

    .stop-btn {
      position: absolute;
      top: -40px;
      right: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid red;
      background-color: red;
      color: red;

      :hover {
        border: 2px solid red;
        border-radius: 5px;
      }
    }

    .submit-btn {
      position: absolute;
      right: 16px;
      bottom: 4px;
      border: none;
      background-color: transparent;
    }
  }
`;

const ChatbotScreen = ({ configuredDocumentIds }) => {
  const currentCourse = useAppSelector((state) => state.context.currentCourse);
  const user = useAppSelector((state) => state.context.user);

  const dispatch = useAppDispatch();

  const formatSources = (source_documents) => {
    const metadata = source_documents.map((s) => s.metadata);

    const sources = metadata.reduce((acc, item) => {
      let document = acc.find((doc) => doc.documentId === item.document_id);
      if (!document) {
        document = {
          ...item,
          documentId: item.document_id,
          pages: [],
          section: {
            name: item.section_title,
            url: `/course/${currentCourse.id}/section/${item.section_id}`,
          },
          document: {
            name: item.title,
            url: getFileUrl(item.document_id),
          },
        };
        acc.push(document);
      }

      if (!document.pages.includes(item.page)) {
        document.pages.push(item.page);
      }

      return acc;
    }, []);

    if (sources.length > 2) {
      return sources.slice(0, 2);
    } else {
      return sources;
    }
  };

  const [messages, setMessages] = useState<
    {
      id: string;
      from: string;
      content: string;
      sourceDocuments: any[];
    }[]
  >([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const handleSendMessage = async (message) => {
    try {
      const newAIMessageId = generateUUID();

      const newHumanMessage = {
        id: generateUUID(),
        from: "HUMAN",
        content: message,
        sourceDocuments: [],
      };

      const newAIMessage = {
        id: newAIMessageId,
        from: "AI",
        content: "...",
        sourceDocuments: [],
      };

      setMessages((prev) => [...prev, newHumanMessage, newAIMessage]);

      MessageApi.createMessage({
        userId: user?.id,
        courseId: currentCourse.id,
        data: newHumanMessage,
      });

      const chatHistory: any = [];
      let count = 0;

      console.log("messages", messages);
      for (let i = messages.length; i >= 1; i--) {
        if (messages[i]?.from === "AI" && messages[i - 1]?.from === "HUMAN") {
          chatHistory.unshift([messages[i - 1].content, messages[i].content]);
          count += 1;
          if (count === 5) {
            break;
          }
        }
      }

      console.log("chatHistory", chatHistory);

      const res = await ChatbotApi.chatGenerate({
        configuredDocumentIds,
        message,
        chatHistory,
      });

      console.log("res", res);

      setMessages((prev) => {
        const lastIndex = prev.length - 1;
        if (prev[lastIndex].from === "AI") {
          const finalAIMessage = {
            ...prev[lastIndex],
            content: res.answer,
            sourceDocuments: formatSources(res.source_documents),
          };

          const updatedMessages = [...prev.slice(0, lastIndex), finalAIMessage];

          MessageApi.createMessage({
            userId: user?.id,
            courseId: currentCourse.id,
            data: finalAIMessage,
          });

          return updatedMessages;
        } else {
          return prev;
        }
      });
    } catch (err) {
      console.log("error", err);
    }
  };

  const handleSubmit = () => {
    const sendMessage = inputValue.trim();
    // if (sendMessage !== "" && !isListening) {
    if (sendMessage !== "") {
      console.log("sendMessage", sendMessage);
      handleSendMessage(sendMessage);

      const textarea = document.getElementById("chat-input");
      if (textarea) {
        textarea.style.height = `28px`;
      }
      setInputValue("");
    }
  };

  const fetchData = async () => {
    try {
      if (currentCourse.id && user?.id) {
        setIsLoading(true);

        const res = await MessageApi.getMessages({
          userId: user?.id,
          courseId: currentCourse.id,
        });

        const initMessages = res.data.map((item) => item.data).reverse();

        setMessages(initMessages);
        setIsLoading(false);
      }
    } catch (err) {
      console.log("err", err);
      setMessages([]);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentCourse, user]);

  const handleDeleteMessages = async () => {
    try {
      const userConfirmed = window.confirm(
        "Are you sure you want to delete all messages?"
      );

      if (userConfirmed) {
        await MessageApi.deleteMessage({
          userId: user?.id,
          courseId: currentCourse.id,
        });

        dispatch(
          addFlag({
            color: "success",
            content: "Delete messages successful!",
          })
        );

        setMessages([]);
      }
    } catch (err) {
      console.log("err", err);
    }
  };

  return (
    <StyledChatSession>
      {isLoading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <Spinner interactionName="load" size="large" />
        </div>
      ) : (
        <>
          {messages && messages.length === 0 ? (
            <NewChatScreen />
          ) : (
            <ScrollableFeed>
              {messages.map((message) => (
                <div key={message.id}>
                  {message.from === "AI" && (
                    <div className="message">
                      <div className="flex items-center">
                        <div className="ai-avatar">
                          <Profile
                            icon={
                              <Avatar
                                size="small"
                                src={logoApp}
                                name="Atlassian account: Emil Rottmayer"
                                presence="online"
                              />
                            }
                            tooltip="Chatbot"
                          />
                        </div>
                        <div className="w-fit-content overflow-wrap-anywhere whitespace-pre-wrap break-words">
                          {message.content}
                        </div>
                      </div>

                      {message.sourceDocuments.length > 0 && (
                        <div className="source-documents ml-11 mt-1 flex border-t-2">
                          <div className="source-title">Sources:</div>

                          <div className="flex flex-col">
                            {message.sourceDocuments.map((item) => (
                              <div className="flex gap-6">
                                <Link to={item.section.url} target="_blank">
                                  {item.section.name}
                                </Link>
                                <div>{" - "}</div>
                                <Link to={item.document.url} target="_blank">
                                  {`${
                                    item.document.name
                                  } (page ${item.pages.map((page) => page)})`}
                                </Link>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {message.from === "HUMAN" && (
                    <div className="human-message m-2 ml-10 mt-4 flex items-center rounded-[5px] bg-[#aed5ff63] p-2">
                      <div className="w-fit-content overflow-wrap-anywhere whitespace-pre-wrap break-words">
                        {message.content}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </ScrollableFeed>
          )}

          <ChatInputStyled>
            <button
              className="delete-btn"
              onClick={() => handleDeleteMessages()}
            >
              <TrashIcon label="" />
            </button>
            <div className="textarea-wrapper">
              <TextArea
                id="chat-input"
                maxHeight="20vh"
                name="area"
                value={inputValue}
                placeholder="Ask any question"
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />
              <AntdButton
                className="submit-btn"
                onClick={() => handleSubmit()}
                icon={<SendIcon label="" />}
              />
            </div>
          </ChatInputStyled>
        </>
      )}
    </StyledChatSession>
  );
};

export default ChatbotScreen;
