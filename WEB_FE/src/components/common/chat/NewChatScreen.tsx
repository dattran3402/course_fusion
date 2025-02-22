import React, { useState, useEffect } from "react";
// import styled from "styled-components";
import Heading from "@atlaskit/heading";

// import logoApp from "../../../public/images/app-icon.png";
const logoApp = "http://localhost:4000/public/chatgpt-logo.png";

const NewChatScreen = () => {
  const WELCOME_MESSAGE = "How can I help you today?";
  const [showMessage, setShowMessage] = useState("");

  useEffect(() => {
    const intervalId = setInterval(() => {
      setShowMessage((prevText) => {
        const nextChar = WELCOME_MESSAGE[prevText.length];
        return prevText + (nextChar || "");
      });
    }, 50);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center gap-2.5">
        <img className="h-[70px] w-[70px]" src={logoApp} alt="logoApp" />
        <Heading level="h600">{showMessage}</Heading>
      </div>
    </div>
  );
};

export default NewChatScreen;
